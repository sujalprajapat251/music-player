import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";

const initialStateUsers = {
    allusers: [],
    currUser: null,
    success: false,
    message: '',
    loading: false,
};

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, color: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
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
            const response = await axios.post(BASE_URL + '/createUser', data);
            sessionStorage.setItem("token", response.data.token);
            sessionStorage.setItem("userId", response.data.user._id);
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            dispatch(getAllUsers());
            return response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id, { dispatch, rejectWithValue }) => {
        console.log(id);
        try {
            const token = await sessionStorage.getItem("token");
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
        const token = await sessionStorage.getItem("token");
        const formData = new FormData();

        // Object.keys(values).forEach((key) => {
        //     if (values[key] !== null) {
        //         formData.append(key, values[key]);
        //     }
        // });

        // Append all form values to FormData
        Object.keys(values).forEach((key) => {
            if (values[key] !== null && values[key] !== undefined) {
                formData.append(key, values[key]);
            }
        });

        if (file) {
            formData.append('photo', file);
        }

        try {
            const response = await axios.put(`${BASE_URL}/userUpdate/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.user;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const removeUserProfilePic = createAsyncThunk(
    'users/removeProfilePic',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/removeProfilePic/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data; // Return any necessary data
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getUserById = createAsyncThunk(
    'users/getUserById',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getUserById/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            // dispatch(setAlert({ text: response.data.message, color: 'success' }));
            // dispatch(getAllUsers());
            return response.data.users;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const resetPassword = createAsyncThunk(
    "users/resetPassword",
    async ({ email, oldPassword, newPassword }, { dispatch, rejectWithValue }) => {
        try {
            const token = await sessionStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/resetPassword`, { email, oldPassword, newPassword }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
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
            const token = await sessionStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getwishlist`, {
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
            const token = await sessionStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/wishlist`, { designId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
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
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching users...';
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Users fetched successfully';
                state.allusers = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to fetch users';
            })
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.message = 'Adding user...';
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.allusers.push(action.payload);
                state.message = action.payload?.message || 'User added successfully';
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to add user';
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting user...';
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.allusers = state.allusers.filter((user) => user._id !== action.payload);
                state.message = action.payload?.message || 'User deleted successfully';
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to delete user';
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.message = 'Editing user...';
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.allusers = state.allusers.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                state.currUser = action.payload;
                state.message = action.payload?.message || 'User updated successfully';
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to update user';
            })
            .addCase(removeUserProfilePic.pending, (state) => {
                state.loading = true;
                state.message = 'Editing user...';
            })
            .addCase(removeUserProfilePic.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.allusers = state.allusers.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                state.message = action.payload?.message || 'User updated successfully';
            })
            .addCase(removeUserProfilePic.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to update user';
            })
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
                state.message = 'Getting user...';
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currUser = action.payload;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to get user';
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.message = 'Resetting password...';
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || 'Password reset successfully';
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = action.payload?.message || 'Failed to reset password';
            })
            .addCase(addToWishList.pending, (state) => {
                state.loading = true;
            })
            .addCase(addToWishList.fulfilled, (state, action) => {
                state.loading = false;
                state.addtowishlist = action.payload;
                state.success = true;
                state.isError = false;
                state.message = "Product Added To Wishlist";
            })
            // .addCase(addToWishList.fulfilled, (state, action) => {
            //     state.loading = false;
            //     // state.addtowishlist = action.payload;
            //     state.success = true;
            //     state.isError = false;
            //     state.message = "Product Added To Wishlist";
            //     console.log(action.payload)
            //     console.log(action.payload, state.allusers)
            //     if (state.userWishList.user.wishlist.some(design => design._id === action.payload._id)) {
            //         state.userWishList.user.wishlist = state.userWishList.user.wishlist.filter(design => design._id !== action.payload._id);
            //     } else {
            //         state.userWishList.user.wishlist.push(action.payload);
            //     }

            // })
            .addCase(addToWishList.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.success = false;
                state.message = action.error;
            })
            .addCase(getUserWishList.pending, (state) => {
                state.loading = true;
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
                state.user = null;
                state.message = "Rejected";

            });
    }
});

export default usersSlice.reducer;