import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    if (dispatch) {
        dispatch(setAlert({ text: errorMessage, color: 'error' }));
    }
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const createSubscribe = createAsyncThunk(
    'subscribe/createSubscribe',
    async (data, { dispatch , rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/createsubscribe`, data);

            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.Subscribe;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const subscribeSlice = createSlice({
    name: 'subscribe',
    initialState: {
        subscribe: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(createSubscribe.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSubscribe.fulfilled, (state, action) => {
                state.loading = false;
                state.subscribe = action.payload;
            })
            .addCase(createSubscribe.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default subscribeSlice.reducer;
