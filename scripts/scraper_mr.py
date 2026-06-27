"""
Scraper para MR Accesorios Industriales — requests + BeautifulSoup
Sin dependencias pesadas, corre en Python 3.9 del sistema.

Instalación:
    pip3 install requests beautifulsoup4

Uso:
    python3 scripts/scraper_mr.py
"""

import csv
import sys
import time
import re
from dataclasses import dataclass
from typing import Optional
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://mraccesoriosindustriales.com.ar"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept-Language": "es-AR,es;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# 26 URLs cubren las 24 categorías (Soportes tiene 3 subcategorías separadas)
CATEGORIAS = [
    ("Soportes para rodamientos", "Soportes Bipartidos",           "/soportes-para-rodamientos-soportes-bipartidos"),
    ("Soportes para rodamientos", "Soportes Especiales",           "/soportes-para-rodamientos-soportes-especiales"),
    ("Soportes para rodamientos", "Soportes Autocentrantes",       "/soportes-para-rodamientos-soportes-autocentrantes"),
    ("Calentadores de Rodamientos", "",                            "/calentadores-de-poleas-calentadores-de-rodamientos"),
    ("Extractores de Rodamientos",  "",                            "/extractores-de-rodamientos"),
    ("Alineadores",                 "",                            "/alineadores-de-poleas-alineadores"),
    ("Automotor",                   "",                            "/automotor"),
    ("Rodamientos",                 "",                            "/rodamientos"),
    ("Acoplamientos",               "",                            "/acoplamientos"),
    ("Bujes",                       "",                            "/bujes"),
    ("Cadenas Industriales",        "",                            "/cadenas-cadenas-industriales"),
    ("Correas Industriales",        "",                            "/correas-correas-industriales"),
    ("Herramientas Industriales",   "",                            "/herramientas-herramientas-industriales"),
    ("Grasas / Lubricación",        "",                            "/lubricacion-grasas---lubricacion"),
    ("Módulos de giro",             "",                            "/modulos-de-giro"),
    ("Piñones",                     "",                            "/pinones"),
    ("Poleas",                      "",                            "/poleas-poleas"),
    ("Ruedas libres",               "",                            "/ruedas-libres"),
    ("Retenes",                     "",                            "/retenes"),
    ("Sistemas lineales",           "",                            "/sistemas-lineales"),
    ("Tornillos de rosca recirculantes", "",                       "/tornillos-de-rosca-recirculantes"),
    ("Motorreductores",             "",                            "/motorreductores"),
    ("Mangueras Industriales",      "",                            "/mangueras-industriales"),
    ("Motores Eléctricos",          "",                            "/motores-electricos-y-motoreductores-motores-electricos"),
    ("Tuercas y arandelas",         "",                            "/tuercas-y-arandelas"),
    ("Equipos Industriales",        "",                            "/equipos-industriales"),
]


@dataclass
class Producto:
    categoria_mr: str
    subcategoria_mr: str
    nombre_producto: str
    slug: str
    url_completa: str
    imagen_url: str


def get_soup(url: str) -> Optional[BeautifulSoup]:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"  [ERROR] GET {url}: {e}", flush=True)
        return None


def parse_total(soup: BeautifulSoup) -> Optional[int]:
    text = soup.get_text()
    m = re.search(r"Total:\s*(\d+)", text)
    return int(m.group(1)) if m else None


def extraer_productos_de_soup(soup: BeautifulSoup, categoria: str, subcategoria: str) -> list[Producto]:
    productos = []
    # Estructura: <a href="/slug"> ... <h4>Nombre</h4> ... <img src="..."> ... </a>
    for a in soup.find_all("a", href=True):
        h4 = a.find("h4")
        if not h4:
            continue
        nombre = h4.get_text(strip=True)
        if not nombre:
            continue
        href = a["href"]
        # Filtrar links que no son productos (nav, header, etc.)
        # Los productos tienen slugs simples como /nombre-del-producto
        if not href.startswith("/") or href.count("/") != 1:
            continue
        # Excluir slugs que son claramente categorías o páginas del sitio
        EXCLUIR = {"", "productos", "contacto", "inicio", "quienes-somos", "home"}
        slug = href.lstrip("/")
        if slug in EXCLUIR or len(slug) < 3:
            continue

        img = a.find("img")
        imagen_url = img["src"] if img and img.get("src") else ""

        productos.append(Producto(
            categoria_mr=categoria,
            subcategoria_mr=subcategoria,
            nombre_producto=nombre,
            slug=slug,
            url_completa=BASE_URL + href,
            imagen_url=imagen_url,
        ))

    # Deduplicar por slug (misma página puede tener links repetidos)
    vistos = set()
    unicos = []
    for p in productos:
        if p.slug not in vistos:
            vistos.add(p.slug)
            unicos.append(p)
    return unicos


def try_page_2(url_base: str, soup_p1: BeautifulSoup, categoria: str, subcategoria: str) -> list[Producto]:
    """
    Intenta obtener la página 2 probando patrones comunes de la plataforma eSMSV.
    """
    slugs_p1 = {p.slug for p in extraer_productos_de_soup(soup_p1, categoria, subcategoria)}
    patrones = [
        url_base + "?pagina=2",
        url_base + "?page=2",
        url_base + "/pagina/2",
        url_base + "?p=2",
    ]
    for url in patrones:
        time.sleep(1)
        soup2 = get_soup(url)
        if not soup2:
            continue
        prods2 = extraer_productos_de_soup(soup2, categoria, subcategoria)
        nuevos = [p for p in prods2 if p.slug not in slugs_p1]
        if nuevos:
            print(f"  Página 2 encontrada via: {url} ({len(nuevos)} productos nuevos)", flush=True)
            return nuevos
    return []


def scrapear_categoria(categoria: str, subcategoria: str, path: str) -> list[Producto]:
    url = BASE_URL + path
    print(f"\n→ {categoria}{' / ' + subcategoria if subcategoria else ''}", flush=True)
    print(f"  {url}", flush=True)

    soup = get_soup(url)
    if not soup:
        return []

    total_esperado = parse_total(soup)
    print(f"  Total declarado: {total_esperado}", flush=True)

    productos = extraer_productos_de_soup(soup, categoria, subcategoria)
    print(f"  Página 1: {len(productos)} productos", flush=True)

    # Si el total declarado supera lo que obtuvimos, buscar página 2
    if total_esperado and len(productos) < total_esperado:
        time.sleep(1.5)
        extra = try_page_2(url, soup, categoria, subcategoria)
        productos.extend(extra)

    obtenidos = len(productos)
    if total_esperado and obtenidos != total_esperado:
        print(f"  [WARN] Esperados {total_esperado}, obtenidos {obtenidos}", flush=True)
    else:
        print(f"  ✓ {obtenidos} productos", flush=True)

    return productos


def main():
    output = "/Users/markopamich/Desktop/Proyectos/BYGrodamientos/bygrodamientos-main/scripts/mr_catalogo_completo.csv"
    todos: list[Producto] = []
    resumen = {}

    for categoria, subcategoria, path in CATEGORIAS:
        key = f"{categoria} / {subcategoria}" if subcategoria else categoria
        try:
            prods = scrapear_categoria(categoria, subcategoria, path)
            todos.extend(prods)
            resumen[key] = len(prods)
        except Exception as e:
            print(f"  [ERROR] {key}: {e}", flush=True)
            resumen[key] = 0
        time.sleep(1.5)  # Rate limiting entre categorías

    # Escribir CSV
    cols = ["categoria_mr", "subcategoria_mr", "nombre_producto", "slug", "url_completa", "imagen_url"]
    with open(output, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for p in todos:
            w.writerow({
                "categoria_mr": p.categoria_mr,
                "subcategoria_mr": p.subcategoria_mr,
                "nombre_producto": p.nombre_producto,
                "slug": p.slug,
                "url_completa": p.url_completa,
                "imagen_url": p.imagen_url,
            })

    print("\n" + "=" * 60, flush=True)
    print(f"TOTAL: {len(todos)} productos → {output}", flush=True)
    print("=" * 60, flush=True)
    for key, n in resumen.items():
        print(f"  {key}: {n}", flush=True)


if __name__ == "__main__":
    main()
