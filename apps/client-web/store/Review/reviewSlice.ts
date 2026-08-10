import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";
import { RootState } from "../store";

const initialState: ReviewState = {
  loader: false,
  successMessage: "",
  errorMessage: "",
  reviews: [],
  totalReview: 0,
  rating_review: [],
  totalPages: 0,
  currentPage: 1,
};

export const customer_review = createAsyncThunk<
  { message: string; productId: string },
  { name: string; rating: number; review: string; productId: string },
  { state: RootState }
>(
  "review/customer_review",
  async (reviewData, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue({ error: "Unauthorized" });

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const { data } = await axios.post("/submit-review", reviewData, config);
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "failed submit review" },
      );
    }
  },
);

export const get_review = createAsyncThunk<ReviewData, GetReviewParams>(
  "review/get_review",
  async ({ productId, pageNumber }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await axios.get(
        `/reviews/${productId}?pageNo=${pageNumber}`,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "failed to get review" },
      );
    }
  },
);

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    reviewMessageClear: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(customer_review.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_review.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(customer_review.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          (action.payload as any)?.error || "Failed to submit review";
      })
      .addCase(get_review.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        get_review.fulfilled,
        (state, { payload }: PayloadAction<ReviewData>) => {
          state.loader = false;
          state.reviews = payload.reviews;
          state.totalReview = payload.totalReview;
          state.rating_review = payload.rating_review;
          state.totalPages = payload.totalPages;
          state.currentPage = payload.currentPage;
        },
      )
      .addCase(get_review.rejected, (state, action) => {
        state.errorMessage =
          (action.payload as any)?.error || "Failed to get reviews";
      });
  },
});

export const { reviewMessageClear } = reviewSlice.actions;
export default reviewSlice.reducer;
