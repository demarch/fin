import { useState } from 'react';
import { X } from 'lucide-react';

interface LoanFormProps {
  onSubmit: (loan: {
    valorParcela: number;
    banco: string;
    totalParcelas: number;
    parcelasPagas: number;
    dataInicio: Date;
    descricao?: string;
  }) => void;
  onCancel: () => void;
}

export default function LoanForm({ onSubmit, onCancel }: LoanFormProps) {
  const [formData, setFormData] = useState({
    valorParcela: '',
    banco: '',
    totalParcelas: '',
    parcelasPagas: '',
    dataInicio: new Date().toISOString().split('T')[0],
    descricao: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      valorParcela: parseFloat(formData.valorParcela) || 0,
      banco: formData.banco,
      totalParcelas: parseInt(formData.totalParcelas) || 0,
      parcelasPagas: parseInt(formData.parcelasPagas) || 0,
      dataInicio: new Date(formData.dataInicio),
      descricao: formData.descricao,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Adicionar Empréstimo
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Empréstimo Pessoal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Parcela *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valorParcela}
              onChange={(e) =>
                setFormData({ ...formData, valorParcela: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco/Instituição *
            </label>
            <input
              type="text"
              value={formData.banco}
              onChange={(e) =>
                setFormData({ ...formData, banco: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Banco do Brasil"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total de Parcelas *
              </label>
              <input
                type="number"
                value={formData.totalParcelas}
                onChange={(e) =>
                  setFormData({ ...formData, totalParcelas: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="12"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parcelas Pagas *
              </label>
              <input
                type="number"
                value={formData.parcelasPagas}
                onChange={(e) =>
                  setFormData({ ...formData, parcelasPagas: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início *
            </label>
            <input
              type="date"
              value={formData.dataInicio}
              onChange={(e) =>
                setFormData({ ...formData, dataInicio: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-blue-600 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
