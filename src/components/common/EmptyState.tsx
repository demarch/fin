import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mb-6 max-w-md text-sm text-gray-600">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
