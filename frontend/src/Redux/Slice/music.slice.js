import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";
import axiosInstance from "../../Utils/axiosInstance";
import axios from "axios";

const initialStateUsers = {
    allmusic: [],
    deletedmusic: [],
    success: false,
    message: '',
    loading: false,
    currentMusic: null,
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
            const response = await axiosInstance.post(`${BASE_URL}/createMusic`, data,
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

export const updateMusic = createAsyncThunk(           
    "music/updateMusic",
    async ({ id, data }, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axiosInstance.put(`${BASE_URL}/updateMusic/${id}`, data,
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
            const response = await axiosInstance.get(`${BASE_URL}/allMusic`,
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

export const getDeletedMusic = createAsyncThunk(
    "music/getDeletedMusic",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axiosInstance.get(`${BASE_URL}/deletedMusic`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const renameMusic = createAsyncThunk(
    "music/renameMusic",
    async ({ musicId, musicName }, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axiosInstance.put(
                `${BASE_URL}/renameMusic/${musicId}`,
                { name: musicName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Music renamed', color: 'success' }));
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


export const moveToFolderMusic = createAsyncThunk(
    "music/moveToFolderMusic",
    async ({ musicId, folderId }, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axiosInstance.put(
                `${BASE_URL}/moveMusicToFolder/${musicId}`,
                { folderId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Moved to folder', color: 'success' }));
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


export const addCoverImage = createAsyncThunk(           
    "music/addCoverImage",
    async ({ musicId, file }, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const formData = new FormData();
            formData.append('image', file); // field name must be 'image'

            const response = await axiosInstance.post(
                `${BASE_URL}/addCoverImage/${musicId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.data; // backend returns { data: music }
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const removeCoverImage = createAsyncThunk(
    "music/removeCoverImage",
    async (deleteId, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axiosInstance.delete(`${BASE_URL}/removeCoverImage/${deleteId}`,
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
            const response = await axiosInstance.delete(`${BASE_URL}/deleteMusic/${deleteId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Music moved to recyle bin successfully', color: 'success' }));
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//restore button from recently deleted page

export const restoreMusic = createAsyncThunk(
    "music/restoreMusic",
    async (musicId, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axiosInstance.put(
                `${BASE_URL}/restoreMusic/${musicId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Music restored successfully', color: 'success' }));
            return response.data.music;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const permanentDeleteMusic = createAsyncThunk(
    "music/permanentDeleteMusic",
    async (musicId, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axiosInstance.delete(
                `${BASE_URL}/permanentDeleteMusic/${musicId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Music permanently deleted', color: 'success' }));
            return { id: musicId }; // return id only
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const restoreAllMusic = createAsyncThunk(
    "music/restoreAll",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axiosInstance.post(
                `${BASE_URL}/restoreAllMusic`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message , color: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const permanentDeleteAllMusic = createAsyncThunk(
    "music/permanentDeleteAllMusic",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axiosInstance.delete(
                `${BASE_URL}/permanentDeleteAll`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message , color: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


const musicSlice = createSlice({
    name: 'music',
    initialState: initialStateUsers,
    reducers: {
        setCurrentMusic: (state, action) => {
            state.currentMusic = action.payload;
        },
    },
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
                state.currentMusic = action.payload;
            })
            .addCase(createMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to create Music';
            })
            .addCase(updateMusic.pending, (state) => {
                state.loading = true;
                state.message = 'updating Music...';
            })
            .addCase(updateMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music updated successfully';
                state.currentMusic = action.payload;
            })
            .addCase(updateMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to update Music';
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
            .addCase(getDeletedMusic.pending, (state) => {
                state.loading = true;
                state.message = 'Loading deleted music...';
            })
            .addCase(getDeletedMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Deleted music loaded successfully';
                state.deletedmusic = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(getDeletedMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to load deleted music';
            })
            .addCase(deleteMusic.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting music...';
            })
            .addCase(deleteMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music deleted successfully';
                const deletedMusic = action.payload;
                if (deletedMusic && deletedMusic._id) {
                    // Remove from all music and add to deleted music
                    const musicToMove = state.allmusic.find(m => m._id === deletedMusic._id);
                    state.allmusic = state.allmusic.filter(m => m._id !== deletedMusic._id);
                    if (musicToMove) {
                        state.deletedmusic = [deletedMusic, ...state.deletedmusic];
                    }
                }
            })
            .addCase(deleteMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to delete music';
            })  
            .addCase(renameMusic.pending, (state) => {
                state.loading = true;
                state.message = 'Renaming music...';
            })
            .addCase(renameMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music renamed successfully';
                const updated = action.payload;
                if (updated && updated._id) {
                    state.allmusic = state.allmusic.map(m =>
                        m._id === updated._id ? { ...m, ...updated } : m
                    );
                }
            })
            .addCase(renameMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to rename music';
            })
            .addCase(moveToFolderMusic.pending, (state) => {
                state.loading = true;
                state.message = 'Moving music to folder...';
            })
            .addCase(moveToFolderMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music moved successfully';
                const updated = action.payload;
                if (updated && updated._id) {
                    state.allmusic = state.allmusic.map(m =>
                        m._id === updated._id ? { ...m, ...updated } : m
                    );
                }
            })
            .addCase(moveToFolderMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to move music';
            })
            .addCase(addCoverImage.pending, (state) => {
                state.loading = true;
                state.message = 'Uploading cover image...';
            })
            .addCase(addCoverImage.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cover image uploaded successfully';
                const updated = action.payload;
                if (updated && updated._id) {
                    state.allmusic = state.allmusic.map(m =>
                        m._id === updated._id ? { ...m, ...updated } : m
                    );
                }
            })
            .addCase(addCoverImage.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to upload cover image';
            })

            //restore button from recently deleted page

            .addCase(restoreMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music restored successfully';
                const restored = action.payload;
                if (restored && restored._id) {
                    // Remove from deleted music list and add to all music list
                    state.deletedmusic = state.deletedmusic.filter(m => m._id !== restored._id);
                    state.allmusic = [...state.allmusic.filter(m => m._id !== restored._id), restored];
                }
            })
            .addCase(restoreMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to restore music';
            })

            .addCase(permanentDeleteMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Music permanently deleted';
                const deletedId = action.payload.id;
                state.allmusic = state.allmusic.filter(m => m._id !== deletedId);
                state.deletedmusic = state.deletedmusic.filter(m => m._id !== deletedId);
            })
            .addCase(permanentDeleteMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to permanently delete music';
            })

            .addCase(restoreAllMusic.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.message = 'All music restored successfully';
                // Move all deleted music back to all music list
                state.allmusic = [...state.allmusic, ...state.deletedmusic];
                state.deletedmusic = [];
            })
            .addCase(restoreAllMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to restore all music';
            })

            .addCase(permanentDeleteAllMusic.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.message = 'All music permanently deleted';
                state.deletedmusic = [];
            })
            .addCase(permanentDeleteAllMusic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to permanently delete all music';
            });
        }
});

export const {
    setCurrentMusic,
} = musicSlice.actions;

export default musicSlice.reducer;