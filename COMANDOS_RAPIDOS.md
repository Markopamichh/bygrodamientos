# Comandos Rápidos - BYG Rodamientos

## Comandos Esenciales

### Desarrollo

```bash
# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev

# El sitio estará en: http://localhost:3000
```

### Producción

```bash
# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start

# Analizar código
npm run lint
```

### Git

```bash
# Inicializar repositorio
git init

# Ver estado
git status

# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Mensaje del commit"

# Conectar con repositorio remoto
git remote add origin [URL_DEL_REPOSITORIO]

# Subir cambios
git push -u origin main
```

## Estructura de Archivos Importantes

```
src/
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Homepage
│   ├── nosotros/page.tsx       # Sobre Nosotros
│   ├── productos/
│   │   ├── page.tsx            # Catálogo
│   │   ├── [category]/page.tsx # Categoría
│   │   └── [category]/[slug]/page.tsx # Producto
│   └── contacto/page.tsx       # Contacto
│
├── data/
│   ├── products/
│   │   ├── rodamientos.ts      # EDITAR AQUÍ para agregar rodamientos
│   │   ├── retenes.ts          # EDITAR AQUÍ para agregar retenes
│   │   └── index.ts            # NO EDITAR (exporta todo)
│   ├── categories.ts           # Categorías (raramente editar)
│   └── company.ts              # Info empresa (editar si cambia)
│
└── components/                 # NO EDITAR (salvo customización)
```

## Tareas Comunes

### Agregar Nuevo Producto

1. Abrir archivo de categoría: `src/data/products/[categoria].ts`
2. Copiar plantilla de producto
3. Completar información
4. Guardar
5. Probar: `npm run dev`

Ver guía completa: `AGREGAR_PRODUCTOS.md`

### Cambiar Información de Contacto

Editar: `src/data/company.ts`

```typescript
export const companyInfo = {
  phone: '0299-XXXXXXX',        // Cambiar aquí
  email: 'nuevo@email.com',     // Cambiar aquí
  // ...
}
```

### Cambiar Colores del Sitio

Editar: `tailwind.config.ts`

```typescript
colors: {
  primary: {
    DEFAULT: '#E31E24',  // Rojo principal
    // ...
  },
}
```

### Agregar Imágenes de Productos

1. Colocar imagen en: `public/images/products/`
2. Nombrar: `producto-nombre.jpg`
3. Actualizar en datos:

```typescript
images: [
  { url: '/images/products/producto-nombre.jpg', alt: 'Descripción' }
]
```

## URLs del Sitio

### Desarrollo (Local)
- Homepage: `http://localhost:3000`
- Nosotros: `http://localhost:3000/nosotros`
- Productos: `http://localhost:3000/productos`
- Contacto: `http://localhost:3000/contacto`

### Producción (una vez deployado)
- Homepage: `https://bygrodamientos.com`
- Nosotros: `https://bygrodamientos.com/nosotros`
- Productos: `https://bygrodamientos.com/productos`
- Contacto: `https://bygrodamientos.com/contacto`

## Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Puerto 3000 en uso
El servidor automáticamente usará 3001, 3002, etc.

O detener proceso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [NUMERO_PID] /F

# Alternativa: cerrar todas las ventanas de terminal
```

### Error en compilación
```bash
# Limpiar caché
rm -rf .next
npm run dev
```

### Cambios no se ven
1. Guardar el archivo (Ctrl+S)
2. Esperar auto-refresh (5-10 segundos)
3. Refrescar navegador (F5)
4. Si persiste: detener servidor (Ctrl+C) y reiniciar

## Variables de Entorno

Archivo: `.env.local`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=5492996726610
NEXT_PUBLIC_GA_ID=                          # Google Analytics
NEXT_PUBLIC_EMAILJS_SERVICE_ID=             # EmailJS (opcional)
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=            # EmailJS (opcional)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=             # EmailJS (opcional)
```

**Importante**: Después de cambiar variables de entorno, reiniciar el servidor.

## Checklist Antes de Deploy

- [ ] Todas las imágenes agregadas
- [ ] Información de contacto correcta
- [ ] Variables de entorno configuradas
- [ ] Probado en móvil y desktop
- [ ] Todos los links funcionan
- [ ] Formulario de contacto probado
- [ ] Sin errores en consola
- [ ] `npm run build` exitoso

## Recursos

- **Documentación Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Vercel Deploy**: https://vercel.com/docs

## Contacto Soporte

Para ayuda técnica, revisar:
1. `README.md` - Documentación general
2. `DEPLOYMENT.md` - Guía de deploy
3. `AGREGAR_PRODUCTOS.md` - Agregar productos
4. `IMPLEMENTACION_COMPLETADA.md` - Estado del proyecto

## Atajos de Teclado (VS Code)

- `Ctrl + S` - Guardar
- `Ctrl + P` - Buscar archivo
- `Ctrl + Shift + F` - Buscar en proyecto
- `Ctrl + /` - Comentar línea
- `Ctrl + \`` - Abrir terminal
- `Alt + ↑/↓` - Mover línea

## Comandos de Node/NPM

```bash
# Ver versión de Node
node --version

# Ver versión de NPM
npm --version

# Actualizar NPM
npm install -g npm@latest

# Limpiar caché de NPM
npm cache clean --force

# Ver paquetes instalados
npm list --depth=0

# Ver paquetes desactualizados
npm outdated
```

¡Éxito con el proyecto! 🚀
