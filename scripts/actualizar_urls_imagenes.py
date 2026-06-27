"""
Sube las imágenes editadas desde public/images/products/encargo/ a Supabase Storage
y actualiza la imagen_url en la tabla productos.

Uso:
    python3 scripts/actualizar_urls_imagenes.py

Requisitos: haber creado el bucket "productos" en Supabase Storage (público).
"""

import os
import re
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BUCKET = "productos"

SRC = Path(__file__).parent.parent / "public" / "images" / "products" / "encargo"


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    archivos = list(SRC.glob("*.webp")) + list(SRC.glob("*.jpg")) + list(SRC.glob("*.png"))
    print(f"{len(archivos)} imágenes encontradas en {SRC}\n")

    ok = 0
    for path in sorted(archivos):
        # Nombre del archivo: <categoria>__<slug>.webp → extraer slug
        stem = path.stem  # ej: "herramientas__calentador-de-induccion-portatil"
        parts = stem.split("__", 1)
        if len(parts) != 2:
            print(f"  [SKIP] nombre inesperado: {path.name}")
            continue

        slug = parts[1]
        storage_path = f"encargo/{path.name}"

        print(f"↑ {path.name}")

        # Subir a Storage
        with open(path, "rb") as f:
            content_type = "image/webp" if path.suffix == ".webp" else "image/jpeg"
            supabase.storage.from_(BUCKET).upload(
                storage_path,
                f.read(),
                {"content-type": content_type, "upsert": "true"},
            )

        # URL pública
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"

        # Actualizar en DB
        res = supabase.table("productos") \
            .update({"imagen_url": public_url}) \
            .eq("slug", slug) \
            .execute()

        if res.data:
            print(f"  ✓ URL actualizada → {public_url}")
            ok += 1
        else:
            print(f"  [WARN] slug '{slug}' no encontrado en la DB")

    print(f"\n{'='*50}")
    print(f"Actualizadas: {ok}/{len(archivos)}")


if __name__ == "__main__":
    main()
