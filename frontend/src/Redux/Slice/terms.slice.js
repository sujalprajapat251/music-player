import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
export const fetchTerms = createAsyncThunk('terms/fetchTerms', async () => {
  const response = await axios.get(`${BASE_URL}/view/terms`);
  return response.data;
});

const termsSlice = createSlice({
  name: 'terms',
  initialState: {
    terms: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTerms.fulfilled, (state, action) => {
        state.loading = false;
        state.terms = action.payload;
      })
      .addCase(fetchTerms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default termsSlice.reducer;
