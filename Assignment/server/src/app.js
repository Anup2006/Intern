import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: " Application is running 🚀"
  });
});

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

//router import 
import userRouter from "./routes/user.routes.js"   
import activityRouter from "./routes/activity.routes.js";

app.use("/api/v1/users",userRouter);
app.use("/api/v1/activities",activityRouter);

export {app}