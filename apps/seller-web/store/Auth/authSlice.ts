import {
  AuthState,
  LoginResponse,
  UserInfo,
  ErrorResponse,
  ProfileUpdateResponse,
  ProfileInfoInput,
} from "@nasi/types/auth";
import { returnRole, returnUserInfo } from "@/utils/authUtils";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";
import { RootState } from "../store";

const initialState: AuthState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  userInfo: null,
  role: "",
  token: null,
};

export const adminLogin = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: AuthState }
>("auth/admin_login", async (info, { rejectWithValue, fulfillWithValue }) => {
  try {
    const { data } = await axios.post<LoginResponse>("/auth/admin/login", info);
    return fulfillWithValue(data);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { error: "An error occurred during login" },
    );
  }
});

export const seller_register = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: ErrorResponse }
>(
  "auth/seller_register",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await axios.post<LoginResponse>(
        "/auth/seller/register",
        info,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          error: "An error occurred during registration",
        },
      );
    }
  },
);

export const seller_login = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: ErrorResponse }
>("auth/seller_login", async (info, { rejectWithValue, fulfillWithValue }) => {
  try {
    const { data } = await axios.post<LoginResponse>(
      "/auth/seller/login",
      info,
      {
        withCredentials: true,
      },
    );
    return fulfillWithValue(data);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { error: "An error occurred during login" },
    );
  }
});

export const customer_register = createAsyncThunk<
  LoginResponse,
  {
    name: string;
    email: string;
    referralCode: string;
    joiningFee: string;
    password: string;
  },
  { rejectValue: ErrorResponse }
>(
  "auth/customer_register",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const payload = {
        name: info.name,
        email: info.email,
        password: info.password,
        referredBy: info.referralCode,
        joiningFee: Number(info.joiningFee || 0),
      };

      const { data } = await axios.post<LoginResponse>(
        "/auth/customer/register",
        payload,
        { withCredentials: true },
      );

      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "An error occurred during registration",
        },
      );
    }
  },
);

export const customer_login = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: ErrorResponse }
>(
  "auth/customer_login",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await axios.post<LoginResponse>(
        "/auth/customer/login",
        info,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { error: "An error occurred during login" },
      );
    }
  },
);

export const join_customer_subscription = createAsyncThunk<
  LoginResponse,
  { referralCode: string; joiningFee: string },
  { state: RootState; rejectValue: ErrorResponse }
>(
  "auth/join_customer_subscription",
  async (
    { referralCode, joiningFee },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      const token = getState().auth.token;

      const { data } = await axios.post<LoginResponse>(
        "/customers/join-subscription",
        { referralCode, joiningFee: Number(joiningFee || 0) },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "Unable to join subscription right now",
        },
      );
    }
  },
);

export const oauth_login = createAsyncThunk<
  LoginResponse,
  { provider: "google" | "facebook"; token: string },
  { rejectValue: ErrorResponse }
>(
  "auth/oauth_login",
  async ({ provider, token }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await axios.post<LoginResponse>(
        "/auth/customer/oauth",
        { provider, token },
        { withCredentials: true },
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "OAuth login failed" },
      );
    }
  },
);

export const initiate_subscription_payment = createAsyncThunk<
  { momoReferenceId: string; message: string },
  { referralCode: string; phone: string },
  { state: RootState; rejectValue: ErrorResponse }
>(
  "auth/initiate_subscription_payment",
  async (
    { referralCode, phone },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.post(
        "/customers/initiate-subscription",
        { referralCode, phone },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "Payment initiation failed" },
      );
    }
  },
);

export const confirm_subscription_payment = createAsyncThunk<
  LoginResponse,
  { momoReferenceId: string },
  { state: RootState; rejectValue: ErrorResponse }
>(
  "auth/confirm_subscription_payment",
  async (
    { momoReferenceId },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.post<LoginResponse>(
        "/customers/confirm-subscription",
        { momoReferenceId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error: any) {
      // 202 = still pending — not an error, surface the message
      if (error.response?.status === 202) {
        return rejectWithValue(
          error.response.data || { message: "Payment still pending" },
        );
      }
      return rejectWithValue(
        error.response?.data || { message: "Confirmation failed" },
      );
    }
  },
);

export const get_user_info = createAsyncThunk<
  UserInfo,
  void,
  { state: RootState; rejectValue: ErrorResponse }
>(
  "auth/get_user_info",
  async (_, { getState, rejectWithValue, fulfillWithValue }) => {
    const { userInfo, token, role } = (getState() as RootState).auth;

    if (!userInfo?.id || !token || !role) {
      return rejectWithValue({
        message: "Please ensure all required fields are provided.",
      });
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    let endpoint = "";
    switch (role) {
      case "admin":
        endpoint = `/admin/${userInfo.id}`;
        break;
      case "seller":
        endpoint = `/seller/${userInfo.id}`;
        break;
      case "user":
        endpoint = `/customers/${userInfo.id}`;
        break;
      default:
        return rejectWithValue({
          message: "The user role provided is not recognized",
        });
    }

    try {
      const { data } = await axios.get(endpoint, config);
      return fulfillWithValue(data.userInfo);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          message: "An error occurred while fetching user info",
        },
      );
    }
  },
);

export const logout = createAsyncThunk<
  LoginResponse,
  { role: string },
  { rejectValue: AuthState }
>("auth/logout", async ({ role }, { rejectWithValue, fulfillWithValue }) => {
  try {
    localStorage.removeItem("accessToken");
    const { data } = await axios.get(`/auth/logout?role=${role}`);

    return fulfillWithValue(data); // Just return message, don't navigate
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data || { error: "An error occurred during logout" },
    );
  }
});

export const profile_image_upload = createAsyncThunk<
  any,
  FormData,
  { state: RootState; rejectValue: ErrorResponse }
>(
  "auth/profile_image_upload",
  async (image, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const { data } = await axios.post("/seller/image-upload", image, config);
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          error: "An error occurred while uploading the image",
        },
      );
    }
  },
);

export const profile_info_add = createAsyncThunk<
  ProfileUpdateResponse,
  ProfileInfoInput,
  { state: RootState; rejectValue: ErrorResponse }
>(
  "auth/profile_info_add",
  async (info, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.put(`/seller/update-profile`, info, config);
      return fulfillWithValue(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          error: "An error occurred while updating profile",
        },
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authMessageClear: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        role?: string;
        userInfo?: UserInfo;
      }>,
    ) => {
      state.token = action.payload.token;
      const user = returnUserInfo(action.payload.token);

      if (user) {
        state.userInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          customerType: user.customerType,
          profileImage: user.profileImage,
          role: user.role,
        };
        state.role = user.role;
      } else {
        state.userInfo = null;
        state.role = "";
        state.token = null;
      }
    },
    clearAuth: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
      state.loader = false;
      state.userInfo = null;
      state.role = "";
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loader = true;
      })
      .addCase(adminLogin.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.errorMessage || "Login failed";
      })
      .addCase(adminLogin.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
        state.userInfo = payload.userInfo;
      })
      .addCase(logout.pending, (state) => {
        state.loader = true;
        state.token = null;
        state.userInfo = null;
        state.role = "";
        state.errorMessage = "";
        state.successMessage = "";
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      })
      .addCase(logout.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.token = null;
        state.userInfo = null;
        state.role = "";
        state.successMessage = payload.message;
        state.errorMessage = "";
      })
      .addCase(logout.rejected, (state, { payload }) => {
        state.loader = false;
        state.token = null;
        state.userInfo = null;
        state.role = "";
        state.successMessage = "";
        state.errorMessage = payload?.errorMessage || "Logout failed";
      })
      .addCase(seller_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(seller_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "Login failed";
      })
      .addCase(seller_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
        state.userInfo = payload.userInfo;
      })
      .addCase(seller_register.pending, (state) => {
        state.loader = true;
      })
      .addCase(seller_register.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "Registration failed";
      })
      .addCase(seller_register.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
      })
      .addCase(customer_register.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_register.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "Registration failed";
      })
      .addCase(customer_register.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
      })
      .addCase(customer_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "Login failed";
      })
      .addCase(customer_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
        state.userInfo = payload.userInfo;
      })
      .addCase(join_customer_subscription.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(join_customer_subscription.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "Subscription update failed";
      })
      .addCase(join_customer_subscription.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
        state.userInfo = payload.userInfo;
        if (typeof window !== "undefined" && payload.token) {
          localStorage.setItem("accessToken", payload.token);
        }
      })
      .addCase(get_user_info.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_user_info.fulfilled, (state, action) => {
        state.loader = false;
        state.userInfo = action.payload;
      })
      .addCase(get_user_info.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage =
          action.payload?.message || "Failed to fetch user info";
      })
      .addCase(profile_image_upload.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.userInfo = action.payload.updatedUser;
      })
      .addCase(profile_image_upload.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload?.message || "Upload failed";
      })
      .addCase(profile_info_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(profile_info_add.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = payload.updatedUser || null;
        state.successMessage = payload.message;
      })
      .addCase(oauth_login.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(oauth_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "OAuth login failed";
      })
      .addCase(oauth_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
        state.userInfo = payload.userInfo;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", payload.token);
        }
      })
      .addCase(initiate_subscription_payment.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
        state.successMessage = "";
      })
      .addCase(initiate_subscription_payment.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "Payment initiation failed";
      })
      .addCase(
        initiate_subscription_payment.fulfilled,
        (state, { payload }) => {
          state.loader = false;
          state.successMessage = payload.message;
        },
      )
      .addCase(confirm_subscription_payment.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(confirm_subscription_payment.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload?.message || "Confirmation failed";
      })
      .addCase(confirm_subscription_payment.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.role = returnRole(payload.token);
        state.userInfo = payload.userInfo;
        if (typeof window !== "undefined" && payload.token) {
          localStorage.setItem("accessToken", payload.token);
        }
      });
  },
});

export const { authMessageClear, setCredentials, setUserInfo, setToken } =
  authSlice.actions;
export default authSlice.reducer;
