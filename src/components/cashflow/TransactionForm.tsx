import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { TransactionType, RecurrenceFrequency, RecurrencePattern } from '../../types/cashflow';

interface TransactionFormProps {
  onSubmit: (
    type: TransactionType,
    description: string,
    amount: number,
    category?: string,
    recurrencePattern?: RecurrencePattern
  ) => void;
  onCancel: () => void;
  initialDay?: number; // Dia do mês para sugerir como data inicial
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, initialDay }) => {
  const [type, setType] = useState<TransactionType>('receita');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [recurrenceStartDate, setRecurrenceStartDate] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(initialDay?.toString() || '1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount.replace(',', '.'));

    if (!description.trim()) {
      alert('Por favor, informe uma descrição');
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Por favor, informe um valor válido');
      return;
    }

    // Validações de recorrência
    if (isRecurring) {
      if (!recurrenceStartDate) {
        alert('Por favor, informe a data inicial da recorrência');
        return;
      }

      // Validar dayOfMonth para frequências que precisam
      if (['monthly', 'quarterly', 'yearly'].includes(recurrenceFrequency)) {
        const day = parseInt(dayOfMonth);
        if (isNaN(day) || day < 1 || day > 31) {
          alert('Por favor, informe um dia do mês válido (1-31)');
          return;
        }
      }
    }

    // Construir padrão de recorrência se aplicável
    const recurrencePattern: RecurrencePattern | undefined = isRecurring
      ? {
          frequency: recurrenceFrequency,
          startDate: recurrenceStartDate,
          endDate: recurrenceEndDate || undefined,
          dayOfMonth: ['monthly', 'quarterly', 'yearly'].includes(recurrenceFrequency)
            ? parseInt(dayOfMonth)
            : undefined,
        }
      : undefined;

    onSubmit(type, description.trim(), amountNum, category.trim() || undefined, recurrencePattern);

    // Resetar formulário
    setDescription('');
    setAmount('');
    setCategory('');
    setIsRecurring(false);
    setRecurrenceStartDate('');
    setRecurrenceEndDate('');
    setDayOfMonth(initialDay?.toString() || '1');
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Nova Transação</h3>

        <form onSubmit={handleSubmit}>
          {/* Tipo de Transação */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('receita')}
                className={`flex-1 py-2 px-4 rounded ${
                  type === 'receita'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType('despesa')}
                className={`flex-1 py-2 px-4 rounded ${
                  type === 'despesa'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('diario')}
                className={`flex-1 py-2 px-4 rounded ${
                  type === 'diario'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Diário
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Salário, Conta de luz, Mercado..."
              required
            />
          </div>

          {/* Valor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
              required
            />
          </div>

          {/* Categoria (opcional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria (opcional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Alimentação, Transporte, Lazer..."
            />
          </div>

          {/* Recorrência */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Transação recorrente
              </span>
            </label>
          </div>

          {/* Campos de Recorrência (aparecem apenas se isRecurring for true) */}
          {isRecurring && (
            <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
              {/* Frequência */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periodicidade
                </label>
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value as RecurrenceFrequency)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              {/* Dia do Mês (apenas para mensal, trimestral e anual) */}
              {['monthly', 'quarterly', 'yearly'].includes(recurrenceFrequency) && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia do mês (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 5"
                  />
                </div>
              )}

              {/* Data Inicial */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={recurrenceStartDate}
                  onChange={(e) => setRecurrenceStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={isRecurring}
                />
              </div>

              {/* Data Final (opcional) */}
              <div className="mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data final (opcional)
                </label>
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={recurrenceStartDate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para recorrência indefinida
                </p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
