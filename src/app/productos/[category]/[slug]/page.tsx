import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { categories } from '@/data/categories';
import { allProducts, getProductBySlug, getRelatedProducts } from '@/data/products';
import { getWhatsAppLink } from '@/lib/utils';
import { CONTACT } from '@/lib/constants';
import ProductCard from '@/components/products/ProductCard';

interface ProductPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];

  allProducts.forEach((product) => {
    const category = categories.find((cat) => cat.id === product.category);
    if (category) {
      params.push({
        category: category.slug,
        slug: product.slug,
      });
    }
  });

  return params;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }

  return {
    title: product.seo.metaTitle,
    description: product.seo.metaDescription,
    keywords: product.seo.keywords,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category: categorySlug, slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = categories.find((cat) => cat.id === product.category);
  const relatedProducts = getRelatedProducts(product.id);
  const productMessage = `Hola, estoy interesado en: ${product.name}. ¿Podrían brindarme más información y disponibilidad?`;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Productos', href: '/productos' },
          { label: category?.name || '', href: `/productos/${categorySlug}` },
          { label: product.name },
        ]}
      />

      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden mb-4">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt}
                  fill
                  className="object-contain p-8"
                  priority
                  quality={85}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-9xl">⚙️</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              {product.name}
            </h1>

            {product.manufacturer && (
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Fabricante:</span> {product.manufacturer}
              </p>
            )}

            {product.partNumber && (
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Código:</span> {product.partNumber}
              </p>
            )}

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {product.longDescription}
            </p>

            {/* Stock Status */}
            {product.inStock && (
              <div className="flex items-center text-green-600 mb-6">
                <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                <span className="font-medium">Disponible en stock</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href={getWhatsAppLink(productMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-medium transition text-center inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Consultar por WhatsApp
              </a>
              <a
                href={`tel:${CONTACT.phone}`}
                className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition text-center"
              >
                📞 Llamar
              </a>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-secondary mb-3">
                  Características Destacadas
                </h2>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {Object.keys(product.specifications).length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Especificaciones Técnicas
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-3 font-medium text-gray-700 w-1/3">
                        {key}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications */}
        {product.applications.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Aplicaciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.applications.map((app, index) => (
                <div
                  key={index}
                  className="bg-gray-50 px-4 py-3 rounded-lg flex items-center"
                >
                  <span className="text-primary mr-3">▪</span>
                  <span className="text-gray-700">{app}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
