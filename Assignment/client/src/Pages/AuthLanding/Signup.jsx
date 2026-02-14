import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { signupUser,setOtpEmail,verifyOtpUser,resendOtpUser,clearOtpState } from "../../redux/authSlice.js";
import OtpForm from "./OtpForm.jsx";
import GoogleButton from "./GoogleButton.jsx";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [focusedField, setFocusedField] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, token,otpUserId, resending,otpEmail } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ name: "", email: "", password: "" });

    if (!name) return setErrors((prev) => ({ ...prev, name: "Name is required" }));
    if (!email) return setErrors((prev) => ({ ...prev, email: "Email is required" }));
    if (!password || password.length < 6)
      return setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));

    dispatch(signupUser({ email, fullname: name, password }))
    .unwrap()
    .then(() => {
      toast.success("Account created! Please verify OTP.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      toast.success("OTP sent to your email. Please check your inbox (and Spam folder if you don't see it).", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      dispatch(setOtpEmail(email));
    })
    .catch((err) => {
      toast.error(err?.message || "Signup failed");
    });
  };

  const handleVerifyOtp= ()=>{
        if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
        dispatch(verifyOtpUser({ userId: otpUserId, otp }))
            .unwrap()
            .then(() => toast.success("Email verified & logged in!"))
            .catch(err => toast.error(err?.message || "OTP verification failed"));
    }

    
    const handleResendOtp = () => {
        dispatch(resendOtpUser({ userId: otpUserId }))
            .unwrap()
            .then(() => toast.success("OTP resent to your email"))
            .catch(() => toast.error("Failed to resend OTP"));
    };

    useEffect(() => {
        if (token) {
            navigate("/app", { replace: true });
        }
    }, [token,navigate]);
    
    if (otpUserId) {
      return (
      <OtpForm
        email={otpEmail}
        otp={otp}
        setOtp={setOtp}
        handleVerifyOtp={handleVerifyOtp}
        handleResendOtp={handleResendOtp}
        loading={loading}
        resending={resending}
        onBack={() => {
            setOtp(""),
            dispatch(clearOtpState());
        }}
      />
      );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#F5F7FA] via-[#E8EBF5] to-[#F5F7FA] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-2">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-medium text-lg text-black mb-2">Create Account</h1>
            <p className="text-gray-500">Start your journey today</p>
          </div>

          <GoogleButton isSignup={true} />

          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-3 text-gray-500 text-sm">or</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 pt-4 pb-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder=" "
              />
              <label
                htmlFor="name"
                className={`absolute left-4 transition-all pointer-events-none ${
                  focusedField === "name" || name ? "top-2 text-xs text-indigo-600" : "top-4 text-base text-gray-400"
                }`}
              >
                Full Name
              </label>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 pt-4 pb-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder=" "
              />
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all pointer-events-none ${
                  focusedField === "email" || email ? "top-2 text-xs text-indigo-600" : "top-4 text-base text-gray-400"
                }`}
              >
                Email Address
              </label>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 pt-4 pb-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all pointer-events-none ${
                  focusedField === "password" || password ? "top-2 text-xs text-indigo-600" : "top-4 text-base text-gray-400"
                }`}
              >
                Password
              </label>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <NavLink to="/login" className="text-indigo-600 hover:text-indigo-700">
              Sign in
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
