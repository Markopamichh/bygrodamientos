import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { categories } from '@/data/categories';
import { createAdminClient } from '@/lib/supabase/server';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Catálogo de Productos',
  description: 'Catálogo completo: rodamientos industriales, retenes, componentes de transmisión, herramientas y más.',
  keywords: ['catalogo rodamientos', 'productos industriales', 'rodamientos neuquen', 'retenes'],
  alternates: { canonical: '/productos' },
};

// Íconos SVG por slug de categoría
const ICONS: Record<string, React.ReactNode> = {
  rodamientos: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
  retenes: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1.5" />
    </svg>
  ),
  transmision: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  herramientas: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.658 5.659a2.25 2.25 0 01-3.182-3.182l5.659-5.659m0 0l-1.83-1.83a1.5 1.5 0 010-2.122l3.464-3.464a3 3 0 014.243 0l.707.707a3 3 0 010 4.243l-3.464 3.464a1.5 1.5 0 01-2.122 0l-1.83-1.83z" />
    </svg>
  ),
  sellos: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  automotriz: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
};

// Ícono genérico para categorías sin definición específica
const DEFAULT_ICON = (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

// WhatsApp de BYG (para sellos mecánicos por encargo)
const WHATSAPP_BYG = 'https://wa.me/5492994019699';

export default async function ProductosPage() {
  const supabase = createAdminClient();

  // Todas las categorías de la DB + conteo de productos
  const [{ data: dbCats }, { data: counts }] = await Promise.all([
    supabase.from('categorias').select('nombre, slug').order('nombre'),
    supabase.from('productos').select('categoria_slug').eq('activo', true),
  ]);

  // Conteo por slug
  const countMap: Record<string, number> = {};
  for (const p of counts ?? []) {
    const s = p.categoria_slug as string;
    if (s) countMap[s] = (countMap[s] ?? 0) + 1;
  }

  // Merge: hardcoded primero (para mantener orden y nombre bonito), luego nuevas de DB
  const hardcodedSlugs = new Set(categories.map((c) => c.slug));
  const extraCats = (dbCats ?? []).filter((c) => !hardcodedSlugs.has(c.slug as string));

  return (
    <>
      <Breadcrumbs items={[{ label: 'Productos' }]} />

      <Container className="py-12">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">Nuestro catálogo</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary mb-4">
            Catálogo de <span className="text-primary">Productos</span>
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Stock propio en las categorías principales. El resto del catálogo está disponible <strong>por encargo</strong> — consultanos precio y plazo por WhatsApp.
          </p>
        </div>

        {/* Grid compacto — 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

          {/* Categorías hardcoded (stock propio) */}
          {categories.map((cat) => {
            const count = countMap[cat.slug] ?? 0;
            if (cat.isCustomOrder) {
              return (
                <a
                  key={cat.id}
                  href={`${WHATSAPP_BYG}?text=${encodeURIComponent('Hola, quiero consultar por sellos mecánicos')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-start gap-3 bg-white border border-stone-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all duration-300"
                >
                  <div className="p-2.5 rounded-lg bg-stone-50 text-stone-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {ICONS[cat.id] ?? DEFAULT_ICON}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-secondary text-sm leading-tight mb-1 group-hover:text-primary transition-colors">{cat.name}</h2>
                    <p className="text-xs text-stone-400">Consultar por WhatsApp</p>
                  </div>
                </a>
              );
            }

            return (
              <Link
                key={cat.id}
                href={`/productos/${cat.slug}`}
                className="group flex flex-col items-start gap-3 bg-white border border-stone-200 rounded-xl p-4 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="p-2.5 rounded-lg bg-stone-50 text-stone-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {ICONS[cat.id] ?? DEFAULT_ICON}
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-secondary text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h2>
                  {count > 0 && (
                    <p className="text-xs text-stone-400">{count} productos</p>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Categorías nuevas de DB (por encargo) */}
          {extraCats.map((cat) => {
            const count = countMap[cat.slug as string] ?? 0;
            return (
              <Link
                key={cat.slug}
                href={`/productos/${cat.slug}`}
                className="group flex flex-col items-start gap-3 bg-white border border-stone-200 rounded-xl p-4 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="p-2.5 rounded-lg bg-stone-50 text-stone-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {ICONS[cat.slug as string] ?? DEFAULT_ICON}
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-secondary text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                    {cat.nombre}
                  </h2>
                  {count > 0 && (
                    <p className="text-xs text-stone-400">{count} productos</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </>
  );
}
