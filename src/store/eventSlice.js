import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { list, eventChangeStatus, deleteEvent } from '../controllers/V1/eventController';
import { getPage } from '../controllers/common';

// Async thunk for fetching events list
export const fetchEventsList = createAsyncThunk(
  'events/fetchEventsList',
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
        return rejectWithValue(listData?.message || 'Failed to fetch events');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for changing event status
export const changeEventStatus = createAsyncThunk(
  'events/changeEventStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId, status } = payload;
      const option = {
        editId: parseInt(editId),
        status: status,
      };
      const res = await eventChangeStatus(option);
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

// Async thunk for deleting event
export const deleteEventAction = createAsyncThunk(
  'events/deleteEvent',
  async (payload, { rejectWithValue }) => {
    try {
      const { editId } = payload;
      const option = {
        id: parseInt(editId),
      };
      const res = await deleteEvent(option);
      if (res.status === true) {
        return { id: parseInt(editId), message: 'Event deleted successfully.' };
      } else {
        return rejectWithValue(res?.message || 'Failed to delete event');
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

const eventSlice = createSlice({
  name: 'events',
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
    resetEventState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch events list
    builder
      .addCase(fetchEventsList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.listData = [];
      })
      .addCase(fetchEventsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listData = action.payload.data;
        state.count = action.payload.count;
        state.totalPages = action.payload.totalPages;
        if (action.payload.data.length === 0) {
          state.totalPages = getPage(1);
        }
      })
      .addCase(fetchEventsList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.listData = [];
      });

    // Change event status
    builder
      .addCase(changeEventStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(changeEventStatus.fulfilled, (state, action) => {
        // Update the event status in the list
        const eventIndex = state.listData.findIndex(
          (event) => event.id === action.payload.id
        );
        if (eventIndex !== -1) {
          state.listData[eventIndex].status = action.payload.status;
        }
      })
      .addCase(changeEventStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete event
    builder
      .addCase(deleteEventAction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteEventAction.fulfilled, (state, action) => {
        // Remove the event from the list
        state.listData = state.listData.filter(
          (event) => event.id !== action.payload.id
        );
        state.count = state.count - 1;
      })
      .addCase(deleteEventAction.rejected, (state, action) => {
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
  resetEventState,
} = eventSlice.actions;

export default eventSlice.reducer;

