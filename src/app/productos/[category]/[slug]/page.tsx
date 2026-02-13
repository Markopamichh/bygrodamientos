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
            <div className="aspect-square bg-stone-50 border border-stone-200 rounded-2xl relative overflow-hidden">
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
                  <svg className="w-24 h-24 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-secondary mb-4">
              {product.name}
            </h1>

            {product.manufacturer && (
              <p className="text-stone-500 mb-3">
                <span className="font-medium text-stone-700">Fabricante:</span> {product.manufacturer}
              </p>
            )}

            {product.partNumber && (
              <p className="text-stone-500 mb-3">
                <span className="font-medium text-stone-700">Código:</span> {product.partNumber}
              </p>
            )}

            <p className="text-stone-600 mb-6 leading-relaxed">
              {product.longDescription}
            </p>

            {/* Stock Status */}
            {product.inStock && (
              <div className="flex items-center text-emerald-600 mb-6">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2.5 animate-pulse"></span>
                <span className="font-medium">Disponible en stock</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href={getWhatsAppLink(productMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-3.5 rounded-xl font-medium transition-all duration-300 ease-out-expo text-center inline-flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Consultar por WhatsApp
              </a>
              <a
                href={`tel:${CONTACT.phone}`}
                className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-medium transition-all duration-300 ease-out-expo text-center inline-flex items-center justify-center hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Llamar
              </a>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-secondary mb-4">
                  Características Destacadas
                </h2>
                <ul className="space-y-2.5">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-stone-600">{feature}</span>
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
            <h2 className="font-display text-2xl font-bold text-secondary mb-6">
              Especificaciones Técnicas
            </h2>
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <tr key={key} className={index % 2 === 0 ? 'bg-stone-50' : 'bg-white'}>
                      <td className="px-6 py-3.5 font-medium text-stone-700 w-1/3 text-sm">
                        {key}
                      </td>
                      <td className="px-6 py-3.5 text-stone-500 text-sm">
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
            <h2 className="font-display text-2xl font-bold text-secondary mb-6">
              Aplicaciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.applications.map((app, index) => (
                <div
                  key={index}
                  className="bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl flex items-center"
                >
                  <svg className="w-4 h-4 text-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                    <rect width="6" height="6" x="1" y="1" rx="1" />
                  </svg>
                  <span className="text-stone-600 text-sm">{app}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-secondary mb-6">
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
