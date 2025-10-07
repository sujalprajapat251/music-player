import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../Utils/axiosInstance';

// Async thunks
export const createReview = createAsyncThunk(
    'reviews/createReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/createReview', reviewData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create review');
        }
    }
);

export const getReviewsByMusicId = createAsyncThunk(
    'reviews/getReviewsByMusicId',
    async ({ musicId, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reviews/music/${musicId}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

export const getReviewsByUserId = createAsyncThunk(
    'reviews/getReviewsByUserId',
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reviews/user?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews');
        }
    }
);

export const updateReview = createAsyncThunk(
    'reviews/updateReview',
    async ({ reviewId, reviewData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/reviews/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update review');
        }
    }
);

export const deleteReview = createAsyncThunk(
    'reviews/deleteReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
        }
    }
);

const initialState = {
    reviews: [],
    userReviews: [],
    currentMusicReviews: [],
    averageRating: 0,
    totalReviews: 0,
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    }
};

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearReviews: (state) => {
            state.reviews = [];
            state.currentMusicReviews = [];
            state.averageRating = 0;
            state.totalReviews = 0;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Review
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews.unshift(action.payload.data);
                state.error = null;
            })
            .addCase(createReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Reviews by Music ID
            .addCase(getReviewsByMusicId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReviewsByMusicId.fulfilled, (state, action) => {
                state.loading = false;
                state.currentMusicReviews = action.payload.data.reviews;
                state.averageRating = action.payload.data.averageRating;
                state.totalReviews = action.payload.data.pagination.totalReviews;
                state.pagination = action.payload.data.pagination;
                state.error = null;
            })
            .addCase(getReviewsByMusicId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Reviews by User ID
            .addCase(getReviewsByUserId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReviewsByUserId.fulfilled, (state, action) => {
                state.loading = false;
                state.userReviews = action.payload.data.reviews;
                state.pagination = action.payload.data.pagination;
                state.error = null;
            })
            .addCase(getReviewsByUserId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Review
            .addCase(updateReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.loading = false;
                const updatedReview = action.payload.data;
                const index = state.currentMusicReviews.findIndex(review => review._id === updatedReview._id);
                if (index !== -1) {
                    state.currentMusicReviews[index] = updatedReview;
                }
                state.error = null;
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Review
            .addCase(deleteReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                const reviewId = action.meta.arg;
                state.currentMusicReviews = state.currentMusicReviews.filter(review => review._id !== reviewId);
                state.userReviews = state.userReviews.filter(review => review._id !== reviewId);
                state.error = null;
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearReviews, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
