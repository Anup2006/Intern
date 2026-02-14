import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
axios.defaults.withCredentials = true;
const BASE_URI = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1";
const ACTIVITY_URL = `${BASE_URI}/activities`;

const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async (date, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ACTIVITY_URL}?date=${date}`);
      return res.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch activities");
    }
  }
);

const addActivity = createAsyncThunk(
  "activities/addActivity",
  async (activity, { rejectWithValue }) => {
    try {
      const res = await axios.post(ACTIVITY_URL, activity);
      return res.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to add activity");
    }
  }
);

const deleteActivity = createAsyncThunk(
  "activities/deleteActivity",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${ACTIVITY_URL}/${id}`);
      return id; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete activity");
    }
  }
);

const fetchHistory = createAsyncThunk(
  "activities/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ACTIVITY_URL}/history`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch history");
    }
  }
);

const fetchWeeklyActivities = createAsyncThunk(
  "activities/fetchWeeklyActivities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ACTIVITY_URL}/weekly`);
      return res.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch weekly activities");
    }
  }
);

const initialState = {
  activities: [],
  loading: false,
  error: null,
  history: [],
  weekly: [],
  loadingWeekly: false,
  errorWeekly: null,
};

export const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivities: (state) => {
      state.activities = [];
      state.history = [];
      state.weekly = [];
      state.loading = false;
      state.error = null;
      state.loadingWeekly = false;
      state.errorWeekly = null;
    },
  },
  extraReducers: (builder) => {
    builder
        // Fetch activities
        .addCase(fetchActivities.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchActivities.fulfilled, (state, action) => {
            state.loading = false;
            state.activities = action.payload;
        })
        .addCase(fetchActivities.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to fetch activities";
        })

        // Add activity
        .addCase(addActivity.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(addActivity.fulfilled, (state, action) => {
            state.loading = false;
            state.activities.push(action.payload);
        })
        .addCase(addActivity.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to add activity";
        })

        // Delete activity
        .addCase(deleteActivity.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteActivity.fulfilled, (state, action) => {
            state.loading = false;
            state.activities = state.activities.filter(a => a._id !== action.payload);
        })
        .addCase(deleteActivity.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to delete activity";
        })

        // fetchHistory
        .addCase(fetchHistory.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchHistory.fulfilled, (state, action) => {
            state.loading = false;
            state.history = action.payload;
        })
        .addCase(fetchHistory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

    // Weekly analytics
      .addCase(fetchWeeklyActivities.pending, (state) => {
        state.loadingWeekly = true;
        state.errorWeekly = null;
      })
      .addCase(fetchWeeklyActivities.fulfilled, (state, action) => {
        state.loadingWeekly = false;
        state.weekly = action.payload;
      })
      .addCase(fetchWeeklyActivities.rejected, (state, action) => {
        state.loadingWeekly = false;
        state.errorWeekly = action.payload;
      });
        
  },
});

export const { clearActivities } = activitySlice.actions;
export { fetchActivities, addActivity,fetchHistory, deleteActivity,fetchWeeklyActivities };
export default activitySlice.reducer;
