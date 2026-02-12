import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { getWhatsAppLink } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const productMessage = `Hola, estoy interesado en: ${product.name}. ¿Podrían brindarme más información?`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            quality={75}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">⚙️</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-secondary mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Aplicaciones */}
        {product.applications.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Aplicaciones:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {product.applications.slice(0, 3).map((app, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-1">•</span>
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
            className="w-full bg-primary text-white text-center py-2 rounded hover:bg-primary-dark transition font-medium text-sm"
          >
            Ver Detalles
          </Link>
          <a
            href={getWhatsAppLink(productMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 text-white text-center py-2 rounded hover:bg-green-600 transition font-medium text-sm"
          >
            Consultar
          </a>
        </div>

        {/* Stock indicator */}
        {product.inStock && (
          <div className="mt-3 flex items-center justify-center text-xs text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
            Disponible
          </div>
        )}
      </div>
    </div>
  );
}
