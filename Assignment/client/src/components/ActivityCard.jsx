import { motion } from 'framer-motion';
import { Trash2, Clock } from 'lucide-react';

const categoryColors = {
  Work: 'bg-blue-500',
  Study: 'bg-purple-500',
  Exercise: 'bg-green-500',
  Break: 'bg-orange-500',
};

export default function ActivityCard({ activity, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 font-medium text-gray-800">{activity.name}</h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              <span>{activity.duration} min</span>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-white text-sm ${
                categoryColors[activity.category] || 'bg-gray-500'
              }`}
            >
              {activity.category}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(activity._id)} 
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </motion.button>
      </div>
    </motion.div>
  );
}
