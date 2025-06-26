import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";
import authSlice from "./Slice/auth.slice";
import userSlice from "./Slice/user.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    user: userSlice
});