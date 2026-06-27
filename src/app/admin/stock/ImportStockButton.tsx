'use client';

import { useRef, useState, useTransition } from 'react';
import { importStockAction, type ImportRow, type ImportResult } from './actions';

type Step = 'idle' | 'preview' | 'result';

function parseCSV(text: string): ImportRow[] {
  const clean = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase().trim());
  const codigoIdx = headers.indexOf('codigo');
  const stockIdx = headers.indexOf('stock_actual');
  const precioIdx = headers.indexOf('precio_venta');

  if (codigoIdx === -1) return [];

  return lines.slice(1).flatMap((line) => {
    const cells = parseRow(line);
    const codigo = cells[codigoIdx]?.trim();
    if (!codigo) return [];

    const rawStock = stockIdx >= 0 ? cells[stockIdx]?.trim() ?? '' : '';
    const rawPrecio = precioIdx >= 0 ? cells[precioIdx]?.trim() ?? '' : '';

    const stock_actual =
      rawStock !== '' && !isNaN(Number(rawStock))
        ? Math.max(0, Math.round(Number(rawStock)))
        : null;
    const precio_venta =
      rawPrecio !== '' && !isNaN(Number(rawPrecio))
        ? Number(parseFloat(rawPrecio).toFixed(2))
        : null;

    if (stock_actual === null && precio_venta === null) return [];
    return [{ codigo, stock_actual, precio_venta }];
  });
}

export function ImportStockButton() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setFileError(
          'Sin filas válidas. El CSV debe tener columnas "codigo" y al menos "stock_actual" o "precio_venta".'
        );
        return;
      }
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  }

  function handleConfirm() {
    startTransition(async () => {
      const res = await importStockAction(rows);
      setResult(res);
      setStep('result');
    });
  }

  function handleClose() {
    setStep('idle');
    setRows([]);
    setResult(null);
    setFileError(null);
  }

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        Importar CSV
      </button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />

      {fileError && (
        <div className="fixed bottom-6 right-6 bg-red-500/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg max-w-sm z-50">
          {fileError}
        </div>
      )}

      {(step === 'preview' || step === 'result') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-white font-semibold text-base">
                {step === 'preview'
                  ? `Importar stock — ${rows.length} ítem${rows.length !== 1 ? 's' : ''}`
                  : 'Resultado de la importación'}
              </h2>
              <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {step === 'preview' && (
              <>
                <div className="overflow-auto flex-1 px-6 py-4">
                  <p className="text-white/40 text-xs mb-4">
                    Solo se actualizan ítems que ya existan en el sistema (buscados por código). Los que no se encuentren quedan como "No encontrados".
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white/40 text-xs border-b border-white/10">
                        <th className="text-left pb-2 font-medium">Código</th>
                        <th className="text-right pb-2 font-medium">Stock nuevo</th>
                        <th className="text-right pb-2 font-medium">Precio nuevo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 font-mono text-white/80">{r.codigo}</td>
                          <td className="py-2 text-right text-white/60">
                            {r.stock_actual !== null ? r.stock_actual : <span className="text-white/25">—</span>}
                          </td>
                          <td className="py-2 text-right text-white/60">
                            {r.precio_venta !== null
                              ? `$${Number(r.precio_venta).toLocaleString('es-AR')}`
                              : <span className="text-white/25">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end shrink-0">
                  <button
                    onClick={handleClose}
                    className="text-white/50 hover:text-white text-sm transition-colors px-4 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                  >
                    {isPending ? 'Importando…' : 'Confirmar importación'}
                  </button>
                </div>
              </>
            )}

            {step === 'result' && result && (
              <>
                <div className="px-6 py-6 flex-1 overflow-auto">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-400">{result.updated}</p>
                      <p className="text-xs text-green-400/70 mt-1">Actualizados</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-white/50">{result.skipped}</p>
                      <p className="text-xs text-white/30 mt-1">No encontrados</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-red-400">{result.errors.length}</p>
                      <p className="text-xs text-red-400/70 mt-1">Con error</p>
                    </div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <p className="text-red-400 text-xs font-semibold mb-2 uppercase tracking-wider">Errores</p>
                      <ul className="space-y-1">
                        {result.errors.map((e, i) => (
                          <li key={i} className="text-red-400/80 text-xs font-mono">{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex justify-end shrink-0">
                  <button
                    onClick={handleClose}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
