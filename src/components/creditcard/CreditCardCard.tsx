import React from 'react';
import { Edit2, Trash2, CreditCard as CardIcon } from 'lucide-react';
import type { CreditCard, CreditCardSummary } from '../../types/creditcard';
import { formatCurrency } from '../../utils/formatters';

interface CreditCardCardProps {
  cartao: CreditCard;
  summary: CreditCardSummary;
  onEdit: (cartao: CreditCard) => void;
  onDelete: (cartao: CreditCard) => void;
  onClick?: (cartao: CreditCard) => void;
}

export const CreditCardCard: React.FC<CreditCardCardProps> = ({
  cartao,
  summary,
  onEdit,
  onDelete,
  onClick,
}) => {
  const getPercentualColor = (percentual: number) => {
    if (percentual < 50) return 'bg-green-500';
    if (percentual < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      className="relative rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${cartao.cor || '#3B82F6'} 0%, ${
          cartao.cor || '#3B82F6'
        }dd 100%)`,
      }}
      onClick={() => onClick?.(cartao)}
    >
      {/* Badge de status */}
      {!cartao.ativo && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
            Inativo
          </span>
        </div>
      )}

      <div className="p-6 text-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardIcon size={24} />
              <h3 className="text-lg font-semibold">{cartao.nome}</h3>
            </div>
            <p className="text-sm opacity-80">{cartao.banco}</p>
          </div>
        </div>

        {/* Limite e Disponível */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs opacity-80 mb-1">Limite Total</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.limiteTotal)}</p>
          </div>

          <div>
            <p className="text-xs opacity-80 mb-1">Disponível</p>
            <p className="text-xl font-semibold">
              {formatCurrency(summary.limiteDisponivel)}
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Utilizado</span>
              <span>{summary.percentualUtilizado.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getPercentualColor(
                  summary.percentualUtilizado
                )}`}
                style={{ width: `${Math.min(summary.percentualUtilizado, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fatura Atual */}
        <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
          <p className="text-xs opacity-80 mb-1">Fatura Atual</p>
          <p className="text-xl font-bold">{formatCurrency(summary.faturaAtual)}</p>
          <p className="text-xs opacity-80 mt-1">
            Vencimento: {cartao.diaVencimento}/{new Date().getMonth() + 1}
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cartao);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
          >
            <Edit2 size={16} />
            <span className="text-sm">Editar</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                window.confirm(
                  `Tem certeza que deseja excluir o cartão "${cartao.nome}"? Todas as transações serão removidas.`
                )
              ) {
                onDelete(cartao);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 bg-opacity-80 hover:bg-opacity-100 rounded-lg transition-all"
          >
            <Trash2 size={16} />
            <span className="text-sm">Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
