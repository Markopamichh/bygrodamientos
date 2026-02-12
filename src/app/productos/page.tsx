import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { categories } from '@/data/categories';

export const metadata: Metadata = {
  title: 'Catálogo de Productos',
  description: 'Catálogo completo: rodamientos industriales, retenes, componentes de transmisión, herramientas y sellos mecánicos.',
  keywords: ['catalogo rodamientos', 'productos industriales', 'rodamientos neuquen', 'retenes'],
};

export default function ProductosPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Productos' }]} />

      <Container className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            Catálogo de <span className="text-primary">Productos</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore nuestra amplia gama de rodamientos industriales, retenes y componentes
            para todo tipo de aplicaciones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/productos/${category.slug}`}
              className="group bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-xl"
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-6xl">⚙️</span>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-secondary mb-3 group-hover:text-primary transition">
                  {category.name}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {category.longDescription}
                </p>
                <div className="flex items-center text-primary font-medium group-hover:underline">
                  Ver productos
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
