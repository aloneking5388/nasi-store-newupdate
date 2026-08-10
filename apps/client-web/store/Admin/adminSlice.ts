import {
  AdminDashboardState,
  SellerCustomerListResponse,
} from "@nasi/types/admin";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "@nasi/api-sdk/client";

const initialState: AdminDashboardState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  sellers: [],
  customers: [],
  totalSellers: 0,
  totalCustomers: 0,
  seller: null,
  customer: null,
};

export const get_dashboard_home = createAsyncThunk<
  { monthlyCustomers: number[] },
  void,
  { rejectValue: { message: string } }
>(
  "admin/get_dashboard_home",
  async (_, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const { data } = await axios.get(`/admin/dashboard-data/main`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const get_sellers_customes = createAsyncThunk(
  "admin/get_sellers",
  async (
    {
      parPage,
      page,
      searchValue,
      status,
    }: { parPage: number; page: number; searchValue: string; status: string },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;
    try {
      const { data } = await axios.get(
        `/admin/dashboard-data?page=${page}&searchValue=${searchValue}&parPage=${parPage}&status=${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const update_customer_status = createAsyncThunk<
  { message: string; userId: string; newStatus: string },
  { userId: string; newStatus: string },
  { rejectValue: { message: string } }
>(
  "admin/update_customer_status",
  async (
    { userId, newStatus },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    const token = (getState() as RootState).auth.token;
    try {
      const { data } = await axios.put(
        `/admin/customer/update-status`,
        { userId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return fulfillWithValue({ message: data.message, userId, newStatus });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "Status update failed" },
      );
    }
  },
);

export const update_customer_type = createAsyncThunk<
  { message: string; userId: string; customerType: string },
  { userId: string; customerType: string },
  { rejectValue: { message: string } }
>(
  "admin/update_customer_type",
  async (
    { userId, customerType },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    const token = (getState() as RootState).auth.token;
    try {
      const { data } = await axios.put(
        `/admin/customer/update-type`,
        { userId, customerType },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return fulfillWithValue({ message: data.message, userId, customerType });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "Customer type update failed" },
      );
    }
  },
);

export const seller_status_update = createAsyncThunk(
  "admin/seller_status_update",
  async (
    info: { sellerId: string; status: string },
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;
    try {
      const { data } = await axios.post(`/admin/dashboard-data`, info, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const get_seller = createAsyncThunk(
  "seller/get_seller",
  async (sellerId: string, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const { data } = await axios.get(`/admin/seller/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return fulfillWithValue(data.userInfo);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const get_customer = createAsyncThunk(
  "admin/get_customer",
  async (
    customerId: string,
    { rejectWithValue, fulfillWithValue, getState },
  ) => {
    const token = (getState() as RootState).auth.token;
    try {
      const { data } = await axios.get(`/admin/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminMessageClear: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_seller.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_seller.fulfilled, (state, action) => {
        state.loader = false;
        state.seller = action.payload;
      })
      .addCase(get_seller.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(get_sellers_customes.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        get_sellers_customes.fulfilled,
        (state, action: PayloadAction<SellerCustomerListResponse>) => {
          state.loader = false;
          state.sellers = action.payload.sellers;
          state.totalSellers = action.payload.totalSellers;
          state.customers = action.payload.customers;
          state.totalCustomers = action.payload.totalCustomers;
        },
      )
      .addCase(get_sellers_customes.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(seller_status_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(seller_status_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(seller_status_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(update_customer_status.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_customer_status.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(update_customer_status.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload?.message || "Update failed";
      })
      .addCase(update_customer_type.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_customer_type.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        if (state.customer) {
          state.customer.customerType = action.payload.customerType;
        }
      })
      .addCase(update_customer_type.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload?.message || "Update failed";
      })
      .addCase(get_customer.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_customer.fulfilled, (state, action) => {
        state.loader = false;
        state.customer = action.payload.userInfo;
      })
      .addCase(get_customer.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { adminMessageClear } = adminSlice.actions;
export default adminSlice.reducer;
