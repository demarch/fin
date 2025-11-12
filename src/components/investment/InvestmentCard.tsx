import React from 'react';
import { Edit2, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import type { Investment } from '../../types/investment';
import { INVESTMENT_TYPE_LABELS, INVESTMENT_TYPE_COLORS } from '../../types/investment';
import { formatCurrency } from '../../utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvestmentCardProps {
  investment: Investment;
  onEdit: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
  onResgatar?: (investment: Investment) => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onEdit,
  onDelete,
  onResgatar,
}) => {
  const cor = INVESTMENT_TYPE_COLORS[investment.tipo];
  const label = INVESTMENT_TYPE_LABELS[investment.tipo];

  const formatData = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const lucro = investment.valorResgate
    ? investment.valorResgate - investment.valor
    : 0;
  const percentualLucro = investment.valorResgate
    ? ((lucro / investment.valor) * 100).toFixed(2)
    : null;

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
        !investment.ativo ? 'opacity-75' : ''
      }`}
    >
      {/* Header com tipo */}
      <div
        className="px-4 py-3 text-white font-semibold flex items-center justify-between"
        style={{ backgroundColor: cor }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={20} />
          <span>{label}</span>
        </div>
        {!investment.ativo && (
          <span className="bg-white bg-opacity-30 px-2 py-1 rounded text-xs">
            Resgatado
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Descrição e Banco */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {investment.descricao}
          </h3>
          {investment.nomeAcao && (
            <p className="text-sm text-gray-600 font-mono font-bold">
              {investment.nomeAcao}
            </p>
          )}
          <p className="text-sm text-gray-500">{investment.banco}</p>
        </div>

        {/* Valor */}
        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign size={16} className="text-gray-400" />
          <span className="text-2xl font-bold" style={{ color: cor }}>
            {formatCurrency(investment.valor)}
          </span>
        </div>

        {/* Quantidade e Valor Unitário (se aplicável) */}
        {investment.quantidade && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Quantidade</p>
              <p className="font-semibold">
                {investment.quantidade.toLocaleString('pt-BR', {
                  maximumFractionDigits: 8,
                })}
              </p>
            </div>
            {investment.valorUnitario && (
              <div>
                <p className="text-gray-500">Valor Unit.</p>
                <p className="font-semibold">{formatCurrency(investment.valorUnitario)}</p>
              </div>
            )}
          </div>
        )}

        {/* Taxa (se aplicável) */}
        {investment.taxa && (
          <div className="text-sm">
            <p className="text-gray-500">Taxa de Rentabilidade</p>
            <p className="font-semibold text-green-600">{investment.taxa}% a.a.</p>
          </div>
        )}

        {/* Data */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>Investido em: {formatData(investment.dataInvestimento)}</span>
        </div>

        {/* Vencimento */}
        {investment.vencimento && (
          <div className="text-sm">
            <p className="text-gray-500">Vencimento</p>
            <p className="font-medium">{formatData(investment.vencimento)}</p>
          </div>
        )}

        {/* Resgate (se já resgatado) */}
        {!investment.ativo && investment.valorResgate && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="text-xs text-gray-500">Resgatado em:</p>
            <p className="text-sm font-medium">
              {investment.dataResgate && formatData(investment.dataResgate)}
            </p>
            <p className="text-lg font-bold">{formatCurrency(investment.valorResgate)}</p>
            <p
              className={`text-sm font-semibold ${
                lucro >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {lucro >= 0 ? '+' : ''}
              {formatCurrency(lucro)} ({percentualLucro}%)
            </p>
          </div>
        )}

        {/* Observações */}
        {investment.observacoes && (
          <div className="text-sm text-gray-600 border-t pt-2">
            <p className="italic">{investment.observacoes}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {investment.ativo && onResgatar && (
            <button
              onClick={() => onResgatar(investment)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
            >
              <DollarSign size={16} />
              Resgatar
            </button>
          )}
          <button
            onClick={() => onEdit(investment)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
          >
            <Edit2 size={16} />
            Editar
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Tem certeza que deseja excluir o investimento "${investment.descricao}"?`
                )
              ) {
                onDelete(investment);
              }
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
