# BYG Rodamientos - Sitio Web Corporativo

Sitio web profesional para BYG Rodamientos, distribuidora de rodamientos industriales, retenes y repuestos en Neuquén, Argentina.

## Tecnologías Utilizadas

- **Framework**: Next.js 14.2+ con App Router
- **Lenguaje**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **Formularios**: React Hook Form + Zod validation
- **Optimizaciones**: next/image, next/font

## Características

- ✅ Diseño responsive mobile-first
- ✅ SEO optimizado con metadata dinámica
- ✅ Sitemap y robots.txt automáticos
- ✅ Catálogo completo de productos
- ✅ Formulario de contacto con validación
- ✅ Integración con WhatsApp
- ✅ Performance optimizado (Server Components)
- ✅ Accesibilidad (a11y)

## Estructura del Proyecto

```
src/
├── app/                      # App Router (Next.js 14)
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Homepage
│   ├── nosotros/           # Página "Sobre Nosotros"
│   ├── productos/          # Catálogo de productos
│   │   ├── [category]/     # Páginas dinámicas de categoría
│   │   └── [category]/[slug]/  # Páginas de producto individual
│   ├── contacto/           # Página de contacto
│   ├── sitemap.ts          # Sitemap dinámico
│   ├── robots.ts           # Robots.txt
│   └── not-found.tsx       # Página 404
├── components/             # Componentes React
│   ├── layout/            # Header, Footer, Breadcrumbs
│   ├── home/              # Componentes de homepage
│   ├── products/          # Componentes de productos
│   ├── contact/           # Formulario de contacto
│   └── shared/            # Componentes reutilizables
├── data/                  # Datos estáticos
│   ├── products/         # Catálogos de productos
│   ├── categories.ts     # Categorías
│   └── company.ts        # Información de empresa
├── types/                # Interfaces TypeScript
├── lib/                  # Utilidades
└── styles/              # Estilos globales
```

## Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El sitio estará disponible en http://localhost:3000
```

### Producción

```bash
# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
```

## Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_SITE_URL=https://bygrodamientos.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_WHATSAPP_NUMBER=5492996726610
```

## Configuración de EmailJS (Opcional)

Para habilitar el envío de emails desde el formulario de contacto:

1. Crear cuenta en [EmailJS](https://www.emailjs.com/)
2. Crear un servicio de email
3. Crear una plantilla de email
4. Copiar las credenciales a `.env.local`

## SEO

El sitio incluye optimizaciones SEO completas:

- Metadata dinámica por página
- Open Graph tags
- Twitter Cards
- Sitemap.xml automático
- Robots.txt
- URLs semánticas
- Schema.org markup (en desarrollo)

## Estructura de Datos

### Productos

Los productos están organizados en archivos TypeScript en `src/data/products/`:

- `rodamientos.ts` - Rodamientos industriales (10 productos)
- `retenes.ts` - Retenes (3 productos)
- Más categorías pueden agregarse fácilmente

Cada producto incluye:
- Información básica (nombre, categoría, descripción)
- Especificaciones técnicas
- Aplicaciones
- Características
- Metadata SEO

### Categorías

Las categorías están definidas en `src/data/categories.ts` e incluyen:
- Rodamientos Industriales
- Retenes
- Componentes de Transmisión
- Herramientas
- Sellos Mecánicos
- Repuestos IVECO
- Línea Automotriz

## Agregar Nuevos Productos

1. Editar el archivo correspondiente en `src/data/products/`
2. Seguir la estructura TypeScript definida
3. Los productos aparecerán automáticamente en el sitio

Ejemplo:

```typescript
{
  id: 'rod-011',
  slug: 'nuevo-producto',
  name: 'Nombre del Producto',
  category: 'rodamientos',
  subcategory: 'rigidos-bolas',
  description: 'Descripción corta',
  longDescription: 'Descripción detallada...',
  images: [{ url: '/images/products/...', alt: '...' }],
  specifications: {
    'Tipo': 'Valor',
    // ...
  },
  applications: ['Aplicación 1', 'Aplicación 2'],
  features: ['Característica 1', 'Característica 2'],
  inStock: true,
  seo: {
    metaTitle: 'Título SEO',
    metaDescription: 'Descripción SEO',
    keywords: ['keyword1', 'keyword2'],
  },
}
```

## Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

## Contacto

Para consultas sobre el sitio web, contactar a BYG Rodamientos:

- **Teléfono**: 0299-4462546
- **Email**: ventas@bygrodamientos.com
- **WhatsApp**: +54 9 299 672-6610
- **Dirección**: Collon Cura 240, Neuquén

## Licencia

Copyright © 2026 BYG Rodamientos. Todos los derechos reservados.
