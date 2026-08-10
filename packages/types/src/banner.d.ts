export interface Banner {
  _id: string;
  productId: string;
  banner: string;
  link?: string;
}

export interface BannerState {
  successMessage: string;
  errorMessage: string;
  loader: boolean;
  banners: Banner[];
  banner: Banner | null;
}

export interface AddBannerInfo {
  productId: string;
  banner: string;
  formData: FormData;
}