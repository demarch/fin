import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Investment, InvestmentType } from '../../types/investment';
import { INVESTMENT_TYPE_LABELS, INVESTMENT_TYPE_COLORS } from '../../types/investment';
import { format } from 'date-fns';

interface InvestmentFormProps {
  onSubmit: (data: Omit<Investment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Investment;
}

const TIPOS_INVESTIMENTO: InvestmentType[] = [
  'acoes',
  'fiis',
  'criptomoedas',
  'renda-fixa',
  'tesouro-direto',
  'cdb',
  'lci-lca',
  'fundos',
  'debentures',
  'coe',
  'previdencia',
  'outro',
];

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [tipo, setTipo] = useState<InvestmentType>(initialData?.tipo || 'acoes');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [banco, setBanco] = useState(initialData?.banco || '');
  const [valor, setValor] = useState(initialData?.valor?.toString() || '');
  const [dataInvestimento, setDataInvestimento] = useState(
    initialData?.dataInvestimento
      ? format(new Date(initialData.dataInvestimento), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );

  // Campos específicos para ações
  const [nomeAcao, setNomeAcao] = useState(initialData?.nomeAcao || '');
  const [quantidade, setQuantidade] = useState(initialData?.quantidade?.toString() || '');
  const [valorUnitario, setValorUnitario] = useState(initialData?.valorUnitario?.toString() || '');

  // Campos opcionais
  const [observacoes, setObservacoes] = useState(initialData?.observacoes || '');
  const [vencimento, setVencimento] = useState(
    initialData?.vencimento ? format(new Date(initialData.vencimento), 'yyyy-MM-dd') : ''
  );
  const [taxa, setTaxa] = useState(initialData?.taxa?.toString() || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tipos que requerem nome do ativo
  const requerNomeAtivo = ['acoes', 'fiis', 'criptomoedas'];
  // Tipos que geralmente têm vencimento
  const permiteVencimento = ['renda-fixa', 'tesouro-direto', 'cdb', 'lci-lca', 'debentures', 'coe'];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!banco.trim()) {
      newErrors.banco = 'Banco/Corretora é obrigatório';
    }

    const valorNum = parseFloat(valor);
    if (!valor || isNaN(valorNum) || valorNum <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!dataInvestimento) {
      newErrors.dataInvestimento = 'Data é obrigatória';
    }

    // Validar campos específicos para ações
    if (requerNomeAtivo.includes(tipo) && !nomeAcao.trim()) {
      newErrors.nomeAcao = `Nome ${tipo === 'acoes' ? 'da ação' : tipo === 'fiis' ? 'do FII' : 'da criptomoeda'} é obrigatório`;
    }

    if (quantidade && quantidade.trim()) {
      const qtd = parseFloat(quantidade);
      if (isNaN(qtd) || qtd <= 0) {
        newErrors.quantidade = 'Quantidade inválida';
      }
    }

    if (valorUnitario && valorUnitario.trim()) {
      const valUnit = parseFloat(valorUnitario);
      if (isNaN(valUnit) || valUnit <= 0) {
        newErrors.valorUnitario = 'Valor unitário inválido';
      }
    }

    if (taxa && taxa.trim()) {
      const taxaNum = parseFloat(taxa);
      if (isNaN(taxaNum)) {
        newErrors.taxa = 'Taxa inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const valorNum = parseFloat(valor);
    const qtd = quantidade ? parseFloat(quantidade) : undefined;
    const valUnit = valorUnitario ? parseFloat(valorUnitario) : undefined;
    const taxaNum = taxa ? parseFloat(taxa) : undefined;

    onSubmit({
      tipo,
      descricao: descricao.trim(),
      banco: banco.trim(),
      valor: valorNum,
      dataInvestimento: new Date(dataInvestimento).toISOString(),
      nomeAcao: requerNomeAtivo.includes(tipo) ? nomeAcao.trim() : undefined,
      quantidade: qtd,
      valorUnitario: valUnit,
      observacoes: observacoes.trim() || undefined,
      vencimento: vencimento ? new Date(vencimento).toISOString() : undefined,
      taxa: taxaNum,
      ativo: initialData?.ativo ?? true,
      dataResgate: initialData?.dataResgate,
      valorResgate: initialData?.valorResgate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? 'Editar Investimento' : 'Novo Investimento'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo de Investimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Investimento *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TIPOS_INVESTIMENTO.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    tipo === t
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    tipo === t
                      ? { backgroundColor: INVESTMENT_TYPE_COLORS[t] }
                      : undefined
                  }
                >
                  {INVESTMENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Tesouro Selic 2029, Ações Vale, Bitcoin"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.descricao ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.descricao && (
              <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Banco/Corretora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco/Corretora *
              </label>
              <input
                type="text"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder="Ex: XP, Nu Invest, Binance"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.banco ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.banco && (
                <p className="text-red-500 text-xs mt-1">{errors.banco}</p>
              )}
            </div>

            {/* Data do Investimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Investimento *
              </label>
              <input
                type="date"
                value={dataInvestimento}
                onChange={(e) => setDataInvestimento(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dataInvestimento ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dataInvestimento && (
                <p className="text-red-500 text-xs mt-1">{errors.dataInvestimento}</p>
              )}
            </div>
          </div>

          {/* Nome do Ativo (para ações, FIIs, cripto) */}
          {requerNomeAtivo.includes(tipo) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tipo === 'acoes' && 'Código da Ação *'}
                {tipo === 'fiis' && 'Código do FII *'}
                {tipo === 'criptomoedas' && 'Nome da Criptomoeda *'}
              </label>
              <input
                type="text"
                value={nomeAcao}
                onChange={(e) => setNomeAcao(e.target.value.toUpperCase())}
                placeholder={
                  tipo === 'acoes'
                    ? 'Ex: PETR4, VALE3'
                    : tipo === 'fiis'
                    ? 'Ex: HGLG11, MXRF11'
                    : 'Ex: BTC, ETH'
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nomeAcao ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nomeAcao && (
                <p className="text-red-500 text-xs mt-1">{errors.nomeAcao}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valor Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Total Investido *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.valor ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.valor && (
                <p className="text-red-500 text-xs mt-1">{errors.valor}</p>
              )}
            </div>

            {/* Quantidade */}
            {requerNomeAtivo.includes(tipo) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="0"
                  step="0.00000001"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quantidade ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantidade && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantidade}</p>
                )}
              </div>
            )}

            {/* Valor Unitário */}
            {requerNomeAtivo.includes(tipo) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Unitário
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={valorUnitario}
                    onChange={(e) => setValorUnitario(e.target.value)}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.valorUnitario ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.valorUnitario && (
                  <p className="text-red-500 text-xs mt-1">{errors.valorUnitario}</p>
                )}
              </div>
            )}
          </div>

          {/* Vencimento e Taxa (para renda fixa) */}
          {permiteVencimento.includes(tipo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Rentabilidade (% a.a.)
                </label>
                <input
                  type="number"
                  value={taxa}
                  onChange={(e) => setTaxa(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.taxa ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.taxa && (
                  <p className="text-red-500 text-xs mt-1">{errors.taxa}</p>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Informações adicionais sobre o investimento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {initialData ? 'Salvar' : 'Adicionar Investimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
