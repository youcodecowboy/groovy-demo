'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MetricsOverview } from './components/MetricsOverview';
import { TeamProgress } from './components/TeamProgress';

// Sample data - replace with real data from your backend
const teamMetrics = {
  totalItems: 1248,
  completionRate: 87,
  efficiency: 92,
  accuracy: 95,
};

const teams = [
  {
    name: 'Team Alpha',
    progress: 75,
    itemsCompleted: 150,
    totalItems: 200,
  },
  {
    name: 'Team Beta',
    progress: 60,
    itemsCompleted: 90,
    totalItems: 150,
  },
  {
    name: 'Team Gamma',
    progress: 85,
    itemsCompleted: 170,
    totalItems: 200,
  },
  {
    name: 'Team Delta',
    progress: 45,
    itemsCompleted: 90,
    totalItems: 200,
  },
];

export default function DiscoPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Disco Dashboard</h1>
          <p className="text-gray-600">Real-time performance metrics and team progress</p>
        </motion.div>

        <MetricsOverview teamMetrics={teamMetrics} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamProgress teams={teams} />
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {/* Add your recent activity items here */}
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Team Alpha completed batch #1234</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">New efficiency record: Team Gamma</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Daily goals updated for all teams</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}