import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
import { setAlert } from "./alert.slice";
import { getUserById } from './user.slice';


const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, color: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const token = await sessionStorage.getItem("token");

// Async thunk for creating payment intent
export const createPaymentIntent = createAsyncThunk(
    'payment/createPaymentIntent',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/payment`, paymentData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Add new async thunk for confirming payment and storing data
export const confirmPaymentSuccess = createAsyncThunk(
    'payment/confirmPaymentSuccess',
    async (confirmData, { dispatch, rejectWithValue }) => {
        console.log('confirmeeeeeeeeeeeeeeeeeeeeeeeee', confirmData);
        try {
            const response = await axios.post(`${BASE_URL}/confirmPayment`, confirmData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            dispatch(getUserById());
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }

    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        clientSecret: null,
        loading: false,
        error: null,
        message: '',
        paymentSuccess: false,
        confirmedPayment: null // Store confirmed payment data
    },
    reducers: {
        clearPaymentState: (state) => {
            state.clientSecret = null;
            state.loading = false;
            state.error = null;
            state.paymentSuccess = false;
            state.confirmedPayment = null;
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
            })
            // Handle payment confirmation
            .addCase(confirmPaymentSuccess.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(confirmPaymentSuccess.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentSuccess = true;
                state.confirmedPayment = action.payload;
            })
            .addCase(confirmPaymentSuccess.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to confirm payment';
            });
    }
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;