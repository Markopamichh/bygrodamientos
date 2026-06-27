import React from 'react';
import type { Metadata } from 'next';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacte a BYG Rodamientos: tel. 0299-4462546, WhatsApp 299-672-6610. Atención personalizada y stock permanente en Neuquén.',
  keywords: ['contacto byg rodamientos', 'rodamientos neuquen contacto', 'telefono rodamientos', 'whatsapp rodamientos'],
};

export default function ContactoPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Contacto' }]} />

      <Container className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            Contáctenos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarlo. Complete el formulario o contáctenos directamente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Formulario */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Envíenos su Consulta
            </h2>
            <ContactForm />
          </div>

          {/* Información de contacto */}
          <div>
            <ContactInfo />
          </div>
        </div>

        {/* Mapa */}
        <div>
          <h2 className="text-2xl font-bold text-secondary mb-6 text-center">
            Nuestra Ubicación
          </h2>
          <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3102.8!2d-68.0591!3d-38.9516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDU3JzA1LjgiUyA2OMKwMDMnMzIuOCJX!5e0!3m2!1ses!2sar!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de BYG Rodamientos"
            />
          </div>
          <p className="text-center text-gray-600 mt-4">
            Collon Cura 240, Neuquén Capital, Neuquén
          </p>
        </div>
      </Container>
    </>
  );
}
