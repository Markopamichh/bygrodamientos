import { createClient } from '@/lib/supabase/server';
import { createProductAction } from '@/app/admin/actions';
import ProductForm from './ProductForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo Producto — Admin BYG' };

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const { data: categorias } = await supabase.from('categorias').select('*').order('nombre');

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/productos" className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a productos
        </a>
        <h1 className="text-2xl font-bold text-white">Nuevo Producto</h1>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <ProductForm
          action={createProductAction}
          categorias={categorias ?? []}
          submitLabel="Crear producto"
        />
      </div>
    </div>
  );
}
