import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { categories } from '@/data/categories';
import { createPublicClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const homeUrl = new URL('/', baseUrl).toString();

  const staticPages = [
    { url: homeUrl,                  lastModified: new Date(), changeFrequency: 'daily' as const,   priority: 1 },
    { url: `${baseUrl}/nosotros`,    lastModified: new Date(), changeFrequency: 'monthly' as const,  priority: 0.8 },
    { url: `${baseUrl}/productos`,   lastModified: new Date(), changeFrequency: 'weekly' as const,   priority: 0.9 },
    { url: `${baseUrl}/marcas`,      lastModified: new Date(), changeFrequency: 'monthly' as const,  priority: 0.7 },
    { url: `${baseUrl}/contacto`,    lastModified: new Date(), changeFrequency: 'monthly' as const,  priority: 0.8 },
  ];

  const categoryPages = categories
    .filter((c) => !c.isCustomOrder)
    .map((category) => ({
      url: `${baseUrl}/productos/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('productos')
      .select('slug, categoria_slug, updated_at')
      .eq('activo', true);

    productPages = (data ?? []).map((p) => ({
      url: `${baseUrl}/productos/${p.categoria_slug}/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // Si Supabase no está disponible en build time, se omiten los productos
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
