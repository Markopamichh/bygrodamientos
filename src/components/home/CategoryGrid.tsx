import React from 'react';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import { categories } from '@/data/categories';

export default function CategoryGrid() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Amplio catálogo de rodamientos industriales, retenes y componentes para todo tipo de aplicaciones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/productos/${category.slug}`}
              className="group bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2 group-hover:text-primary transition">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
                <span className="inline-block mt-4 text-primary font-medium group-hover:underline">
                  Ver productos →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
