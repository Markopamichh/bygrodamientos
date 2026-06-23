/**
 * Script de migración: siembra las colecciones de Firestore con los datos del seed de Supabase.
 * Ejecutar UNA SOLA VEZ:  npx tsx scripts/seed-firestore.ts
 *
 * Requiere que .env.local ya tenga las variables FIREBASE_*
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    });

const db = getFirestore(app);

// ─────────────────────────────────────────────
// Datos de categorías (slug = ID del documento)
// ─────────────────────────────────────────────
const categorias = [
  { slug: 'rodamientos',  nombre: 'Rodamientos Industriales' },
  { slug: 'retenes',      nombre: 'Retenes' },
  { slug: 'transmision',  nombre: 'Componentes de Transmisión' },
  { slug: 'herramientas', nombre: 'Herramientas' },
  { slug: 'sellos',       nombre: 'Sellos Mecánicos' },
  { slug: 'automotriz',   nombre: 'Línea Automotriz' },
];

// ─────────────────────────────────────────────
// Mapa UUID → slug (para resolver categoria_id del seed SQL)
// ─────────────────────────────────────────────
const uuidToSlug: Record<string, string> = {
  'a1000000-0000-0000-0000-000000000001': 'rodamientos',
  'a2000000-0000-0000-0000-000000000002': 'retenes',
  'a3000000-0000-0000-0000-000000000003': 'transmision',
  'a4000000-0000-0000-0000-000000000004': 'herramientas',
  'a5000000-0000-0000-0000-000000000005': 'sellos',
  'a6000000-0000-0000-0000-000000000006': 'automotriz',
};

const slugToNombre: Record<string, string> = Object.fromEntries(
  categorias.map((c) => [c.slug, c.nombre])
);

// ─────────────────────────────────────────────
// Productos del seed
// ─────────────────────────────────────────────
interface SeedProducto {
  nombre: string;
  slug: string;
  descripcion: string;
  descripcion_larga: string;
  categoria_id: string; // UUID del seed → se convierte a slug
  subcategoria: string;
  stock: number;
  imagen_url: string | null;
  especificaciones: Record<string, string>;
  aplicaciones: string[];
  caracteristicas: string[];
  fabricante?: string | null;
  activo: boolean;
}

const productos: SeedProducto[] = [
  // ── RODAMIENTOS ──
  {
    nombre: 'Rodamiento Rígido de Bolas 6200 Series',
    slug: 'rodamiento-rigido-bolas-6200',
    descripcion: 'Rodamientos rígidos de bolas para aplicaciones generales de alta velocidad y baja fricción',
    descripcion_larga: 'Los rodamientos rígidos de bolas son los más versátiles y ampliamente utilizados. Diseñados para soportar cargas radiales y axiales moderadas en ambas direcciones. Ideales para aplicaciones de alta velocidad con mínima fricción y bajo nivel de ruido. Disponibles en diversas configuraciones: abiertos, con protecciones metálicas (Z, ZZ) o con sellos de goma (RS, 2RS).',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'rigidos-bolas',
    stock: 10,
    imagen_url: '/images/products/rodamientorigidodebolas (1).webp',
    especificaciones: { Tipo: 'Rígido de bolas', Serie: '6200', 'Carga radial': 'Alta', 'Carga axial': 'Moderada', Velocidad: 'Muy alta', Temperatura: '-30°C a +110°C', 'Material jaula': 'Acero estampado o poliamida', Protección: 'Abierto, Z, ZZ, RS, 2RS' },
    aplicaciones: ['Motores eléctricos', 'Bombas centrífugas', 'Ventiladores industriales', 'Reductores de velocidad', 'Electrodomésticos', 'Maquinaria textil'],
    caracteristicas: ['Baja fricción y bajo nivel de ruido', 'Alta velocidad de funcionamiento', 'Mantenimiento mínimo', 'Diseño simple y robusto', 'Amplia disponibilidad de medidas', 'Excelente relación calidad-precio'],
    fabricante: 'NSK / SKF / FAG',
    activo: true,
  },
  {
    nombre: 'Rodamiento de Bolas a Rótula',
    slug: 'rodamiento-bolas-rotula',
    descripcion: 'Rodamientos auto-alineantes para aplicaciones con desalineación del eje',
    descripcion_larga: 'Los rodamientos de bolas a rótula tienen dos hileras de bolas que funcionan sobre una pista esférica común en el aro exterior, lo que les permite ser insensibles a las desalineaciones del eje respecto al soporte.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'bolas-rotula',
    stock: 10,
    imagen_url: '/images/products/rodamiento-de-bolas-a-rotula (1).webp',
    especificaciones: { Tipo: 'Bolas a rótula', Serie: '1200, 2200', Hileras: 'Doble', 'Capacidad auto-alineante': '±3°', 'Carga radial': 'Alta', Velocidad: 'Media-alta', Temperatura: '-30°C a +120°C' },
    aplicaciones: ['Equipos mineros', 'Maquinaria agrícola', 'Transportadores', 'Molinos', 'Ventiladores de gran tamaño', 'Equipos de construcción'],
    caracteristicas: ['Auto-alineante hasta ±3°', 'Soporta desalineación del eje', 'Alta capacidad de carga radial', 'Reducción de problemas de montaje', 'Vida útil prolongada en condiciones difíciles', 'Disponible con agujero cónico o cilíndrico'],
    fabricante: 'SKF / FAG / NSK',
    activo: true,
  },
  {
    nombre: 'Rodamiento de Contacto Angular',
    slug: 'rodamiento-contacto-angular',
    descripcion: 'Rodamientos para altas cargas axiales combinadas con cargas radiales',
    descripcion_larga: 'Los rodamientos de contacto angular tienen pistas en los aros interior y exterior desplazadas entre sí en la dirección del eje del rodamiento. El ángulo de contacto determina la capacidad de carga: mayor ángulo = mayor capacidad axial.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'contacto-angular',
    stock: 10,
    imagen_url: '/images/products/contacto-angular (1).webp',
    especificaciones: { Tipo: 'Contacto angular', Serie: '7200, 7300', 'Ángulo de contacto': '15°, 25°, 40°', 'Carga axial': 'Muy alta', 'Carga radial': 'Alta', Velocidad: 'Alta', Configuración: 'Simple, apareado', Temperatura: '-30°C a +120°C' },
    aplicaciones: ['Husillos de máquinas herramienta', 'Bombas de alta presión', 'Compresores', 'Cajas de engranajes', 'Maquinaria de precisión', 'Equipos dentales'],
    caracteristicas: ['Alta capacidad de carga axial', 'Soporta cargas combinadas', 'Alta precisión de funcionamiento', 'Puede montarse en configuración apareada', 'Diferentes ángulos de contacto disponibles', 'Excelente para altas velocidades'],
    fabricante: 'FAG / NSK / SKF',
    activo: true,
  },
  {
    nombre: 'Rodamiento de Rodillos Cilíndricos',
    slug: 'rodamiento-rodillos-cilindricos',
    descripcion: 'Rodamientos de alta capacidad de carga radial para aplicaciones pesadas',
    descripcion_larga: 'Los rodamientos de rodillos cilíndricos tienen elementos rodantes cilíndricos que están en contacto lineal con las pistas. Esto les proporciona una alta capacidad de carga radial y permiten altas velocidades. Son separables, lo que facilita el montaje y desmontaje.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'rodillos-cilindricos',
    stock: 10,
    imagen_url: '/images/products/contacto-cilindrico (1).webp',
    especificaciones: { Tipo: 'Rodillos cilíndricos', Serie: 'NU, NJ, NUP, N', 'Carga radial': 'Muy alta', 'Carga axial': 'Limitada o nula', Velocidad: 'Alta', Diseño: 'Separable', Temperatura: '-40°C a +120°C' },
    aplicaciones: ['Motores de tracción', 'Reductores de velocidad pesados', 'Laminadores', 'Máquinas papeleras', 'Compresores grandes', 'Turbinas'],
    caracteristicas: ['Muy alta capacidad de carga radial', 'Diseño separable facilita montaje', 'Alta rigidez', 'Baja fricción', 'Adecuado para altas velocidades', 'Disponible en diversas configuraciones'],
    fabricante: 'SKF / Timken / NSK',
    activo: true,
  },
  {
    nombre: 'Rodamiento de Rodillos a Rótula',
    slug: 'rodamiento-rodillos-rotula',
    descripcion: 'Rodamientos de máxima carga para aplicaciones extremas con desalineación',
    descripcion_larga: 'Los rodamientos de rodillos a rótula tienen dos hileras de rodillos simétricos que trabajan sobre una pista esférica común. Combinan una altísima capacidad de carga con la capacidad de compensar desalineaciones.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'rodillos-rotula',
    stock: 10,
    imagen_url: '/images/products/Rodamientos-Axiales-de-Rodillos-a-Rótula (1).webp',
    especificaciones: { Tipo: 'Rodillos a rótula', Serie: '222, 223, 230, 231', Hileras: 'Doble', 'Capacidad auto-alineante': '±3°', 'Carga radial': 'Extremadamente alta', Velocidad: 'Media', Temperatura: '-40°C a +120°C' },
    aplicaciones: ['Molinos de bolas', 'Trituradoras', 'Equipos de minería pesada', 'Laminadores de acero', 'Grúas y puentes grúa', 'Maquinaria de construcción pesada'],
    caracteristicas: ['Capacidad de carga extremadamente alta', 'Auto-alineante hasta ±3°', 'Soporta cargas de choque', 'Diseño robusto para condiciones extremas', 'Larga vida útil en aplicaciones pesadas', 'Reduce costos de mantenimiento'],
    fabricante: 'SKF / FAG / Timken',
    activo: true,
  },
  {
    nombre: 'Rodamiento Axial de Bolas',
    slug: 'rodamiento-axial-bolas',
    descripcion: 'Rodamientos para cargas axiales puras a velocidades moderadas',
    descripcion_larga: 'Los rodamientos axiales de bolas están diseñados para soportar exclusivamente cargas axiales en una dirección. Constan de dos aros y una jaula con bolas.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'axiales',
    stock: 10,
    imagen_url: '/images/products/Axial a bola (2).webp',
    especificaciones: { Tipo: 'Axial de bolas', Serie: '511, 512, 513', 'Dirección de carga': 'Unidireccional', 'Carga axial': 'Alta', 'Carga radial': 'No admite', Velocidad: 'Media', Temperatura: '-20°C a +100°C' },
    aplicaciones: ['Taladros y fresadoras', 'Grúas (giro de pluma)', 'Mesas giratorias', 'Cajas de engranajes', 'Sistemas de elevación', 'Equipos de posicionamiento'],
    caracteristicas: ['Soporta cargas axiales elevadas', 'Diseño compacto', 'Bajo consumo de espacio axial', 'Fácil montaje', 'Económico', 'Varias configuraciones disponibles'],
    fabricante: 'FAG / INA / NSK',
    activo: true,
  },
  {
    nombre: 'Rodamiento de Agujas',
    slug: 'rodamiento-agujas',
    descripcion: 'Rodamientos compactos de alta capacidad para espacios reducidos',
    descripcion_larga: 'Los rodamientos de agujas utilizan elementos rodantes cilíndricos muy finos y largos (agujas). Esta configuración permite una alta capacidad de carga en un diseño muy compacto con mínima sección radial.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'agujas',
    stock: 10,
    imagen_url: '/images/products/agujas1.webp',
    especificaciones: { Tipo: 'Agujas', 'Diámetro agujas': '1.5-5 mm', 'Relación L/D': '2.5 a 10', 'Carga radial': 'Muy alta para su tamaño', 'Sección radial': 'Mínima', Velocidad: 'Media-alta', Temperatura: '-30°C a +120°C' },
    aplicaciones: ['Transmisiones automotrices', 'Bielas de motores', 'Ejes de levas', 'Articulaciones universales', 'Bombas hidráulicas', 'Máquinas textiles'],
    caracteristicas: ['Sección radial mínima', 'Alta capacidad de carga radial', 'Ahorro de espacio y peso', 'Bajo coeficiente de fricción', 'Alta rigidez', 'Diversas configuraciones disponibles'],
    fabricante: 'INA / NSK / Koyo',
    activo: true,
  },
  {
    nombre: 'Rodamiento de Cubo de Rueda',
    slug: 'rodamiento-cubos-rueda',
    descripcion: 'Rodamientos especiales para aplicaciones automotrices',
    descripcion_larga: 'Los rodamientos de cubo de rueda son unidades completas diseñadas específicamente para aplicaciones automotrices. Integran rodamientos de bolas de contacto angular o rodillos cónicos en una configuración sellada y pre-lubricada.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'rigidos-bolas',
    stock: 10,
    imagen_url: '/images/products/cubo de rueda.webp',
    especificaciones: { Tipo: 'Cubo de rueda (HUB)', Generación: '1, 2 o 3', Sellado: 'Integral', Lubricación: 'De por vida', 'Carga combinada': 'Radial + axial', Montaje: 'Rápido y sencillo' },
    aplicaciones: ['Automóviles ligeros', 'Camionetas', 'Vehículos comerciales ligeros', 'SUVs', 'Aplicaciones automotrices en general'],
    caracteristicas: ['Pre-lubricado de por vida', 'Sellado integral', 'Montaje rápido y sencillo', 'Alta confiabilidad', 'Reducción de peso', 'Compatible con sistemas ABS'],
    fabricante: 'SKF / Timken / NSK',
    activo: true,
  },
  {
    nombre: 'Rodamiento de Rodillos Cónicos',
    slug: 'rodamiento-rodillos-conicos',
    descripcion: 'Rodamientos para cargas combinadas radiales y axiales elevadas',
    descripcion_larga: 'Los rodamientos de rodillos cónicos tienen rodillos en forma de tronco de cono que trabajan sobre pistas cónicas. Son separables y pueden soportar cargas combinadas radiales y axiales.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'rodillos-cilindricos',
    stock: 10,
    imagen_url: '/images/products/rodillo conico.webp',
    especificaciones: { Tipo: 'Rodillos cónicos', Serie: '302, 303, 320, 322', 'Carga radial': 'Muy alta', 'Carga axial': 'Alta', Diseño: 'Separable', Montaje: 'En pares o individual', Temperatura: '-40°C a +120°C' },
    aplicaciones: ['Cajas de cambios automotrices', 'Diferenciales de vehículos', 'Rodillos de laminadores', 'Reductores de velocidad', 'Ejes ferroviarios', 'Maquinaria de construcción'],
    caracteristicas: ['Soporta cargas combinadas muy altas', 'Diseño separable facilita montaje', 'Ajustable para eliminar juego', 'Alta rigidez', 'Larga vida útil', 'Amplia gama de tamaños'],
    fabricante: 'Timken / SKF / Koyo',
    activo: true,
  },
  {
    nombre: 'Rodamiento Híbrido Cerámico',
    slug: 'rodamiento-ceramic-hibrido',
    descripcion: 'Rodamientos de alta performance con bolas cerámicas',
    descripcion_larga: 'Los rodamientos híbridos combinan aros de acero con bolas de cerámica (nitruro de silicio). Ofrecen ventajas significativas en aplicaciones de alta velocidad, ambientes corrosivos o donde se requiere mínima lubricación.',
    categoria_id: 'a1000000-0000-0000-0000-000000000001',
    subcategoria: 'rigidos-bolas',
    stock: 10,
    imagen_url: '/images/products/hibrido ceramico.webp',
    especificaciones: { Tipo: 'Híbrido cerámico', 'Material bolas': 'Nitruro de silicio (Si3N4)', 'Material aros': 'Acero cromado', Velocidad: 'Extremadamente alta', Temperatura: '-60°C a +150°C', 'Resistencia química': 'Excelente' },
    aplicaciones: ['Husillos de alta velocidad', 'Bombas químicas', 'Turbinas', 'Equipos médicos', 'Industria alimentaria', 'Ambientes corrosivos'],
    caracteristicas: ['Velocidades extremadamente altas', 'Menor fricción y calentamiento', 'Resistencia a corrosión', 'No magnético', 'Mayor vida útil', 'Menor necesidad de lubricación'],
    fabricante: 'SKF / NSK / GMN',
    activo: true,
  },
  // ── RETENES ──
  {
    nombre: 'Retén de Nitrilo Clásico',
    slug: 'reten-nitrilo-clasico',
    descripcion: 'Retén estándar de nitrilo (NBR) para aplicaciones industriales generales',
    descripcion_larga: 'El retén de nitrilo clásico es el más utilizado en la industria por su excelente relación costo-beneficio. Fabricado en caucho nitrilo (NBR), ofrece buena resistencia a aceites minerales, grasas, combustibles y agua.',
    categoria_id: 'a2000000-0000-0000-0000-000000000002',
    subcategoria: 'nitrilo-clasico',
    stock: 10,
    imagen_url: '/images/products/nitrilo clasico.webp',
    especificaciones: { Material: 'Nitrilo (NBR)', Temperatura: '-40°C a +100°C', Resistencia: 'Aceites minerales, grasas, combustibles', Dureza: '70 Shore A', Perfil: 'Labio simple con carcasa metálica', 'Velocidad periférica': 'Hasta 12 m/s', Presión: 'Hasta 0.05 MPa' },
    aplicaciones: ['Cajas reductoras', 'Motores eléctricos', 'Bombas hidráulicas', 'Maquinaria industrial general', 'Transmisiones mecánicas', 'Equipos agrícolas'],
    caracteristicas: ['Excelente resistencia a aceites minerales', 'Buena resistencia mecánica al desgaste', 'Económico y de amplia disponibilidad', 'Fácil montaje y reemplazo', 'Carcasa metálica para mayor rigidez', 'Todas las medidas estándar en stock'],
    activo: true,
  },
  {
    nombre: 'Retén de Nitrilo con Resorte',
    slug: 'reten-nitrilo-resorte',
    descripcion: 'Retén de nitrilo con resorte de acero inoxidable para mayor presión de sellado',
    descripcion_larga: 'El retén de nitrilo con resorte incorpora un resorte helicoidal de acero inoxidable que mantiene una presión constante del labio sobre el eje, compensando el desgaste natural y las variaciones térmicas.',
    categoria_id: 'a2000000-0000-0000-0000-000000000002',
    subcategoria: 'nitrilo-resorte',
    stock: 10,
    imagen_url: '/images/products/RETENES DE NITRILO CON RESORTE.webp',
    especificaciones: { Material: 'Nitrilo (NBR) + resorte AISI 304', Temperatura: '-40°C a +100°C', Resistencia: 'Aceites minerales, grasas, combustibles', Dureza: '70 Shore A', Perfil: 'Labio con resorte helicoidal', 'Velocidad periférica': 'Hasta 15 m/s', Presión: 'Hasta 0.07 MPa' },
    aplicaciones: ['Reductores de velocidad', 'Motores eléctricos de alta exigencia', 'Bombas centrífugas', 'Compresores', 'Equipos de minería', 'Maquinaria de producción continua'],
    caracteristicas: ['Resorte compensa desgaste del labio', 'Mayor vida útil que el retén clásico', 'Presión de sellado constante', 'Mejor rendimiento a altas velocidades', 'Compensación de variaciones térmicas', 'Sellado confiable en condiciones exigentes'],
    activo: true,
  },
  {
    nombre: 'Retén de Vitón (FKM)',
    slug: 'reten-viton-fkm',
    descripcion: 'Retén de alto rendimiento para altas temperaturas y fluidos agresivos',
    descripcion_larga: 'Los retenes de Vitón (FKM) ofrecen excelente resistencia química y térmica, siendo la opción premium para las aplicaciones más exigentes. Soportan temperaturas de hasta +200°C.',
    categoria_id: 'a2000000-0000-0000-0000-000000000002',
    subcategoria: 'viton',
    stock: 10,
    imagen_url: '/images/products/reten viton.webp',
    especificaciones: { Material: 'Vitón (FKM / Fluoroelastómero)', Temperatura: '-20°C a +200°C', Resistencia: 'Aceites sintéticos, solventes, combustibles, ácidos', Dureza: '75 Shore A', 'Velocidad periférica': 'Hasta 15 m/s', Presión: 'Hasta 0.05 MPa' },
    aplicaciones: ['Industria petroquímica', 'Motores de alta temperatura', 'Compresores industriales', 'Bombas químicas', 'Equipos con aceites sintéticos', 'Industria alimentaria (alta temperatura)'],
    caracteristicas: ['Resistencia a temperaturas hasta +200°C', 'Excelente resistencia química', 'Larga vida útil en condiciones extremas', 'Baja permeabilidad a gases', 'Resistente al ozono y UV', 'Material premium para aplicaciones críticas'],
    activo: true,
  },
  {
    nombre: 'O-Rings',
    slug: 'orings',
    descripcion: 'Sellos tóricos O-Ring en diversos materiales y medidas para sellado estático y dinámico',
    descripcion_larga: 'Los O-Rings son sellos de sección circular utilizados para sellado estático y dinámico en una gran variedad de aplicaciones. Disponibles en nitrilo (NBR), vitón (FKM), silicona (VMQ), EPDM y PTFE.',
    categoria_id: 'a2000000-0000-0000-0000-000000000002',
    subcategoria: 'orings',
    stock: 10,
    imagen_url: '/images/products/ORINGS.webp',
    especificaciones: { Materiales: 'NBR, FKM, VMQ, EPDM, PTFE', Temperatura: '-60°C a +250°C (según material)', Presión: 'Hasta 40 MPa (con anillos anti-extrusión)', Normas: 'AS568, DIN 3771, ISO 3601', Secciones: 'De 1 mm a 10 mm', Aplicación: 'Estática y dinámica' },
    aplicaciones: ['Cilindros hidráulicos', 'Conexiones neumáticas', 'Válvulas industriales', 'Bombas', 'Equipos de refrigeración', 'Instrumentación y control'],
    caracteristicas: ['Amplia variedad de materiales', 'Medidas estándar y especiales', 'Sellado estático y dinámico', 'Normas internacionales AS568 / DIN / ISO', 'Económicos y de fácil instalación', 'Stock de medidas más frecuentes'],
    activo: true,
  },
  // ── TRANSMISIÓN ──
  {
    nombre: 'Manguitos de Fijación Serie H',
    slug: 'manguito-fijacion-h',
    descripcion: 'Manguitos de fijación cónicos para montaje de rodamientos sobre ejes lisos.',
    descripcion_larga: 'Los manguitos de fijación serie H son elementos cónicos diseñados para montar rodamientos con agujero cónico sobre ejes cilíndricos lisos. Fabricados en acero de alta resistencia con tuerca ranurada y arandela de seguridad incluidas.',
    categoria_id: 'a3000000-0000-0000-0000-000000000003',
    subcategoria: 'manguitos',
    stock: 10,
    imagen_url: '/images/products/manguito de fijacion.webp',
    especificaciones: { Tipo: 'Manguito de fijación cónico', Serie: 'H200 / H300 / H2300 / H3100', Material: 'Acero al carbono', Conicidad: '1:12', 'Acabado superficial': 'Fosfatado', Incluye: 'Tuerca ranurada + arandela de seguridad', 'Rango de diámetros': '15 mm a 200 mm', Norma: 'DIN 5415 / ISO 2982' },
    aplicaciones: ['Ejes de transmisión industrial', 'Ventiladores y extractores', 'Transportadores de banda', 'Maquinaria agrícola', 'Reductores de velocidad', 'Bombas centrífugas'],
    caracteristicas: ['Montaje sobre ejes lisos sin escalones', 'Posicionamiento axial libre del rodamiento', 'Tuerca ranurada y arandela de seguridad incluidas', 'Fácil montaje y desmontaje', 'Alta capacidad de sujeción', 'Disponible en múltiples series y medidas'],
    fabricante: 'SKF / NTN / FAG',
    activo: true,
  },
  {
    nombre: 'Acoples Flexibles de Mordaza',
    slug: 'acoples-flexibles',
    descripcion: 'Acoples flexibles tipo mordaza para conexión de ejes.',
    descripcion_larga: 'Los acoples flexibles de mordaza son elementos de transmisión diseñados para conectar dos ejes y transmitir par de torsión, compensando simultáneamente desalineaciones angulares, radiales y axiales.',
    categoria_id: 'a3000000-0000-0000-0000-000000000003',
    subcategoria: 'acoples',
    stock: 10,
    imagen_url: '/images/products/acoples flexibles.webp',
    especificaciones: { Tipo: 'Acople flexible de mordaza (jaw coupling)', 'Material cubos': 'Aluminio / Acero / Fundición', 'Material inserto': 'Poliuretano (elastómero)', 'Dureza inserto': 'Shore 92A (estándar) / 80A / 98A', 'Par máximo': 'Hasta 2.500 Nm según tamaño', 'RPM máximas': 'Hasta 19.000 RPM', 'Temperatura de trabajo': '-40°C a +100°C', 'Desalineación angular': 'Hasta 1°', 'Desalineación radial': 'Hasta 0,15 mm' },
    aplicaciones: ['Bombas centrífugas y de engranajes', 'Compresores de aire', 'Motores eléctricos', 'Generadores', 'Máquinas herramienta', 'Sistemas de ventilación industrial'],
    caracteristicas: ['Compensación de desalineaciones múltiples', 'Inserto elastomérico intercambiable', 'Montaje y desmontaje sin mover equipos', 'Libre de mantenimiento y lubricación', 'Amortiguación de vibraciones y golpes', 'Amplia gama de tamaños disponibles'],
    fabricante: 'Lovejoy / Martin / KTR',
    activo: true,
  },
  {
    nombre: 'Poleas de Transmisión',
    slug: 'poleas-transmision',
    descripcion: 'Poleas de transmisión en V, sincrónicas y planas para sistemas de correas industriales.',
    descripcion_larga: 'Amplia gama de poleas de transmisión para sistemas de correas industriales. Incluye poleas en V (perfil A, B, C, SPZ, SPA, SPB), poleas sincrónicas (dentadas) para correas de distribución, y poleas planas.',
    categoria_id: 'a3000000-0000-0000-0000-000000000003',
    subcategoria: 'poleas',
    stock: 10,
    imagen_url: '/images/products/poleas.webp',
    especificaciones: { Tipos: 'Polea en V / Sincrónica / Plana', 'Perfiles en V': 'A, B, C, D, SPZ, SPA, SPB, SPC', 'Perfiles sincrónicas': 'HTD (3M, 5M, 8M, 14M), T5, T10, AT5, AT10', Material: 'Fundición gris GG25 / Acero / Aluminio', 'Número de canales': '1 a 10 canales', Fijación: 'Buje taper lock / Agujero con chavetero', Balanceo: 'Grado G6.3 según ISO 1940', Acabado: 'Fosfatado / Pintado / Mecanizado' },
    aplicaciones: ['Compresores industriales', 'Ventiladores y extractores', 'Transportadores de banda', 'Maquinaria textil', 'Trituradoras y molinos', 'Sistemas de bombeo'],
    caracteristicas: ['Amplia variedad de perfiles y tamaños', 'Compatibles con buje taper lock', 'Balanceo de precisión para baja vibración', 'Fundición de alta calidad GG25', 'Múltiples canales disponibles', 'Stock de medidas más comunes'],
    fabricante: 'Optibelt / Gates / Martin',
    activo: true,
  },
  {
    nombre: 'Correas de Transmisión',
    slug: 'correas-transmision',
    descripcion: 'Correas de transmisión en V, sincrónicas y multi-V para aplicaciones industriales y automotrices.',
    descripcion_larga: 'Línea completa de correas de transmisión para aplicaciones industriales y automotrices. Incluye correas trapeciales clásicas, correas estrechas de alto rendimiento, correas sincrónicas y correas multi-V.',
    categoria_id: 'a3000000-0000-0000-0000-000000000003',
    subcategoria: 'correas',
    stock: 10,
    imagen_url: '/images/products/correas.webp',
    especificaciones: { Tipos: 'Trapecial clásica / Estrecha / Sincrónica / Multi-V', 'Perfiles clásicos': 'A (13x8mm), B (17x11mm), C (22x14mm)', 'Perfiles estrechos': 'SPZ, SPA, SPB, SPC', 'Perfiles sincrónicas': 'HTD 3M, 5M, 8M, 14M', 'Material base': 'Caucho EPDM / Caucho cloropreno', Refuerzo: 'Cordones de poliéster / Aramida / Fibra de vidrio', 'Temperatura de trabajo': '-30°C a +80°C (estándar)', 'Velocidad máxima': 'Hasta 50 m/s según tipo' },
    aplicaciones: ['Motores eléctricos industriales', 'Compresores de aire y refrigeración', 'Bombas industriales', 'Sistemas de climatización HVAC', 'Maquinaria agrícola', 'Equipos de minería y canteras'],
    caracteristicas: ['Alta resistencia a la fatiga y elongación', 'Funcionamiento silencioso y sin vibraciones', 'Resistentes a aceites, calor y ozono', 'Transmisión de potencia eficiente (hasta 98%)', 'Larga vida útil con bajo mantenimiento', 'Amplio stock de medidas estándar'],
    fabricante: 'Optibelt / Gates / Continental',
    activo: true,
  },
  // ── HERRAMIENTAS ──
  {
    nombre: 'Extractor Hidráulico de Tres Garras',
    slug: 'extractor-hidraulico-tres-garras',
    descripcion: 'Extractor hidráulico de tres garras autocentrante para desmontaje de rodamientos, engranajes y poleas.',
    descripcion_larga: 'Extractor hidráulico de tres garras con sistema autocentrante para desmontaje seguro y eficiente de rodamientos, engranajes, poleas y bujes.',
    categoria_id: 'a4000000-0000-0000-0000-000000000004',
    subcategoria: 'extractores',
    stock: 10,
    imagen_url: '/images/products/extractor hidráulico de tres garras.webp',
    especificaciones: { Tipo: 'Extractor hidráulico de 3 garras autocentrante', 'Fuerza de extracción': '5 a 50 toneladas según modelo', 'Apertura máxima': '50 mm a 380 mm según modelo', 'Profundidad de agarre': '80 mm a 250 mm', 'Material garras': 'Acero aleado Cr-Mo tratado térmicamente', 'Presión hidráulica': 'Hasta 700 bar', 'Garras reversibles': 'Sí (modo interior y exterior)', Norma: 'DIN 5234' },
    aplicaciones: ['Desmontaje de rodamientos', 'Extracción de engranajes', 'Remoción de poleas y bujes', 'Mantenimiento de motores eléctricos', 'Talleres de reparación industrial', 'Mantenimiento preventivo y correctivo'],
    caracteristicas: ['Accionamiento hidráulico para fuerza controlada', 'Sistema autocentrante de precisión', 'Garras reversibles interior/exterior', 'Acero aleado Cr-Mo de alta resistencia', 'Protección contra sobrecarga', 'Múltiples tamaños disponibles'],
    fabricante: 'SKF / Enerpac / Betex',
    activo: true,
  },
  {
    nombre: 'Calentador de Rodamientos por Inducción',
    slug: 'calentador-induccion-rodamientos',
    descripcion: 'Calentador por inducción electromagnética para montaje de rodamientos, anillos y bujes.',
    descripcion_larga: 'Calentador de rodamientos por inducción electromagnética para montaje profesional de rodamientos, anillos interiores, bujes y engranajes sobre ejes.',
    categoria_id: 'a4000000-0000-0000-0000-000000000004',
    subcategoria: 'calentadores',
    stock: 10,
    imagen_url: '/images/products/calentador de rodamientos por inducción.webp',
    especificaciones: { Tipo: 'Calentador por inducción electromagnética', Potencia: '3.6 kW / 8 kW / 12 kW según modelo', 'Peso máximo pieza': '10 kg a 150 kg según modelo', 'Diámetro máximo pieza': 'Hasta 480 mm (interior)', 'Temperatura máxima': '250°C (ajustable)', 'Tiempo calentamiento': '30 seg a 10 min según pieza', Alimentación: '220V / 380V monofásico/trifásico', Desmagnetización: 'Automática integrada', Control: 'Digital con sensor de temperatura' },
    aplicaciones: ['Montaje de rodamientos sobre ejes', 'Calentamiento de anillos interiores', 'Montaje de bujes y casquillos', 'Montaje de engranajes con interferencia', 'Mantenimiento industrial programado', 'Talleres de reparación de motores'],
    caracteristicas: ['Calentamiento rápido y uniforme por inducción', 'Control digital de temperatura con sensor', 'Desmagnetización automática de la pieza', 'Sin llama ni contacto directo', 'Protección contra sobrecalentamiento', 'Método recomendado por SKF, FAG y NSK'],
    fabricante: 'SKF / Betex / Bega',
    activo: true,
  },
  {
    nombre: 'Grasa para Rodamientos Industrial',
    slug: 'grasa-rodamientos-industrial',
    descripcion: 'Grasa de litio de alto rendimiento para lubricación de rodamientos industriales.',
    descripcion_larga: 'Grasa de alto rendimiento a base de jabón de litio/litio complejo formulada específicamente para la lubricación de rodamientos industriales. Ofrece excelente protección contra el desgaste, la corrosión y la oxidación.',
    categoria_id: 'a4000000-0000-0000-0000-000000000004',
    subcategoria: 'lubricacion',
    stock: 10,
    imagen_url: '/images/products/grasa para rodamientos 1.webp',
    especificaciones: { Tipo: 'Grasa de litio complejo', 'Grado NLGI': '2', 'Aceite base': 'Aceite mineral de alta calidad', 'Viscosidad aceite base': '100 cSt a 40°C', 'Rango de temperatura': '-30°C a +150°C', 'Punto de goteo': '> 250°C', 'Resistencia al agua': 'Excelente (DIN 51807: 0-90)', Color: 'Marrón claro / Azul según marca', Presentaciones: 'Cartucho 400g / Balde 5kg / Tambor 18kg / 180kg' },
    aplicaciones: ['Rodamientos de bolas y rodillos', 'Motores eléctricos', 'Bombas y ventiladores', 'Transportadores industriales', 'Maquinaria en general', 'Sistemas de lubricación centralizada'],
    caracteristicas: ['Excelente protección antidesgaste', 'Alta resistencia al lavado por agua', 'Amplio rango de temperaturas de trabajo', 'Compatible con lubricación centralizada', 'Larga vida útil de relubricación', 'Múltiples presentaciones disponibles'],
    fabricante: 'SKF / Shell / Mobil',
    activo: true,
  },
  // ── AUTOMOTRIZ ──
  {
    nombre: 'Kit de Distribución',
    slug: 'kit-distribucion-automotriz',
    descripcion: 'Kits de distribución completos para vehículos nacionales e importados',
    descripcion_larga: 'Kits de distribución completos que incluyen correa dentada, tensores y rodamientos auxiliares. Garantizan la correcta sincronización del motor.',
    categoria_id: 'a6000000-0000-0000-0000-000000000006',
    subcategoria: 'distribucion',
    stock: 10,
    imagen_url: '/images/products/Kitdedistribucion.webp',
    especificaciones: { Tipo: 'Kit de distribución completo', Incluye: 'Correa dentada, tensor, rodillos guía', Aplicación: 'Motores nafteros y diésel', 'Intervalo de cambio': 'Según fabricante (60.000 - 120.000 km)', 'Marcas disponibles': 'Gates, Dayco, SKF, Continental' },
    aplicaciones: ['Vehículos particulares', 'Utilitarios', 'Camionetas', 'Vehículos comerciales livianos'],
    caracteristicas: ['Kit completo con todos los componentes necesarios', 'Correas de alta resistencia al desgaste', 'Tensores con rodamientos de precisión', 'Compatibilidad garantizada con el vehículo', 'Marcas de primera línea'],
    fabricante: 'Gates / Dayco / SKF',
    activo: true,
  },
  {
    nombre: 'Bomba de Agua',
    slug: 'bomba-de-agua-automotriz',
    descripcion: 'Bombas de agua para el sistema de refrigeración del motor',
    descripcion_larga: 'Bombas de agua para el circuito de refrigeración del motor. Aseguran la correcta circulación del refrigerante para mantener la temperatura óptima de funcionamiento.',
    categoria_id: 'a6000000-0000-0000-0000-000000000006',
    subcategoria: 'bombas-agua',
    stock: 10,
    imagen_url: '/images/products/bomba de agua.webp',
    especificaciones: { Tipo: 'Bomba de agua mecánica', Función: 'Circulación de refrigerante', 'Material cuerpo': 'Aluminio fundido', 'Material impulsor': 'Fundición / Plástico reforzado', Sello: 'Sello mecánico cerámico', 'Marcas disponibles': 'Dolz, SKF, Graf, URO' },
    aplicaciones: ['Vehículos particulares', 'Utilitarios y camionetas', 'Vehículos comerciales', 'Motores nafteros y diésel'],
    caracteristicas: ['Sello mecánico de alta durabilidad', 'Impulsor balanceado dinámicamente', 'Resistencia a altas temperaturas', 'Caudal óptimo para cada motorización', 'Instalación directa sin modificaciones'],
    fabricante: 'Dolz / SKF / Graf',
    activo: true,
  },
  {
    nombre: 'Cubo de Rueda',
    slug: 'cubo-de-rueda-automotriz',
    descripcion: 'Cubos de rueda y rodamientos para todo tipo de vehículos',
    descripcion_larga: 'Cubos de rueda (wheel hubs) con rodamientos integrados para vehículos nacionales e importados. Componente esencial para el giro libre y seguro de las ruedas.',
    categoria_id: 'a6000000-0000-0000-0000-000000000006',
    subcategoria: 'ruedas',
    stock: 10,
    imagen_url: '/images/products/cubo de rueda.webp',
    especificaciones: { Tipo: 'Cubo de rueda con rodamiento integrado', Material: 'Acero al carbono de alta resistencia', Rodamiento: 'Doble hilera de bolas / rodillos cónicos', 'Sensor ABS': 'Disponible con y sin sensor', Posición: 'Delantero / Trasero', 'Marcas disponibles': 'SKF, NSK, NTN, Timken' },
    aplicaciones: ['Vehículos particulares', 'Camionetas y SUV', 'Utilitarios', 'Vehículos comerciales livianos'],
    caracteristicas: ['Rodamientos sellados de por vida', 'Alta capacidad de carga radial y axial', 'Compatibilidad con sistema ABS', 'Instalación directa (bolt-on)', 'Pre-engrasados de fábrica', 'Máxima seguridad en conducción'],
    fabricante: 'SKF / NSK / NTN',
    activo: true,
  },
];

async function seed() {
  console.log('🔥 Iniciando seed de Firestore...\n');

  // 1. Escribir categorías
  console.log('📁 Escribiendo categorías...');
  const batch = db.batch();
  for (const cat of categorias) {
    const ref = db.collection('categorias').doc(cat.slug);
    batch.set(ref, {
      nombre: cat.nombre,
      slug: cat.slug,
      created_at: Timestamp.now(),
    });
    console.log(`  ✓ ${cat.slug} → "${cat.nombre}"`);
  }
  await batch.commit();

  // 2. Escribir productos
  console.log('\n📦 Escribiendo productos...');
  for (const p of productos) {
    const catSlug = uuidToSlug[p.categoria_id];
    if (!catSlug) {
      console.warn(`  ⚠ Categoría no encontrada para UUID: ${p.categoria_id} (producto: ${p.nombre})`);
      continue;
    }
    const catNombre = slugToNombre[catSlug] ?? '';

    await db.collection('productos').add({
      nombre: p.nombre,
      slug: p.slug,
      descripcion: p.descripcion ?? null,
      descripcion_larga: p.descripcion_larga ?? null,
      categoria_id: catSlug,
      categoria_nombre: catNombre,
      categoria_slug: catSlug,
      subcategoria: p.subcategoria ?? null,
      stock: p.stock,
      precio: null,
      imagen_url: p.imagen_url ?? null,
      especificaciones: p.especificaciones ?? {},
      aplicaciones: p.aplicaciones ?? [],
      caracteristicas: p.caracteristicas ?? [],
      fabricante: p.fabricante ?? null,
      numero_parte: null,
      activo: p.activo,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${p.slug}`);
  }

  console.log(`\n✅ Seed completado: ${categorias.length} categorías, ${productos.length} productos`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
