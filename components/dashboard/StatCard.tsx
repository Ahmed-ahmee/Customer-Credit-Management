
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isNegative?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isNegative = false }) => {
  const changeColor = isNegative ? 'text-red-400' : 'text-green-400';
  const arrow = isNegative ? '↓' : '↑';

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-blue-500 transition-all duration-300">
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      <p className={`text-sm mt-2 flex items-center font-semibold ${changeColor}`}>
        {arrow} {change} vs last month
      </p>
    </div>
  );
};

export default StatCard;
