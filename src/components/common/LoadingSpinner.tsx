import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-blue-500`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Loading Overlay para cobrir toda a tela ou container
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Carregando...',
  blur = true,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center ${
        blur ? 'backdrop-blur-sm' : ''
      } bg-white/70`}
    >
      <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-gray-700">{text}</p>
      </div>
    </div>
  );
};
