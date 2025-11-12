import { useState } from 'react';
import type { DailyEntry, TransactionType, RecurrencePattern } from '../../types/cashflow';
import CurrencyInput from '../common/CurrencyInput';
import { TransactionForm } from './TransactionForm';
import { TransactionsList } from './TransactionsList';

interface DayRowProps {
  entry: DailyEntry;
  monthStr: string;
  onUpdate: (field: keyof DailyEntry, value: number) => void;
  onAddTransaction: (
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
  onDeleteTransaction: (transactionId: string) => void;
  onDeleteSeries?: (recurringId: string) => void;
  isToday?: boolean;
}

export default function DayRow({
  entry,
  onUpdate,
  onAddTransaction,
  onDeleteTransaction,
  onDeleteSeries,
  isToday = false
}: DayRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const hasMovement = entry.entrada > 0 || entry.saida > 0 || entry.diario > 0;
  const transactionsCount = entry.transactions?.length || 0;

  const handleAddTransaction = (
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
  ) => {
    onAddTransaction(type, description, amount, category, recurrencePattern, creditCardData);
    setShowTransactionForm(false);
  };

  return (
    <>
      <tr className={`${isToday ? 'bg-blue-50' : hasMovement ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors`}>
        <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
          <div className="flex items-center gap-2">
            <span>{entry.day}</span>
            {transactionsCount > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                title={`${transactionsCount} transação(ões)`}
              >
                {transactionsCount}
              </button>
            )}
          </div>
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
        <td className="px-2 py-1 border-r border-gray-200">
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
        <td className="px-2 py-1">
          <div className="flex gap-1">
            <button
              onClick={() => setShowTransactionForm(true)}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Adicionar transação"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {transactionsCount > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title={isExpanded ? 'Ocultar transações' : 'Ver transações'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Linha expandida com transações */}
      {isExpanded && transactionsCount > 0 && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Transações do dia {entry.day}
              </h4>
              <TransactionsList
                transactions={entry.transactions || []}
                onDelete={onDeleteTransaction}
                onDeleteSeries={onDeleteSeries}
              />
            </div>
          </td>
        </tr>
      )}

      {/* Modal de adicionar transação */}
      {showTransactionForm && (
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowTransactionForm(false)}
          initialDay={entry.day}
        />
      )}
    </>
  );
}
