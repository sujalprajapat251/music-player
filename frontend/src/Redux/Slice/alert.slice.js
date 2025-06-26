import { createSlice } from "@reduxjs/toolkit"

const initState = {
    text: '',
    color: ''
}

const alertSlice = createSlice({
    name: 'alert',
    initialState: initState,
    reducers: {
        setAlert: (state, action) => {
            console.log(action);
            state.text = action.payload.text;
            state.color = action.payload.color;
        },
        resetAlert: (state, action) => {
            state.text = '';
            state.color = '';
        }
    }
});

export const { setAlert, resetAlert } = alertSlice.actions;
export default alertSlice.reducer