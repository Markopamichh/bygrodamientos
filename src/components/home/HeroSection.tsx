import React from 'react';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import Button from '@/components/shared/Button';
import { getWhatsAppLink } from '@/lib/utils';
import { BearingSceneWrapper, AnimatedCounter, FadeIn } from './HeroClientParts';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary min-h-[85vh] flex items-center -mt-16 md:-mt-[88px]">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div
          className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <Container className="relative z-10 py-20 md:py-28">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">

          {/* Left — texto (server-rendered for fast LCP) */}
          <div>
            {/* Logo */}
            <FadeIn delay="">
              <Image
                src="/images/Logo/logobyg1.png"
                alt="BYG Rodamientos"
                width={320}
                height={160}
                priority
                sizes="(max-width: 768px) 0px, 320px"
                className="hidden md:block h-28 md:h-36 w-auto object-contain mb-6"
              />
            </FadeIn>

            {/* Badge */}
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/10">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                La calidad que tu industria necesita
              </div>
            </FadeIn>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Rodamientos y Repuestos{' '}
              <span className="text-primary relative">
                Industriales
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtitle — this is the LCP element, now server-rendered */}
            <p className="text-lg md:text-xl text-stone-400 mb-10 max-w-lg leading-relaxed">
              Asesoramiento especializado, stock permanente y capacidad de importación
              internacional para toda la región patagónica.
            </p>

            {/* CTAs */}
            <FadeIn delay="delay-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={getWhatsAppLink('Hola, necesito asesoramiento sobre rodamientos industriales.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 ease-out-expo inline-flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Consultar por WhatsApp
                </a>
                <Button href="/productos" variant="outline" size="lg" className="!border-white/20 !text-white hover:!bg-white/10 !rounded-xl !px-8 !py-4">
                  Ver Catálogo
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Right — bearing 3D */}
          <FadeIn className="h-[360px] md:h-[460px] lg:h-[540px] w-full" delay="delay-400">
            <BearingSceneWrapper />
          </FadeIn>
        </div>

        {/* Stats bar */}
        <FadeIn delay="delay-500">
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl">
            {[
              { end: 300, suffix: '+', label: 'Clientes activos' },
              { end: 48, suffix: 'h', label: 'Entrega rápida' },
              { end: 40, suffix: '+', label: 'Años de experiencia en el rubro' },
              { end: 100, suffix: '%', label: 'Garantía total' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-white font-display mb-1">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-stone-500 group-hover:text-stone-400 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-10 md:h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
