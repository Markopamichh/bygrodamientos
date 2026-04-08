import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import { CONTACT } from '@/lib/constants';
import { categories } from '@/data/categories';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Empresa */}
          <div>
            <div className="mb-6">
              <Image
                src="/images/Logo/logobyg1.png"
                alt="BYG Rodamientos"
                width={200}
                height={224}
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-4">
              Distribuidores de rodamientos industriales y repuestos en Neuquén.
              Más de 300 clientes en Patagonia.
            </p>
            <p className="text-sm text-stone-500">
              Stock permanente y entrega rápida
            </p>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-300 mb-5">Productos</h3>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/productos/${cat.slug}`}
                    className="text-stone-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-300 mb-5">Navegación</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/nosotros', label: 'Sobre Nosotros' },
                { href: '/productos', label: 'Catálogo' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-300 mb-5">Contacto</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-stone-400">{CONTACT.address}</span>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors duration-300">
                  <svg className="w-4 h-4 text-stone-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors duration-300">
                  <svg className="w-4 h-4 text-stone-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {CONTACT.email}
                </a>
              </li>
              <li className="pt-1">
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-5 py-2.5 rounded-lg transition-all duration-300 ease-out-expo text-sm font-medium hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Horarios */}
        <div className="mt-12 pt-8 border-t border-stone-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><span className="text-stone-400">Lun-Vie:</span> 8:30 - 17:00</span>
              </div>
              <span className="text-stone-600">|</span>
              <span><span className="text-stone-400">Sábado:</span> 9:00 - 13:00</span>
              <span className="text-stone-600">|</span>
              <span><span className="text-stone-400">Domingo:</span> Cerrado</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-stone-600">
          <p>&copy; {currentYear} BYG Rodamientos. Todos los derechos reservados.</p>
          <Link href="/admin" className="hover:text-stone-400 transition-colors duration-300">
            Panel Admin
          </Link>
        </div>
      </Container>
    </footer>
  );
}
