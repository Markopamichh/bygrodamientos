'use client';

import { useState, useRef } from 'react';
import { importProductsAction } from '@/app/admin/actions';
import type { ImportProductsResult } from '@/app/admin/actions';

// ── CSV parser (handles quoted fields with commas and escaped quotes) ──────────
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else if (ch === '\r' && !inQuotes) {
      // skip \r
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);

  if (lines.length < 2) return [];

  function splitRow(row: string): string[] {
    const cells: string[] = [];
    let cell = '';
    let q = false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === '"') {
        if (q && row[i + 1] === '"') { cell += '"'; i++; }
        else q = !q;
      } else if (c === ',' && !q) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  }

  const headers = splitRow(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));

  const ALIASES: Record<string, string> = {
    categoria: 'categoria_nombre',
    categoría: 'categoria_nombre',
    'categoría_nombre': 'categoria_nombre',
    imagen: 'imagen_url',
    'imagen_url': 'imagen_url',
    'url_imagen': 'imagen_url',
    descripción: 'descripcion',
    descripción_corta: 'descripcion',
    descripción_larga: 'descripcion_larga',
    subcategoría: 'subcategoria',
    precio_ars: 'precio',
  };

  const normalizedHeaders = headers.map((h) => ALIASES[h] ?? h);

  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const cells = splitRow(line);
    const obj: Record<string, string> = {};
    normalizedHeaders.forEach((h, i) => { obj[h] = cells[i] ?? ''; });
    return obj;
  });
}

const TEMPLATE_CSV = `nombre,categoria_nombre,subcategoria,stock,precio,fabricante,imagen_url,descripcion,descripcion_larga,activo
Rodamiento Rígido 6200,Rodamientos,rigidos-bolas,10,1500,SKF,,Rodamiento rígido de bolas estándar,,Sí
Retén NBR 40x60x10,Retenes,,5,,FAG,https://ejemplo.com/imagen.jpg,Retén de nitrilo,,Sí`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla-productos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const REQUIRED_COLS = ['nombre', 'categoria_nombre'];

type PreviewRow = Record<string, string> & { _rowIndex: number };

export default function ImportCSVForm() {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportProductsResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setParseError('El archivo está vacío o no tiene el formato correcto.');
        setRows([]);
        return;
      }

      const cols = Object.keys(parsed[0]);
      const missing = REQUIRED_COLS.filter((r) => !cols.includes(r));
      if (missing.length > 0) {
        setParseError(`Faltan columnas requeridas: ${missing.join(', ')}. Columnas encontradas: ${cols.join(', ')}`);
        setRows([]);
        return;
      }

      setHeaders(cols);
      setRows(parsed.map((r, i) => ({ ...r, _rowIndex: i + 2 })));
    };
    reader.readAsText(file, 'utf-8');
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setLoading(true);
    const cleanRows = rows.map(({ _rowIndex: _, ...rest }) => rest);
    const res = await importProductsAction(cleanRows);
    setResult(res);
    setLoading(false);
    if (res.inserted > 0 && res.errors.length === 0) {
      setRows([]);
      setHeaders([]);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function reset() {
    setRows([]);
    setHeaders([]);
    setResult(null);
    setParseError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const LABEL_MAP: Record<string, string> = {
    nombre: 'Nombre', categoria_nombre: 'Categoría', subcategoria: 'Subcategoría',
    stock: 'Stock', precio: 'Precio', fabricante: 'Fabricante',
    imagen_url: 'Imagen URL', descripcion: 'Descripción', descripcion_larga: 'Desc. larga',
    activo: 'Activo', slug: 'Slug',
  };

  return (
    <div className="space-y-6">
      {/* Instrucciones + template */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-3">
        <h2 className="text-white font-medium">Formato del CSV</h2>
        <p className="text-white/50 text-sm">
          El archivo debe tener estas columnas (la primera fila es el encabezado):
        </p>
        <div className="flex flex-wrap gap-2">
          {['nombre *', 'categoria_nombre *', 'subcategoria', 'stock', 'precio', 'fabricante', 'imagen_url', 'descripcion', 'descripcion_larga', 'activo'].map((col) => (
            <span
              key={col}
              className={`text-xs px-2 py-1 rounded font-mono ${col.endsWith('*') ? 'bg-yellow-500/15 text-yellow-400' : 'bg-white/5 text-white/50'}`}
            >
              {col}
            </span>
          ))}
        </div>
        <p className="text-white/30 text-xs">* requerido — La categoría debe coincidir exactamente con las categorías existentes</p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Descargar plantilla CSV
        </button>
      </div>

      {/* File input */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
        <label className="block text-sm text-white/60 mb-3">Seleccionar archivo CSV</label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="text-white/60 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white/70 hover:file:bg-white/15 transition-colors cursor-pointer"
        />
        {parseError && (
          <p className="text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{parseError}</p>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-xl p-4 border ${result.errors.length === 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
          <p className="font-medium text-sm mb-1" style={{ color: result.errors.length === 0 ? '#4ade80' : '#facc15' }}>
            {result.inserted > 0
              ? `✓ ${result.inserted} producto${result.inserted !== 1 ? 's' : ''} importado${result.inserted !== 1 ? 's' : ''} correctamente`
              : 'No se importó ningún producto'}
            {result.errors.length > 0 && ` · ${result.errors.length} fila${result.errors.length !== 1 ? 's' : ''} con error`}
          </p>
          {result.errors.length > 0 && (
            <ul className="text-yellow-300/70 text-xs space-y-0.5 mt-2">
              {result.errors.map((e, i) => (
                <li key={i}>Fila {e.row}{e.nombre ? ` (${e.nombre})` : ''}: {e.message}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-3 mt-3">
            {result.inserted > 0 && (
              <a href="/admin/productos" className="text-sm text-white/60 hover:text-white underline transition-colors">
                Ver productos →
              </a>
            )}
            <button type="button" onClick={reset} className="text-sm text-white/40 hover:text-white transition-colors">
              Importar otro archivo
            </button>
          </div>
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              <span className="text-white font-medium">{rows.length}</span> fila{rows.length !== 1 ? 's' : ''} encontrada{rows.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={reset}
                className="text-sm text-white/30 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? 'Importando...' : `Importar ${rows.length} producto${rows.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-3 py-2.5 text-xs text-white/30 font-medium">#</th>
                    {headers.map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 text-xs text-white/40 font-medium whitespace-nowrap">
                        {LABEL_MAP[h] ?? h}
                        {REQUIRED_COLS.includes(h) && <span className="text-yellow-500 ml-0.5">*</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.slice(0, 50).map((row, i) => {
                    const missingRequired = REQUIRED_COLS.some((c) => !row[c]?.trim());
                    return (
                      <tr key={i} className={`${missingRequired ? 'bg-red-500/5' : 'hover:bg-white/[0.02]'} transition-colors`}>
                        <td className="px-3 py-2 text-white/20 text-xs">{row._rowIndex}</td>
                        {headers.map((h) => (
                          <td key={h} className="px-3 py-2 text-white/60 max-w-[200px]">
                            <span className={`block truncate ${!row[h] && REQUIRED_COLS.includes(h) ? 'text-red-400 italic' : ''}`}>
                              {row[h] || (REQUIRED_COLS.includes(h) ? '⚠ requerido' : <span className="text-white/20">—</span>)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rows.length > 50 && (
              <p className="text-center text-white/30 text-xs py-3 border-t border-white/5">
                Mostrando 50 de {rows.length} filas — se importarán todas
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
