'use client';

import { useEffect, useState } from 'react';
import { fetchClientes, insertCliente, updateCliente } from './actions';

interface Cliente {
  id: string;
  nombre: string;
  razon_social: string | null;
  cuit_cuil: string | null;
  condicion_iva: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
}

const IVA_LABELS: Record<string, string> = {
  responsable_inscripto: 'Resp. Inscripto',
  monotributista: 'Monotributista',
  consumidor_final: 'Cons. Final',
  exento: 'Exento',
};
const IVA_COLORS: Record<string, string> = {
  responsable_inscripto: 'bg-blue-500/15 text-blue-400',
  monotributista: 'bg-purple-500/15 text-purple-400',
  consumidor_final: 'bg-white/10 text-white/50',
  exento: 'bg-emerald-500/15 text-emerald-400',
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; cliente?: Cliente }>({ open: false });
  const [q, setQ] = useState('');

  async function cargar() {
    const data = await fetchClientes();
    setClientes(data as Cliente[]);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = clientes.filter(c =>
    !q ||
    c.nombre.toLowerCase().includes(q.toLowerCase()) ||
    (c.razon_social ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (c.cuit_cuil ?? '').includes(q)
  );

  return (
    <div className="p-6 md:p-8">
      {modal.open && (
        <ClienteModal
          cliente={modal.cliente}
          onClose={() => { setModal({ open: false }); cargar(); }}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-white/40 text-sm mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo cliente
        </button>
      </div>

      <input
        value={q} onChange={e => setQ(e.target.value)}
        placeholder="Buscar por nombre, razón social o CUIT..."
        className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-500/50 mb-6"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm mb-3">{q ? 'Sin resultados' : 'No hay clientes todavía'}</p>
          {!q && <button onClick={() => setModal({ open: true })} className="text-yellow-400 text-sm hover:text-yellow-300">Agregar el primero →</button>}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden md:table-cell">CUIT/CUIL</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden lg:table-cell">Condición IVA</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtrados.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white/80 text-sm font-medium">{c.nombre}</p>
                    {c.razon_social && <p className="text-white/30 text-xs">{c.razon_social}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/50 text-sm font-mono">{c.cuit_cuil ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IVA_COLORS[c.condicion_iva] ?? 'bg-white/10 text-white/50'}`}>
                      {IVA_LABELS[c.condicion_iva] ?? c.condicion_iva}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="space-y-0.5">
                      {c.email && <p className="text-white/40 text-xs">{c.email}</p>}
                      {c.telefono && <p className="text-white/40 text-xs">{c.telefono}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {c.telefono && (
                        <a href={`https://wa.me/${c.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded text-white/20 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                      <button onClick={() => setModal({ open: true, cliente: c })}
                        className="p-1.5 rounded text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────

function ClienteModal({ cliente, onClose }: { cliente?: Cliente; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: fd.get('nombre') as string,
      razon_social: (fd.get('razon_social') as string) || null,
      cuit_cuil: (fd.get('cuit_cuil') as string) || null,
      condicion_iva: fd.get('condicion_iva') as string,
      email: (fd.get('email') as string) || null,
      telefono: (fd.get('telefono') as string) || null,
      direccion: (fd.get('direccion') as string) || null,
      notas: (fd.get('notas') as string) || null,
    };
    const result = cliente
      ? await updateCliente(cliente.id, payload)
      : await insertCliente(payload);
    if (result.error) { setError(result.error); setLoading(false); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#1a1a1a]">
          <h2 className="text-white font-semibold">{cliente ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nombre *" name="nombre" defaultValue={cliente?.nombre} required placeholder="Juan Pérez / Empresa SA" />
          <Field label="Razón social" name="razon_social" defaultValue={cliente?.razon_social ?? ''} placeholder="Para empresas" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="CUIT / CUIL" name="cuit_cuil" defaultValue={cliente?.cuit_cuil ?? ''} placeholder="20-12345678-9" />
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Condición IVA</label>
              <select name="condicion_iva" defaultValue={cliente?.condicion_iva ?? 'consumidor_final'}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50">
                <option value="consumidor_final">Consumidor Final</option>
                <option value="responsable_inscripto">Resp. Inscripto</option>
                <option value="monotributista">Monotributista</option>
                <option value="exento">Exento</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" name="email" type="email" defaultValue={cliente?.email ?? ''} placeholder="correo@empresa.com" />
            <Field label="Teléfono / WhatsApp" name="telefono" defaultValue={cliente?.telefono ?? ''} placeholder="+54 9 299 ..." />
          </div>
          <Field label="Dirección" name="direccion" defaultValue={cliente?.direccion ?? ''} placeholder="Calle 123, Neuquén" />
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Notas</label>
            <textarea name="notas" defaultValue={cliente?.notas ?? ''} rows={2} placeholder="Observaciones..." className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20 resize-none" />
          </div>
          {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-sm transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : cliente ? 'Guardar' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue, required, placeholder, type = 'text' }: {
  label: string; name: string; defaultValue?: string; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder}
        className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20" />
    </div>
  );
}
