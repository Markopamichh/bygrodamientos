export const GTM_ID = 'GTM-KCVP42TD';

export const SITE_NAME = 'BYG Rodamientos';
export const SITE_DESCRIPTION = 'Distribuidores de rodamientos industriales, retenes y repuestos en Neuquén. Más de 300 clientes. Asesoramiento especializado y stock permanente.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bygrodamientos.com.ar';

export const CONTACT = {
  phone: '0299-4462562',
  phone2: '0299-4462562',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492994019699',
  email: 'bygrodamientos@gmail.com',
  address: 'Collon Cura 240, Neuquén, Argentina',
};

export const SOCIAL = {
  facebook: '',
  instagram: '',
  linkedin: '',
};

export const SEO = {
  defaultTitle: `${SITE_NAME} | Venta de Rodamientos Industriales en Neuquén`,
  titleTemplate: `%s | ${SITE_NAME}`,
  defaultDescription: SITE_DESCRIPTION,
  keywords: [
    'rodamientos industriales',
    'rodamientos neuquen',
    'venta rodamientos',
    'retenes industriales',
    'repuestos industriales',
    'rodamientos patagonia',
    'BYG rodamientos',
  ],
};
