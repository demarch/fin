import type { DailyEntry } from '../../types/cashflow';
import CurrencyInput from '../common/CurrencyInput';

interface DayRowProps {
  entry: DailyEntry;
  onUpdate: (field: keyof DailyEntry, value: number) => void;
  isToday?: boolean;
}

export default function DayRow({ entry, onUpdate, isToday = false }: DayRowProps) {
  const hasMovement = entry.entrada > 0 || entry.saida > 0 || entry.diario > 0;

  return (
    <tr className={`${isToday ? 'bg-blue-50' : hasMovement ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors`}>
      <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
        {entry.day}
      </td>
      <td className="px-2 py-1 border-r border-gray-200">
        <CurrencyInput
          value={entry.entrada}
          onChange={(value) => onUpdate('entrada', value)}
          positive
        />
      </td>
      <td className="px-2 py-1 border-r border-gray-200">
        <CurrencyInput
          value={entry.saida}
          onChange={(value) => onUpdate('saida', value)}
          negative
        />
      </td>
      <td className="px-2 py-1 border-r border-gray-200">
        <CurrencyInput
          value={entry.diario}
          onChange={(value) => onUpdate('diario', value)}
        />
      </td>
      <td className="px-2 py-1">
        <div
          className={`text-sm font-semibold text-currency ${
            entry.saldo >= 0 ? 'text-success' : 'text-danger'
          }`}
        >
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(entry.saldo)}
        </div>
      </td>
    </tr>
  );
}
