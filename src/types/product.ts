export type CategoryType = string;

export interface ProductImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryType;
  subcategory: string;
  description: string;
  longDescription: string;
  images: ProductImage[];
  specifications: Record<string, string>;
  applications: string[];
  features: string[];
  relatedProducts?: string[];
  inStock: boolean;
  availability: 'stock' | 'encargo';
  manufacturer?: string;
  partNumber?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}
