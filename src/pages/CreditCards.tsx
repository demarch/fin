import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCreditCardStore } from '../store/creditCardStore';
import { CreditCardForm } from '../components/creditcard/CreditCardForm';
import { CreditCardCard } from '../components/creditcard/CreditCardCard';
import type { CreditCard } from '../types/creditcard';
import { format } from 'date-fns';

export const CreditCards: React.FC = () => {
  const {
    getAllCartoes,
    getCartaoSummary,
    addCartao,
    updateCartao,
    deleteCartao,
  } = useCreditCardStore();

  const [showForm, setShowForm] = useState(false);
  const [editingCartao, setEditingCartao] = useState<CreditCard | undefined>();

  const cartoes = getAllCartoes();
  const mesAtual = format(new Date(), 'yyyy-MM');

  const handleAddCartao = () => {
    setEditingCartao(undefined);
    setShowForm(true);
  };

  const handleEditCartao = (cartao: CreditCard) => {
    setEditingCartao(cartao);
    setShowForm(true);
  };

  const handleDeleteCartao = (cartao: CreditCard) => {
    deleteCartao(cartao.id);
  };

  const handleSubmit = (data: Omit<CreditCard, 'id' | 'createdAt'>) => {
    if (editingCartao) {
      updateCartao(editingCartao.id, data);
    } else {
      addCartao(data);
    }
    setShowForm(false);
    setEditingCartao(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCartao(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Cartões de Crédito</h1>
            <button
              onClick={handleAddCartao}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus size={20} />
              Novo Cartão
            </button>
          </div>
          <p className="text-gray-600">
            Gerencie seus cartões de crédito e acompanhe seus gastos
          </p>
        </div>

        {/* Lista de Cartões */}
        {cartoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                  <Plus size={40} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum cartão cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Adicione seu primeiro cartão de crédito para começar a gerenciar suas
                despesas
              </p>
              <button
                onClick={handleAddCartao}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Cartão
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartoes.map((cartao) => (
              <CreditCardCard
                key={cartao.id}
                cartao={cartao}
                summary={getCartaoSummary(cartao.id, mesAtual)}
                onEdit={handleEditCartao}
                onDelete={handleDeleteCartao}
              />
            ))}
          </div>
        )}

        {/* Resumo Geral */}
        {cartoes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Total de Cartões</p>
                <p className="text-3xl font-bold text-blue-700">{cartoes.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Cartões Ativos</p>
                <p className="text-3xl font-bold text-green-700">
                  {cartoes.filter((c) => c.ativo).length}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 mb-1">Limite Total</p>
                <p className="text-3xl font-bold text-purple-700">
                  R${' '}
                  {cartoes
                    .reduce((sum, c) => sum + c.limite, 0)
                    .toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <CreditCardForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingCartao}
        />
      )}
    </div>
  );
};
