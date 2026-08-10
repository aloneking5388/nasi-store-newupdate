export interface SubscribePayload {
  name: string;
  email: string;
}

export interface NewsletterState {
  loader: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}