import { RootState } from "@/store/store";
import { Banner, BannerState } from "@nasi/types/banner";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

// Async Thunks
export const add_banner = createAsyncThunk<
  { message: string; banner: Banner },
  FormData,
  { state: RootState }
>(
  "banner/add_banner",
  async (formData, { fulfillWithValue, rejectWithValue, getState }) => {
    const token = getState().auth.token;

    try {
      const { data } = await axios.post(`/banner`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

export const update_banner = createAsyncThunk<
  { message: string; banner: Banner },
  { bannerId: string; formData: FormData },
  { state: RootState }
>(
  "banner/update_banner",
  async (
    { bannerId, formData },
    { fulfillWithValue, rejectWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;

    try {
      const { data } = await axios.put(`/banner/${bannerId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const get_banner = createAsyncThunk<
  { banner: Banner },
  string,
  { state: RootState }
>(
  "banner/get_banner",
  async (productId, { fulfillWithValue, rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const { data } = await axios.get(
        `/banner/by-product/${productId}`,
        config,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Initial State
const initialState: BannerState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  banners: [],
  banner: null,
};

// Slice
const bannerReducer = createSlice({
  name: "banner",
  initialState,
  reducers: {
    bannerMessageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    clearBanner: (state) => {
      state.banner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(add_banner.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        add_banner.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload.message;
        },
      )
      .addCase(
        add_banner.fulfilled,
        (
          state,
          { payload }: PayloadAction<{ message: string; banner: Banner }>,
        ) => {
          state.loader = false;
          state.successMessage = payload.message;
          state.banner = payload.banner;
        },
      )
      .addCase(
        get_banner.fulfilled,
        (state, { payload }: PayloadAction<{ banner: Banner }>) => {
          state.loader = false;
          state.banner = payload.banner;
        },
      )
      .addCase(update_banner.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        update_banner.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload.message;
        },
      )
      .addCase(
        update_banner.fulfilled,
        (
          state,
          { payload }: PayloadAction<{ message: string; banner: Banner }>,
        ) => {
          state.loader = false;
          state.successMessage = payload.message;
          state.banner = payload.banner;
        },
      );
  },
});

// Export Actions
export const { bannerMessageClear, clearBanner } = bannerReducer.actions;

// Export Reducer
export default bannerReducer.reducer;
