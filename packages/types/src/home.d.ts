export interface HomeApiResponse {
  banners: any[];
  categorys: any[];
  products: any[];
  latest_product?: any[];
  topRated_product?: any[];
  discount_product?: any[];
}

export interface HomeState {
  successMessage: string;
  errorMessage: string;
  loader: boolean;
  banners: Banner[];
  latest_product: Product[][];
  topRated_product: Product[][];
  discount_product: Product[][];
  products: Product[];
  categorys: any[];
}