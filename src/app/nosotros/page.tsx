import React from 'react';
import type { Metadata } from 'next';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { companyHistory, companyMission, companyValues } from '@/data/company';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Empresa neuquina con más de 300 clientes en Patagonia. Distribuidores especializados en rodamientos y repuestos industriales.',
  keywords: ['byg rodamientos', 'empresa neuquen', 'rodamientos patagonia', 'sobre nosotros'],
};

export default function NosotrosPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Nosotros' }]} />

      <Container className="py-16">
        {/* Título principal */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
            Sobre <span className="text-primary">BYG Rodamientos</span>
          </h1>
          <p className="text-xl text-gray-600">
            Compromiso con la excelencia en rodamientos industriales desde Neuquén
          </p>
        </div>

        {/* Historia */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">Nuestra Historia</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {companyHistory}
            </p>
          </div>
        </div>

        {/* Misión */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-primary/5 rounded-lg p-8 border-l-4 border-primary">
            <h2 className="text-2xl font-bold text-secondary mb-4">Nuestra Misión</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {companyMission}
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-secondary text-center mb-12">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">
                      {value.icon === 'users' && '👥'}
                      {value.icon === 'clock' && '🕐'}
                      {value.icon === 'briefcase' && '💼'}
                      {value.icon === 'wrench' && '🔧'}
                      {value.icon === 'globe' && '🌍'}
                      {value.icon === 'package' && '📦'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-secondary mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por qué elegirnos */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-secondary mb-6 text-center">
              ¿Por Qué Elegirnos?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-secondary mb-1">Experiencia Comprobada</h3>
                  <p className="text-gray-600 text-sm">
                    Años de trayectoria en el sector industrial de la región
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-secondary mb-1">Cobertura Regional</h3>
                  <p className="text-gray-600 text-sm">
                    Servicio a toda la Patagonia con logística eficiente
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-secondary mb-1">Stock Permanente</h3>
                  <p className="text-gray-600 text-sm">
                    Productos disponibles para entrega inmediata
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-secondary mb-1">Soporte Técnico</h3>
                  <p className="text-gray-600 text-sm">
                    Asesoramiento especializado en cada consulta
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-secondary mb-1">Importación Directa</h3>
                  <p className="text-gray-600 text-sm">
                    Capacidad de importar productos especiales
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-secondary mb-1">Relación Calidad-Precio</h3>
                  <p className="text-gray-600 text-sm">
                    Mejores marcas a precios competitivos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
