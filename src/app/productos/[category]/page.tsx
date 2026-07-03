import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductGrid from '@/components/products/ProductGrid';
import { categories } from '@/data/categories';
import { createPublicClient } from '@/lib/supabase/server';
import type { ProductoRow } from '@/types/database';
import type { Product, CategoryType } from '@/types/product';

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

function mapProduct(p: ProductoRow, catSlug: string): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.nombre,
    category: catSlug as CategoryType,
    subcategory: p.subcategoria ?? '',
    description: p.descripcion ?? '',
    longDescription: p.descripcion_larga ?? '',
    images: p.imagen_url ? [{ url: p.imagen_url, alt: p.nombre }] : [],
    specifications: p.especificaciones ?? {},
    applications: p.aplicaciones ?? [],
    features: p.caracteristicas ?? [],
    inStock: p.stock > 0,
    availability: p.tipo_disponibilidad ?? 'stock',
    manufacturer: p.fabricante ?? undefined,
    partNumber: p.numero_parte ?? undefined,
    seo: {
      metaTitle: `${p.nombre} | BYG Rodamientos Neuquén`,
      metaDescription: p.descripcion ?? p.nombre,
      keywords: [p.nombre.toLowerCase()],
    },
  };
}

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from('categorias').select('slug');
  const dbSlugs = (data ?? []).map((c) => ({ category: c.slug as string }));
  const hardcodedSlugs = categories.map((cat) => ({ category: cat.slug }));
  const all = [...hardcodedSlugs];
  for (const s of dbSlugs) {
    if (!all.find((x) => x.category === s.category)) all.push(s);
  }
  return all;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = categories.find((c) => c.slug === categorySlug);
  if (category) {
    return {
      title: category.seo.metaTitle,
      description: category.seo.metaDescription,
      keywords: category.seo.keywords,
      alternates: { canonical: `/productos/${categorySlug}` },
    };
  }
  const supabase = createPublicClient();
  const { data } = await supabase.from('categorias').select('nombre').eq('slug', categorySlug).single();
  if (!data) return { title: 'Categoría no encontrada' };
  return {
    title: `${data.nombre} | BYG Rodamientos Neuquén`,
    description: `${data.nombre} — BYG Rodamientos Neuquén`,
    alternates: { canonical: `/productos/${categorySlug}` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  // Try hardcoded first, then Supabase
  let categoryName: string;
  let categoryDesc: string;
  let categorySubcats: { id: string; name: string; slug: string }[] = [];

  const hardcoded = categories.find((c) => c.slug === categorySlug);
  if (hardcoded) {
    categoryName = hardcoded.name;
    categoryDesc = hardcoded.longDescription;
    categorySubcats = hardcoded.subcategories;
  } else {
    const supabase2 = createPublicClient();
    const { data: catData } = await supabase2.from('categorias').select('nombre').eq('slug', categorySlug).single();
    if (!catData) notFound();
    categoryName = catData.nombre;
    categoryDesc = '';
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria_slug', categorySlug)
    .eq('activo', true)
    .order('nombre');

  const products: Product[] = (data ?? []).map((d) => {
    const row: ProductoRow = {
      id: d.id,
      nombre: d.nombre,
      slug: d.slug,
      descripcion: d.descripcion ?? null,
      descripcion_larga: d.descripcion_larga ?? null,
      categoria_id: d.categoria_id ?? null,
      categoria_nombre: d.categoria_nombre ?? null,
      categoria_slug: d.categoria_slug ?? null,
      subcategoria: d.subcategoria ?? null,
      stock: d.stock,
      precio: d.precio ?? null,
      imagen_url: d.imagen_url ?? null,
      especificaciones: d.especificaciones ?? {},
      aplicaciones: d.aplicaciones ?? [],
      caracteristicas: d.caracteristicas ?? [],
      fabricante: d.fabricante ?? null,
      numero_parte: d.numero_parte ?? null,
      activo: d.activo,
      tipo_disponibilidad: (d.tipo_disponibilidad as 'stock' | 'encargo') ?? 'stock',
      proveedor_id: d.proveedor_id ?? null,
      url_referencia_proveedor: d.url_referencia_proveedor ?? null,
      created_at: d.created_at ?? '',
      updated_at: d.updated_at ?? '',
    };
    return mapProduct(row, categorySlug);
  });

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Productos', href: '/productos' },
          { label: categoryName },
        ]}
      />

      <Container className="py-16">
        <div className="mb-12">
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">{categoryName}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary mb-4">
            {categoryName}
          </h1>
          {categoryDesc && <p className="text-lg text-stone-500 max-w-3xl">{categoryDesc}</p>}
        </div>

        {categorySubcats.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-xl font-bold text-secondary mb-4">Subcategorías</h2>
            <div className="flex flex-wrap gap-3">
              {categorySubcats.map((subcat) => (
                <span
                  key={subcat.id}
                  className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm border border-stone-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 ease-out-expo cursor-pointer"
                >
                  {subcat.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-display text-2xl font-bold text-secondary mb-6">Productos Disponibles</h2>
          <ProductGrid products={products} />
        </div>

        {products.length > 0 && (
          <div className="mt-16 bg-stone-50 border border-stone-200 rounded-2xl p-8 md:p-10 text-center">
            <h3 className="font-display text-2xl font-bold text-secondary mb-3">
              ¿No encuentra lo que busca?
            </h3>
            <p className="text-stone-500 mb-6 max-w-xl mx-auto">
              Contamos con capacidad de importación para productos específicos.
              Contáctenos y le ayudaremos a encontrar la solución perfecta.
            </p>
            <a
              href="/contacto"
              className="inline-block bg-primary text-white px-8 py-3.5 rounded-xl hover:bg-primary-dark transition-all duration-300 ease-out-expo font-medium hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Contactar
            </a>
          </div>
        )}
      </Container>
    </>
  );
}
