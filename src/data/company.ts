import { ContactInfo } from '@/types/contact';

export const companyInfo: ContactInfo = {
  address: 'Collon Cura 240',
  city: 'Neuquén',
  province: 'Neuquén',
  phone: '0299-4462546',
  phone2: '0299-4462547',
  whatsapp: '5492994019699',
  email: 'bygrodamientos@gmail.com',
  hours: {
    weekdays: 'Lunes a Viernes: 8:30 - 17:00',
    saturday: 'Sábados: Cerrado',
    sunday: 'Domingos: Cerrado',
  },
  coordinates: {
    lat: -38.9516,
    lng: -68.0591,
  },
};

export const companyValues = [
  {
    title: 'Trato Personalizado',
    description: 'Atención directa y asesoramiento técnico especializado para cada cliente',
    icon: 'users',
  },
  {
    title: 'Entrega Rápida',
    description: 'Stock permanente y entrega inmediata en productos de alta rotación',
    icon: 'clock',
  },
  {
    title: '300+ Clientes',
    description: 'Más de 300 clientes satisfechos en Neuquén y toda la Patagonia',
    icon: 'briefcase',
  },
  {
    title: 'Expertise Técnico',
    description: 'Conocimiento profundo en rodamientos industriales y soluciones técnicas',
    icon: 'wrench',
  },
  {
    title: 'Importación Internacional',
    description: 'Capacidad de importar productos específicos según necesidades del cliente',
    icon: 'globe',
  },
  {
    title: 'Stock Permanente',
    description: 'Amplio inventario de productos de uso frecuente y entrega inmediata',
    icon: 'package',
  },
];

export const companyMission = 'Proveer soluciones industriales de calidad con un servicio personalizado, disponibilidad inmediata y asesoramiento técnico especializado para optimizar los procesos productivos de nuestros clientes.';

export const companyHistory = 'BYG Rodamientos es una empresa neuquina con sólida trayectoria en la distribución de rodamientos industriales, retenes y componentes de transmisión. Con más de 300 clientes en Neuquén y toda la región patagónica, nos especializamos en brindar soluciones técnicas para la industria, con stock permanente y capacidad de importación internacional.';
