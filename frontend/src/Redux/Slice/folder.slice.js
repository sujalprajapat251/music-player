import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";

const initialStateUsers = {
  folders: [],
  success: false,
  message: '',
  loading: false,
};

const handleErrors = (error, dispatch, rejectWithValue) => {
  const errorMessage = error.response?.data?.message || 'An error occurred';
  dispatch(setAlert({ text: errorMessage, color: 'error' }));
  return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getFolderByUserId = createAsyncThunk(
  "folder/getFolderByUserId",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const token = await sessionStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/getAllFolderByUserid/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Slice__________", response.data)
      return response.data.newAddFolder;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);


// Add this new async thunk to your existing folder slice
export const updateFolderName = createAsyncThunk(
  "folder/updateFolderName",
  async ({ folderId, folderName }, { dispatch, rejectWithValue }) => {
    try {
      const token = await sessionStorage.getItem("token");
      const response = await axios.put(`${BASE_URL}/updateFolderById/${folderId}`,
        { folderName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setAlert({ text: response.data.message, color: 'success' }));
      return response.data.folder;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);


// Add delete folder action
export const deleteFolderById = createAsyncThunk(
  "folder/deleteFolderById",
  async (folderId, { dispatch, rejectWithValue }) => {
    try {
      const token = await sessionStorage.getItem("token");
      const response = await axios.delete(`${BASE_URL}/deletefolderbyid/${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(setAlert({ text: response.data.message, color: 'success' }));
      return folderId; // Return the deleted folder ID
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

const folderSlice = createSlice({
  name: 'folder',
  initialState: initialStateUsers,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFolderByUserId.pending, (state) => {
        state.loading = true;
        state.message = 'Fetching Sounds...';
      })
      .addCase(getFolderByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Sounds fetched successfully';
        state.folders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getFolderByUserId.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.message = action.payload?.message || 'Failed to fetch Sounds';
      })

      // Add these cases to your existing extraReducers builder
      .addCase(updateFolderName.pending, (state) => {
        state.loading = true;
        state.message = 'Updating folder...';
      })
      .addCase(updateFolderName.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Folder updated successfully';
        // Update the specific folder in the folders array
        const index = state.folders.findIndex(folder => folder._id === action.payload._id);
        if (index !== -1) {
          state.folders[index] = action.payload;
        }
      })
      .addCase(updateFolderName.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.message = action.payload?.message || 'Failed to update folder';
      })
      .addCase(deleteFolderById.pending, (state) => {
        state.loading = true;
        state.message = 'Deleting folder...';
      })
      .addCase(deleteFolderById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Folder deleted successfully';
        // Remove the deleted folder from the folders array
        state.folders = state.folders.filter(folder => folder._id !== action.payload);
      })
      .addCase(deleteFolderById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.message = action.payload?.message || 'Failed to delete folder';
      })
  }
});

export default folderSlice.reducer;