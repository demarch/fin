import { useState, useEffect } from 'react';
import { formatCurrency, parseCurrency } from '../../utils/formatters';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  positive?: boolean;
  negative?: boolean;
}

export default function CurrencyInput({
  value,
  onChange,
  className = '',
  positive = false,
  negative = false,
}: CurrencyInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setInputValue(value.toString());
  };

  const handleBlur = () => {
    const parsedValue = parseCurrency(inputValue);
    onChange(parsedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value.toString());
    }
  };

  const displayValue = value === 0 && !isEditing ? '-' : formatCurrency(value);

  const colorClass = positive
    ? 'text-success'
    : negative
    ? 'text-danger'
    : value > 0
    ? 'text-success'
    : value < 0
    ? 'text-danger'
    : 'text-gray-900';

  if (isEditing) {
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full px-2 py-1 text-sm border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        autoFocus
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`w-full px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 rounded text-currency ${colorClass} ${className}`}
    >
      {displayValue}
    </div>
  );
}
