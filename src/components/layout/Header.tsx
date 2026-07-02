'use client';

import React from 'react';
import { Home, Info, Package, Tag, Phone, MessageCircle } from 'lucide-react';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { CONTACT } from '@/lib/constants';

const NAV_ITEMS = [
  { name: 'Inicio', url: '/', icon: Home },
  { name: 'Nosotros', url: '/nosotros', icon: Info },
  { name: 'Productos', url: '/productos', icon: Package },
  { name: 'Marcas', url: '/marcas', icon: Tag },
  { name: 'Contacto', url: '/contacto', icon: Phone },
];

export default function Header() {
  return (
    <>
      {/* Navbar flotante tubelight */}
      <NavBar items={NAV_ITEMS} />

      {/* WhatsApp flotante */}
      <a
        href={`https://wa.me/${CONTACT.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed top-4 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5"
      >
        <MessageCircle size={18} strokeWidth={2.5} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </>
  );
}
