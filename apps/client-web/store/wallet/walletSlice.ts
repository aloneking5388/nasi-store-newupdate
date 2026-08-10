import { RootState } from "@/store/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

const initialState: WalletState = {
  walletBalance: 0,
  referralEarnings: 0,
  transactions: [],
  loader: false,
  errorMessage: "",
  successMessage: "",
};

export const getWalletOverview = createAsyncThunk<
  any,
  void,
  { state: RootState; rejectValue: string }
>("wallet/getWalletOverview", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("Unauthorized: Token missing");
    }

    const res = await axios.get("/wallet/overview", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch wallet overview",
    );
  }
});

export const deductWalletAmount = createAsyncThunk<
  any,
  { payAmount: number; orderId: string },
  { state: RootState; rejectValue: string }
>(
  "wallet/deductWalletAmount",
  async (
    { payAmount, orderId },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue("Unauthorized: Token missing");
      }

      console.log("Deducting wallet amount:", { payAmount, orderId });

      const response = await axios.post(
        "/wallet/deduct",
        { payAmount, orderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // ✅ Return only the serializable JSON response body
      return fulfillWithValue(response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to deduct wallet amount",
      );
    }
  },
);

export const transferToWallet = createAsyncThunk<
  any,
  number,
  { state: RootState; rejectValue: string }
>(
  "wallet/transferToWallet",
  async (amount, { getState, fulfillWithValue, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      if (!token) {
        return rejectWithValue("Unauthorized: Token missing");
      }

      const res = await axios.post(
        "/wallet/transfer",
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return fulfillWithValue(res.data);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "failed to transfer",
      );
    }
  },
);

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    walletMessageClear(state) {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWalletOverview.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(getWalletOverview.fulfilled, (state, action) => {
        state.loader = false;
        state.walletBalance = action.payload.walletBalance;
        state.referralEarnings = action.payload.referralEarnings;
        state.transactions = action.payload.transactions;
      })
      .addCase(getWalletOverview.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          action.payload || "Failed to fetch wallet overview";
      })
      .addCase(transferToWallet.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(transferToWallet.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(transferToWallet.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload || "Transfer failed";
      })
      .addCase(deductWalletAmount.pending, (state) => {
        state.loader = true;
      })
      .addCase(deductWalletAmount.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.walletBalance -= action.payload.amount; // Update wallet balance
      })
      .addCase(deductWalletAmount.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload || "Failed to deduct wallet amount";
      });
  },
});

export const { walletMessageClear } = walletSlice.actions;
export default walletSlice.reducer;
