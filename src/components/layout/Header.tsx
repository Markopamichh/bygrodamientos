'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import { CONTACT } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/productos', label: 'Productos' },
  { href: '/marcas', label: 'Marcas' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ease-out-expo ${
      scrolled ? 'glass-header shadow-sm' : 'bg-transparent'
    }`}>
      <nav className="py-4">
        <Container>
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link href="/">
              <Image
                src="/images/Logo/logobyg1.png"
                alt="BYG Rodamientos"
                width={160}
                height={180}
                priority
                className="h-20 w-auto object-contain"
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-medium text-sm transition-colors duration-300 py-1
                    after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary
                    after:transition-all after:duration-300 after:ease-out-expo hover:after:w-full
                    ${scrolled ? 'text-stone-700 hover:text-primary' : 'text-white/90 hover:text-white'}`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 ${
                  scrolled
                    ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25'
                    : 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
                }`}
              >
                WhatsApp
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 rounded-full transition-all duration-300 ease-out-expo origin-center ${
                  mobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''
                } ${scrolled ? 'bg-stone-800' : 'bg-white'}`} />
                <span className={`w-full h-0.5 rounded-full transition-all duration-200 ${
                  mobileMenuOpen ? 'opacity-0 scale-x-0' : ''
                } ${scrolled ? 'bg-stone-800' : 'bg-white'}`} />
                <span className={`w-full h-0.5 rounded-full transition-all duration-300 ease-out-expo origin-center ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''
                } ${scrolled ? 'bg-stone-800' : 'bg-white'}`} />
              </div>
            </button>
          </div>
        </Container>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile panel */}
      <div className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 md:hidden transform transition-transform duration-500 ease-out-expo shadow-2xl ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-1 px-4 flex-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-stone-700 hover:text-primary hover:bg-primary/5 transition-all duration-300 font-medium py-3 px-4 rounded-lg ${
                  mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? `${(i + 1) * 75}ms` : '0ms' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="p-4 space-y-3 border-t border-stone-100">
            <a
              href={`tel:${CONTACT.phone}`}
              className="flex items-center gap-3 text-stone-600 hover:text-primary transition-colors py-2 px-4 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {CONTACT.phone}
            </a>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-all duration-300 font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
