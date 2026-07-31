import type { Product, ProductCategory } from "../data/products";

export const sortProducts = (items: Product[]) =>
  [...items].sort((a, b) => a.sortOrder - b.sortOrder);
export const filterByCategory = (items: Product[], category: ProductCategory) =>
  sortProducts(items.filter((product) => product.category === category));
export const filterByCollection = (items: Product[], collection: string) =>
  sortProducts(items.filter((product) => product.collection === collection));
export const featuredProducts = (items: Product[], limit = 6) =>
  sortProducts(items.filter((product) => product.featured)).slice(0, limit);
