import { createClient } from '@/lib/supabase/server';
import { createCategoriaAction, deleteCategoriaAction } from '@/app/admin/actions';
import CategoriaForm from './CategoriaForm';
import DeleteCategoriaButton from './DeleteCategoriaButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categorías — Admin BYG' };

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, slug, created_at')
    .order('nombre');

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Categorías</h1>
        <p className="text-white/40 text-sm mt-0.5">{categorias?.length ?? 0} categorías</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-white font-medium text-sm">Categorías existentes</h2>
          </div>
          <div className="divide-y divide-white/5">
            {categorias?.map((c) => (
              <div key={c.id} className="px-5 py-3.5 flex items-center justify-between group">
                <div>
                  <p className="text-white/80 text-sm">{c.nombre}</p>
                  <p className="text-white/30 text-xs font-mono">{c.slug}</p>
                </div>
                <DeleteCategoriaButton id={c.id} nombre={c.nombre} />
              </div>
            ))}
            {(!categorias || categorias.length === 0) && (
              <p className="px-5 py-8 text-center text-white/30 text-sm">No hay categorías</p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4">Agregar categoría</h2>
          <CategoriaForm action={createCategoriaAction} />
        </div>
      </div>
    </div>
  );
}
