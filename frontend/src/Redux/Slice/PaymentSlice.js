import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';

// Async thunk for creating payment intent
export const createPaymentIntent = createAsyncThunk(
    'payment/createPaymentIntent',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/payment`, paymentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        clientSecret: null,
        loading: false,
        error: null,
        paymentSuccess: false,
    },
    reducers: {
        clearPaymentState: (state) => {
            state.clientSecret = null;
            state.loading = false;
            state.error = null;
            state.paymentSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPaymentIntent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaymentIntent.fulfilled, (state, action) => {
                state.loading = false;
                state.clientSecret = action.payload.clientSecret;
                state.paymentSuccess = false;
            })
            .addCase(createPaymentIntent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to create payment intent';
            });
    }
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;