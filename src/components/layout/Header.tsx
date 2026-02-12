'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import { CONTACT } from '@/lib/constants';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      {/* Top bar con información de contacto */}
      <div className="bg-secondary text-white py-2 hidden md:block">
        <Container>
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <a href={`tel:${CONTACT.phone}`} className="hover:text-primary transition">
                📞 {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-primary transition">
                ✉️ {CONTACT.email}
              </a>
            </div>
            <div>
              <span>Lun-Vie 8:00-18:00 | Sáb 9:00-13:00</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main navigation */}
      <nav className="py-5">
        <Container>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center py-2">
              <Image
                src="/images/Logo/logobygoriginal.png"
                alt="BYG Rodamientos"
                width={240}
                height={270}
                priority
                className="h-24 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-primary transition font-medium">
                Inicio
              </Link>
              <Link href="/nosotros" className="text-gray-700 hover:text-primary transition font-medium">
                Nosotros
              </Link>
              <Link href="/productos" className="text-gray-700 hover:text-primary transition font-medium">
                Productos
              </Link>
              <Link href="/contacto" className="text-gray-700 hover:text-primary transition font-medium">
                Contacto
              </Link>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition font-medium"
              >
                WhatsApp
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-primary transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  href="/nosotros"
                  className="text-gray-700 hover:text-primary transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nosotros
                </Link>
                <Link
                  href="/productos"
                  className="text-gray-700 hover:text-primary transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Productos
                </Link>
                <Link
                  href="/contacto"
                  className="text-gray-700 hover:text-primary transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contacto
                </Link>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="text-gray-700 hover:text-primary transition"
                >
                  📞 {CONTACT.phone}
                </a>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition font-medium text-center"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </Container>
      </nav>
    </header>
  );
}
