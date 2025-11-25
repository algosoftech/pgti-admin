import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, contactShopChangeStatus, deleteContactShop } from '../controllers/V1/contactShopController';
import { getPage } from '../controllers/common';

// Async thunk for fetching Contact Shops list
export const fetchContactShopsList = createAsyncThunk(
  'contactShops/fetchContactShopsList',
  async (options, { rejectWithValue }) => {
    try {
      const listData = await list(options);
      if (listData.status === true) {
        return {
          data: listData?.result || [],
          count: listData?.count || 0,
          totalPages: getPage(listData?.count || 1, options?.limit || 10),
        };
      } else {
        return rejectWithValue(listData?.message || 'Failed to fetch Contact Shops');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing Contact Shop status
export const changeContactShopStatus = createAsyncThunk(
  'contactShops/changeContactShopStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await contactShopChangeStatus(option);
      if (res.status === true) {
        return { id: parseInt(editId), status, message: 'Status changed successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to change status');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Operation not perform yet! please try in some time.');
    }
  }
);

// Async thunk for deleting Contact Shop
export const deleteContactShopAction = createAsyncThunk(
  'contactShops/deleteContactShop',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId } = payload;
      const option = {
        editId: parseInt(editId),
      };
      const res = await deleteContactShop(option);
      if (res.status === true) {
        return { id: parseInt(editId), message: 'Contact Shop deleted successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to delete Contact Shop');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Operation not perform yet! please try in some time.');
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
  filter: {
    from: '',
    to: '',
    filter_by: '',
    search: '',
  },
  showRequest: '',
};

const contactShopSlice = createSlice({
  name: 'contactShops',
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
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
      state.skip = 0;
      state.currentPage = 1;
    },
    resetFilter: (state) => {
      state.filter = {
        from: '',
        to: '',
        filter_by: '',
        search: '',
      };
      state.skip = 0;
      state.currentPage = 1;
    },
    setShowRequest: (state, action) => {
      state.showRequest = action.payload;
      state.skip = 0;
      state.currentPage = 1;
    },
    resetContactShopState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Contact Shops list
    builder
      .addCase(fetchContactShopsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchContactShopsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchContactShopsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change Contact Shop status
    builder
      .addCase(changeContactShopStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeContactShopStatus.fulfilled, (state, action) => {
        // Update the Contact Shop status in the list
        const contactShopIndex = state.listData.findIndex(
          (contactShop) => contactShop.id === action.payload.id
        );
        if (contactShopIndex !== -1) {
          state.listData[contactShopIndex].status = action.payload.status;
        }
      })
      .addCase(changeContactShopStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete Contact Shop
    builder
      .addCase(deleteContactShopAction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteContactShopAction.fulfilled, (state, action) => {
        // Remove the Contact Shop from the list
        state.listData = state.listData.filter(
          (contactShop) => contactShop.id !== action.payload.id
        );
        state.count = state.count - 1;
      })
      .addCase(deleteContactShopAction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentPage,
  setLimit,
  setFilter,
  resetFilter,
  setShowRequest,
  resetContactShopState,
} = contactShopSlice.actions;

export default contactShopSlice.reducer;

