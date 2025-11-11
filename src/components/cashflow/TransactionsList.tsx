import React from 'react';
import type { Transaction } from '../../types/cashflow';
import { formatCurrency } from '../../utils/formatters';

interface TransactionsListProps {
  transactions: Transaction[];
  onDelete: (transactionId: string) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic py-2">
        Nenhuma transação registrada
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'receita':
        return 'Receita';
      case 'despesa':
        return 'Despesa';
      case 'diario':
        return 'Diário';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'receita':
        return 'text-green-600 bg-green-50';
      case 'despesa':
        return 'text-red-600 bg-red-50';
      case 'diario':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs px-2 py-0.5 rounded ${getTypeColor(transaction.type)}`}
              >
                {getTypeLabel(transaction.type)}
              </span>
              {transaction.category && (
                <span className="text-xs text-gray-500">
                  {transaction.category}
                </span>
              )}
            </div>
            <div className="font-medium text-gray-900">
              {transaction.description}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-lg">
                {formatCurrency(transaction.amount)}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(transaction.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Deseja realmente excluir esta transação?')) {
                  onDelete(transaction.id);
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Excluir transação"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
