import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities, addActivity, deleteActivity } from '../redux/activitySlice.js';
import ActivityCard from '../components/ActivityCard.jsx';
import { toast } from 'sonner';

export default function DailyLog() {
  const dispatch = useDispatch();
  const { activities, loading, error } = useSelector((state) => state.activities);

  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Work');

  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter((activity) => activity.date === today);

  useEffect(() => {
    dispatch(fetchActivities(today));
  }, [dispatch, today]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activityName.trim()) return toast.error('Please enter an activity name');
    if (!duration || parseInt(duration) <= 0) return toast.error('Please enter a valid duration');

    try {
      await dispatch(
        addActivity({ name: activityName, duration: parseInt(duration), category, date: today })
      ).unwrap();
      toast.success('Activity added!');
      setActivityName('');
      setDuration('');
      setCategory('Work');
    } catch (err) {
      toast.error(err?.message || 'Failed to add activity');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteActivity(id)).unwrap();
      toast.success('Activity deleted');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete activity');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-center sm:text-left">Daily Log</h1>
          <p className="text-gray-500 mb-8 text-center sm:text-left">Track your activities for today</p>

          {/* Activity Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 sm:p-6 shadow-md mb-8"
          >
            <h2 className="text-xl font-medium mb-4">Add New Activity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Activity Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration (minutes)"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Exercise">Exercise</option>
                <option value="Break">Break</option>
              </select>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Activity
              </motion.button>
            </form>
          </motion.div>

          {/* Activities List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-medium mb-4">Today's Activities</h2>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : todayActivities.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow">
                <p className="text-gray-400">No activities logged yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {todayActivities.map((activity) => (
                    <ActivityCard
                      key={activity._id} 
                      activity={activity}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
