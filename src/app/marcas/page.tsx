import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import { MARCAS_DESTACADAS, MARCAS_GRID } from '@/data/marcas';

export const metadata: Metadata = {
  title: 'Marcas | BYG Rodamientos Neuquén',
  description:
    'En BYG Rodamientos comercializamos productos de las marcas líderes mundiales: SKF, NSK, FAG, NTN, TIMKEN, INA, RINGSPANN y muchas más. Calidad garantizada en cada componente.',
};

export default function MarcasPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/bg-pattern.svg')] opacity-5 pointer-events-none" />
        <Container className="relative">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Marcas</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Fabricantes líderes a nivel mundial
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              En BYG Rodamientos comercializamos productos de los mejores fabricantes del mundo.
              Cada marca que ofrecemos representa décadas de ingeniería, calidad y confiabilidad
              para las aplicaciones industriales más exigentes de la Patagonia y el país.
            </p>
          </div>
        </Container>
      </section>

      {/* Marcas destacadas */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Distribución oficial</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary">
              Marcas principales que comercializamos
            </h2>
            <p className="text-stone-500 mt-3 max-w-2xl mx-auto">
              Representamos oficialmente a fabricantes de clase mundial, lo que nos permite ofrecerte
              productos originales con soporte técnico y garantía respaldada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MARCAS_DESTACADAS.map((marca) => (
              <div
                key={marca.nombre}
                className="group bg-stone-50 border border-stone-200 rounded-2xl p-7 hover:bg-white hover:shadow-xl hover:shadow-stone-200/50 hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-secondary group-hover:text-primary transition-colors duration-300">
                      {marca.nombre}
                    </h3>
                    <p className="text-stone-400 text-sm mt-0.5">{marca.origen}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full">
                    {marca.tipo}
                  </span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{marca.descripcion}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Grid de logos — todas las marcas */}
      <section className="py-20 bg-stone-50 border-t border-stone-200">
        <Container>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Catálogo completo</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary">
              Otras marcas que comercializamos
            </h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto">
              Accedé a un amplio catálogo de marcas reconocidas en rodamientos, transmisión,
              sellos, guías lineales y más.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {MARCAS_GRID.map((marca) => (
              <div
                key={marca.nombre}
                className="group bg-white border border-stone-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-primary/20 transition-all duration-300 aspect-[4/3]"
              >
                <div className="relative w-full flex-1 flex items-center justify-center">
                  <Image
                    src={marca.logoUrl}
                    alt={`Logo ${marca.nombre}`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 17vw"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-semibold text-stone-400 group-hover:text-secondary transition-colors duration-300 text-center leading-tight">
                  {marca.nombre}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-stone-200">
        <Container>
          <div className="bg-secondary rounded-2xl px-8 py-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                ¿Necesitás un producto de alguna de estas marcas?
              </h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                Consultanos por WhatsApp o visitá nuestro local en Neuquén. Si no lo tenemos en stock,
                lo conseguimos por encargo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/5492994000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Consultar por WhatsApp
                </a>
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-7 py-3.5 rounded-xl font-semibold border border-white/20 transition-all duration-300"
                >
                  Ver catálogo de productos
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
