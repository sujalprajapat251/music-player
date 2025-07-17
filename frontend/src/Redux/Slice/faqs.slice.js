import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';

// Async thunk to fetch FAQs
export const fetchFaqs = createAsyncThunk('faqs/fetchFaqs', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/view/faqs`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const faqsSlice = createSlice({
  name: 'faqs',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default faqsSlice.reducer;
