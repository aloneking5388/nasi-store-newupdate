import { CategoryState } from "@nasi/types/categoris";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

const initialState: CategoryState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  categorys: [],
  totalCategory: 0,
};

export const categoryAdd = createAsyncThunk(
  "category/categoryAdd",
  async (
    {
      name,
      image,
      subcategories,
    }: { name: string; image: File; subcategories?: string },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as any).auth.token;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("subcategories", subcategories || "");
      formData.append("image", image);

      const { data } = await axios.post("/category", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "add category failed" },
      );
    }
  },
);

export const get_category = createAsyncThunk(
  "category/get_category",
  async (
    {
      parPage,
      page,
      searchValue,
    }: { parPage: number; page: number; searchValue: string },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as any).auth.token;

    try {
      const { data } = await axios.get(
        `/category?page=${page}&searchValue=${searchValue}&parPage=${parPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "qurye category failed" },
      );
    }
  },
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    CategoryMessageClear: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(categoryAdd.pending, (state) => {
        state.loader = true;
      })
      .addCase(categoryAdd.rejected, (state, { payload }: any) => {
        state.loader = false;
        state.errorMessage = payload?.error || "Failed to add category";
      })
      .addCase(categoryAdd.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.categorys = [...state.categorys, payload.category];
      })
      .addCase(get_category.fulfilled, (state, { payload }) => {
        state.totalCategory = payload.totalCategory;
        state.categorys = Array.isArray(payload.categorys)
          ? payload.categorys
          : [];
      });
  },
});

export const { CategoryMessageClear } = categorySlice.actions;
export default categorySlice.reducer;
