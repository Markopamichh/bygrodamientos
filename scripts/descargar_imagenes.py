import asyncio
import os
import re
import aiohttp
from urllib.parse import urlparse
from playwright.async_api import async_playwright

BASE = "https://mraccesoriosindustriales.com.ar"
OUTPUT_DIR = "imagenes_descargadas"

# Mapeo de tus categorías a las URLs reales del sitio
CATEGORIAS = {
    "rigidos_de_bolas": [
        "/rodamientos-a-bolas",
        "/rodamientos-linea-6000-2rs-2z",
        "/rodamientos-linea-6000-2rs-2z-2",
        "/rodamientos-linea-6300-2rs-2z",
    ],
    "bolas_a_rotula": [
        "/rodamientos-linea-22200",
        "/rodamientos-autocentrantes-uc",
    ],
    "contacto_angular": [
        "/rodamientos-de-contacto-angular",
    ],
    "rodillos_cilindricos": [
        "/rodamientos-de-rodillos-cilindricos",
    ],
    "rodillos_a_rotula": [
        "/rodamientos-especiales",
    ],
    "axiales": [
        "/rodamientos-especiales",
    ],
    "agujas": [
        "/rodamientos-de-agujas",
    ],
}

SKIP_KEYWORDS = ["logo", "icon", "banner", "placeholder", "spinner", "avatar", "flag", "payment", "social"]

async def descargar_imagen(session, url, path):
    try:
        async with session.get(url) as r:
            if r.status == 200:
                with open(path, "wb") as f:
                    f.write(await r.read())
                return True
    except Exception as e:
        print(f"    ERROR: {e}")
    return False

async def scrapear_categoria(page, url, carpeta):
    print(f"  Cargando: {url}")
    try:
        await page.goto(BASE + url, timeout=30000, wait_until="networkidle")
    except:
        await page.goto(BASE + url, timeout=30000, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)

    # Scroll para cargar imágenes lazy
    for _ in range(5):
        await page.evaluate("window.scrollBy(0, 600)")
        await page.wait_for_timeout(500)

    imgs = await page.evaluate("""() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src || img.dataset.src || img.dataset.lazySrc || '',
            alt: img.alt || '',
            width: img.naturalWidth,
            height: img.naturalHeight,
        }));
    }""")

    urls_validas = []
    for img in imgs:
        src = img["src"]
        if not src or src.startswith("data:"):
            continue
        if any(k in src.lower() for k in SKIP_KEYWORDS):
            continue
        # Solo imágenes de tamaño razonable (evita iconos)
        if img["width"] > 0 and img["width"] < 50:
            continue
        if src not in urls_validas:
            urls_validas.append(src)

    return urls_validas

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    total = 0

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page()

        async with aiohttp.ClientSession() as session:
            for categoria, urls in CATEGORIAS.items():
                carpeta = os.path.join(OUTPUT_DIR, categoria)
                os.makedirs(carpeta, exist_ok=True)
                print(f"\n[{categoria.upper().replace('_', ' ')}]")

                todas_las_imgs = []
                for url in urls:
                    imgs = await scrapear_categoria(page, url, carpeta)
                    for img in imgs:
                        if img not in todas_las_imgs:
                            todas_las_imgs.append(img)

                print(f"  {len(todas_las_imgs)} imágenes encontradas")

                for i, url_img in enumerate(todas_las_imgs):
                    ext = os.path.splitext(urlparse(url_img).path)[1] or ".jpg"
                    if ext.lower() not in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]:
                        ext = ".jpg"
                    nombre = f"{categoria}_{i+1:04d}{ext}"
                    path = os.path.join(carpeta, nombre)
                    ok = await descargar_imagen(session, url_img, path)
                    if ok:
                        print(f"    OK: {nombre}")
                        total += 1

        await browser.close()

    print(f"\nListo. {total} imágenes guardadas en: {OUTPUT_DIR}/")

asyncio.run(main())
