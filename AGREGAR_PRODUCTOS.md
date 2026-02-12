# Guía para Agregar Productos

Esta guía explica cómo agregar nuevos productos al catálogo de BYG Rodamientos.

## Estructura de un Producto

Cada producto debe seguir esta estructura TypeScript:

```typescript
{
  id: string;              // ID único (ejemplo: 'rod-011')
  slug: string;            // URL amigable (ejemplo: 'rodamiento-rigido-bolas')
  name: string;            // Nombre completo del producto
  category: CategoryType;  // Categoría (rodamientos, retenes, etc.)
  subcategory: string;     // Subcategoría
  description: string;     // Descripción corta (1-2 líneas)
  longDescription: string; // Descripción detallada
  images: ProductImage[];  // Array de imágenes
  specifications: Record<string, string>;  // Especificaciones técnicas
  applications: string[];  // Lista de aplicaciones
  features: string[];      // Características destacadas
  relatedProducts?: string[];  // IDs de productos relacionados (opcional)
  inStock: boolean;        // Disponibilidad
  manufacturer?: string;   // Fabricante (opcional)
  partNumber?: string;     // Código de parte (opcional)
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}
```

## Paso a Paso

### 1. Identificar la Categoría

El producto debe pertenecer a una de estas categorías:

- `rodamientos` - Rodamientos Industriales
- `retenes` - Retenes
- `transmision` - Componentes de Transmisión
- `herramientas` - Herramientas
- `sellos` - Sellos Mecánicos
- `iveco` - Repuestos IVECO
- `automotriz` - Línea Automotriz

### 2. Abrir el Archivo Correspondiente

Navegar a `src/data/products/` y abrir el archivo de la categoría:

- Rodamientos: `rodamientos.ts`
- Retenes: `retenes.ts`
- Otros: crear archivo nuevo si no existe

### 3. Agregar el Producto

Copiar esta plantilla y completar con la información del producto:

```typescript
{
  id: 'ROD-XXX', // Incrementar número secuencial
  slug: 'nombre-producto-url-amigable',
  name: 'Nombre Completo del Producto',
  category: 'rodamientos', // Cambiar según categoría
  subcategory: 'rigidos-bolas', // Ver subcategorías disponibles

  description: 'Descripción corta y atractiva del producto en 1-2 líneas',

  longDescription: 'Descripción detallada del producto. Explicar para qué sirve, ' +
    'en qué aplicaciones se usa, ventajas principales, etc. Incluir información técnica ' +
    'relevante que ayude al cliente a entender si es el producto correcto para su necesidad.',

  images: [
    {
      url: '/images/products/nombre-imagen.jpg',
      alt: 'Descripción de la imagen para SEO',
    },
  ],

  specifications: {
    'Tipo': 'Tipo de rodamiento',
    'Serie': 'Número de serie',
    'Carga radial': 'Alta/Media/Baja',
    'Carga axial': 'Alta/Media/Baja',
    'Velocidad': 'Alta/Media/Baja',
    'Temperatura': '-XX°C a +XX°C',
    // Agregar más especificaciones según sea necesario
  },

  applications: [
    'Aplicación 1 (ejemplo: Motores eléctricos)',
    'Aplicación 2 (ejemplo: Bombas centrífugas)',
    'Aplicación 3',
    'Aplicación 4',
    // Agregar entre 4-8 aplicaciones típicas
  ],

  features: [
    'Característica destacada 1',
    'Característica destacada 2',
    'Característica destacada 3',
    'Característica destacada 4',
    // Listar entre 4-6 características principales
  ],

  inStock: true, // true si hay stock, false si no
  manufacturer: 'SKF / NSK / FAG', // Marcas disponibles
  partNumber: 'CÓDIGO-FABRICANTE', // Opcional

  seo: {
    metaTitle: 'Nombre Producto | BYG Rodamientos Neuquén',
    metaDescription: 'Breve descripción optimizada para Google (150-160 caracteres). ' +
      'Incluir palabras clave y llamado a la acción.',
    keywords: [
      'palabra clave 1',
      'palabra clave 2',
      'rodamientos neuquen',
      'nombre producto',
    ],
  },
},
```

### 4. Verificar Sintaxis

Asegurarse de:
- ✅ Comas al final de cada objeto (excepto el último)
- ✅ Comillas correctas (usar comillas simples '')
- ✅ ID único no repetido
- ✅ Slug único en formato URL (sin espacios, todo minúsculas)
- ✅ Categoría válida

### 5. Guardar y Probar

```bash
# Desde la carpeta del proyecto
npm run dev

# Visitar: http://localhost:3000/productos/[categoria]/[slug]
```

## Ejemplos Completos

### Ejemplo 1: Rodamiento Simple

```typescript
{
  id: 'rod-011',
  slug: 'rodamiento-6201',
  name: 'Rodamiento Rígido de Bolas 6201',
  category: 'rodamientos',
  subcategory: 'rigidos-bolas',
  description: 'Rodamiento rígido de bolas serie 6201 para aplicaciones generales',
  longDescription: 'El rodamiento 6201 es uno de los más utilizados en la industria ' +
    'por su versatilidad y disponibilidad. Ideal para motores eléctricos pequeños, ' +
    'ventiladores y maquinaria liviana.',
  images: [
    { url: '/images/products/rodamiento-6201.jpg', alt: 'Rodamiento 6201' }
  ],
  specifications: {
    'Serie': '6201',
    'Diámetro interior': '12 mm',
    'Diámetro exterior': '32 mm',
    'Ancho': '10 mm',
    'Carga dinámica': '6.82 kN',
  },
  applications: [
    'Motores eléctricos pequeños',
    'Ventiladores',
    'Electrodomésticos',
    'Herramientas eléctricas',
  ],
  features: [
    'Alta disponibilidad',
    'Bajo costo',
    'Fácil instalación',
    'Baja fricción',
  ],
  inStock: true,
  manufacturer: 'NSK',
  seo: {
    metaTitle: 'Rodamiento 6201 | BYG Rodamientos Neuquén',
    metaDescription: 'Rodamiento rígido de bolas 6201 en stock. Para motores eléctricos y ventiladores. Venta en Neuquén.',
    keywords: ['rodamiento 6201', 'rodamiento 12x32x10', 'rodamientos neuquen'],
  },
},
```

### Ejemplo 2: Retén

```typescript
{
  id: 'ret-004',
  slug: 'reten-30x47x7',
  name: 'Retén 30x47x7 NBR',
  category: 'retenes',
  subcategory: 'nitrilo',
  description: 'Retén de nitrilo medida 30x47x7 para ejes y cajas',
  longDescription: 'Retén de nitrilo (NBR) para sellar ejes rotatorios. Medida estándar ' +
    '30mm diámetro interior, 47mm diámetro exterior, 7mm de espesor. Resistente a ' +
    'aceites minerales y temperaturas hasta 100°C.',
  images: [
    { url: '/images/products/reten-standard.jpg', alt: 'Retén NBR 30x47x7' }
  ],
  specifications: {
    'Material': 'Nitrilo (NBR)',
    'Ø Interior': '30 mm',
    'Ø Exterior': '47 mm',
    'Espesor': '7 mm',
    'Temperatura': '-40°C a +100°C',
    'Dureza': '70 Shore A',
  },
  applications: [
    'Cajas reductoras',
    'Bombas hidráulicas',
    'Motores eléctricos',
    'Maquinaria general',
  ],
  features: [
    'Resistente a aceites minerales',
    'Buena elasticidad',
    'Fácil instalación',
    'Stock permanente',
  ],
  inStock: true,
  seo: {
    metaTitle: 'Retén 30x47x7 NBR | BYG Rodamientos Neuquén',
    metaDescription: 'Retén de nitrilo 30x47x7 en stock. Para ejes y cajas. Resistente a aceites. Neuquén.',
    keywords: ['reten 30x47x7', 'reten nbr', 'retenes neuquen', 'sello eje'],
  },
},
```

## Tips para Mejores Descripciones

### Descripción Corta (description)
- Máximo 2 líneas
- Enfocarse en el beneficio principal
- Usar lenguaje claro y directo

### Descripción Larga (longDescription)
- 2-3 párrafos
- Explicar QUÉ es
- Explicar PARA QUÉ sirve
- Mencionar ventajas clave
- Incluir detalles técnicos relevantes

### Aplicaciones
- Ser específico (no solo "industria")
- Listar 4-8 aplicaciones concretas
- Usar nombres que los clientes reconozcan

### Características
- Beneficios tangibles
- Ventajas sobre alternativas
- Aspectos que el cliente valora

### SEO
- **Meta Title**: Máximo 60 caracteres
- **Meta Description**: 150-160 caracteres
- **Keywords**: 4-6 palabras/frases clave

## Subcategorías Disponibles

### Rodamientos
- rigidos-bolas
- bolas-rotula
- contacto-angular
- rodillos-cilindricos
- rodillos-rotula
- axiales
- agujas

### Retenes
- nitrilo
- viton
- silicona
- especiales

### Transmisión
- manguitos
- acoples
- poleas
- correas

### Herramientas
- extractores
- calentadores
- prensas
- lubricacion

### Sellos
- bombas
- agitadores
- cartucho

### IVECO
- motor
- transmision-iveco
- suspension

### Automotriz
- distribucion
- homocineticas
- ruedas
- suspension-auto

## Agregar Nueva Categoría

Si necesitas agregar una categoría completamente nueva:

1. Editar `src/data/categories.ts`
2. Agregar nueva categoría al array
3. Crear archivo en `src/data/products/nueva-categoria.ts`
4. Importar en `src/data/products/index.ts`

## Imágenes

### Formato Recomendado
- **Tamaño**: 800x800px mínimo
- **Formato**: JPG o WebP
- **Peso**: < 200KB (optimizar)
- **Ubicación**: `public/images/products/`

### Nombrado de Archivos
- Usar kebab-case: `rodamiento-6201.jpg`
- Descriptivo: `reten-nitrilo-30x47.jpg`
- Sin espacios ni caracteres especiales

### Optimización
```bash
# Usar herramientas como:
- TinyPNG (online)
- ImageOptim (Mac)
- Squoosh (online)
```

## Checklist Final

Antes de publicar nuevos productos:

- [ ] ID único no repetido
- [ ] Slug único en formato URL
- [ ] Categoría y subcategoría válidas
- [ ] Descripción corta clara y atractiva
- [ ] Descripción larga completa y útil
- [ ] Al menos 4 aplicaciones listadas
- [ ] Al menos 4 características destacadas
- [ ] Especificaciones técnicas completas
- [ ] Meta title < 60 caracteres
- [ ] Meta description 150-160 caracteres
- [ ] Keywords relevantes (4-6)
- [ ] Estado de stock correcto
- [ ] Sin errores de sintaxis
- [ ] Probado en localhost

## Soporte

Si tienes dudas sobre cómo agregar productos o necesitas ayuda con la sintaxis, contactar al equipo de desarrollo.
