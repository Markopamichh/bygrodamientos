import { CategoryType } from './product';

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: CategoryType;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  subcategories: Subcategory[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}
