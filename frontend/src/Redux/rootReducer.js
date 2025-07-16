import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";
import authSlice from "./Slice/auth.slice";
import userSlice from "./Slice/user.slice";
import soundSlice from "./Slice/sound.slice";
import contactSlice from "./Slice/contact.slice";
import faqsSlice from './Slice/faqs.slice'
export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    user: userSlice,
    sound:soundSlice,
    contact: contactSlice,
    faqs: faqsSlice
});