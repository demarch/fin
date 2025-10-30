import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useCashFlowStore } from '../store/cashFlowStore';
import { formatMonthString, parseMonthString } from '../utils/formatters';
import MonthGrid from '../components/cashflow/MonthGrid';
import Card from '../components/common/Card';

export default function CashFlow() {
  const {
    months,
    currentMonth,
    initializeMonth,
    updateDailyEntry,
    setCurrentMonth,
    getSaldoInicial,
  } = useCashFlowStore();

  const monthData = months[currentMonth];

  useEffect(() => {
    initializeMonth(currentMonth);
  }, [currentMonth, initializeMonth]);

  const handlePreviousMonth = () => {
    const date = parseMonthString(currentMonth);
    date.setMonth(date.getMonth() - 1);
    const newMonth = formatMonthString(date);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const date = parseMonthString(currentMonth);
    date.setMonth(date.getMonth() + 1);
    const newMonth = formatMonthString(date);
    setCurrentMonth(newMonth);
  };

  const handleToday = () => {
    const today = formatMonthString(new Date());
    setCurrentMonth(today);
  };

  const saldoInicial = getSaldoInicial(currentMonth);

  if (!monthData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fluxo de Caixa</h1>
          <p className="text-gray-600">
            Controle suas entradas e saídas diárias
          </p>
        </div>

        {/* Month Navigation */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousMonth}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button>

            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                {monthData.monthName} {monthData.year}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium text-primary bg-blue-50 border border-primary rounded-md hover:bg-blue-100 transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={handleNextMonth}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </Card>

        {/* Saldo Inicial Info */}
        <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-700">
            Saldo Inicial do Mês:
          </span>
          <span
            className={`text-lg font-bold ${
              saldoInicial >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(saldoInicial)}
          </span>
        </div>

        {/* Month Grid */}
        <Card>
          <MonthGrid
            monthData={monthData}
            onUpdateEntry={(day, field, value) =>
              updateDailyEntry(currentMonth, day, field, value)
            }
          />
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Entradas</p>
              <p className="text-2xl font-bold text-success">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(monthData.totals.totalEntradas)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Saídas</p>
              <p className="text-2xl font-bold text-danger">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(monthData.totals.totalSaidas)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Saldo Final</p>
              <p
                className={`text-2xl font-bold ${
                  monthData.totals.saldoFinal >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(monthData.totals.saldoFinal)}
              </p>
            </div>
          </Card>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Dica:</strong> Clique duas vezes em qualquer célula para editar o valor.
            Pressione Enter para salvar ou Esc para cancelar.
          </p>
        </div>
      </div>
    </div>
  );
}
