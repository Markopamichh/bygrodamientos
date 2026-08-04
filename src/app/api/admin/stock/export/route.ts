import { createAuthClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  const supabaseAuth = await createAuthClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const supabase = createAdminClient();

  // PostgREST corta en 1000 filas por página → paginamos para traer TODO el stock.
  const PAGE = 1000;
  const MAX = 20000;
  type ItemRow = {
    codigo: string;
    fabricante: string | null;
    stock_actual: number;
    stock_minimo: number;
    precio_venta: number | null;
    ubicacion: string | null;
    productos: { nombre: string; subcategoria: string | null } | null;
  };
  const items: ItemRow[] = [];
  for (let from = 0; from < MAX; from += PAGE) {
    const { data, error } = await supabase
      .from('items')
      .select('codigo, fabricante, stock_actual, stock_minimo, precio_venta, ubicacion, productos(nombre, subcategoria)')
      .order('codigo')
      .range(from, from + PAGE - 1);
    if (error) return new NextResponse('Error al obtener stock', { status: 500 });
    const rows = (data ?? []) as unknown as ItemRow[];
    items.push(...rows);
    if (rows.length < PAGE) break;
  }

  // Matriz de la planilla (encabezado + filas).
  const encabezado = [
    'Código',
    'Producto',
    'Rubro',
    'Fabricante',
    'Stock actual',
    'Stock mínimo',
    'Precio venta',
    'Ubicación',
  ];
  const filas = items.map((it) => [
    it.codigo,
    it.productos?.nombre ?? '',
    it.productos?.subcategoria ?? '',
    it.fabricante ?? '',
    it.stock_actual,
    it.stock_minimo,
    it.precio_venta ?? '',
    it.ubicacion ?? '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([encabezado, ...filas]);
  ws['!cols'] = [
    { wch: 22 }, // código
    { wch: 40 }, // producto
    { wch: 20 }, // rubro
    { wch: 14 }, // fabricante
    { wch: 12 }, // stock actual
    { wch: 12 }, // stock mínimo
    { wch: 14 }, // precio
    { wch: 16 }, // ubicación
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock');

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  const body = new Uint8Array(buffer);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="stock-byg-${date}.xlsx"`,
      'Content-Length': String(body.length),
    },
  });
}
