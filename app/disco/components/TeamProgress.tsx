import React from 'react';
import { motion } from 'framer-motion';

interface TeamProgressProps {
  teams: {
    name: string;
    progress: number;
    itemsCompleted: number;
    totalItems: number;
  }[];
}

export const TeamProgress: React.FC<TeamProgressProps> = ({ teams }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Team Progress</h2>
      <div className="space-y-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{team.name}</span>
              <span className="text-sm text-gray-500">
                {team.itemsCompleted} / {team.totalItems} items
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${team.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{team.progress}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};