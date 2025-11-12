import { useState, useEffect } from 'react';
import { formatCurrency, parseCurrency } from '../../utils/formatters';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  positive?: boolean;
  negative?: boolean;
  label?: string;
  id?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  className = '',
  positive = false,
  negative = false,
  label,
  id,
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
    // Se o valor for 0, deixar vazio para facilitar a digitação
    setInputValue(value === 0 ? '' : value.toString());
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

  const ariaLabel = label || (positive ? 'Entrada' : negative ? 'Saída' : 'Valor');

  if (isEditing) {
    return (
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full px-2 py-1 text-sm border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        autoFocus
        aria-label={`Editar ${ariaLabel}`}
        aria-describedby={id ? `${id}-help` : undefined}
      />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleDoubleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDoubleClick();
        }
      }}
      className={`w-full px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 rounded text-currency focus:outline-none focus:ring-2 focus:ring-blue-500 ${colorClass} ${className}`}
      aria-label={`${ariaLabel}: ${displayValue}. Pressione Enter para editar`}
    >
      {displayValue}
    </div>
  );
}
