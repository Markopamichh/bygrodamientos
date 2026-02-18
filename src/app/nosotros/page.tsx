import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { companyHistory, companyMission, companyValues } from '@/data/company';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Empresa neuquina con más de 300 clientes en Patagonia. Distribuidores especializados en rodamientos y repuestos industriales.',
  keywords: ['byg rodamientos', 'empresa neuquen', 'rodamientos patagonia', 'sobre nosotros'],
};

const valueIcons: Record<string, React.ReactNode> = {
  users: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  wrench: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.658 5.659a2.25 2.25 0 01-3.182-3.182l5.659-5.659m0 0l-1.83-1.83a1.5 1.5 0 010-2.122l3.464-3.464a3 3 0 014.243 0l.707.707a3 3 0 010 4.243l-3.464 3.464a1.5 1.5 0 01-2.122 0l-1.83-1.83z" />
    </svg>
  ),
  globe: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  package: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

export default function NosotrosPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Nosotros' }]} />

      <Container className="py-16">
        {/* Título principal */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">Conozca nuestra empresa</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary mb-6">
            Sobre <span className="text-primary">BYG Rodamientos</span>
          </h1>
          <p className="text-lg text-stone-500">
            Compromiso con la excelencia en rodamientos industriales desde Neuquén
          </p>
        </div>

        {/* Historia + Imagen del premio */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Historia texto */}
            <div className="bg-white border border-stone-200 rounded-2xl p-8">
              <h2 className="font-display text-2xl font-bold text-secondary mb-4">Nuestra Historia</h2>
              <p className="text-stone-600 leading-relaxed">
                {companyHistory}
              </p>
            </div>

            {/* Imagen premio */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden p-6">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/images/company/premio.png"
                      alt="Reconocimiento BYG Rodamientos"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <p className="text-center text-sm text-stone-400 mt-4 font-medium">
                    Reconocimiento a la trayectoria y excelencia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Misión */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 border-l-4 border-l-primary">
            <h2 className="font-display text-2xl font-bold text-secondary mb-4">Nuestra Misión</h2>
            <p className="text-stone-600 leading-relaxed text-lg">
              {companyMission}
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-secondary text-center mb-12">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyValues.map((value, index) => (
              <div
                key={index}
                className="card-accent group bg-white border border-stone-200 p-6 rounded-xl hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-500 ease-out-expo"
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {valueIcons[value.icon] || valueIcons.wrench}
                  </div>
                  <h3 className="font-display text-lg font-bold text-secondary mb-2">
                    {value.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por qué elegirnos */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold text-secondary mb-8 text-center">
              ¿Por Qué Elegirnos?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Experiencia Comprobada', desc: 'Años de trayectoria en el sector industrial de la región' },
                { title: 'Cobertura Regional', desc: 'Servicio a toda la Patagonia con logística eficiente' },
                { title: 'Stock Permanente', desc: 'Productos disponibles para entrega inmediata' },
                { title: 'Soporte Técnico', desc: 'Asesoramiento especializado en cada consulta' },
                { title: 'Importación Directa', desc: 'Capacidad de importar productos especiales' },
                { title: 'Relación Calidad-Precio', desc: 'Mejores marcas a precios competitivos' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-secondary mb-1">{item.title}</h3>
                    <p className="text-stone-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
