import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    },
    category: {
      type: String,
      enum: ["Work", "Study", "Exercise", "Break"],
      default: "Work",
    },
    date: { 
        type: String, 
        required: true 
    }, 
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);
