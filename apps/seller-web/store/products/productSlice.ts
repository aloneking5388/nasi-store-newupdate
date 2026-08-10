import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "@nasi/api-sdk/client";
import {
  AddProductResponse,
  PriceRange,
  Product,
  ProductState,
  QueryParams,
  QueryProductsResponse,
  UpdatProduct,
} from "@nasi/types/product";

const initialState: ProductState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  products: [],
  latest_product: [],
  topRated_product: [],
  discount_product: [],
  relatedProducts: [],
  moreProducts: [],
  sellerProducts: [],
  totalSellerProduct: 0,
  product: null,
  totalProduct: 0,
  parPage: 12,
  reviews: [],
  totalReview: 0,
  rating_review: [],
  priceRange: {
    low: 0,
    high: 0,
  },
  totalPages: 0,
  currentPage: 1,
};

export const addProduct = createAsyncThunk<
  AddProductResponse,
  FormData,
  { state: RootState }
>(
  "product/addProduct",
  async (
    formData: FormData,
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const { token, userInfo } = (getState() as RootState).auth;

    if (userInfo?.status !== "active") {
      return rejectWithValue("Your seller account is not active.");
    }

    if (userInfo?.role !== "seller") {
      return rejectWithValue("You are not a seller.");
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.post(`/products`, formData, config);
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "Add Product Error" },
      );
    }
  },
);

export const updateProduct = createAsyncThunk<
  AddProductResponse,
  UpdatProduct,
  { state: RootState }
>(
  "product/updateProduct",
  async (
    product: UpdatProduct,
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.post(
        `/products/${product.productId}`,
        product,
        config,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response.data || { error: "update product failed" },
      );
    }
  },
);

export const productImageUpdate = createAsyncThunk(
  "product/productImageUpdate",
  async (
    {
      oldImage,
      newImage,
      productId,
    }: { oldImage: File; newImage: File; productId: string },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const formData = new FormData();
      formData.append("oldImage", oldImage);
      formData.append("newImage", newImage);
      formData.append("productId", productId);

      const { data } = await axios.post(
        `/products/image-update`,
        formData,
        config,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "update product image failed" },
      );
    }
  },
);

export const deleteProduct = createAsyncThunk<
  { message: string; productId: string },
  string,
  { state: RootState }
>(
  "product/deleteProduct",
  async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const { data } = await axios.delete(`/products/${productId}`, config);
      return fulfillWithValue({ message: data.message, productId });
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "Failed to delete product" },
      );
    }
  },
);

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (
    {
      page,
      searchValue,
      parPage,
    }: { page: number; searchValue: string; parPage: number },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(
        `/products?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`,
        config,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "get products failed" },
      );
    }
  },
);

export const getSellerProducts = createAsyncThunk<
  { products: Product[]; totalProduct: number },
  { page: number; parPage: number; searchValue: string },
  { state: RootState; rejectValue: any }
>(
  "product/getSellerProducts",
  async (
    { page, parPage, searchValue },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `/products/sellersProducts?page=${page}&parPage=${parPage}&searchValue=${searchValue}`,
        config,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to get seller products",
      );
    }
  },
);

export const price_range_product = createAsyncThunk<
  { latest_product: Product[][]; priceRange: PriceRange },
  void,
  {
    rejectValue: any;
  }
>(
  "product/price_range_product",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await axios.get("/price-range");
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "faild to price range product" },
      );
    }
  },
);

export const query_products = createAsyncThunk<
  QueryProductsResponse,
  QueryParams
>(
  "product/query_products",
  async (query, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await axios.get(
        `/query-products?category=${query.category ?? ""}&rating=${
          query.rating ?? ""
        }&lowPrice=${query.low ?? 0}&highPrice=${
          query.high ?? Number.MAX_SAFE_INTEGER
        }&sortPrice=${query.sortPrice ?? ""}&pageNumber=${
          query.pageNumber ?? 1
        }&searchValue=${query.searchValue ?? ""}`,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to get seller products",
      );
    }
  },
);

export const getProduct = createAsyncThunk(
  "product/getProduct",
  async (
    productId: string,
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(`/products/${productId}`, config);
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "failed get product" },
      );
    }
  },
);

export const get_Product = createAsyncThunk<
  { product: Product; relatedProducts: Product[]; moreProducts: Product[] },
  string,
  { rejectValue: string }
>(
  "product/get_Product",
  async (slug, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await axios.get(`/products/product/${slug}`);
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || { error: "failed get products" },
      );
    }
  },
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    productMessageClear: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        addProduct.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload?.error || "Failed to add product";
        },
      )
      .addCase(
        addProduct.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.successMessage = payload.message;
        },
      )
      .addCase(
        getProducts.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.totalProduct = payload.totalProduct;
          state.products = payload.products;
        },
      )
      .addCase(
        getProduct.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.product = payload.product;
        },
      )
      .addCase(get_Product.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        get_Product.fulfilled,
        (
          state,
          {
            payload,
          }: PayloadAction<{
            product: Product;
            relatedProducts: Product[];
            moreProducts: Product[];
          }>,
        ) => {
          state.loader = false;
          state.product = payload.product;
          state.relatedProducts = payload.relatedProducts;
          state.moreProducts = payload.moreProducts;
        },
      )
      .addCase(
        get_Product.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload ?? "failed to get product";
        },
      )
      .addCase(price_range_product.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        price_range_product.fulfilled,
        (
          state,
          {
            payload,
          }: PayloadAction<{
            latest_product: Product[][];
            priceRange: PriceRange;
          }>,
        ) => {
          state.loader = false;
          state.latest_product = payload.latest_product;
          state.priceRange = payload.priceRange;
        },
      )
      .addCase(
        price_range_product.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload ?? "failed to get price range product";
        },
      )
      .addCase(updateProduct.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        updateProduct.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload?.error || "Failed to update product";
        },
      )
      .addCase(
        updateProduct.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.product = payload.product;
          state.successMessage = payload.message;
        },
      )
      .addCase(
        productImageUpdate.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.product = payload.product;
          state.successMessage = payload.message;
        },
      )
      .addCase(productImageUpdate.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        productImageUpdate.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage =
            payload?.error || "Failed to update product image";
        },
      );
    builder
      .addCase(getSellerProducts.pending, (state) => {
        state.loader = true;
      })
      .addCase(getSellerProducts.fulfilled, (state, action) => {
        state.loader = false;
        state.sellerProducts = action.payload.products;
        state.totalSellerProduct = action.payload.totalProduct;
      })
      .addCase(getSellerProducts.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload || "Failed to get seller products";
      })

      .addCase(getProducts.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        getProducts.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload?.error || "Failed to get products";
        },
      )
      .addCase(query_products.pending, (state) => {
        state.loader = true;
      })
      .addCase(query_products.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.products = payload.products;
        state.totalProduct = payload.totalProduct;
        state.parPage = payload.parPage;
      })
      .addCase(
        query_products.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload?.error ?? "query products failed";
        },
      )
      .addCase(deleteProduct.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        deleteProduct.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.successMessage = payload.message;
          state.products = state.products.filter(
            (p) => p.id !== payload.productId,
          );
        },
      )
      .addCase(
        deleteProduct.rejected,
        (state, { payload }: PayloadAction<any>) => {
          state.loader = false;
          state.errorMessage = payload?.error || "Failed to delete product";
        },
      );
  },
});

export const { productMessageClear } = productSlice.actions;
export const selectProducts = (state: RootState) => state.product.products;
export const selectProductLoading = (state: RootState) => state.product.loader;
export const selectProductError = (state: RootState) =>
  state.product.errorMessage;
export const selectProductSuccessMessage = (state: RootState) =>
  state.product.successMessage;
export const selectProductTotal = (state: RootState) =>
  state.product.totalProduct;
export const selectProduct = (state: RootState) => state.product.product;

export default productSlice.reducer;
