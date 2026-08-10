import { HomeApiResponse, HomeState } from "@nasi/types/home";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

// Initial State
const initialState: HomeState = {
  banners: [],
  latest_product: [],
  topRated_product: [],
  discount_product: [],
  products: [],
  categorys: [],
  successMessage: "",
  errorMessage: "",
  loader: false,
};

// Async Thunk for fetching home data
export const get_Home_Data = createAsyncThunk<
  HomeApiResponse, // ✅ Return type
  void, // ✅ Argument type
  { rejectValue: { errorMessage: string } } // ✅ Error type
>("home/get_Home_Data", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get("/home");
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.errorMessage ||
      error.message ||
      "Something went wrong";
    return rejectWithValue({ errorMessage: message });
  }
});

// Slice
const homeReducer = createSlice({
  name: "home",
  initialState,
  reducers: {
    setHomeData: (state, action: PayloadAction<HomeApiResponse>) => {
      const payload = action.payload;
      state.loader = false;
      state.banners = payload.banners || [];
      state.categorys = payload.categorys || [];
      state.products = payload.products || [];
      state.latest_product = payload.latest_product || [];
      state.topRated_product = payload.topRated_product || [];
      state.discount_product = payload.discount_product || [];
      state.errorMessage = "";
    },
    resetHomeState: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
      state.loader = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_Home_Data.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        get_Home_Data.fulfilled,
        (state, action: PayloadAction<HomeApiResponse>) => {
          const payload = action.payload;
          state.loader = false;
          state.banners = payload.banners || [];
          state.categorys = payload.categorys || [];
          state.products = payload.products || [];
          state.latest_product = payload.latest_product || [];
          state.topRated_product = payload.topRated_product || [];
          state.discount_product = payload.discount_product || [];
        },
      )
      .addCase(get_Home_Data.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          action.payload?.errorMessage || "Failed to fetch home data";
      });
  },
});

// Exports
export const { resetHomeState, setHomeData } = homeReducer.actions;
export default homeReducer.reducer;
