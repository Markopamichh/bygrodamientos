import { createAuthClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseAuth = await createAuthClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const supabase = createAdminClient();
  const { data: items, error } = await supabase
    .from('items')
    .select('codigo, fabricante, stock_actual, stock_minimo, precio_venta, ubicacion, productos(nombre)')
    .order('codigo');

  if (error) return new NextResponse('Error al obtener stock', { status: 500 });

  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const headers = ['codigo', 'producto', 'fabricante', 'stock_actual', 'stock_minimo', 'precio_venta', 'ubicacion'];
  const rows = (items ?? []).map((item) => [
    item.codigo,
    ((item.productos as unknown as { nombre: string } | null))?.nombre ?? '',
    item.fabricante ?? '',
    item.stock_actual,
    item.stock_minimo,
    item.precio_venta ?? '',
    item.ubicacion ?? '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="stock-byg-${date}.csv"`,
    },
  });
}
