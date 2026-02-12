import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductGrid from '@/components/products/ProductGrid';
import { categories } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = categories.find((cat) => cat.slug === categorySlug);

  if (!category) {
    return {
      title: 'Categoría no encontrada',
    };
  }

  return {
    title: category.seo.metaTitle,
    description: category.seo.metaDescription,
    keywords: category.seo.keywords,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = categories.find((cat) => cat.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(category.id);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Productos', href: '/productos' },
          { label: category.name },
        ]}
      />

      <Container className="py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            {category.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {category.longDescription}
          </p>
        </div>

        {/* Subcategories */}
        {category.subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-secondary mb-4">Subcategorías</h2>
            <div className="flex flex-wrap gap-3">
              {category.subcategories.map((subcat) => (
                <span
                  key={subcat.id}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary hover:text-white transition cursor-pointer"
                >
                  {subcat.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold text-secondary mb-6">
            Productos Disponibles
          </h2>
          <ProductGrid products={products} />
        </div>

        {/* CTA */}
        {products.length > 0 && (
          <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-secondary mb-3">
              ¿No encuentra lo que busca?
            </h3>
            <p className="text-gray-600 mb-6">
              Contamos con capacidad de importación para productos específicos.
              Contáctenos y le ayudaremos a encontrar la solución perfecta.
            </p>
            <a
              href="/contacto"
              className="inline-block bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-dark transition font-medium"
            >
              Contactar
            </a>
          </div>
        )}
      </Container>
    </>
  );
}
