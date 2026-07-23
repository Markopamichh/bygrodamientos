import React from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductCard from '@/components/products/ProductCard';
import { categories } from '@/data/categories';
import { createPublicClient } from '@/lib/supabase/server';
import { getWhatsAppLink } from '@/lib/utils';
import { CONTACT } from '@/lib/constants';
import type { ProductoRow } from '@/types/database';
import type { Product, CategoryType } from '@/types/product';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

function mapProduct(p: ProductoRow, catSlug: string): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.nombre,
    category: catSlug as CategoryType,
    subcategory: p.subcategoria ?? '',
    description: p.descripcion ?? '',
    longDescription: p.descripcion_larga ?? '',
    images: p.imagen_url ? [{ url: p.imagen_url, alt: p.nombre }] : [],
    specifications: p.especificaciones ?? {},
    applications: p.aplicaciones ?? [],
    features: p.caracteristicas ?? [],
    inStock: p.stock > 0,
    availability: p.tipo_disponibilidad ?? 'stock',
    manufacturer: p.fabricante ?? undefined,
    partNumber: p.numero_parte ?? undefined,
    seo: {
      metaTitle: `${p.nombre} | BYG Rodamientos Neuquén`,
      metaDescription: p.descripcion ?? p.nombre,
      keywords: [p.nombre.toLowerCase()],
    },
  };
}

function rowFromData(id: string, data: Record<string, unknown>): ProductoRow {
  return {
    id,
    nombre: data.nombre as string,
    slug: data.slug as string,
    descripcion: (data.descripcion as string | null) ?? null,
    descripcion_larga: (data.descripcion_larga as string | null) ?? null,
    categoria_id: (data.categoria_id as string | null) ?? null,
    categoria_nombre: (data.categoria_nombre as string | null) ?? null,
    categoria_slug: (data.categoria_slug as string | null) ?? null,
    subcategoria: (data.subcategoria as string | null) ?? null,
    stock: data.stock as number,
    precio: (data.precio as number | null) ?? null,
    imagen_url: (data.imagen_url as string | null) ?? null,
    especificaciones: (data.especificaciones as Record<string, string>) ?? {},
    aplicaciones: (data.aplicaciones as string[]) ?? [],
    caracteristicas: (data.caracteristicas as string[]) ?? [],
    fabricante: (data.fabricante as string | null) ?? null,
    numero_parte: (data.numero_parte as string | null) ?? null,
    activo: data.activo as boolean,
    tipo_disponibilidad: ((data.tipo_disponibilidad as string) === 'encargo' ? 'encargo' : 'stock'),
    proveedor_id: (data.proveedor_id as string | null) ?? null,
    url_referencia_proveedor: (data.url_referencia_proveedor as string | null) ?? null,
    created_at: (data.created_at as string) ?? '',
    updated_at: (data.updated_at as string) ?? '',
  };
}

export async function generateStaticParams() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('productos')
      .select('slug, categoria_slug')
      .eq('activo', true);
    return (data ?? []).map((d) => ({
      category: d.categoria_slug ?? 'productos',
      slug: d.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('productos')
    .select('nombre, descripcion, categoria_slug')
    .eq('slug', slug)
    .eq('activo', true)
    .limit(1)
    .single();

  if (!data) return { title: 'Producto no encontrado', robots: { index: false, follow: false } };

  // El canonical siempre apunta a la categoría real del producto, nunca a la del
  // parámetro: si no coinciden, la página redirige a esta misma URL.
  const categoriaReal = (data.categoria_slug as string | null) ?? 'productos';

  return {
    title: `${data.nombre} | BYG Rodamientos Neuquén`,
    description: (data.descripcion as string | null) ?? (data.nombre as string),
    alternates: { canonical: `/productos/${categoriaReal}/${slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category: categorySlug, slug } = await params;
  const supabase = createPublicClient();

  const { data: productData } = await supabase
    .from('productos')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .limit(1)
    .single();

  if (!productData) notFound();

  // Un producto vive en una sola categoría. Sin este chequeo el mismo contenido
  // respondía 200 bajo cualquier categoría (incluso inexistente), generando
  // duplicados con canonical autorreferente ("Duplicada: sin versión canónica"
  // en Search Console). Se redirige 308 a la URL real en vez de 404 para no
  // perder los enlaces que ya apunten a la variante equivocada.
  const categoriaReal = productData.categoria_slug as string | null;
  if (categoriaReal && categoriaReal !== categorySlug) {
    permanentRedirect(`/productos/${categoriaReal}/${slug}`);
  }

  const rawProduct = rowFromData(productData.id, productData as Record<string, unknown>);
  const product = mapProduct(rawProduct, categorySlug);
  const category = categories.find((c) => c.slug === categorySlug);

  const { data: relatedData } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria_id', rawProduct.categoria_id ?? categorySlug)
    .eq('activo', true)
    .neq('id', productData.id)
    .limit(4);

  const relatedProducts: Product[] = (relatedData ?? []).map((d) => {
    const row: ProductoRow = {
      ...rowFromData(d.id, d as Record<string, unknown>),
      tipo_disponibilidad: ((d.tipo_disponibilidad as string) === 'encargo' ? 'encargo' : 'stock'),
      proveedor_id: (d.proveedor_id as string | null) ?? null,
      url_referencia_proveedor: (d.url_referencia_proveedor as string | null) ?? null,
    };
    return mapProduct(row, (d.categoria_slug as string | null) ?? categorySlug);
  });

  const IMAGE_FIT: Record<string, string> = {
    'motorreductores':        'object-contain scale-[1.6]',
    'motores-electricos':     'object-contain scale-[1.35]',
    'mangueras-industriales': 'object-contain scale-[1.25]',
    'retenes':                'object-cover',
  };

  const isEncargo = product.availability === 'encargo';
  const productMessage = isEncargo
    ? `Hola, me gustaría consultar precio y disponibilidad para: ${product.name} (pedido por encargo). ¿Podrían cotizarme?`
    : `Hola, estoy interesado en: ${product.name}. ¿Podrían brindarme más información y disponibilidad?`;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Productos', href: '/productos' },
          { label: category?.name ?? '', href: `/productos/${categorySlug}` },
          { label: product.name },
        ]}
      />

      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div>
            <div className="aspect-square bg-white border border-stone-200 rounded-2xl relative overflow-hidden flex items-center justify-center">
              {product.images.length > 0 ? (
                <>
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    fill
                    className={IMAGE_FIT[product.category] ?? 'object-contain scale-[1.18]'}
                    priority
                    quality={80}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-24 h-24 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
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

            {(product.description || product.longDescription) && (
              <p className="text-stone-600 mb-6 leading-relaxed">
                {product.description || product.longDescription}
              </p>
            )}

            {isEncargo ? (
              <div className="flex items-center gap-2.5 mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Disponible por encargo</p>
                  <p className="text-amber-700 text-xs">Consultanos precio y plazo de entrega</p>
                </div>
              </div>
            ) : product.inStock ? (
              <div className="flex items-center text-emerald-600 mb-6">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2.5 animate-pulse" />
                <span className="font-medium">Disponible en stock</span>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href={getWhatsAppLink(productMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-3.5 rounded-xl font-medium transition-all duration-300 ease-out-expo text-center inline-flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {isEncargo ? 'Consultar precio por WhatsApp' : 'Consultar por WhatsApp'}
              </a>
            </div>

            {product.features.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-secondary mb-4">Características Destacadas</h2>
                <ul className="space-y-2.5">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
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

        {Object.keys(product.specifications).length > 0 && (
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold text-secondary mb-6">Especificaciones Técnicas</h2>
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-stone-50' : 'bg-white'}>
                      <td className="px-6 py-3.5 font-medium text-stone-700 w-1/3 text-sm">{key}</td>
                      <td className="px-6 py-3.5 text-stone-500 text-sm">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {product.applications.length > 0 && (
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold text-secondary mb-6">Aplicaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.applications.map((app, i) => (
                <div key={i} className="bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl flex items-center">
                  <svg className="w-4 h-4 text-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                    <rect width="6" height="6" x="1" y="1" rx="1" />
                  </svg>
                  <span className="text-stone-600 text-sm">{app}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-secondary mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
