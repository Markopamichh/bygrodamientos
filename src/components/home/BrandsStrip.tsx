import React from 'react';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import { MARCAS_HOME } from '@/data/marcas';

// Duplicamos para el loop continuo del marquee
const LOOP = [...MARCAS_HOME, ...MARCAS_HOME];

export default function BrandsStrip() {
  return (
    <section className="py-16 bg-stone-50 border-y border-stone-200 overflow-hidden">
      <Container>
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Nuestras marcas</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary">
            Trabajamos con los mejores fabricantes
          </h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto text-sm">
            Rodamientos y accesorios de las marcas líderes a nivel mundial.
          </p>
        </div>
      </Container>

      {/* Marquee infinito */}
      <div className="relative">
        {/* Fades laterales */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 animate-marquee w-max">
          {LOOP.map((nombre, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center px-7 py-3.5 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
            >
              <span className="font-display font-bold text-stone-400 group-hover:text-secondary tracking-wider text-sm transition-colors duration-300 whitespace-nowrap">
                {nombre}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <Link
          href="/marcas"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium text-sm transition-colors duration-300 group"
        >
          Ver todas las marcas
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
