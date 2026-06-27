'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { ItemFormState } from '../../actions';

interface Producto {
  id: string;
  nombre: string;
}

interface Item {
  id: string;
  codigo: string;
  fabricante: string;
  numero_parte: string;
  medida_interna: number | null;
  medida_externa: number | null;
  ancho: number | null;
  stock_minimo: number;
  precio_costo: number | null;
  precio_venta: number | null;
  ubicacion: string;
  activo: boolean;
  producto_id: string;
}

interface Props {
  action: (prevState: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  productos: Producto[];
  item: Item;
  backHref: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
    >
      {pending && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  );
}

export default function EditItemForm({ action, productos, item, backHref }: Props) {
  const [state, formAction] = useFormState<ItemFormState, FormData>(action, {});

  const err = (field: string) => state.errors?.[field]?.[0];

  const inputClass = (field: string) =>
    `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 transition-colors ${
      err(field)
        ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30'
        : 'border-white/10 focus:border-yellow-500/50 focus:ring-yellow-500/30'
    }`;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Identificación */}
      <fieldset className="space-y-4">
        <legend className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
          Identificación
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-white/60 mb-1.5">
              Producto (familia) <span className="text-red-400">*</span>
            </label>
            <select
              name="producto_id"
              className={inputClass('producto_id')}
              defaultValue={item.producto_id}
            >
              <option value="" disabled>
                Seleccionar familia de producto
              </option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {err('producto_id') && (
              <p className="text-red-400 text-xs mt-1">{err('producto_id')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Código <span className="text-red-400">*</span>
            </label>
            <input
              name="codigo"
              className={inputClass('codigo')}
              defaultValue={item.codigo}
              placeholder="Ej: 6204"
            />
            {err('codigo') && <p className="text-red-400 text-xs mt-1">{err('codigo')}</p>}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Fabricante</label>
            <input
              name="fabricante"
              className={inputClass('fabricante')}
              defaultValue={item.fabricante}
              placeholder="Ej: SKF / FAG / NSK"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Número de parte</label>
            <input
              name="numero_parte"
              className={inputClass('numero_parte')}
              defaultValue={item.numero_parte}
              placeholder="Ej: 6204-2RS1"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Ubicación en depósito</label>
            <input
              name="ubicacion"
              className={inputClass('ubicacion')}
              defaultValue={item.ubicacion}
              placeholder="Ej: Estante A3"
            />
          </div>
        </div>
      </fieldset>

      {/* Medidas */}
      <fieldset className="space-y-4">
        <legend className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
          Medidas (mm)
        </legend>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Ø interno</label>
            <input
              name="medida_interna"
              type="number"
              min="0"
              step="0.01"
              className={inputClass('medida_interna')}
              defaultValue={item.medida_interna ?? ''}
              placeholder="Ej: 20"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Ø externo</label>
            <input
              name="medida_externa"
              type="number"
              min="0"
              step="0.01"
              className={inputClass('medida_externa')}
              defaultValue={item.medida_externa ?? ''}
              placeholder="Ej: 47"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Ancho</label>
            <input
              name="ancho"
              type="number"
              min="0"
              step="0.01"
              className={inputClass('ancho')}
              defaultValue={item.ancho ?? ''}
              placeholder="Ej: 14"
            />
          </div>
        </div>
      </fieldset>

      {/* Precios y mínimo */}
      <fieldset className="space-y-4">
        <legend className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
          Precios y stock mínimo
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Stock mínimo (alerta)</label>
            <input
              name="stock_minimo"
              type="number"
              min="0"
              className={inputClass('stock_minimo')}
              defaultValue={item.stock_minimo}
            />
            <p className="text-white/25 text-xs mt-1">
              El stock actual se gestiona solo con movimientos
            </p>
          </div>
          <div />
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Precio costo (ARS)</label>
            <input
              name="precio_costo"
              type="number"
              min="0"
              step="0.01"
              className={inputClass('precio_costo')}
              defaultValue={item.precio_costo ?? ''}
              placeholder="Dejar vacío si no aplica"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Precio venta (ARS)</label>
            <input
              name="precio_venta"
              type="number"
              min="0"
              step="0.01"
              className={inputClass('precio_venta')}
              defaultValue={item.precio_venta ?? ''}
              placeholder="Dejar vacío si no aplica"
            />
          </div>
        </div>
      </fieldset>

      {/* Estado en inventario */}
      <fieldset>
        <legend className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
          Estado en inventario
        </legend>
        <div className="flex items-center gap-3">
          <input type="hidden" name="activo" value="false" />
          <input
            type="checkbox"
            id="activo"
            name="activo"
            value="true"
            defaultChecked={item.activo}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/30 focus:ring-offset-0"
          />
          <label htmlFor="activo" className="text-sm text-white/70 cursor-pointer">
            Ítem activo en el inventario
          </label>
        </div>
        <p className="text-white/25 text-xs mt-2 ml-7">
          Desactivar oculta el ítem del listado de stock. No afecta la web.
        </p>
      </fieldset>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <SubmitButton />
        <a
          href={backHref}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
