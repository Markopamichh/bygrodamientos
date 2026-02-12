import React from 'react';
import Container from '@/components/shared/Container';
import Button from '@/components/shared/Button';
import { CONTACT } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/utils';

export default function ContactBanner() {
  return (
    <section className="py-16 bg-primary text-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Necesita Asesoramiento Técnico?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Nuestro equipo está disponible para ayudarlo a encontrar la solución perfecta
            para sus necesidades industriales
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={`tel:${CONTACT.phone}`}
              className="bg-white text-primary px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition inline-flex items-center justify-center"
            >
              <span className="mr-2">📞</span>
              {CONTACT.phone}
            </a>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-md font-medium transition inline-flex items-center justify-center"
            >
              <span className="mr-2">💬</span>
              WhatsApp
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="bg-secondary hover:bg-secondary-light text-white px-8 py-3 rounded-md font-medium transition inline-flex items-center justify-center"
            >
              <span className="mr-2">✉️</span>
              Email
            </a>
          </div>

          <p className="text-sm opacity-75">
            Horario de atención: Lunes a Viernes 8:00 - 18:00 | Sábados 9:00 - 13:00
          </p>
        </div>
      </Container>
    </section>
  );
}
