import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { presupuestoId } = await req.json();
    if (!presupuestoId) return NextResponse.json({ error: 'Falta presupuestoId' }, { status: 400 });

    const sb = createAdminClient();

    const [{ data: pres }, { data: items }] = await Promise.all([
      sb.from('presupuestos')
        .select('*, clientes(nombre, razon_social, cuit_cuil, email, condicion_iva)')
        .eq('id', presupuestoId)
        .single(),
      sb.from('presupuesto_items')
        .select('*')
        .eq('presupuesto_id', presupuestoId)
        .order('orden'),
    ]);

    if (!pres) return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });

    const cliente = (pres as Record<string, unknown>).clientes as Record<string, string | null> | null;
    const email = cliente?.email;
    if (!email) return NextResponse.json({ error: 'El cliente no tiene email registrado' }, { status: 400 });

    const numero = `P-${String((pres as Record<string, unknown>).numero).padStart(4, '0')}`;
    const html = buildEmailHtml(pres as Record<string, unknown>, items as Record<string, unknown>[], numero, cliente);

    const { error } = await resend.emails.send({
      from: 'BYG Rodamientos <onboarding@resend.dev>',
      to: [email],
      subject: `Presupuesto ${numero} — BYG Rodamientos`,
      html,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Marcar como enviado si estaba en borrador
    if ((pres as Record<string, unknown>).estado === 'borrador') {
      await sb.from('presupuestos').update({ estado: 'enviado' }).eq('id', presupuestoId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function buildEmailHtml(
  pres: Record<string, unknown>,
  items: Record<string, unknown>[],
  numero: string,
  cliente: Record<string, string | null> | null
): string {
  const clienteNombre = cliente?.razon_social ?? cliente?.nombre ?? 'Cliente';
  const fechaEmision = new Date(pres.fecha_emision as string).toLocaleDateString('es-AR');
  const fechaVence = pres.fecha_vencimiento
    ? new Date(pres.fecha_vencimiento as string).toLocaleDateString('es-AR')
    : null;

  const filas = items.map(item => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px;">${item.descripcion}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#6b7280;font-size:14px;text-align:center;">${item.cantidad}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#6b7280;font-size:14px;text-align:right;">$${Number(item.precio_unitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#111827;font-size:14px;text-align:right;font-weight:600;">$${Number(item.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const descuento = Number(pres.descuento_pct) > 0 ? `
    <tr>
      <td colspan="3" style="padding:8px 16px;text-align:right;color:#6b7280;font-size:13px;">Descuento (${pres.descuento_pct}%)</td>
      <td style="padding:8px 16px;text-align:right;color:#ef4444;font-size:13px;">-$${Number(pres.descuento_monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
    </tr>` : '';

  const iva = Number(pres.iva_pct) > 0 ? `
    <tr>
      <td colspan="3" style="padding:8px 16px;text-align:right;color:#6b7280;font-size:13px;">IVA (${pres.iva_pct}%)</td>
      <td style="padding:8px 16px;text-align:right;color:#6b7280;font-size:13px;">$${Number(pres.iva_monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;border-radius:12px 12px 0 0;padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">BYG Rodamientos</p>
                <p style="margin:4px 0 0;color:#ffffff80;font-size:13px;">Neuquén, Argentina</p>
              </td>
              <td align="right">
                <p style="margin:0;color:#f59e0b;font-size:20px;font-weight:700;">${numero}</p>
                <p style="margin:4px 0 0;color:#ffffff60;font-size:12px;">PRESUPUESTO</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Info cliente -->
        <tr><td style="background:#ffffff;padding:24px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:50%;vertical-align:top;">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Para</p>
                <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${clienteNombre}</p>
                ${cliente?.cuit_cuil ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">CUIT/CUIL: ${cliente.cuit_cuil}</p>` : ''}
                <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${cliente?.email ?? ''}</p>
              </td>
              <td style="width:50%;vertical-align:top;text-align:right;">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Fechas</p>
                <p style="margin:0;color:#374151;font-size:13px;">Emisión: <strong>${fechaEmision}</strong></p>
                ${fechaVence ? `<p style="margin:4px 0 0;color:#374151;font-size:13px;">Válido hasta: <strong>${fechaVence}</strong></p>` : ''}
                <p style="margin:4px 0 0;color:#374151;font-size:13px;">Pago: <strong>${pres.condicion_pago}</strong></p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Tabla ítems -->
        <tr><td style="background:#ffffff;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb;">Descripción</th>
                <th style="padding:10px 16px;text-align:center;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb;">Cant.</th>
                <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb;">Precio u.</th>
                <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
            <tfoot>
              ${descuento}
              ${iva}
              <tr style="background:#f9fafb;">
                <td colspan="3" style="padding:14px 16px;text-align:right;color:#111827;font-size:15px;font-weight:700;border-top:2px solid #e5e7eb;">TOTAL</td>
                <td style="padding:14px 16px;text-align:right;color:#d97706;font-size:18px;font-weight:700;border-top:2px solid #e5e7eb;">$${Number(pres.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </td></tr>

        ${pres.notas ? `
        <!-- Notas -->
        <tr><td style="background:#fffbeb;border:1px solid #fde68a;border-top:none;padding:16px 32px;">
          <p style="margin:0 0 4px;color:#92400e;font-size:11px;font-weight:600;text-transform:uppercase;">Notas</p>
          <p style="margin:0;color:#78350f;font-size:13px;line-height:1.6;">${pres.notas}</p>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr><td style="background:#f3f4f6;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">Este presupuesto fue emitido por <strong>BYG Rodamientos</strong> · Neuquén, Argentina</p>
          <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">Para consultas: <a href="https://wa.me/5492994019699" style="color:#16a34a;text-decoration:none;">WhatsApp</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
