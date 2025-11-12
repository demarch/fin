import React from 'react';
import type { Transaction } from '../../types/cashflow';
import { formatCurrency } from '../../utils/formatters';
import { formatRecurrenceFrequency } from '../../utils/recurrence';

interface TransactionsListProps {
  transactions: Transaction[];
  onDelete: (transactionId: string) => void;
  onDeleteSeries?: (recurringId: string) => void; // Para deletar toda a série de uma recorrência
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, onDelete, onDeleteSeries }) => {
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

  const isRecurringTransaction = (transaction: Transaction) => {
    return transaction.isRecurring || !!transaction.parentRecurringId;
  };

  const handleDelete = (transaction: Transaction) => {
    // Se for uma transação recorrente (template ou ocorrência gerada)
    if (isRecurringTransaction(transaction) && onDeleteSeries) {
      const recurringId = transaction.parentRecurringId || transaction.id;

      // Mostrar opções
      const message = transaction.parentRecurringId
        ? `Esta é uma ocorrência de uma transação recorrente.\n\nO que deseja fazer?\n\n[OK] - Excluir apenas esta ocorrência\n[Cancelar] - Ver opções para excluir toda a série`
        : `Esta é uma transação recorrente.\n\nVocê deseja excluir:\n\n[OK] - Excluir toda a série (todas as ocorrências)\n[Cancelar] - Excluir apenas esta transação`;

      if (window.confirm(message)) {
        // Se for uma ocorrência gerada, excluir apenas ela
        if (transaction.parentRecurringId) {
          onDelete(transaction.id);
        } else {
          // Se for o template, perguntar novamente
          if (window.confirm('Tem certeza? Isso excluirá TODAS as ocorrências desta recorrência!')) {
            onDeleteSeries(recurringId);
          }
        }
      } else {
        // Se cancelou e é uma ocorrência gerada, perguntar se quer excluir toda a série
        if (transaction.parentRecurringId) {
          if (window.confirm('Deseja excluir TODA a série desta recorrência?\n\nIsso excluirá todas as ocorrências passadas e futuras.')) {
            onDeleteSeries(recurringId);
          }
        }
      }
    } else {
      // Transação normal (não recorrente)
      if (window.confirm('Deseja realmente excluir esta transação?')) {
        onDelete(transaction.id);
      }
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
              {isRecurringTransaction(transaction) && (
                <span
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700"
                  title={
                    transaction.isRecurring && transaction.recurrencePattern
                      ? `Recorrência ${formatRecurrenceFrequency(transaction.recurrencePattern.frequency)}`
                      : 'Transação gerada automaticamente por recorrência'
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {transaction.isRecurring && transaction.recurrencePattern
                    ? formatRecurrenceFrequency(transaction.recurrencePattern.frequency)
                    : 'Auto'}
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
              onClick={() => handleDelete(transaction)}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              title={
                isRecurringTransaction(transaction)
                  ? 'Excluir transação (opções disponíveis)'
                  : 'Excluir transação'
              }
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
