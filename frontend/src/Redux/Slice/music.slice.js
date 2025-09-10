import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";

const initialStateUsers = {
    allmusic: [],
    success: false,
    message: '',
    loading: false,
};

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, color: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const createMusic = createAsyncThunk(           
    "music/createMusic",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createMusic`, data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getAllMusic = createAsyncThunk(
    "music/getAllMusic",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/allMusic`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            console.log("HIHIHIHII", response);
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


export const deleteMusic = createAsyncThunk(
    "music/deleteMusic",
    async (deleteId, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deleteMusic/${deleteId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            
            console.log("HIHIHIHII", response);
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const musicSlice = createSlice({
    name: 'music',
    initialState: initialStateUsers,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createMusic.pending, (state) => {
                state.loading = true;
                state.message = 'creating Music...';
            })
            .addCase(createMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music created successfully';
                state.allmusic = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(createMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to create Music';
            })
            .addCase(getAllMusic.pending, (state) => {
                state.loading = true;
                state.message = 'Loading music...';
            })
            .addCase(getAllMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music loaded successfully';
                state.allmusic = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(getAllMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to load Music';
            })
    }
});

export const {
} = musicSlice.actions;

export default musicSlice.reducer;