import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  subtitle?: string;
}

export default function SummaryCard({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
}: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-primary',
    green: 'bg-green-50 text-success',
    red: 'bg-red-50 text-danger',
    yellow: 'bg-yellow-50 text-warning',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[1]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
