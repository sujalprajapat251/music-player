import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";
import authSlice from "./Slice/auth.slice";
import userSlice from "./Slice/user.slice";
import soundSlice from "./Slice/sound.slice";
import folderSlice from "./Slice/folder.slice";

import contactSlice from "./Slice/contact.slice";
import faqsSlice from './Slice/faqs.slice'
import termsSlice from './Slice/terms.slice';
import studioReducer from './Slice/studio.slice';
import subscribeReducer from './Slice/subscribe.slice';
import categoryReducer from './Slice/category.slice';
import patternReducer from './Slice/pattern.slice';
import effectsReducer from './Slice/effects.slice';

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    user: userSlice,
    sound:soundSlice,
    folder:folderSlice,
    contact: contactSlice,
    faqs: faqsSlice,
    terms: termsSlice,
    studio: studioReducer,
    subscribe: subscribeReducer,
    category: categoryReducer,
    pattern:patternReducer
    effects: effectsReducer,
});