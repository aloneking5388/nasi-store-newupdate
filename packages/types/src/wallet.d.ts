interface WalletState {
  walletBalance: number;
  referralEarnings: number;
  transactions: any[];
  loader: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}