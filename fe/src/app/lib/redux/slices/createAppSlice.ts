import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppInfo {
  name: string;
  packageName: string;
  description: string;
}

interface CreateAppState {
  appInfo: AppInfo;
  templateId: string | null;
}

const initialState: CreateAppState = {
  appInfo: {
    name: "",
    packageName: "",
    description: "",
  },
  templateId: null,
};

const createAppSlice = createSlice({
  name: "createApp",
  initialState,

  reducers: {
    setAppInfo(state, action: PayloadAction<AppInfo>) {
      state.appInfo = action.payload;
    },

    setTemplateId(state, action: PayloadAction<string | null>) {
      state.templateId = action.payload;
    },

    resetCreateApp() {
      return initialState;
    },
  },
});

export const { setAppInfo, setTemplateId, resetCreateApp } =
  createAppSlice.actions;

export default createAppSlice.reducer;
