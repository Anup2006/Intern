import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from '../../redux/authSlice.js';
import GoogleButton from "./GoogleButton.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [focusedField, setFocusedField] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }

    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    dispatch(loginUser({ email, password }))
    .unwrap()
    .then(() => {
      toast.success("Welcome back!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      navigate("/app");
    })
    .catch((err) => {
      toast.error(err?.message || "Login failed");
    });
  };

  useEffect(() => {
    if (token) {
      navigate("/app", { replace: true });
    }
  }, [token,navigate]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#F5F7FA] via-[#E8EBF5] to-[#F5F7FA] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl text-black mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue your journey</p>
          </div>

          <GoogleButton isSignup={false} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
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
                  focusedField === "email" || email
                    ? "top-2 text-xs text-indigo-600"
                    : "top-4 text-base text-gray-400"
                }`}
              >
                Email Address
              </label>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
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
                  focusedField === "password" || password
                    ? "top-2 text-xs text-indigo-600"
                    : "top-4 text-base text-gray-400"
                }`}
              >
                Password
              </label>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
              <p className="text-sm text-gray-500 hover:text-indigo-600 cursor-pointer">
                <NavLink to="/auth/forgetPassword">
                  Forget Password?
                </NavLink>
              </p>
            </div>

            {/* Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <NavLink to="/signup" className="text-indigo-600 hover:text-indigo-700">
              Sign up
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
