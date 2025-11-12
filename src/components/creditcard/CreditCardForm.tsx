import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreditCard } from '../../types/creditcard';

interface CreditCardFormProps {
  onSubmit: (data: Omit<CreditCard, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: CreditCard;
}

const CORES_DISPONIVEIS = [
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Amarelo', valor: '#F59E0B' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Cinza', valor: '#6B7280' },
  { nome: 'Preto', valor: '#1F2937' },
];

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [banco, setBanco] = useState(initialData?.banco || '');
  const [limite, setLimite] = useState(initialData?.limite?.toString() || '');
  const [diaVencimento, setDiaVencimento] = useState(
    initialData?.diaVencimento?.toString() || ''
  );
  const [diaFechamento, setDiaFechamento] = useState(
    initialData?.diaFechamento?.toString() || ''
  );
  const [cor, setCor] = useState(initialData?.cor || CORES_DISPONIVEIS[0].valor);
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!banco.trim()) {
      newErrors.banco = 'Banco é obrigatório';
    }

    const limiteNum = parseFloat(limite);
    if (!limite || isNaN(limiteNum) || limiteNum <= 0) {
      newErrors.limite = 'Limite deve ser maior que zero';
    }

    const diaVencNum = parseInt(diaVencimento);
    if (!diaVencimento || isNaN(diaVencNum) || diaVencNum < 1 || diaVencNum > 31) {
      newErrors.diaVencimento = 'Dia deve estar entre 1 e 31';
    }

    const diaFechNum = parseInt(diaFechamento);
    if (!diaFechamento || isNaN(diaFechNum) || diaFechNum < 1 || diaFechNum > 31) {
      newErrors.diaFechamento = 'Dia deve estar entre 1 e 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      nome: nome.trim(),
      banco: banco.trim(),
      limite: parseFloat(limite),
      diaVencimento: parseInt(diaVencimento),
      diaFechamento: parseInt(diaFechamento),
      cor,
      ativo,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome do Cartão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cartão *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nubank, Itaú Mastercard"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nome && (
              <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
            )}
          </div>

          {/* Banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco *
            </label>
            <input
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Ex: Nubank, Itaú, Bradesco"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.banco ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.banco && (
              <p className="text-red-500 text-xs mt-1">{errors.banco}</p>
            )}
          </div>

          {/* Limite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">R$</span>
              <input
                type="number"
                value={limite}
                onChange={(e) => setLimite(e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.limite ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.limite && (
              <p className="text-red-500 text-xs mt-1">{errors.limite}</p>
            )}
          </div>

          {/* Dia de Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dia de Vencimento *
            </label>
            <input
              type="number"
              value={diaVencimento}
              onChange={(e) => setDiaVencimento(e.target.value)}
              placeholder="Ex: 10"
              min="1"
              max="31"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.diaVencimento ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.diaVencimento && (
              <p className="text-red-500 text-xs mt-1">{errors.diaVencimento}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Dia do mês em que a fatura vence
            </p>
          </div>

          {/* Dia de Fechamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dia de Fechamento *
            </label>
            <input
              type="number"
              value={diaFechamento}
              onChange={(e) => setDiaFechamento(e.target.value)}
              placeholder="Ex: 5"
              min="1"
              max="31"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.diaFechamento ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.diaFechamento && (
              <p className="text-red-500 text-xs mt-1">{errors.diaFechamento}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Dia do mês em que a fatura fecha
            </p>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor de Identificação
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CORES_DISPONIVEIS.map((c) => (
                <button
                  key={c.valor}
                  type="button"
                  onClick={() => setCor(c.valor)}
                  className={`h-10 rounded-md transition-all ${
                    cor === c.valor
                      ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.valor }}
                  title={c.nome}
                />
              ))}
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
              Cartão ativo
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Salvar' : 'Criar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
