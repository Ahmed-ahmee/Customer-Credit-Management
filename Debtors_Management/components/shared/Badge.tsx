
import React from 'react';

interface BadgeProps {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
}

const Badge: React.FC<BadgeProps> = ({ label, color }) => {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-300',
    yellow: 'bg-yellow-500/20 text-yellow-300',
    red: 'bg-red-500/20 text-red-300',
    blue: 'bg-blue-500/20 text-blue-300',
  };

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[color]}`}>
      {label}
    </span>
  );
};

export default Badge;
