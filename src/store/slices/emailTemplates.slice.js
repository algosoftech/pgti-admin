import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, emailTemplateChangeStatus, deleteEmailTemplate } from 'services/emailTemplates.service';
import { getPage } from 'utils/common';

export const fetchEmailTemplatesList = createAsyncThunk(
  'emailTemplates/fetchList',
  async (options, { rejectWithValue }) => {
    try {
      const listData = await list(options);
      if (listData.status === true) {
        return {
          data: listData?.result || [],
          count: listData?.count || 0,
          totalPages: getPage(listData?.count || 1, options?.limit || 10),
        };
      }
      return rejectWithValue(listData?.message || 'Failed to fetch templates');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const changeEmailTemplateStatus = createAsyncThunk(
  'emailTemplates/changeStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const res = await emailTemplateChangeStatus({ editId: parseInt(editId), status });
      if (res.status === true) {
        return { id: parseInt(editId), status, message: 'Status changed successfully.' };
      }
      return rejectWithValue(res?.message || 'Failed to change status');
    } catch (error) {
      return rejectWithValue(error.message || 'Operation failed.');
    }
  }
);

export const deleteEmailTemplateAction = createAsyncThunk(
  'emailTemplates/delete',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId } = payload;
      const res = await deleteEmailTemplate({ editId: parseInt(editId) });
      if (res.status === true) {
        return { id: parseInt(editId), message: 'Template deleted successfully.' };
      }
      return rejectWithValue(res?.message || 'Failed to delete template');
    } catch (error) {
      return rejectWithValue(error.message || 'Operation failed.');
    }
  }
);

const initialState = {
  listData: [],
  isLoading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  skip: 0,
  count: 0,
  filter: { from: '', to: '', filter_by: '', search: '' },
  showRequest: '',
};

const emailTemplatesSlice = createSlice({
  name: 'emailTemplates',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
      state.skip = (action.payload - 1) * state.limit;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.skip = 0;
      state.currentPage = 1;
    },
    setShowRequest: (state, action) => {
      state.showRequest = action.payload;
      state.skip = 0;
      state.currentPage = 1;
    },
    resetEmailTemplatesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailTemplatesList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchEmailTemplatesList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) state.totalPages = getPage(1);
      })
      .addCase(fetchEmailTemplatesList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    builder
      .addCase(changeEmailTemplateStatus.fulfilled, (state, action) => {
        const idx = state.listData.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.listData[idx].status = action.payload.status;
      })
      .addCase(changeEmailTemplateStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteEmailTemplateAction.fulfilled, (state, action) => {
        state.listData = state.listData.filter(t => t.id !== action.payload.id);
        state.count = state.count - 1;
      })
      .addCase(deleteEmailTemplateAction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  setLimit,
  setShowRequest,
  resetEmailTemplatesState,
} = emailTemplatesSlice.actions;

export default emailTemplatesSlice.reducer;
