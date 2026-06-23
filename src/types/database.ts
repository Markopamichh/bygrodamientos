export interface CategoriaRow {
  id: string;     // = slug (Firestore document ID)
  nombre: string;
  slug: string;
  created_at: string;
}

export interface ProductoRow {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  descripcion_larga: string | null;
  categoria_id: string | null;       // = slug de la categoría (Firestore doc ID)
  categoria_nombre: string | null;   // desnormalizado
  categoria_slug: string | null;     // desnormalizado
  subcategoria: string | null;
  stock: number;
  precio: number | null;
  imagen_url: string | null;
  especificaciones: Record<string, string>;
  aplicaciones: string[];
  caracteristicas: string[];
  fabricante: string | null;
  numero_parte: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginAttemptRow {
  id: string;
  ip_address: string | null;
  attempted_at: string;
}
