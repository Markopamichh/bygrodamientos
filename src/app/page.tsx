import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import BrandsStrip from '@/components/home/BrandsStrip';
import ContactBanner from '@/components/home/ContactBanner';

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
