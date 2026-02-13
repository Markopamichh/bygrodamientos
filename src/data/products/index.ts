import { Product } from '@/types/product';
import { rodamientosProducts } from './rodamientos';
import { retenesProducts } from './retenes';
import { transmisionProducts } from './transmision';
import { herramientasProducts } from './herramientas';

export const allProducts: Product[] = [
  ...rodamientosProducts,
  ...retenesProducts,
  ...transmisionProducts,
  ...herramientasProducts,
];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find(p => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter(p => p.category === category);
}

export function getProductsBySubcategory(category: string, subcategory: string): Product[] {
  return allProducts.filter(p => p.category === category && p.subcategory === subcategory);
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return [];

  // Primero buscar productos de la misma subcategoría
  let related = allProducts.filter(
    p => p.id !== productId &&
    p.category === product.category &&
    p.subcategory === product.subcategory
  );

  // Si no hay suficientes, buscar de la misma categoría
  if (related.length < limit) {
    const categoryProducts = allProducts.filter(
      p => p.id !== productId &&
      p.category === product.category &&
      !related.includes(p)
    );
    related = [...related, ...categoryProducts];
  }

  return related.slice(0, limit);
}
