import React from 'react';
import {
  Document, Page, View, Text, Image, StyleSheet, renderToBuffer,
} from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

// ─── Datos BYG ────────────────────────────────────────────────────────────────
const BYG = {
  nombre:    'BYG Rodamientos',
  cuit:      '20-20794031-4',
  direccion: 'Collon Cura 240, Neuquén (8300)',
  telefono:  '0299-4462546',
  email:     'bygrodamientos@gmail.com',
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
function getLogoBase64(): string {
  const p = path.join(process.cwd(), 'public', 'images', 'Logo', 'logobyg1.png');
  return `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
}

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  dark:    '#0f172a',
  amber:   '#d97706',
  gray:    '#6b7280',
  lightbg: '#f9fafb',
  border:  '#e5e7eb',
  white:   '#ffffff',
  text:    '#111827',
  muted:   '#9ca3af',
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 40, paddingBottom: 50,
    paddingHorizontal: 44,
    fontSize: 9,
    color: C.text,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: C.dark,
  },
  logo: { width: 90, height: 90, objectFit: 'contain' },
  headerRight: { alignItems: 'flex-end' },
  presTitle: {
    fontSize: 20, fontFamily: 'Helvetica-Bold',
    color: C.dark, letterSpacing: 1,
  },
  presNum: {
    fontSize: 13, fontFamily: 'Helvetica-Bold',
    color: C.amber, marginTop: 3,
  },
  presData: { color: C.gray, marginTop: 2, fontSize: 8.5 },

  /* Sección BYG */
  bygRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  bygBlock: { fontSize: 8, color: C.gray, lineHeight: 1.6 },
  bygNombre: { fontFamily: 'Helvetica-Bold', color: C.dark, fontSize: 9, marginBottom: 2 },

  /* Info cliente */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.lightbg,
    borderRadius: 4,
    padding: 12,
    marginBottom: 18,
  },
  infoLabel: { fontSize: 7.5, color: C.muted, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontFamily: 'Helvetica-Bold', color: C.dark, fontSize: 9.5 },
  infoSub:   { color: C.gray, fontSize: 8, marginTop: 2 },

  /* Tabla */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.dark,
    borderRadius: 3,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: C.lightbg },
  thText: { fontFamily: 'Helvetica-Bold', color: C.white, fontSize: 8, textTransform: 'uppercase' },
  tdText: { color: C.text, fontSize: 8.5 },

  colCant:   { width: '10%' },
  colDesc:   { width: '55%' },
  colPrecio: { width: '17%', textAlign: 'right' },
  colIva:    { width: '8%',  textAlign: 'center' },
  colNeto:   { width: '10%', textAlign: 'right' },

  /* Totales */
  totalesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  totalesBox: { width: '45%' },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  totalLabel: { color: C.gray, fontSize: 8.5 },
  totalValue: { color: C.text, fontSize: 8.5, fontFamily: 'Helvetica-Bold' },
  totalFinalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    backgroundColor: C.dark,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 4,
  },
  totalFinalLabel: { fontFamily: 'Helvetica-Bold', color: C.white, fontSize: 10 },
  totalFinalValue: { fontFamily: 'Helvetica-Bold', color: C.amber, fontSize: 12 },

  /* Notas */
  notasBox: {
    marginTop: 18,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: C.amber,
    borderRadius: 3,
  },
  notasLabel: { fontFamily: 'Helvetica-Bold', color: '#92400e', fontSize: 7.5,
    textTransform: 'uppercase', marginBottom: 4 },
  notasText:  { color: '#78350f', fontSize: 8.5, lineHeight: 1.5 },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { color: C.muted, fontSize: 7.5 },
});

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PdfItem {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface PdfCliente {
  nombre?: string | null;
  razon_social?: string | null;
  cuit_cuil?: string | null;
  email?: string | null;
  condicion_iva?: string | null;
}

interface PdfPresupuesto {
  fecha_emision: string;
  fecha_vencimiento?: string | null;
  condicion_pago: string;
  subtotal: number;
  descuento_pct: number;
  descuento_monto: number;
  iva_pct: number;
  iva_monto: number;
  total: number;
  notas?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtFecha = (s: string) =>
  new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ─── Componente PDF ──────────────────────────────────────────────────────────
function PresupuestoPdfDoc({
  pres, items, numero, cliente, logo,
}: {
  pres: PdfPresupuesto;
  items: PdfItem[];
  numero: string;
  cliente: PdfCliente | null;
  logo: string;
}) {
  const clienteNombre = cliente?.razon_social ?? cliente?.nombre ?? '—';
  const netoGravado = pres.subtotal - pres.descuento_monto;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Image src={logo} style={s.logo} />
          <View style={s.headerRight}>
            <Text style={s.presTitle}>PRESUPUESTO</Text>
            <Text style={s.presNum}>{numero}</Text>
            <Text style={s.presData}>Fecha: {fmtFecha(pres.fecha_emision)}</Text>
            {pres.fecha_vencimiento && (
              <Text style={s.presData}>Válido hasta: {fmtFecha(pres.fecha_vencimiento)}</Text>
            )}
          </View>
        </View>

        {/* ── Datos BYG ── */}
        <View style={s.bygRow}>
          <View>
            <Text style={s.bygNombre}>{BYG.nombre}</Text>
            <Text style={s.bygBlock}>C.U.I.T.: {BYG.cuit}</Text>
            <Text style={s.bygBlock}>{BYG.direccion}</Text>
            <Text style={s.bygBlock}>Tel.: {BYG.telefono}</Text>
            <Text style={s.bygBlock}>{BYG.email}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.bygBlock, { fontFamily: 'Helvetica-Bold', color: C.dark }]}>
              Condición de venta
            </Text>
            <Text style={s.bygBlock}>{pres.condicion_pago}</Text>
            <Text style={[s.bygBlock, { marginTop: 4, fontFamily: 'Helvetica-Bold', color: C.dark }]}>
              Moneda
            </Text>
            <Text style={s.bygBlock}>Pesos Argentinos</Text>
          </View>
        </View>

        {/* ── Info cliente ── */}
        <View style={s.infoRow}>
          <View>
            <Text style={s.infoLabel}>Para</Text>
            <Text style={s.infoValue}>{clienteNombre}</Text>
            {cliente?.cuit_cuil && (
              <Text style={s.infoSub}>C.U.I.T.: {cliente.cuit_cuil}</Text>
            )}
            {cliente?.email && (
              <Text style={s.infoSub}>{cliente.email}</Text>
            )}
          </View>
          {cliente?.condicion_iva && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.infoLabel}>Condición IVA</Text>
              <Text style={[s.infoSub, { color: C.dark, fontFamily: 'Helvetica-Bold' }]}>
                {cliente.condicion_iva.replace(/_/g, ' ')}
              </Text>
            </View>
          )}
        </View>

        {/* ── Tabla items ── */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colCant]}>Cant.</Text>
          <Text style={[s.thText, s.colDesc]}>Descripción</Text>
          <Text style={[s.thText, s.colPrecio]}>Precio Unit.</Text>
          <Text style={[s.thText, s.colIva]}>IVA</Text>
          <Text style={[s.thText, s.colNeto]}>Neto</Text>
        </View>

        {items.map((item, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.tdText, s.colCant]}>{item.cantidad}</Text>
            <Text style={[s.tdText, s.colDesc]}>{item.descripcion}</Text>
            <Text style={[s.tdText, s.colPrecio]}>{fmt(item.precio_unitario)}</Text>
            <Text style={[s.tdText, s.colIva]}>
              {pres.iva_pct > 0 ? `${pres.iva_pct}%` : '—'}
            </Text>
            <Text style={[s.tdText, s.colNeto]}>{fmt(item.subtotal)}</Text>
          </View>
        ))}

        {/* ── Totales ── */}
        <View style={s.totalesRow}>
          <View style={s.totalesBox}>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>Sub Total</Text>
              <Text style={s.totalValue}>{fmt(pres.subtotal)}</Text>
            </View>
            {pres.descuento_pct > 0 && (
              <View style={s.totalLine}>
                <Text style={s.totalLabel}>Descuento ({pres.descuento_pct}%)</Text>
                <Text style={[s.totalValue, { color: '#ef4444' }]}>-{fmt(pres.descuento_monto)}</Text>
              </View>
            )}
            {pres.iva_pct > 0 && (
              <>
                <View style={s.totalLine}>
                  <Text style={s.totalLabel}>Neto gravado al {pres.iva_pct}%</Text>
                  <Text style={s.totalValue}>{fmt(netoGravado)}</Text>
                </View>
                <View style={s.totalLine}>
                  <Text style={s.totalLabel}>IVA {pres.iva_pct}%</Text>
                  <Text style={s.totalValue}>{fmt(pres.iva_monto)}</Text>
                </View>
              </>
            )}
            <View style={s.totalFinalLine}>
              <Text style={s.totalFinalLabel}>TOTAL</Text>
              <Text style={s.totalFinalValue}>{fmt(pres.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Notas ── */}
        {pres.notas && (
          <View style={s.notasBox}>
            <Text style={s.notasLabel}>Notas</Text>
            <Text style={s.notasText}>{pres.notas}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            MUCHAS GRACIAS — Las mercaderías viajan por cuenta y riesgo del comprador.
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export async function generatePresupuestoPdf(params: {
  pres: PdfPresupuesto;
  items: PdfItem[];
  numero: string;
  cliente: PdfCliente | null;
}): Promise<Buffer> {
  const logo = getLogoBase64();
  const element = (
    <PresupuestoPdfDoc {...params} logo={logo} />
  );
  return renderToBuffer(element) as Promise<Buffer>;
}
