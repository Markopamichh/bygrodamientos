import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { getWhatsAppLink } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const IMAGE_FIT: Record<string, string> = {
  'motorreductores':        'object-contain scale-[1.6]',
  'motores-electricos':     'object-contain scale-[1.35]',
  'mangueras-industriales': 'object-contain scale-[1.25]',
  'retenes':                'object-cover',
};

export default function ProductCard({ product }: ProductCardProps) {
  const isEncargo = product.availability === 'encargo';

  const whatsappMessage = isEncargo
    ? `Hola, me gustaría consultar precio y disponibilidad para: ${product.name} (pedido por encargo). ¿Podrían cotizarme?`
    : `Hola, estoy interesado en: ${product.name}. ¿Podrían brindarme más información?`;

  return (
    <div className="card-accent group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-500 ease-out-expo">
      {/* Product Image */}
      <div className="aspect-square bg-stone-50 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <>
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt}
              fill
              className={`${IMAGE_FIT[product.category] ?? 'object-contain scale-[1.18]'} group-hover:scale-[1.05] transition-transform duration-700 ease-out-expo`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              quality={75}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-16 h-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
        )}

      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        <p className="text-sm text-stone-500 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Aplicaciones */}
        {product.applications.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-stone-400 mb-1.5">Aplicaciones:</p>
            <ul className="text-xs text-stone-500 space-y-1">
              {product.applications.slice(0, 3).map((app, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-1.5 mt-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
                  </span>
                  {app}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/productos/${product.category}/${product.slug}`}
            className="w-full bg-primary text-white text-center py-2.5 rounded-xl hover:bg-primary-dark transition-all duration-300 ease-out-expo font-medium text-sm hover:shadow-lg hover:shadow-primary/20"
          >
            Ver Detalles
          </Link>
          <a
            href={getWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white text-center py-2.5 rounded-xl hover:bg-[#1da851] transition-all duration-300 ease-out-expo font-medium text-sm inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {isEncargo ? 'Consultar precio' : 'Consultar'}
          </a>
        </div>
      </div>
    </div>
  );
}
