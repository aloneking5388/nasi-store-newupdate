import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "@nasi/api-sdk/client";
import {
  GetOrdersArgs,
  GetOrdersResponse,
  HomeDashboardState,
  OrderItem,
} from "@nasi/types/homeDashboard";

const initialState: HomeDashboardState = {
  loader: false,
  errorMessage: "",
  successMessage: "",
  order: null,
  orders: [],
  totalRevenue: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalPendingOrders: 0,
  monthlyCustomers: Array(12).fill(0),
  monthlyRevenue: Array(12).fill(0),
  monthlyOrders: Array(12).fill(0),
  monthlySales: Array(12).fill(0),
};

export const home_orders = createAsyncThunk<
  GetOrdersResponse,
  GetOrdersArgs,
  {
    state: RootState;
    rejectWithValue: { errorMessage: string }; // <-- this fixes the typing for rejected case
  } // return type (from fulfilled)
>(
  "homeDashboard/home_orders",
  async (
    { page, parPage, searchValue },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    try {
      const token = (getState() as RootState).auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `/order?page=${page}&searchValue=${searchValue}&parPage=${parPage}`,
        config,
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || "Failed to fetch orders",
      });
    }
  },
);

export const home_order = createAsyncThunk<
  OrderItem,
  string,
  {
    state: RootState;
    rejectValue: { message: string };
  }
>(
  "homeDashboard/home_order",
  async (orderId, { rejectWithValue, getState, fulfillWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`/order/${orderId}`, config);

      const orderData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;
      console.log("Order Data:", orderData);
      return fulfillWithValue(orderData);
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.error || "Failed to fetch order details",
      });
    }
  },
);

export const get_home_dashboard_data = createAsyncThunk<
  HomeDashboardState, // return type (from fulfilled)
  void, // argument type
  {
    state: RootState;
    rejectValue: { message: string }; // <-- this fixes the typing for rejected case
  }
>(
  "homeDashboard/get_home_dashboard_data",
  async (_, { rejectWithValue, getState, fulfillWithValue }) => {
    const token = (getState() as RootState).auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get("/admin/dashboard-data/main", config);
      return fulfillWithValue(data);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch home dashboard data";
      return rejectWithValue({ message });
    }
  },
);

export const admin_order_status_update = createAsyncThunk(
  "order/admin_order_status_update",
  async (
    { orderId, info }: { orderId: string; info: { status: string } },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token;

      if (!token) {
        return rejectWithValue({
          success: false,
          message: "Unauthorized: No token found",
        });
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(`/order/${orderId}`, info, config);

      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || {
          success: false,
          message: "Unexpected error",
        },
      );
    }
  },
);

const homeDashboardSlice = createSlice({
  name: "homeDashboard",
  initialState,
  reducers: {
    homeDashboardMessageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_home_dashboard_data.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        get_home_dashboard_data.fulfilled,
        (state, { payload }: PayloadAction<HomeDashboardState>) => {
          state.loader = false;
          state.totalRevenue = payload.totalRevenue;
          state.totalProducts = payload.totalProducts;
          state.totalOrders = payload.totalOrders;
          state.totalPendingOrders = payload.totalPendingOrders;
          state.monthlyCustomers = payload.monthlyCustomers;
          state.monthlyRevenue = payload.monthlyRevenue;
          state.monthlyOrders = payload.monthlyOrders;
          state.monthlySales = payload.monthlySales;
        },
      )
      .addCase(get_home_dashboard_data.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          action.payload?.message || "Failed to fetch home dashboard data";
      })
      .addCase(home_order.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        home_order.fulfilled,
        (state, action: PayloadAction<OrderItem>) => {
          state.loader = false;
          state.order = action.payload;
        },
      )
      .addCase(home_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          (action.payload as any)?.message || "Failed to fetch order details";
      })
      .addCase(home_orders.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        home_orders.fulfilled,
        (state, action: PayloadAction<GetOrdersResponse>) => {
          state.loader = false;
          state.orders = action.payload.orders; // Adjust this line if your response structure is different
        },
      )
      .addCase(home_orders.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          (action.payload as any)?.errorMessage || "Failed to fetch orders";
      })
      .addCase(admin_order_status_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        admin_order_status_update.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loader = false;
          state.successMessage =
            action.payload.message || "Order status updated successfully";
        },
      )
      .addCase(admin_order_status_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          (action.payload as any)?.message || "Failed to update order status";
      });
  },
});

export const { homeDashboardMessageClear } = homeDashboardSlice.actions;
export default homeDashboardSlice.reducer;
