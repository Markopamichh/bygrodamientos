import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { categories } from '@/data/categories';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Páginas estáticas
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Páginas de categorías (estructura estática del sitio)
  const categoryPages = categories
    .filter((c) => !c.isCustomOrder)
    .map((category) => ({
      url: `${baseUrl}/productos/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Páginas de productos — dinámico desde Supabase
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from('productos')
      .select('slug, updated_at, categorias(slug)')
      .eq('activo', true);

    productPages = (products ?? []).map((p) => {
      const catSlug = (p.categorias as { slug: string } | null)?.slug ?? '';
      return {
        url: `${baseUrl}/productos/${catSlug}/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });
  } catch {
    // Si Supabase no está disponible en build time, se omiten los productos
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
