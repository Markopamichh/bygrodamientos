import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ContactBanner from '@/components/home/ContactBanner';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <WhyChooseUs />
      <ContactBanner />
    </>
  );
}
