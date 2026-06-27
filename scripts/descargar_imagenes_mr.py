"""
Descarga todas las imágenes de productos MR Accesorios (por encargo) desde el CDN
y las guarda localmente en public/images/products/encargo/<slug>.webp

Después de editar (quitar logo, optimizar), subir a Supabase Storage y correr
actualizar_urls_imagenes.py para actualizar la DB.

Uso:
    python3 scripts/descargar_imagenes_mr.py
"""

import os
import time
import urllib.request
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

DEST = Path(__file__).parent.parent / "public" / "images" / "products" / "encargo"
DEST.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}


def descargar(url: str, dest_path: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as r:
            dest_path.write_bytes(r.read())
        return True
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Obteniendo productos MR desde Supabase...")
    res = supabase.table("productos") \
        .select("slug, nombre, imagen_url, categoria_slug") \
        .eq("tipo_disponibilidad", "encargo") \
        .not_.is_("imagen_url", "null") \
        .order("categoria_slug") \
        .execute()

    productos = res.data
    print(f"  {len(productos)} productos con imagen\n")

    ok = 0
    skip = 0
    error = 0

    for p in productos:
        slug = p["slug"]
        url = p["imagen_url"]
        nombre = p["nombre"]
        cat = p["categoria_slug"] or "sin-categoria"

        # Guardar como <categoria>__<slug>.webp para organizar
        filename = f"{cat}__{slug}.webp"
        dest = DEST / filename

        if dest.exists():
            skip += 1
            continue

        print(f"↓ {nombre[:50]}")
        print(f"  {filename}")

        if descargar(url, dest):
            size_kb = dest.stat().st_size // 1024
            print(f"  ✓ {size_kb} KB")
            ok += 1
        else:
            error += 1

        time.sleep(0.3)  # Rate limiting suave

    print(f"\n{'='*50}")
    print(f"Descargadas: {ok}  |  Ya existían: {skip}  |  Errores: {error}")
    print(f"Carpeta: {DEST}")
    print(f"\nPróximos pasos:")
    print("  1. Editar imágenes (quitar logo MR, optimizar)")
    print("  2. Convertir a WebP y comprimir (squoosh.app o tinypng.com)")
    print("  3. Subir a Supabase Storage (bucket: productos)")
    print("  4. Correr actualizar_urls_imagenes.py para actualizar la DB")


if __name__ == "__main__":
    main()
