"""
Script de carga: inserta productos de MR Accesorios Industriales en Supabase.

Requisitos:
    pip install supabase python-dotenv

Variables de entorno (.env en raíz del proyecto):
    NEXT_PUBLIC_SUPABASE_URL=...
    SUPABASE_SERVICE_ROLE_KEY=...   (service role, NO la anon key)

Uso:
    python scripts/carga_mr.py --csv mr_catalogo_completo.csv [--dry-run]

--dry-run: solo muestra lo que haría, no inserta nada.
"""

import argparse
import csv
import os
import re
import unicodedata
from difflib import SequenceMatcher
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path="/Users/markopamich/Desktop/Proyectos/BYGrodamientos/bygrodamientos-main/.env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# ── Mapeo de categorías MR → categoría BYG existente ──────────────────────────
# Formato: categoria_mr (exacta) → slug de categoría BYG existente
MAPA_FUSION = {
    "Calentadores de Rodamientos": "herramientas",
    "Extractores de Rodamientos":  "herramientas",
    "Grasas / Lubricación":        "herramientas",
    "Herramientas Industriales":   "herramientas",
    "Rodamientos":                 "rodamientos",
    "Retenes":                     "retenes",
    "Correas Industriales":        "transmision",
    "Poleas":                      "transmision",
    "Acoplamientos":               "transmision",
    "Automotor":                   "automotriz",
}

# Categorías 100% nuevas a crear (nombre legible, slug propuesto)
CATEGORIAS_NUEVAS = [
    ("Soportes para rodamientos", "soportes-para-rodamientos"),
    ("Alineadores",               "alineadores"),
    ("Bujes",                     "bujes"),
    ("Cadenas Industriales",      "cadenas-industriales"),
    ("Módulos de giro",           "modulos-de-giro"),
    ("Piñones",                   "pinones"),
    ("Ruedas libres",             "ruedas-libres"),
    ("Sistemas lineales",         "sistemas-lineales"),
    ("Tornillos de rosca recirculantes", "tornillos-rosca-recirculantes"),
    ("Motorreductores",           "motorreductores"),
    ("Mangueras Industriales",    "mangueras-industriales"),
    ("Motores Eléctricos",        "motores-electricos"),
    ("Tuercas y arandelas",       "tuercas-y-arandelas"),
    ("Equipos Industriales",      "equipos-industriales"),
]

UMBRAL_SIMILITUD = 0.72  # Si similitud de nombre supera esto → caso dudoso

# Productos dudosos que fueron revisados manualmente y SE DEBEN INSERTAR igual
# (son distintos a los existentes aunque superen el umbral de similitud)
DUDOSOS_APROBADOS = {
    "Calentadores de Inducción - Rodamientos",
    "Calentador de inducción portátil compacto",
    "Extractores Mecánicos para Rodamientos",
    "Rodamientos de agujas",
    "Rodamientos de Precisión",
    "Correas Dentadas",
}


def slugify(text: str) -> str:
    """Genera slug URL-friendly desde texto."""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def similitud(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def main(csv_path: str, dry_run: bool):
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Conectando a Supabase...")

    # ── 1. Cargar estado actual de BYG ────────────────────────────────────────
    categorias_byg = {
        row["slug"]: row
        for row in supabase.table("categorias").select("*").execute().data
    }
    productos_byg = supabase.table("productos").select("id,nombre,slug,categoria_id").execute().data
    slugs_existentes = {p["slug"] for p in productos_byg}
    nombres_existentes = [(p["nombre"], p["id"]) for p in productos_byg]

    print(f"Categorías BYG existentes: {list(categorias_byg.keys())}")
    print(f"Productos BYG existentes: {len(productos_byg)}")

    # ── 2. Obtener proveedor_id de MR ─────────────────────────────────────────
    mr = supabase.table("proveedores").select("id").eq("nombre", "MR Accesorios Industriales").execute().data
    if not mr:
        raise RuntimeError("No se encontró el proveedor MR en la tabla. ¿Aplicaste la migración?")
    proveedor_id = mr[0]["id"]

    # ── 3. Crear categorías nuevas si no existen ──────────────────────────────
    cat_id_por_nombre: dict[str, str] = {}

    for nombre_cat, slug_cat in CATEGORIAS_NUEVAS:
        if slug_cat in categorias_byg:
            cat_id_por_nombre[nombre_cat] = categorias_byg[slug_cat]["id"]
            print(f"  Categoría '{nombre_cat}' ya existe (id={cat_id_por_nombre[nombre_cat]})")
        else:
            print(f"  Crear categoría nueva: '{nombre_cat}' (slug={slug_cat})")
            if not dry_run:
                res = supabase.table("categorias").insert({
                    "nombre": nombre_cat,
                    "slug": slug_cat,
                }).execute()
                cat_id_por_nombre[nombre_cat] = res.data[0]["id"]
                categorias_byg[slug_cat] = res.data[0]
            else:
                cat_id_por_nombre[nombre_cat] = f"[DRY-RUN:{slug_cat}]"

    # También mapear las que se fusionan con existentes
    for cat_mr, slug_byg in MAPA_FUSION.items():
        if slug_byg in categorias_byg:
            cat_id_por_nombre[cat_mr] = categorias_byg[slug_byg]["id"]
        else:
            print(f"  [WARN] Slug BYG '{slug_byg}' no encontrado para fusión de '{cat_mr}'")

    # ── 4. Leer CSV y clasificar productos ────────────────────────────────────
    with open(csv_path, encoding="utf-8") as f:
        filas = list(csv.DictReader(f))

    print(f"\nTotal filas en CSV: {len(filas)}")

    dudosos = []
    a_insertar = []
    omitidos = []

    for fila in filas:
        cat_mr = fila["categoria_mr"].strip()
        subcat_mr = fila["subcategoria_mr"].strip()
        nombre = fila["nombre_producto"].strip()
        slug_mr = fila["slug"].strip()
        url = fila["url_completa"].strip()
        img = fila["imagen_url"].strip()

        # Resolver categoria_id en BYG
        cat_id = cat_id_por_nombre.get(cat_mr)
        if not cat_id:
            print(f"  [WARN] Sin mapeo para categoría '{cat_mr}' — omitiendo '{nombre}'")
            omitidos.append({"nombre": nombre, "razon": f"sin mapeo para '{cat_mr}'"})
            continue

        # Verificar similitud con productos existentes
        es_dudoso = False
        for nombre_existente, id_existente in nombres_existentes:
            sim = similitud(nombre, nombre_existente)
            if sim >= UMBRAL_SIMILITUD:
                if nombre in DUDOSOS_APROBADOS:
                    break  # revisado manualmente: insertar igual
                dudosos.append({
                    "nuevo": nombre,
                    "existente": nombre_existente,
                    "id_existente": id_existente,
                    "similitud": round(sim, 2),
                    "categoria_mr": cat_mr,
                })
                es_dudoso = True
                break

        if es_dudoso:
            continue
        else:
            # Generar slug único
            slug_base = slugify(nombre)
            slug_final = slug_base
            contador = 2
            while slug_final in slugs_existentes:
                slug_final = f"{slug_base}-{contador}"
                contador += 1
            slugs_existentes.add(slug_final)

            a_insertar.append({
                "nombre": nombre,
                "slug": slug_final,
                "descripcion": "",
                "categoria_id": cat_id,
                "categoria_nombre": cat_mr,
                "categoria_slug": slugify(cat_mr),
                "subcategoria": subcat_mr if subcat_mr else cat_mr,
                "imagen_url": img,
                "tipo_disponibilidad": "encargo",
                "proveedor_id": proveedor_id,
                "url_referencia_proveedor": url,
                "stock": 0,
                "precio": None,
                "activo": True,
            })

    # ── 5. Reportar dudosos ───────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print(f"CASOS DUDOSOS (similitud >= {UMBRAL_SIMILITUD}) — REVISAR ANTES DE INSERTAR:")
    print("=" * 60)
    if dudosos:
        for d in dudosos:
            print(f"  NUEVO:     '{d['nuevo']}' (MR: {d['categoria_mr']})")
            print(f"  EXISTENTE: '{d['existente']}' (id={d['id_existente']})")
            print(f"  Similitud: {d['similitud']}")
            print()
    else:
        print("  Ninguno — todo limpio.")

    print(f"\nProductos a insertar: {len(a_insertar)}")
    print(f"Casos dudosos (no insertados): {len(dudosos)}")
    print(f"Omitidos (sin mapeo): {len(omitidos)}")

    if dry_run:
        print("\n[DRY-RUN] No se insertó nada. Revisá los casos dudosos arriba.")
        print("\nPrimeros 5 registros que se insertarían:")
        for row in a_insertar[:5]:
            print(f"  - {row['nombre']} → slug={row['slug']}, cat={row['categoria_nombre']}")
        return

    # ── 6. Insertar en lotes ──────────────────────────────────────────────────
    if not a_insertar:
        print("\nNada para insertar.")
        return

    confirm = input(f"\n¿Confirmas insertar {len(a_insertar)} productos en Supabase? [s/N] ")
    if confirm.lower() != "s":
        print("Abortado.")
        return

    LOTE = 50
    insertados = 0
    for i in range(0, len(a_insertar), LOTE):
        lote = a_insertar[i:i + LOTE]
        supabase.table("productos").insert(lote).execute()
        insertados += len(lote)
        print(f"  Insertados {insertados}/{len(a_insertar)}...")

    print(f"\n✓ Inserción completa: {insertados} productos cargados.")
    print(f"  Recordá revisar y decidir manualmente los {len(dudosos)} casos dudosos.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Carga productos MR en Supabase BYG")
    parser.add_argument("--csv", default="mr_catalogo_completo.csv", help="Path al CSV del scraper")
    parser.add_argument("--dry-run", action="store_true", help="Solo simula, no inserta nada")
    args = parser.parse_args()
    main(args.csv, args.dry_run)
