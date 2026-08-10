import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { NewsletterState, SubscribePayload } from "@nasi/types/newsletter";

const initialState: NewsletterState = {
  loader: false,
  successMessage: "",
  errorMessage: "",
};

export const subscribeUser = createAsyncThunk(
  "newsletter/subscribeUser",
  async ({ name, email }: SubscribePayload, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || "Subscription failed.");
      }

      return data;
    } catch (err: any) {
      return rejectWithValue("Network error.");
    }
  },
);

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    resetNewsletterState: (state) => {
      state.loader = false;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeUser.pending, (state) => {
        state.loader = true;
        state.successMessage = "";
        state.errorMessage = "";
      })
      .addCase(subscribeUser.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage =
          action.payload.message || "Subscription successful!";
      })
      .addCase(subscribeUser.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          (action.payload as string) || "Subscription failed.";
      });
  },
});

export const { resetNewsletterState } = newsletterSlice.actions;
export default newsletterSlice.reducer;
