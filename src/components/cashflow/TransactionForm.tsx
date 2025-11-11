import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { TransactionType } from '../../types/cashflow';

interface TransactionFormProps {
  onSubmit: (type: TransactionType, description: string, amount: number, category?: string) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel }) => {
  const [type, setType] = useState<TransactionType>('receita');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

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

    onSubmit(type, description.trim(), amountNum, category.trim() || undefined);

    // Resetar formulário
    setDescription('');
    setAmount('');
    setCategory('');
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
          <div className="mb-6">
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
