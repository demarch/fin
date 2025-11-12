import React from 'react';
import { createPortal } from 'react-dom';
import type { Transaction } from '../../types/cashflow';
import { useCashFlowStore } from '../../store/cashFlowStore';
import { formatCurrency } from '../../utils/formatters';
import { formatRecurrenceFrequency } from '../../utils/recurrence';

interface RecurringTransactionsManagerProps {
  onClose: () => void;
}

export const RecurringTransactionsManager: React.FC<RecurringTransactionsManagerProps> = ({ onClose }) => {
  const { getRecurringTransactions, deleteRecurringTransaction } = useCashFlowStore();
  const recurringTransactions = getRecurringTransactions();

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
        return 'text-green-600 bg-green-50 border-green-200';
      case 'despesa':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'diario':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleDelete = (transaction: Transaction) => {
    const confirmMessage = `Tem certeza que deseja excluir toda a série de "${transaction.description}"?\n\nIsso irá remover:\n- O template da recorrência\n- Todas as ocorrências já geradas\n- Não será possível gerar novas ocorrências\n\nEsta ação não pode ser desfeita!`;

    if (window.confirm(confirmMessage)) {
      deleteRecurringTransaction(transaction.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getRecurrenceDescription = (transaction: Transaction): string => {
    if (!transaction.recurrencePattern) return '';

    const pattern = transaction.recurrencePattern;
    const parts: string[] = [];

    // Frequência
    parts.push(formatRecurrenceFrequency(pattern.frequency));

    // Dia do mês ou último dia
    if (pattern.useLastDayOfMonth) {
      parts.push('no último dia do mês');
    } else if (pattern.dayOfMonth) {
      parts.push(`dia ${pattern.dayOfMonth}`);
    }

    // Datas
    parts.push(`desde ${formatDate(pattern.startDate)}`);

    if (pattern.endDate) {
      parts.push(`até ${formatDate(pattern.endDate)}`);
    } else {
      parts.push('(indefinidamente)');
    }

    return parts.join(' • ');
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Gerenciar Recorrências
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {recurringTransactions.length} transação(ões) recorrente(s) cadastrada(s)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Fechar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {recurringTransactions.length === 0 ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                Nenhuma transação recorrente cadastrada
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Crie uma transação recorrente marcando a opção "Transação recorrente" ao adicionar uma nova transação
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recurringTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`border-2 rounded-lg p-4 ${getTypeColor(transaction.type)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Title and Type */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getTypeColor(transaction.type)}`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                        {transaction.category && (
                          <span className="text-xs text-gray-500">
                            {transaction.category}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {transaction.description}
                      </h3>

                      {/* Amount */}
                      <div className="text-2xl font-bold mb-3">
                        {formatCurrency(transaction.amount)}
                      </div>

                      {/* Recurrence Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{getRecurrenceDescription(transaction)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDelete(transaction)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors border border-red-200"
                        title="Excluir toda a série"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>Dica:</strong> Para excluir apenas uma ocorrência específica, use o botão de lixeira na lista de transações do dia.
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
