'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProveedorModal, DeleteProveedorButton } from './ProveedorModal';

interface Proveedor {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  contacto: string | null;
  notas: string | null;
  created_at: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; proveedor?: Proveedor }>({ open: false });
  const [q, setQ] = useState('');

  async function cargar() {
    const supabase = createClient();
    const { data } = await supabase.from('proveedores').select('*').order('nombre');
    setProveedores((data as Proveedor[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  function cerrarModal() {
    setModal({ open: false });
    cargar();
  }

  const filtrados = proveedores.filter(p =>
    !q || p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    (p.contacto ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      {modal.open && <ProveedorModal proveedor={modal.proveedor} onClose={cerrarModal} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Proveedores</h1>
          <p className="text-white/40 text-sm mt-0.5">{proveedores.length} proveedor{proveedores.length !== 1 ? 'es' : ''} registrado{proveedores.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo proveedor
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por nombre o contacto..."
          className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-500/50"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm mb-4">{q ? 'Sin resultados' : 'No hay proveedores todavía'}</p>
          {!q && (
            <button onClick={() => setModal({ open: true })} className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
              Agregar el primero →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(p => (
            <div key={p.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
              {/* Header card */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                  <span className="text-yellow-400 font-bold text-sm">{p.nombre.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{p.nombre}</h3>
                  {p.contacto && <p className="text-white/40 text-xs mt-0.5 truncate">Contacto: {p.contacto}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModal({ open: true, proveedor: p })}
                    className="p-1.5 rounded text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <DeleteProveedorButton id={p.id} nombre={p.nombre} />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                {p.telefono && (
                  <a href={`tel:${p.telefono}`} className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors group">
                    <svg className="w-3.5 h-3.5 shrink-0 text-white/25 group-hover:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {p.telefono}
                  </a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors group">
                    <svg className="w-3.5 h-3.5 shrink-0 text-white/25 group-hover:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {p.email}
                  </a>
                )}
                {p.sitio_web && (
                  <a href={p.sitio_web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors group truncate">
                    <svg className="w-3.5 h-3.5 shrink-0 text-white/25 group-hover:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="truncate">{p.sitio_web.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {p.notas && (
                  <p className="text-white/30 text-xs pt-1 border-t border-white/5 line-clamp-2">{p.notas}</p>
                )}
              </div>

              {/* WhatsApp rápido */}
              {p.telefono && (
                <a
                  href={`https://wa.me/${p.telefono.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-medium transition-colors border border-[#25D366]/20"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Contactar por WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
