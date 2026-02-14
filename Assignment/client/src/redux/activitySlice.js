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


const initialState = {
  activities: [],
  loading: false,
  error: null,
};

export const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivities: (state) => {
      state.activities = [];
      state.loading = false;
      state.error = null;
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
      });
  },
});

export const { clearActivities } = activitySlice.actions;
export { fetchActivities, addActivity, deleteActivity };
export default activitySlice.reducer;
