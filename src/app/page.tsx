import React from 'react';
import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import BrandsStrip from '@/components/home/BrandsStrip';
import ContactBanner from '@/components/home/ContactBanner';

export const metadata: Metadata = {
  title: 'BYG Rodamientos | Distribuidor en Neuquén',
  description: 'Distribuidor líder de rodamientos, retenes, correas y componentes industriales en Neuquén. Más de 15 años de experiencia. Entrega en 48 hs. Stock permanente.',
  keywords: [
    'rodamientos neuquen', 'distribuidora rodamientos', 'retenes neuquen',
    'correas industriales', 'componentes transmision', 'byg rodamientos',
    'rodamientos patagonia', 'repuestos industriales neuquen',
  ],
  openGraph: {
    title: 'BYG Rodamientos — Distribuidor en Neuquén',
    description: 'Rodamientos, retenes, correas y componentes industriales. Stock permanente y entrega rápida en Neuquén y la Patagonia.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <WhyChooseUs />
      <BrandsStrip />
      <ContactBanner />
    </>
  );
}
