export interface MarcaDestacada {
  nombre: string;
  origen: string;
  tipo: string; // 'distribuidor oficial' | 'distribución exclusiva'
  descripcion: string;
}

export interface MarcaLogo {
  nombre: string;
  logoUrl: string;
}

const CDN = 'https://ss-cnt-001c.esmsv.com/r/content/host1/bdd8cf8fe5a4915516c7492d106a6977/editor';

export const MARCAS_DESTACADAS: MarcaDestacada[] = [
  {
    nombre: 'NKE',
    origen: 'Austria',
    tipo: 'Marca comercializada',
    descripcion:
      'NKE Austria es un fabricante europeo de rodamientos de alta calidad con raíces en la tradición industrial austríaca de Steyr. Produce rodamientos estándar y especiales para aplicaciones industriales exigentes, combinando ingeniería europea con excelente relación precio-rendimiento.',
  },
  {
    nombre: 'NTN · SNR · BOWER',
    origen: 'Japón / Francia',
    tipo: 'Marca comercializada',
    descripcion:
      'NTN Corporation es uno de los fabricantes de rodamientos más grandes del mundo, con más de 100 años de innovación. SNR, su filial europea, y BOWER completan una línea completa de rodamientos para aplicaciones industriales y automotrices de alta exigencia.',
  },
  {
    nombre: 'FAG · INA',
    origen: 'Alemania',
    tipo: 'Marca comercializada',
    descripcion:
      'Schaeffler Group, a través de sus marcas FAG e INA, es referente mundial en rodamientos de precisión y componentes de transmisión. Su ingeniería alemana garantiza la más alta calidad en aplicaciones industriales críticas.',
  },
  {
    nombre: 'NSK',
    origen: 'Japón',
    tipo: 'Marca comercializada',
    descripcion:
      'NSK Ltd. es un fabricante japonés de clase mundial especializado en rodamientos de alta precisión, husillos de bolas y sistemas de guía lineal. Con décadas de innovación, sus productos son referencia en la industria automotriz e industrial.',
  },
  {
    nombre: 'TIMKEN',
    origen: 'Estados Unidos',
    tipo: 'Marca comercializada',
    descripcion:
      'The Timken Company, fundada en 1899, es sinónimo de rodamientos cónicos de alta resistencia. Sus soluciones en acero especial y rodamientos son utilizadas en las aplicaciones más exigentes de la industria pesada, minería y transporte.',
  },
  {
    nombre: 'RINGSPANN',
    origen: 'Alemania',
    tipo: 'Marca comercializada',
    descripcion:
      'RINGSPANN es especialista en elementos de fijación de cubos, frenos industriales, embragues de rodillos y amortiguadores de torsión. Con ingeniería alemana de precisión, sus componentes son esenciales en aplicaciones de transmisión de alta demanda.',
  },
  {
    nombre: 'OPTIBELT',
    origen: 'Alemania',
    tipo: 'Marca comercializada',
    descripcion:
      'OPTIBELT es un fabricante alemán líder en correas de transmisión de alta calidad: correas en V, correas dentadas y correas sincrónicas. Sus productos destacan por su eficiencia energética, durabilidad y precisión en la transmisión de potencia.',
  },
  {
    nombre: 'SKF',
    origen: 'Suecia',
    tipo: 'Marca comercializada',
    descripcion:
      'Líder mundial en rodamientos, sellos, lubricación y sistemas de transmisión de potencia. SKF combina más de 100 años de experiencia con tecnología de vanguardia para ofrecer soluciones que maximizan la eficiencia y vida útil de la maquinaria.',
  },
];

export const MARCAS_GRID: MarcaLogo[] = [
  { nombre: 'NKE',         logoUrl: '/images/marcas/nke.jpg' },
  { nombre: 'RETENES SAV', logoUrl: '/images/marcas/sav.jpg' },
  { nombre: 'SKF',         logoUrl: `${CDN}/descarga%20%2831%29.webp` },
  { nombre: 'SEAL MASTER', logoUrl: `${CDN}/descarga%20%285%29_A7kmgBwTXJ.webp` },
  { nombre: 'INA',         logoUrl: `${CDN}/descarga%20%2812%29.webp` },
  { nombre: 'FAG',         logoUrl: `${CDN}/descarga%20%2811%29.webp` },
  { nombre: 'KOYO',        logoUrl: `${CDN}/descarga%20%2810%29.webp` },
  { nombre: 'ROLLWAY',     logoUrl: `${CDN}/descarga%20%289%29_cjwMSMfNYI.webp` },
  { nombre: 'MC GILL',     logoUrl: `${CDN}/descarga%20%288%29_dLISsC5tDv.webp` },
  { nombre: 'LINK BELT',   logoUrl: `${CDN}/descarga%20%287%29_lIrSanx1W5.webp` },
  { nombre: 'LOVEJOY',     logoUrl: `${CDN}/descarga%20%2813%29.webp` },
  { nombre: 'GUMMI',       logoUrl: `${CDN}/descarga%20%2816%29_gcbxGFubqP.webp` },
  { nombre: 'NSK',         logoUrl: `${CDN}/descarga%20%282%29.webp` },
  { nombre: 'MICHELIN',    logoUrl: `${CDN}/descarga%20%2815%29.webp` },
  { nombre: 'BROWNING',    logoUrl: `${CDN}/descarga%20%283%29.webp` },
  { nombre: 'IKO',         logoUrl: `${CDN}/descarga%20%2814%29.webp` },
  { nombre: 'HIWIN',       logoUrl: `${CDN}/descarga%20%284%29.webp` },
  { nombre: 'DODGE',       logoUrl: `${CDN}/descarga%20%2820%29_mRQLHmSRBa.webp` },
  { nombre: 'REXNORD',     logoUrl: `${CDN}/descarga%20%2822%29_cbhdKgJSfo.webp` },
  // posición 18: falta logo en el CDN de MR — omitida
  { nombre: 'DIAMOND',     logoUrl: `${CDN}/Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2896%29_CZ1TwEU7JH.webp` },
  { nombre: 'GATES',       logoUrl: `${CDN}/descarga%20%2818%29_gNlNDtwF5y.webp` },
  { nombre: 'OPTIBELT',    logoUrl: `${CDN}/descarga%20%2819%29_BFShvvZDi8.webp` },
  { nombre: 'THK',         logoUrl: `${CDN}/descarga%20%282%29%20%281%29.webp` },
  { nombre: 'COOPER',      logoUrl: `${CDN}/descarga%20%2821%29_h7ksfxUWjW.webp` },
  { nombre: 'CR',          logoUrl: `${CDN}/descarga%20%2827%29.webp` },
  { nombre: 'FALK',        logoUrl: `${CDN}/descarga%20%2824%29_pLC7JqpQBk.webp` },
  { nombre: 'MARTIN',      logoUrl: `${CDN}/descarga%20%2823%29_kvlB1AFpdg.webp` },
  { nombre: 'MORSE',       logoUrl: `${CDN}/descarga%20%2825%29.webp` },
  { nombre: 'TSUBAKI',     logoUrl: `${CDN}/descarga%20%286%29.webp` },
];

// Las más conocidas para el strip del home
export const MARCAS_HOME = [
  'SKF', 'NSK', 'FAG', 'INA', 'KOYO', 'TIMKEN', 'NTN', 'SNR',
  'THK', 'OPTIBELT', 'GATES', 'BROWNING', 'HIWIN', 'TSUBAKI', 'DODGE',
];
