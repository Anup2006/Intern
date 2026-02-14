import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { LayoutDashboard, History, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from '../redux/authSlice.js';

const navItems = [
  { path: '/app/home', label: 'Daily Log', icon: LayoutDashboard },
  { path: '/app/history', label: 'History', icon: History },
  { path: '/app/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Dashboard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-[#F5F7FA]">
      {/* Mobile top bar */}
      <div className="sm:hidden flex justify-between items-center p-4 bg-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">HabitFlow</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen || isDesktop ? 0 : -300 }}
        transition={{ type: "tween" }}
        className="fixed sm:static top-0 left-0 z-50 w-90 h-screen bg-white flex flex-col shadow-lg sm:shadow-none"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 hidden sm:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold">HabitFlow</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={() => setSidebarOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section*/}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.fullname?.charAt(0).toUpperCase() || "U"}
                  className="w-10 h-10 object-cover"
                />
              ) : (
                <span>{user?.fullname?.charAt(0).toUpperCase() || "U"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{user?.fullname}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      {sidebarOpen && !isDesktop && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 ">
        {children}
      </main>
    </div>
  );
}
