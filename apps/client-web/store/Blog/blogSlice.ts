import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@nasi/api-sdk/client";

export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/blogs");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchBlogBySlug = createAsyncThunk(
  "blog/fetchBlogBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/blogs/${slug}`);
      return response.data.blog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (formData: FormData, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as any).auth.token;

      const response = await axios.post("/blogs", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.blog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Types
interface Blog {
  _id?: string;
  slug?: string;
  title: string;
  content: string;
  image: string;
  author: string;
  createdAt?: string;
}

interface BlogState {
  blogs: Blog[];
  totalBlogs?: number;
  selectedBlog: Blog | null;
  loader: boolean;
  errorMessage: string;
  successMessage?: string;
}

const initialState: BlogState = {
  blogs: [],
  totalBlogs: 0,
  selectedBlog: null,
  loader: false,
  errorMessage: "",
  successMessage: "",
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    resetBlogMesseg: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loader = false;
        state.blogs = action.payload.blogs;
        state.totalBlogs = action.payload.totalBlogs;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loader = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(createBlog.pending, (state) => {
        state.loader = true;
        state.errorMessage = "";
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loader = false;
        state.blogs.push(action.payload);
        state.successMessage = "Blog created successfully!";
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { resetBlogMesseg } = blogSlice.actions;
export default blogSlice.reducer;
