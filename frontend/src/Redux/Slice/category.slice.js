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

export const getAllCategory = createAsyncThunk(
    'category/getAllCategory',
    async (_, { dispatch , rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/allcategory`);

            return response.data.categorydata;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState: {
        category: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllCategory.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching category...';
                state.isError = false;
            })
            .addCase(getAllCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'category fetched successfully';
                state.category = action.payload;
                state.isError = false;
            })
            .addCase(getAllCategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch category';
            });
    },
});

export default categorySlice.reducer;
