import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { TrendingUp, Calendar, Award } from "lucide-react";
import ThreeBarChart  from "../components/ThreeBarChart.jsx";
import { fetchWeeklyActivities } from "../redux/activitySlice.js";

const categoryColors = {
  Work: "#3b82f6",
  Study: "#a855f7",
  Exercise: "#22c55e",
  Break: "#f97316",
};

export default function Analytics() {
  const dispatch = useDispatch();
  const weeklyActivities = useSelector((state) => state.activities.weekly);
  const loadingWeekly = useSelector((state) => state.activities.loadingWeekly);

  useEffect(() => {
    dispatch(fetchWeeklyActivities());
  }, [dispatch]);

  const weeklyData = React.useMemo(() => {
    if (!weeklyActivities || !weeklyActivities.length) return [];

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((dayName, idx) => {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - (6 - idx));
      const dateStr = dayDate.toISOString().split("T")[0];

      const dayActivities = weeklyActivities.filter((a) => a.date === dateStr);

      const dayData = {
        name: dayName,
        date: dateStr,
        Work: 0,
        Study: 0,
        Exercise: 0,
        Break: 0,
        total: 0,
      };

      dayActivities.forEach((activity) => {
        dayData[activity.category] += activity.duration;
        dayData.total += activity.duration;
      });

      return dayData;
    });
  }, [weeklyActivities]);

  const stats = React.useMemo(() => {
    if (!weeklyData.length) return { totalDuration: 0, mostActiveDay: "None", topCategory: "None" };

    const totalDuration = weeklyData.reduce((sum, d) => sum + d.total, 0);

    const mostActiveDay = weeklyData.reduce(
      (max, day) => (day.total > max.total ? day : max),
      { name: "None", total: 0 }
    ).name;

    const categoryTotals = { Work: 0, Study: 0, Exercise: 0, Break: 0 };
    weeklyData.forEach((d) => {
      Object.keys(categoryTotals).forEach((cat) => {
        categoryTotals[cat] += d[cat];
      });
    });

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [cat, duration]) => (duration > max.duration ? { category: cat, duration } : max),
      { category: "None", duration: 0 }
    ).category;

    return { totalDuration, mostActiveDay, topCategory };
  }, [weeklyData]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl mb-2">Analytics</h1>
        <p className="text-gray-500 mb-8">Your weekly overview and insights</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total This Week</p>
                <p className="text-2xl">{stats.totalDuration} min</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Most Active Day</p>
                <p className="text-2xl">{stats.mostActiveDay}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Top Category</p>
                <p className="text-2xl">{stats.topCategory}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        >
          <h2 className="text-xl mb-6">Weekly Overview</h2>
          <div className="h-80">
            {!loadingWeekly && weeklyData.length > 0 ? (
              <ThreeBarChart data={weeklyData} />
            ) : (
              <p className="text-center text-gray-400">Loading chart...</p>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-600">{category}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
