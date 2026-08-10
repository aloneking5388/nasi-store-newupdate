import { RootState } from "@/store/store";
import {
  CartResponse,
  CartWishlistState,
  ProductPayload,
  ResponseMessage,
  WishlistPayload,
} from "@nasi/types/cart";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

const initialState: CartWishlistState = {
  loader: false,
  cartItems: [],
  wishlistItems: [],
  tax: 0,
  totalWithTax: 0,
  cartCount: 0,
  wishlistCount: 0,
  buyProductItem: 0,
  price: 0,
  outOfStockProducts: [],
  successMessage: "",
  errorMessage: "",
  shippingDetails: {
    products: [],
    price: 0,
    tax: 0,
    total: 0,
    items: 0,
  },
};

export const addToCart = createAsyncThunk<
  ResponseMessage,
  ProductPayload,
  { state: RootState }
>("cart/addToCart", async (info, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await axios.post("/cart/add-to-cart", info, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue({
      errorMessage: err.response?.data?.message || "Something went wrong",
    });
  }
});

export const getCartItems = createAsyncThunk<
  CartResponse,
  { id: string },
  { state: RootState }
>(
  "cart/getCartItems",
  async (userInfo, { getState, rejectWithValue, fulfillWithValue }) => {
    const token = getState().auth.token;
    try {
      const res = await axios.get(`/cart/get-cart/${userInfo.id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      return fulfillWithValue(res.data as CartResponse);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: err.message });
    }
  },
);

export const deleteCartItem = createAsyncThunk<
  ResponseMessage,
  string,
  { state: RootState }
>("cart/deleteCartItem", async (id, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await axios.delete(`/cart/delete-cart/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || { error: err.message });
  }
});

export const quantity_dec = createAsyncThunk<
  ResponseMessage,
  string,
  { state: RootState }
>(
  "cart/quantity_dec",
  async (card_Id, { getState, rejectWithValue, fulfillWithValue }) => {
    const token = getState().auth.token;
    try {
      const res = await axios.put(
        `/cart/quantity-dec/${card_Id}`,
        {},
        {
          headers: { authorization: `Bearer ${token}` },
        },
      );
      return fulfillWithValue(res.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: err.message });
    }
  },
);
export const quantity_inc = createAsyncThunk<
  ResponseMessage,
  string,
  { state: RootState }
>(
  "cart/quantity_inc",
  async (card_Id, { getState, rejectWithValue, fulfillWithValue }) => {
    const token = getState().auth.token;
    try {
      const res = await axios.put(
        `/cart/quantity-inc/${card_Id}`,
        {},
        {
          headers: { authorization: `Bearer ${token}` },
        },
      );
      return fulfillWithValue(res.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: err.message });
    }
  },
);

// ------------------------
// Async Thunks (Wishlist)
// ------------------------

export const addToWishlist = createAsyncThunk<
  ResponseMessage,
  WishlistPayload,
  { state: RootState }
>("cart/addToWishlist", async (info, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await axios.post("/wishlist/add-to-wishlist", info, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || { error: err.message });
  }
});

export const getWishlistItems = createAsyncThunk<
  any[],
  { id: string },
  { state: RootState }
>("cart/getWishlistItems", async (userInfo, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await axios.get(`/wishlist/get-wishlist/${userInfo.id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.data.wishlistItems;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || { error: err.message });
  }
});

export const deleteWishlistItem = createAsyncThunk<
  ResponseMessage,
  string,
  { state: RootState }
>("cart/deleteWishlistItem", async (id, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await axios.delete(`/wishlist/delete-wishlist/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || { error: err.message });
  }
});

// ------------------------
// Slice
// ------------------------

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartMessageClear: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
      state.loader = false;
    },
    setShippingDetails: (state, { payload }) => {
      state.shippingDetails = payload;
    },
  },
  extraReducers: (builder) => {
    // Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loader = true;
      })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.cartCount += 1;
      })
      .addCase(getCartItems.pending, (state) => {
        state.loader = true;
      })
      .addCase(getCartItems.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.cartItems = payload.cartItems;
        state.outOfStockProducts = payload.outOfStockProducts;
        state.buyProductItem = payload.buyProductItem;
        state.price = payload.price;
        state.tax = payload.tax;
        state.totalWithTax = payload.totalWithTax;
        state.cartCount = payload.cardProductCount;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.loader = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })

      // Wishlist
      .addCase(addToWishlist.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.wishlistCount += 1;
      })
      .addCase(getWishlistItems.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.wishlistItems = payload;
        state.wishlistCount = payload.length;
      })
      .addCase(deleteWishlistItem.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(quantity_dec.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addCase(quantity_inc.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      .addMatcher(
        (action) => action.type.endsWith("rejected"),
        (state, { payload }: any) => {
          state.errorMessage =
            payload?.errorMessage ||
            "An error occurred processing your request.";
        },
      );
  },
});

export const { cartMessageClear, setShippingDetails } = cartSlice.actions;
export default cartSlice.reducer;
