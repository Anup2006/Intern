import {Router} from "express";
import { addActivity, getActivitiesByDate, deleteActivity } from "../controllers/activity.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router()

router.use(verifyJwt);
router.post("/", addActivity);
router.get("/", getActivitiesByDate); 
router.delete("/:id", deleteActivity);

export default router