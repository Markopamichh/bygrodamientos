import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductGrid from '@/components/products/ProductGrid';
import { categories } from '@/data/categories';
import { createClient } from '@/lib/supabase/server';
import type { ProductoRow, CategoriaRow } from '@/types/database';
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
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return { title: 'Categoría no encontrada' };
  return {
    title: category.seo.metaTitle,
    description: category.seo.metaDescription,
    keywords: category.seo.keywords,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const supabase = await createClient();

  // Get Supabase category ID by slug
  const { data: dbCategory } = await supabase
    .from('categorias')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  let products: Product[] = [];

  if (dbCategory) {
    const { data: dbProducts } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria_id', dbCategory.id)
      .eq('activo', true)
      .order('nombre');

    products = (dbProducts ?? []).map((p) => mapProduct(p as ProductoRow, categorySlug));
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Productos', href: '/productos' },
          { label: category.name },
        ]}
      />

      <Container className="py-16">
        <div className="mb-12">
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">{category.name}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary mb-4">
            {category.name}
          </h1>
          <p className="text-lg text-stone-500 max-w-3xl">{category.longDescription}</p>
        </div>

        {category.subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-xl font-bold text-secondary mb-4">Subcategorías</h2>
            <div className="flex flex-wrap gap-3">
              {category.subcategories.map((subcat) => (
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
