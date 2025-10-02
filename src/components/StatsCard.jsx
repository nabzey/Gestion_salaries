import React from 'react';

// eslint-disable-next-line no-unused-vars
export default function StatsCard({ title, value, change, changeType, icon: IconComponent, color }) {
  const colorVariants = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorVariants[color]} bg-opacity-10`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <span className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-2 text-gray-800">{value}</p>
    </div>
  );
}
