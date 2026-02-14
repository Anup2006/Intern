import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory, deleteActivity } from "../redux/activitySlice";
import ActivityCard from "../components/ActivityCard.jsx";
import { toast } from "sonner";

export default function History() {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector((state) => state.activities);

  const [expandedDates, setExpandedDates] = useState(new Set());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  const normalizeDate = (date) => new Date(date).toLocaleDateString("en-CA");

  const groupedActivities = useMemo(() => {
    const groups = {};
    history.forEach((activity) => {
      const dateKey = normalizeDate(activity.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(activity);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [history]);

  const filteredActivities = useMemo(() => {
    if (!selectedDate) return groupedActivities;
    const dateStr = normalizeDate(selectedDate);
    return groupedActivities.filter(([date]) => date === dateStr);
  }, [selectedDate, groupedActivities]);

  const toggleDate = (date) => {
    const newSet = new Set(expandedDates);
    if (newSet.has(date)) newSet.delete(date);
    else newSet.add(date);
    setExpandedDates(newSet);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteActivity(id)).unwrap();
      toast.success("Activity deleted");
    } catch (err) {
      toast.error(err?.message || "Failed to delete activity");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const normDate = normalizeDate(dateStr);
    if (normDate === normalizeDate(today)) return "Today";
    if (normDate === normalizeDate(yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const dates = [];
  for (let i = 0; i < firstDayOfMonth; i++) dates.push(null);
  for (let i = 1; i <= daysInMonth; i++)
    dates.push(new Date(calendarYear, calendarMonth, i));

  const hasActivity = (date) =>
    groupedActivities.some(([d]) => d === normalizeDate(date));

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else setCalendarMonth(calendarMonth - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else setCalendarMonth(calendarMonth + 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-semibold">History</h1>
      <p className="text-gray-500">View your past activities</p>

      {/* Calendar Card */}
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 max-w-md sm:max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
            <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-base sm:text-lg font-medium text-center flex-1">
                {new Date(calendarYear, calendarMonth).toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                })}
            </h2>
            <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-500 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-[10px] sm:text-xs h-6 flex items-center justify-center">
                {d}
            </div>
            ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-1 mt-2">
            {dates.map((date, idx) => {
            if (!date) return <div key={idx} className="w-full h-12"></div>; // placeholder

            const isSelected =
                selectedDate && normalizeDate(date) === normalizeDate(selectedDate);
            const today = normalizeDate(date) === normalizeDate(new Date());
            const activity = hasActivity(date);

            return (
                <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`relative w-full sm:w-12 h-12 flex items-center justify-center rounded-md text-xs
                        ${isSelected ? "bg-indigo-500 text-white shadow-lg" :
                        today ? "bg-indigo-100 text-indigo-700 font-semibold" : "text-gray-700"}
                        hover:bg-indigo-200`}
                >
                <span className="flex items-center justify-center w-full h-full">
                    {date.getDate()}
                </span>
                {activity && (
                    <span
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-indigo-500"
                    }`}
                    ></span>
                )}
                </button>
            );
            })}
        </div>
    </div>

      {/* Activities */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow">
          <p className="text-gray-400">No activities recorded for this date.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map(([date, activities], index) => {
            const isExpanded = expandedDates.has(date);
            const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow overflow-hidden"
              >
                <motion.button
                  onClick={() => toggleDate(date)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors sticky top-0 bg-white z-10"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                    <div className="text-left">
                      <h3 className="text-lg">{formatDate(date)}</h3>
                      <p className="text-sm text-gray-500">
                        {activities.length} {activities.length === 1 ? "activity" : "activities"} · {totalDuration} minutes
                      </p>
                    </div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 space-y-3 border-t border-gray-100 pt-4">
                        {activities.map((activity) => (
                          <ActivityCard
                            key={activity._id}
                            activity={activity}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
