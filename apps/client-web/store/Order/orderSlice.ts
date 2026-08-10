// store/features/order/orderSlice.ts

import { RootState } from "@/store/store";
import { Order, OrderState, ShippingInfo } from "@nasi/types/order";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

// ✅ Thunk: Place Order
export const place_order = createAsyncThunk<
  { message: string; orderId: string },
  {
    price: number;
    products: any[];
    shippingFee: number;
    shippingInfo: ShippingInfo;
    userId: string;
    items: number;
    shippingMethodMap: { [sellerId: string]: string };
  },
  { state: RootState }
>(
  "order/place_order",
  async (
    {
      price,
      products,
      shippingFee,
      shippingInfo,
      userId,
      items,
      shippingMethodMap,
    },
    { getState, fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { authorization: `Bearer ${token}` } };

      const { data } = await axios.post(
        "/customers/order",
        {
          price,
          products,
          shippingFee,
          shippingInfo,
          userId,
          items,
          shippingMethodMap,
        },
        config,
      );

      return fulfillWithValue({
        message: data.message || "Order placed successfully!",
        orderId: data.orderId,
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Order placement failed",
      );
    }
  },
);

// ✅ Thunk: Get Orders
export const get_orders = createAsyncThunk<
  { orders: Order[] },
  { customerId: string; status: string },
  { state: RootState; rejectValue: string }
>(
  "order/get_orders",
  async (
    { customerId, status },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { authorization: `Bearer ${token}` } };
      const { data } = await axios.get(
        `/customers/order/${customerId}?status=${status}`,
        config,
      );
      return fulfillWithValue({ orders: data.orders });
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

// ✅ Thunk: Get Single Order
export const get_order = createAsyncThunk<
  { order: Order },
  string,
  { state: RootState; rejectValue: string }
>("order/get_order", async (orderId, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    const config = { headers: { authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`/customers/get-order/${orderId}`, config);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch order",
    );
  }
});

// ✅ Initial state
const initialState: OrderState = {
  orderId: "",
  totalPrice: 0,
  items: 0,
  loader: false,
  myOrders: [],
  myOrder: null,
  errorMessage: "",
  successMessage: "",
};

// ✅ Slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    orderMessageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    setOrderDetails: (
      state,
      action: PayloadAction<{
        orderId: string;
        totalPrice: number;
        items: number;
      }>,
    ) => {
      state.orderId = action.payload.orderId;
      state.totalPrice = action.payload.totalPrice;
      state.items = action.payload.items;
    },
    clearOrderDetails: (state) => {
      state.orderId = "";
      state.totalPrice = 0;
      state.items = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(place_order.pending, (state) => {
        state.loader = true;
      })
      .addCase(place_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage =
          action.payload?.message || "Order placed successfully!";
      })
      .addCase(get_orders.fulfilled, (state, action) => {
        state.myOrders = action.payload.orders;
      })
      .addCase(get_order.fulfilled, (state, action) => {
        state.myOrder = action.payload.order;
      })
      .addCase(get_orders.rejected, (state, action) => {
        state.errorMessage = action.payload || "Could not get orders.";
      })
      .addCase(get_order.rejected, (state, action) => {
        state.errorMessage = action.payload || "Could not get order.";
      });
  },
});

export const { orderMessageClear, setOrderDetails, clearOrderDetails } =
  orderSlice.actions;
export default orderSlice.reducer;
