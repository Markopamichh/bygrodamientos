import React from 'react';
import Container from '@/components/shared/Container';
import { companyValues } from '@/data/company';

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compromiso con la excelencia y el servicio personalizado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companyValues.map((value, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">
                    {value.icon === 'users' && '👥'}
                    {value.icon === 'clock' && '🕐'}
                    {value.icon === 'briefcase' && '💼'}
                    {value.icon === 'wrench' && '🔧'}
                    {value.icon === 'globe' && '🌍'}
                    {value.icon === 'package' && '📦'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
