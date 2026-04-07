import { createClient } from '@/lib/supabase/server';
import { updateProductAction } from '@/app/admin/actions';
import { notFound } from 'next/navigation';
import ProductForm from '../../nuevo/ProductForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('productos').select('nombre').eq('id', id).single();
  return { title: data ? `Editar: ${data.nombre} — Admin BYG` : 'Editar Producto' };
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categorias }] = await Promise.all([
    supabase.from('productos').select('*').eq('id', id).single(),
    supabase.from('categorias').select('*').order('nombre'),
  ]);

  if (!product) notFound();

  const updateWithId = updateProductAction.bind(null, id);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/productos" className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a productos
        </a>
        <h1 className="text-2xl font-bold text-white">Editar Producto</h1>
        <p className="text-white/40 text-sm mt-0.5">{product.nombre}</p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <ProductForm
          action={updateWithId}
          categorias={categorias ?? []}
          product={product}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
