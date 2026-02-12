import React from 'react';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Button from '@/components/shared/Button';
import { getWhatsAppLink } from '@/lib/utils';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6">
            Rodamientos y Repuestos Industriales en{' '}
            <span className="text-primary">Neuquén</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Más de 300 clientes confían en nosotros. Asesoramiento especializado,
            stock permanente y capacidad de importación internacional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={getWhatsAppLink('Hola, necesito asesoramiento sobre rodamientos industriales.')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-md font-medium transition inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Consultar por WhatsApp
            </a>
            <Button href="/contacto" variant="outline" size="lg">
              Formulario de Contacto
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">300+</div>
              <div className="text-sm text-gray-600 mt-1">Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">48h</div>
              <div className="text-sm text-gray-600 mt-1">Entrega</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-gray-600 mt-1">Años</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-gray-600 mt-1">Garantía</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
