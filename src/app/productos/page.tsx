import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { categories } from '@/data/categories';

export const metadata: Metadata = {
  title: 'Catálogo de Productos',
  description: 'Catálogo completo: rodamientos industriales, retenes, componentes de transmisión, herramientas y sellos mecánicos.',
  keywords: ['catalogo rodamientos', 'productos industriales', 'rodamientos neuquen', 'retenes'],
};

const categoryIcons: Record<string, React.ReactNode> = {
  rodamientos: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </svg>
  ),
  retenes: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-8 0a8 8 0 1016 0 8 8 0 10-16 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
    </svg>
  ),
  transmision: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  herramientas: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.658 5.659a2.25 2.25 0 01-3.182-3.182l5.659-5.659m0 0l-1.83-1.83a1.5 1.5 0 010-2.122l3.464-3.464a3 3 0 014.243 0l.707.707a3 3 0 010 4.243l-3.464 3.464a1.5 1.5 0 01-2.122 0l-1.83-1.83z" />
    </svg>
  ),
  sellos: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  automotriz: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
};

export default function ProductosPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Productos' }]} />

      <Container className="py-16">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">Nuestro catálogo</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary mb-4">
            Catálogo de <span className="text-primary">Productos</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-3xl mx-auto">
            Explore nuestra amplia gama de rodamientos industriales, retenes y componentes
            para todo tipo de aplicaciones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/productos/${category.slug}`}
              className="card-accent group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-500 ease-out-expo"
            >
              {/* Category visual */}
              <div className="aspect-[4/3] bg-stone-50 flex items-center justify-center relative overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out-expo"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="text-stone-300 group-hover:text-primary transition-all duration-500 ease-out-expo group-hover:scale-110">
                    {categoryIcons[category.id] || categoryIcons.rodamientos}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="font-display text-xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </h2>
                <p className="text-stone-500 mb-4 line-clamp-2 text-sm leading-relaxed">
                  {category.longDescription}
                </p>
                <div className="flex items-center text-primary font-medium text-sm">
                  Ver productos
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300 ease-out-expo"
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
