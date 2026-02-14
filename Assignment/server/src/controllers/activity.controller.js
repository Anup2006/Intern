import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Activity } from "../models/activity.model.js";

// Add activity
const addActivity = asyncHandler(async (req, res) => {
  const { name, duration, category, date } = req.body;

  if (!name || !duration || !date) throw new apiError(400, "All fields are required");

  const activity = await Activity.create({
    name,
    duration,
    category,
    date,
    user: req.user._id, 
  });

  res.status(201).json(new apiResponse(201, activity, "Activity added successfully"));
});

// Get activities by date
const getActivitiesByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw new apiError(400, "Date is required");

  const activities = await Activity.find({ user: req.user._id, date }).sort({ createdAt: -1 });
  res.status(200).json(new apiResponse(200, activities, "Activities fetched"));
});

// Delete activity
const deleteActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const activity = await Activity.findOne({ _id: id, user: req.user._id });
  if (!activity) throw new apiError(404, "Activity not found");

  await Activity.deleteOne({ _id: id, user: req.user._id });
  res.status(200).json(new apiResponse(200, null, "Activity deleted successfully"));
});

// Fetch History 
const getAllActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
  res.status(200).json(new apiResponse(200, activities, "All activities fetched"));
});

// Fetch weekly activities for analytics
const getWeeklyActivities = asyncHandler(async (req, res) => {
  const today = new Date();
  const past7Days = new Date();
  past7Days.setDate(today.getDate() - 6); 

  const startDate = past7Days.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const activities = await Activity.find({
    user: req.user._id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1, createdAt: 1 });

  res.status(200).json(new apiResponse(200, activities, "Weekly activities fetched"));
});

export{
    addActivity,
    getActivitiesByDate,
    deleteActivity,
    getAllActivities,
    getWeeklyActivities
}