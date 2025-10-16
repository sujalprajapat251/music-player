import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';

export const fetchPremium = createAsyncThunk(
    'premium/fetchPremiumdata',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/premiums`);
            return response.data.data;
            console.log('Premium data fetched successfully', response.data);
        }
        catch (error) {
            return rejectWithValue(error.response.data);

        }
    }
)

const premiumSlice = createSlice({
    name: 'premiums',
    initialState: {
        premiums: [],
        selectedPlan: null,
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedPlan: (state, action) => {
            state.selectedPlan = action.payload;
        },
        clearSelectedPlan: (state) => {
            state.selectedPlan = null;
        }
    },
    extraReducers: (builder) => {
        builder.
            addCase(fetchPremium.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPremium.fulfilled, (state, action) => {
                state.loading = false;
                state.premiums = action.payload;
            })
            .addCase(fetchPremium.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
})

export const { setSelectedPlan, clearSelectedPlan } = premiumSlice.actions;
export default premiumSlice.reducer;