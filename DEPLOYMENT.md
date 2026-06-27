# Guía de Deployment - BYG Rodamientos

## Pre-requisitos

- Cuenta en [Vercel](https://vercel.com) (recomendado)
- Repositorio Git (GitHub, GitLab, o Bitbucket)
- Dominio bygrodamientos.com configurado

## Deployment en Vercel (Recomendado)

### Paso 1: Preparar el Repositorio

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar archivos
git add .

# Crear commit inicial
git commit -m "Initial commit: BYG Rodamientos website"

# Conectar con repositorio remoto
git remote add origin [URL_DE_TU_REPOSITORIO]
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. Hacer clic en "New Project"
3. Importar el repositorio Git
4. Configurar el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `next build`
   - **Output Directory**: .next

### Paso 3: Configurar Variables de Entorno

En el panel de Vercel, agregar las siguientes variables de entorno:

```
NEXT_PUBLIC_SITE_URL=https://bygrodamientos.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_WHATSAPP_NUMBER=5492996726610
```

### Paso 4: Deploy

1. Hacer clic en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. El sitio estará disponible en una URL temporal de Vercel

### Paso 5: Configurar Dominio Personalizado

1. En el dashboard de Vercel, ir a "Settings" > "Domains"
2. Agregar dominio: `bygrodamientos.com`
3. Seguir instrucciones para configurar DNS:
   - Tipo: A Record
   - Name: @
   - Value: 76.76.21.21 (IP de Vercel)

   Y para www:
   - Tipo: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

4. Esperar propagación DNS (hasta 48 horas)

## Post-Deployment

### Google Analytics

1. Crear propiedad en [Google Analytics](https://analytics.google.com)
2. Obtener Measurement ID (G-XXXXXXXXXX)
3. Agregar como variable de entorno `NEXT_PUBLIC_GA_ID`
4. Redeploy en Vercel

### Google Search Console

1. Ir a [Google Search Console](https://search.google.com/search-console)
2. Agregar propiedad: bygrodamientos.com
3. Verificar propiedad (vía DNS o archivo HTML)
4. Enviar sitemap: `https://bygrodamientos.com/sitemap.xml`

### EmailJS (Formulario de Contacto)

1. Crear cuenta en [EmailJS](https://www.emailjs.com)
2. Crear servicio de email (Gmail, Outlook, etc.)
3. Crear plantilla de email con placeholders:
   - `{{name}}`
   - `{{company}}`
   - `{{email}}`
   - `{{phone}}`
   - `{{product}}`
   - `{{message}}`
   - `{{isEmergency}}`
4. Obtener credenciales:
   - Service ID
   - Template ID
   - Public Key
5. Agregar como variables de entorno
6. Redeploy

### Configuración de Email (Alternativa: Resend)

Si prefieres usar Resend en lugar de EmailJS:

1. Crear cuenta en [Resend](https://resend.com)
2. Verificar dominio
3. Obtener API Key
4. Actualizar código en `src/components/contact/ContactForm.tsx`

## Monitoreo

### Vercel Analytics

- Automáticamente incluido en el plan gratuito
- Ver métricas de performance en el dashboard

### Web Vitals

Monitorear Core Web Vitals:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Mantenimiento

### Actualizar Contenido

Para agregar nuevos productos:

1. Editar archivos en `src/data/products/`
2. Commit y push a repositorio
3. Vercel redesplegará automáticamente

### Actualizar Dependencias

```bash
# Verificar actualizaciones
npm outdated

# Actualizar dependencias
npm update

# Actualizar Next.js específicamente
npm install next@latest react@latest react-dom@latest
```

### Backup

- Vercel mantiene historial de deployments
- Repositorio Git es el backup principal
- Exportar datos periódicamente si se migra a CMS

## Troubleshooting

### Error en Build

```bash
# Limpiar caché
rm -rf .next
npm run build
```

### Variables de Entorno no Funcionan

- Verificar que tienen prefijo `NEXT_PUBLIC_` para variables del cliente
- Redeploy después de cambiar variables en Vercel
- Verificar ortografía exacta

### Sitemap no Actualiza

- Forzar rebuild en Vercel
- Verificar en Google Search Console
- Puede tardar hasta 24h en indexar

## Costos

### Vercel

- Plan Hobby: Gratis
  - 100GB bandwidth
  - Unlimited requests
  - Automatic HTTPS
  - Custom domains

- Plan Pro: $20/mes (si necesitas más)
  - 1TB bandwidth
  - Analytics avanzado
  - Soporte prioritario

### Dominio

- .com: ~$12-15/año (GoDaddy, Namecheap, etc.)

### EmailJS

- Plan Gratis: 200 emails/mes
- Plan Personal: $7/mes (1000 emails)

Total estimado mensual: $0-$30 dependiendo de tráfico

## Mejoras Futuras

1. **CMS Headless**: Sanity o Contentful para gestión de productos
2. **Base de Datos**: Supabase o PostgreSQL
3. **Autenticación**: NextAuth.js para panel de administración
4. **E-commerce**: Stripe para pagos online
5. **Chat en vivo**: Tawk.to o Intercom
6. **CDN de Imágenes**: Cloudinary para imágenes optimizadas

## Soporte

Para soporte técnico del sitio web, contactar al desarrollador.

Para contenido y productos, contactar a BYG Rodamientos:
- Email: ventas@bygrodamientos.com
- Tel: 0299-4462546
