import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import activityReducer from './activitySlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        activities:activityReducer
    },
})