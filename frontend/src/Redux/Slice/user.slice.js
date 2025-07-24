import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";
import axiosInstance from "../../Utils/axiosInstance";

const initialStateUsers = {
    allusers: [],
    currUser: null,
    userWishList: null,
    addtowishlist: null,
    success: false,
    message: '',
    loading: false,
    isError: false,
};

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    if (dispatch) {
        dispatch(setAlert({ text: errorMessage, color: 'error' }));
    }
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axios.get(`${BASE_URL}/allUsers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const createUser = createAsyncThunk(
    'users/add',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/createUser`, data);
            
            // Store tokens
            if (response.data.token) {
                sessionStorage.setItem("token", response.data.token);
            }
            if (response.data.user?._id) {
                sessionStorage.setItem("userId", response.data.user._id);
            }
            
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axios.delete(`${BASE_URL}/deleteUser/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateUser = createAsyncThunk(
    "users/updateUser",
    async ({ id, values, file }, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const formData = new FormData();

            // Append all form values to FormData
            Object.keys(values).forEach((key) => {
                if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
                    formData.append(key, values[key]);
                }
            });

            // Append file if provided
            if (file) {
                formData.append('photo', file);
            }

            const response = await axiosInstance.put(`${BASE_URL}/userUpdate/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const removeUserProfilePic = createAsyncThunk(
    'users/removeProfilePic',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axiosInstance.put(`${BASE_URL}/removeProfilePic/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getUserById = createAsyncThunk(
    'users/getUserById',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            const userId = sessionStorage.getItem("userId");
            
            if (!token || !userId) {
                throw new Error('No authentication token or user ID found');
            }
            
            const response = await axiosInstance.get(`${BASE_URL}/getUserById/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            
            return response.data.users || response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const resetPassword = createAsyncThunk(
    "users/resetPassword",
    async ({ email, oldPassword, newPassword }, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axiosInstance.put(`${BASE_URL}/resetPassword`, 
                { email, oldPassword, newPassword }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getUserWishList = createAsyncThunk(
    'user/getwishlist',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axiosInstance.get(`${BASE_URL}/getwishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const addToWishList = createAsyncThunk(
    'user/addtowishlist',
    async (designId, { dispatch, rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axiosInstance.put(`${BASE_URL}/wishlist`, 
                { designId }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            dispatch(getUserWishList());
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState: initialStateUsers,
    reducers: {
        // Clear messages
        clearMessages: (state) => {
            state.message = '';
            state.success = false;
            state.isError = false;
        },
        // Clear current user
        clearCurrentUser: (state) => {
            state.currUser = null;
        },
        // Reset state
        resetUserState: (state) => {
            return { ...initialStateUsers };
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all users
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching users...';
                state.isError = false;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Users fetched successfully';
                state.allusers = Array.isArray(action.payload) ? action.payload : [];
                state.isError = false;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch users';
            })
            
            // Create user
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.message = 'Creating user...';
                state.isError = false;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.allusers.push(action.payload);
                state.currUser = action.payload;
                state.message = 'User created successfully';
                state.isError = false;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create user';
            })
            
            // Delete user
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting user...';
                state.isError = false;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.allusers = state.allusers.filter((user) => user._id !== action.payload);
                state.message = 'User deleted successfully';
                state.isError = false;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete user';
            })
            
            // Update user
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.message = 'Updating user...';
                state.isError = false;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update user in allusers array
                state.allusers = state.allusers.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                // Update current user
                state.currUser = action.payload;
                state.message = 'User updated successfully';
                state.isError = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update user';
            })
            
            // Remove profile pic
            .addCase(removeUserProfilePic.pending, (state) => {
                state.loading = true;
                state.message = 'Removing profile picture...';
                state.isError = false;
            })
            .addCase(removeUserProfilePic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update user in allusers array
                state.allusers = state.allusers.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                // Update current user
                state.currUser = action.payload;
                state.message = 'Profile picture removed successfully';
                state.isError = false;
            })
            .addCase(removeUserProfilePic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to remove profile picture';
            })
            
            // Get user by ID
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
                state.message = 'Getting user...';
                state.isError = false;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currUser = action.payload;
                state.message = '';
                state.isError = false;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to get user';
            })
            
            // Reset password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.message = 'Resetting password...';
                state.isError = false;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Password reset successfully';
                state.isError = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to reset password';
            })
            
            // Add to wishlist
            .addCase(addToWishList.pending, (state) => {
                state.loading = true;
                state.isError = false;
            })
            .addCase(addToWishList.fulfilled, (state, action) => {
                state.loading = false;
                state.addtowishlist = action.payload;
                state.success = true;
                state.isError = false;
                state.message = "Product added to wishlist";
            })
            .addCase(addToWishList.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.success = false;
                state.message = action.payload?.message || 'Failed to add to wishlist';
            })
            
            // Get user wishlist
            .addCase(getUserWishList.pending, (state) => {
                state.loading = true;
                state.isError = false;
            })
            .addCase(getUserWishList.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.isError = false;
                state.userWishList = action.payload;
            })
            .addCase(getUserWishList.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to get wishlist';
            });
    }
});

export const { clearMessages, clearCurrentUser, resetUserState } = usersSlice.actions;
export default usersSlice.reducer;