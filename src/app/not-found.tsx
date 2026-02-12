import React from 'react';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Button from '@/components/shared/Button';

export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-secondary mb-4">
          Página No Encontrada
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Lo sentimos, la página que está buscando no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/" variant="primary" size="lg">
            Volver al Inicio
          </Button>
          <Button href="/productos" variant="outline" size="lg">
            Ver Productos
          </Button>
        </div>
      </div>
    </Container>
  );
}
