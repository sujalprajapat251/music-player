import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const submitContactForm = createAsyncThunk(
  'contact/submitContactForm',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/contact', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Something went wrong');
    }
  }
);

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetContactState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContactForm.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitContactForm.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetContactState } = contactSlice.actions;
export default contactSlice.reducer;
