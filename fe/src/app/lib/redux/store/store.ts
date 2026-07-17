import { configureStore } from "@reduxjs/toolkit";
import createAppReducer from "../slices/createAppSlice";
import createTemplateReducer from "../slices/createTemplateSlice";
export const store = configureStore({
  reducer: {
    createApp: createAppReducer,
    createTemplate: createTemplateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
