import type { MonthlyData, TransactionType, RecurrencePattern } from '../../types/cashflow';
import DayRow from './DayRow';
import { formatCurrency } from '../../utils/formatters';

interface MonthGridProps {
  monthData: MonthlyData;
  onUpdateEntry: (day: number, field: keyof import('../../types/cashflow').DailyEntry, value: number) => void;
  onAddTransaction: (
    day: number,
    type: TransactionType,
    description: string,
    amount: number,
    category?: string,
    recurrencePattern?: RecurrencePattern,
    creditCardData?: {
      isCartaoCredito: boolean;
      cartaoCreditoId?: string;
      parcelado?: boolean;
      numeroParcelas?: number;
    }
  ) => void;
  onDeleteTransaction: (day: number, transactionId: string) => void;
  onDeleteSeries?: (recurringId: string) => void;
}

export default function MonthGrid({ monthData, onUpdateEntry, onAddTransaction, onDeleteTransaction, onDeleteSeries }: MonthGridProps) {
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === monthData.year &&
    today.getMonth() === new Date(monthData.month + '-01').getMonth();
  const currentDay = today.getDate();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
              Dia
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
              Entrada
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
              Saída
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
              Diário
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
              Saldo
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {monthData.entries.map((entry) => (
            <DayRow
              key={entry.day}
              entry={entry}
              monthStr={monthData.month}
              onUpdate={(field, value) => onUpdateEntry(entry.day, field, value)}
              onAddTransaction={(type, description, amount, category, recurrencePattern) =>
                onAddTransaction(entry.day, type, description, amount, category, recurrencePattern)
              }
              onDeleteTransaction={(transactionId) =>
                onDeleteTransaction(entry.day, transactionId)
              }
              onDeleteSeries={onDeleteSeries}
              isToday={isCurrentMonth && entry.day === currentDay}
            />
          ))}

          {/* Totals Row */}
          <tr className="bg-primary text-white font-bold">
            <td className="px-4 py-3 text-sm border-r border-blue-600">
              TOTAL
            </td>
            <td className="px-4 py-3 text-sm border-r border-blue-600">
              {formatCurrency(monthData.totals.totalEntradas)}
            </td>
            <td className="px-4 py-3 text-sm border-r border-blue-600">
              {formatCurrency(monthData.totals.totalSaidas)}
            </td>
            <td className="px-4 py-3 text-sm border-r border-blue-600">
              -
            </td>
            <td className="px-4 py-3 text-sm border-r border-blue-600">
              {formatCurrency(monthData.totals.saldoFinal)}
            </td>
            <td className="px-4 py-3 text-sm">
              -
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
