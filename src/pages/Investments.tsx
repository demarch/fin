import React, { useState } from 'react';
import { Plus, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { useInvestmentStore } from '../store/investmentStore';
import { InvestmentForm } from '../components/investment/InvestmentForm';
import { InvestmentCard } from '../components/investment/InvestmentCard';
import type { Investment, InvestmentType, InvestmentFilter } from '../types/investment';
import { INVESTMENT_TYPE_LABELS } from '../types/investment';
import { formatCurrency } from '../utils/formatters';
import { removerInvestimento, registrarResgateInvestimento } from '../utils/investmentIntegration';

export const Investments: React.FC = () => {
  const {
    getAllInvestimentos,
    getInvestimentosFiltrados,
    addInvestimento,
    updateInvestimento,
    getSummary,
    getBancosUnicos,
  } = useInvestmentStore();

  const [showForm, setShowForm] = useState(false);
  const [showResgateModal, setShowResgateModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  const [resgatandoInvestment, setResgatandoInvestment] = useState<Investment | undefined>();

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<InvestmentType | ''>('');
  const [filtroBanco, setFiltroBanco] = useState<string>('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativos' | 'resgatados'>('ativos');
  const [showFilters, setShowFilters] = useState(false);

  const bancosUnicos = getBancosUnicos();
  const summary = getSummary();

  // Aplicar filtros
  const filtros: InvestmentFilter = {};
  if (filtroTipo) filtros.tipo = filtroTipo;
  if (filtroBanco) filtros.banco = filtroBanco;
  if (filtroAtivo === 'ativos') filtros.ativo = true;
  if (filtroAtivo === 'resgatados') filtros.ativo = false;

  const investimentos =
    Object.keys(filtros).length > 0 ? getInvestimentosFiltrados(filtros) : getAllInvestimentos();

  const investimentosFiltrados =
    filtroAtivo === 'ativos'
      ? investimentos.filter((i) => i.ativo)
      : filtroAtivo === 'resgatados'
      ? investimentos.filter((i) => !i.ativo)
      : investimentos;

  const handleAddInvestimento = () => {
    setEditingInvestment(undefined);
    setShowForm(true);
  };

  const handleEditInvestimento = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleDeleteInvestimento = (investment: Investment) => {
    if (window.confirm(`Tem certeza que deseja excluir o investimento "${investment.descricao}"? Isso também removerá o lançamento do fluxo de caixa.`)) {
      removerInvestimento(investment.id);
    }
  };

  const handleSubmit = (data: Omit<Investment, 'id' | 'createdAt'>) => {
    if (editingInvestment) {
      updateInvestimento(editingInvestment.id, data);
    } else {
      addInvestimento(data);
    }
    setShowForm(false);
    setEditingInvestment(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvestment(undefined);
  };

  // Modal de Resgate
  const [valorResgate, setValorResgate] = useState('');
  const [dataResgate, setDataResgate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleResgatar = (investment: Investment) => {
    setResgatandoInvestment(investment);
    setValorResgate(investment.valor.toString());
    setDataResgate(new Date().toISOString().split('T')[0]);
    setShowResgateModal(true);
  };

  const handleConfirmarResgate = () => {
    if (!resgatandoInvestment) return;

    const valor = parseFloat(valorResgate);
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, informe um valor válido');
      return;
    }

    registrarResgateInvestimento(resgatandoInvestment.id, valor, new Date(dataResgate).toISOString());
    setShowResgateModal(false);
    setResgatandoInvestment(undefined);
    setValorResgate('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Investimentos</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Filter size={20} />
                Filtros
              </button>
              <button
                onClick={handleAddInvestimento}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Plus size={20} />
                Novo Investimento
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Gerencie seus investimentos e acompanhe seu patrimônio
          </p>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as InvestmentType | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os tipos</option>
                  {Object.entries(INVESTMENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco/Corretora
                </label>
                <select
                  value={filtroBanco}
                  onChange={(e) => setFiltroBanco(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os bancos</option>
                  {bancosUnicos.map((banco) => (
                    <option key={banco} value={banco}>
                      {banco}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filtroAtivo}
                  onChange={(e) =>
                    setFiltroAtivo(e.target.value as 'todos' | 'ativos' | 'resgatados')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ativos">Ativos</option>
                  <option value="resgatados">Resgatados</option>
                  <option value="todos">Todos</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} />
              <span className="text-sm opacity-90">Total Investido</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary.totalInvestido)}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} />
              <span className="text-sm opacity-90">Saldo Investido</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary.saldoInvestido)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} />
              <span className="text-sm opacity-90">Total Resgatado</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary.totalResgatado)}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} />
              <span className="text-sm opacity-90">Investimentos Ativos</span>
            </div>
            <p className="text-3xl font-bold">{summary.quantidadeAtivos}</p>
          </div>
        </div>

        {/* Lista de Investimentos */}
        {investimentosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                  <TrendingUp size={40} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum investimento encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                {filtroTipo || filtroBanco
                  ? 'Tente ajustar os filtros ou adicione um novo investimento'
                  : 'Comece a construir seu patrimônio adicionando seus investimentos'}
              </p>
              <button
                onClick={handleAddInvestimento}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Investimento
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investimentosFiltrados.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onEdit={handleEditInvestimento}
                onDelete={handleDeleteInvestimento}
                onResgatar={investment.ativo ? handleResgatar : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <InvestmentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingInvestment}
        />
      )}

      {/* Modal de Resgate */}
      {showResgateModal && resgatandoInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Resgatar Investimento
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Investimento:</p>
                <p className="font-semibold">{resgatandoInvestment.descricao}</p>
                <p className="text-sm text-gray-500">
                  Valor investido: {formatCurrency(resgatandoInvestment.valor)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Resgate *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={valorResgate}
                    onChange={(e) => setValorResgate(e.target.value)}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data do Resgate *
                </label>
                <input
                  type="date"
                  value={dataResgate}
                  onChange={(e) => setDataResgate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {parseFloat(valorResgate) > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Resultado:</p>
                  <p
                    className={`text-lg font-bold ${
                      parseFloat(valorResgate) >= resgatandoInvestment.valor
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {parseFloat(valorResgate) >= resgatandoInvestment.valor ? '+' : ''}
                    {formatCurrency(
                      parseFloat(valorResgate) - resgatandoInvestment.valor
                    )}{' '}
                    (
                    {(
                      ((parseFloat(valorResgate) - resgatandoInvestment.valor) /
                        resgatandoInvestment.valor) *
                      100
                    ).toFixed(2)}
                    %)
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => setShowResgateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarResgate}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Confirmar Resgate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
