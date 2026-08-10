import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";
import { RootState } from "../store";
import { DashboardData, DashboardState } from "@nasi/types/dashboard";

const initialState: DashboardState = {
  user: null,
  walletBalance: 0,
  recentOrders: [],
  errorMessage: "",
  successMessage: "",
  loader: false,
  totalOrders: 0,
  orderCounts: {
    pending: 0,
    paid: 0,
    unpaid: 0,
  },
};

// ✅ Thunk for fetching dashboard data
export const get_dashboard_index_data = createAsyncThunk<
  DashboardData,
  string, // userId
  {
    state: RootState;
    rejectValue: { message: string };
  }
>(
  "dashboard/get_dashboard_index_data",
  async (userId, { rejectWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get<DashboardData>(
        `/customers/get-dashboard-data/${userId}`,
        config,
      );
      return data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch dashboard data";
      return rejectWithValue({ message });
    }
  },
);

// ✅ Slice for dashboard
export const dashboardReducer = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_dashboard_index_data.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(
        get_dashboard_index_data.fulfilled,
        (state, action: PayloadAction<DashboardData>) => {
          state.loader = false;
          state.user = action.payload.user;
          state.walletBalance = action.payload.walletBalance;
          state.recentOrders = action.payload.recentOrders;
          state.totalOrders = action.payload.totalOrders;
          state.orderCounts = action.payload.orderCounts;
        },
      )
      .addCase(
        get_dashboard_index_data.rejected,
        (state, action: PayloadAction<{ message?: string } | undefined>) => {
          state.loader = false;
          state.errorMessage =
            action.payload?.message || "get dashboard data failed";
        },
      );
  },
});

export const { messageClear } = dashboardReducer.actions;
export default dashboardReducer.reducer;
