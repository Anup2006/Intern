import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";
import { sendOTPEmail,generateOTP } from "../utils/otp.js";

const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({ validateBeforeSave:false })

        return {accessToken,refreshToken}
    }catch(error){
    throw new apiError(500,"Something went wrong while generating refresh and access tokens")
    }
}

const registerUser= asyncHandler( async (req,res)=>{
    //console.log(req.body)
    const {email,password,fullname} = req.body

    if ([email,password,fullname].some((field)=> typeof field !== "string" || field?.trim()==="")){
        throw new apiError(400,"All fields are required!!")
    }

    const existedUser = await User.findOne({
        $or:[{email},{fullname}]
    })
    if(existedUser){
        throw new apiError(409,"User with email or fullname already exists")
    }

    const otp=generateOTP();

    const user = await User.create({
        email,
        fullname,
        password,
        emailOTP: otp,
        emailOTPExpires: Date.now() + 10 * 60 * 1000, // 10 min
        isEmailVerified: false
    })

    await sendOTPEmail(email, otp);

    return res.status(201).json(
        new apiResponse(
        200,
        { userId: user._id },
        "OTP sent to email. Please verify."
        )   
    );
})

const resendOtp=asyncHandler(async(req,res)=>{
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new apiError(404, "User not found");

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.status(200).json({
        success: true,
        message: "OTP resent successfully"
    });
})

const verifyEmailOtp= asyncHandler(async(req,res)=>{
    const {userId,otp}=req.body;
    const user = await User.findById(userId)

    if(!user){
        throw new apiError(404, "User not found");
    }
    
    if (user.emailOTP !== otp.toString()) {
        throw new apiError(400, "Invalid OTP");
    }

    if (user.emailOTPExpires < Date.now()) {
        throw new apiError(400, "OTP expired");
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;

    await user.save();

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if(!createdUser){
        throw new apiError(500,"something went wrong while registering user")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const options={
        httpOnly:true,
        secure:true,
        sameSite: "none",
    }

    return res.status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:createdUser,accessToken,refreshToken
            },
            "User registered sucessfully") 
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body

    if(!(email)){
        throw new apiError(400,"email is required")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new apiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(String(password))
    if(!isPasswordValid){
        throw new apiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true,
        sameSite: "none",
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
    )

})

const logOutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )
    
    const options={
        httpOnly:true,
        secure:true,
    }
    
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User Logged Out Successfully"))
    
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.files?.avatar[0].path
    
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new apiError(400,"Error while uploading on cloudinary")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url,
            }
        },
        {
            new:true,
        }
    )

    return res.status(200)
    .json(new apiResponse(200,{user:user},"User avatar is updated successfully"))
})

const forgetPassword=asyncHandler(async(req,res)=>{
    const {email,newPassword,confPassword}=req.body
    
    if([email,newPassword,confPassword].some((field)=> field?.trim()==="")){
        throw new apiError(400,"All fields are required!!")
    }

    if(!(newPassword === confPassword)){
        throw new apiError(400,"Confirm Password doesn't match ")
    }

    const user=await User.findOne({email})

    if(!user){
        throw new apiError(404,"User with this email id does not exists")
    }
    
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(201)
    .json(
        new apiResponse(
            200,
            {},
            "Password reset Successfully"
        )
    )
})

import axios from "axios";

const getGoogleUser = async (code) => {
  const { data } = await axios.post(
    "https://oauth2.googleapis.com/token",
    {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  
  const userInfo = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    }
  );

  return userInfo.data;
};


const googleLogin = asyncHandler(async(req,res)=>{
    const { code } = req.body;

  if (!code) {
    throw new apiError(400, "Google token is required");
  }

  const { sub, email, picture } = await getGoogleUser(code);

  let user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, "User not found. Please sign up.");
  }

  if (!user.googleId) {
    user.googleId = sub;
    user.avatar = picture;
    user.provider = "google";
    await user.save({ validateBeforeSave: false });
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Google login successful"
      )
    );
})

const googleSignUp = asyncHandler(async(req,res)=>{
    const { code } = req.body;

    if (!code) {
        throw new apiError(400, "Google token is required");
    }

    const { sub, email, name, picture } = await getGoogleUser(code);

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new apiError(409, "User already exists. Please login.");
    }

    const isSuperAdmin =
        (email === process.env.SUPER_ADMIN_EMAIL);

    const user = await User.create({
        fullname: name,
        email,
        googleId: sub,
        avatar: picture,
        provider: "google",
        isEmailVerified: true,
    });

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
        new apiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "Google signup successful"
        )
    );
})

export {
    registerUser,
    loginUser,
    logOutUser,
    forgetPassword,
    updateUserAvatar,
    googleLogin,
    googleSignUp,
    verifyEmailOtp,
    resendOtp,
}