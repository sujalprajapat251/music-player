import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";

const initialStateUsers = {
    allsounds: [],
    success: false,
    message: '',
    loading: false,
    musicType: ''
};

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, color: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllSound = createAsyncThunk(
    "sound/getAllSound",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/allSounds`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.sounds;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const soundSlice = createSlice({
    name: 'sound',
    initialState: initialStateUsers,
    reducers: {
        setMusicTypeExtention: (state, action) => {
            state.musicType = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(getAllSound.pending, (state) => {
            state.loading = true;
            state.message = 'Fetching Sounds...';
        })
        .addCase(getAllSound.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = 'Sounds fetched successfully';
            state.allsounds = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(getAllSound.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.message = action.payload?.message || 'Failed to fetch Sounds';
        })
    }
});

export const {
    setMusicTypeExtention
} = soundSlice.actions;

export default soundSlice.reducer;