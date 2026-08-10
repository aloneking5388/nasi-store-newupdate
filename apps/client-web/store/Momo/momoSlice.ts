import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

export const initiatePayment = createAsyncThunk(
  "momo/initiatePayment",
  async ({ amount, phone, externalId }: any) => {
    const res = await axios.post("/momo", { amount, phone, externalId });
    return res.data;
  },
);

const momoSlice = createSlice({
  name: "momo",
  initialState: {
    loader: false,
    successMassege: "",
    referenceId: "",
    errorMassege: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.loader = true;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loader = false;
        state.successMassege =
          action.payload.message || "Payment initiated successfully";
        state.referenceId = action.payload.referenceId;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loader = false;
        state.errorMassege = action.error.message || "Failed";
      });
  },
});

export default momoSlice.reducer;
