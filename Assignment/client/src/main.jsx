import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  BrowserRouter,
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import ProtectedRoutes from "./utils/ProtectedRoutes.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import Login from "./Pages/AuthLanding/Login.jsx"; 
import Signup from "./Pages/AuthLanding/Signup.jsx";
import ForgetPassword from "./Pages/AuthLanding/ForgetPassword.jsx";
import DailyLog from "./Pages/DailyLog.jsx"

const GoogleAuthWrapper=({ children }) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path="/login" element={<GoogleAuthWrapper>
        <Login />
      </GoogleAuthWrapper>} />
      <Route path="/signup" element={<GoogleAuthWrapper>
        <Signup />
      </GoogleAuthWrapper>} />
      <Route path="/auth/forgetPassword" element={<ForgetPassword/>}/>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/app" element={<App />}>
          <Route index element={<DailyLog/>} /> 
          <Route path="home" element={<DailyLog/>} />
        </Route>
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer position="top-right" autoClose={3000} theme="dark"/>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
