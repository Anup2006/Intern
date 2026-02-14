import {Router} from "express";
import { googleLogin,googleSignUp,forgetPassword, loginUser, logOutUser, registerUser,  updateUserAvatar, verifyEmailOtp, resendOtp } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        }
    ]),
    registerUser
)
router.route("/verify-otp").post(verifyEmailOtp)
router.route("/resend-otp").post(resendOtp)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJwt,logOutUser) 
router.route("/reset-password").post(forgetPassword) 
router.route("/update-avatar").post(
    verifyJwt,
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        }
    ]),    
    updateUserAvatar
) 
router.route("/googleLogin").post(googleLogin)
router.route("/googleSignup").post(googleSignUp)

export default router