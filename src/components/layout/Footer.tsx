import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import { CONTACT } from '@/lib/constants';
import { categories } from '@/data/categories';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white mt-20">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Empresa */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/Logo/logobygoriginal.png"
                alt="BYG Rodamientos"
                width={180}
                height={200}
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Distribuidores de rodamientos industriales y repuestos en Neuquén.
              Más de 300 clientes en Patagonia.
            </p>
            <p className="text-sm text-gray-400">
              Stock permanente y entrega rápida
            </p>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Productos</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/productos/${cat.slug}`}
                    className="text-gray-300 hover:text-primary transition text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary transition text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-gray-300 hover:text-primary transition text-sm">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-gray-300 hover:text-primary transition text-sm">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-primary transition text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">
                <span className="font-medium">Dirección:</span><br />
                {CONTACT.address}
              </li>
              <li>
                <a href={`tel:${CONTACT.phone}`} className="text-gray-300 hover:text-primary transition">
                  Tel: {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="text-gray-300 hover:text-primary transition">
                  {CONTACT.email}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Horarios */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <span className="font-medium">Lunes a Viernes:</span> 8:00 - 18:00
            </div>
            <div>
              <span className="font-medium">Sábados:</span> 9:00 - 13:00
            </div>
            <div>
              <span className="font-medium">Domingos:</span> Cerrado
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} BYG Rodamientos. Todos los derechos reservados.</p>
        </div>
      </Container>
    </footer>
  );
}
