import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TemplateInfo {
  name: string;
  description: string;
}

interface CreateTemplateState {
  templateInfo: TemplateInfo;
}

const initialState: CreateTemplateState = {
  templateInfo: {
    name: "",
    description: "",
  },
};

const createTemplateSlice = createSlice({
  name: "createTemplate",
  initialState,

  reducers: {
    setTemplateInfo(state, action: PayloadAction<TemplateInfo>) {
      state.templateInfo = action.payload;
    },

    resetCreateTemplate() {
      return initialState;
    },
  },
});

export const { setTemplateInfo, resetCreateTemplate } =
  createTemplateSlice.actions;

export default createTemplateSlice.reducer;
