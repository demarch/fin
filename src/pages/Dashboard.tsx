import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, BarChart3, Inbox } from 'lucide-react';
import { useCashFlowStore } from '../store/cashFlowStore';
import { useLoansStore } from '../store/loansStore';
import { formatCurrency, formatMonthString } from '../utils/formatters';
import { calculateMonthTotalsUpToDay } from '../utils/calculations';
import SummaryCard from '../components/dashboard/SummaryCard';
import Card from '../components/common/Card';
import { SkeletonCard, EmptyState } from '../components/common';

export default function Dashboard() {
  const { months, currentMonth, initializeMonth, setCurrentMonth } = useCashFlowStore();
  const { getTotalRemainingAmount } = useLoansStore();
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 GARANTIR que sempre mostra dados do mês atual
  useEffect(() => {
    const mesAtual = formatMonthString(new Date());
    // console.log('[Dashboard] 🗓️ Componente montado - Verificando mês atual:', mesAtual);
    // console.log('[Dashboard] 📅 Mês no store:', currentMonth);

    if (currentMonth !== mesAtual) {
      // console.log('[Dashboard] ⚠️ Mês diferente do atual! Atualizando para:', mesAtual);
      setCurrentMonth(mesAtual);
    }
  }, []); // Executar apenas uma vez ao montar

  useEffect(() => {
    initializeMonth(currentMonth);
    // Simulate loading time for better UX feedback
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [currentMonth, initializeMonth]);

  const monthData = months[currentMonth];
  const totalLoansRemaining = getTotalRemainingAmount();

  // Calcular dados apenas até o dia atual
  const currentDayTotals = useMemo(() => {
    if (!monthData) {
      return { totalEntradas: 0, totalSaidas: 0, saldoFinal: 0 };
    }

    const today = new Date();
    const [currentYear, currentMonthNum] = currentMonth.split('-').map(Number);
    const isCurrentMonth =
      today.getFullYear() === currentYear &&
      (today.getMonth() + 1) === currentMonthNum;

    // Se for o mês atual, calcular apenas até hoje
    // Se for mês passado, usar todos os dados do mês
    // Se for mês futuro, mostrar zero
    if (isCurrentMonth) {
      const currentDay = today.getDate();
      return calculateMonthTotalsUpToDay(monthData.entries, currentDay);
    } else if (currentYear < today.getFullYear() ||
               (currentYear === today.getFullYear() && currentMonthNum < (today.getMonth() + 1))) {
      // Mês passado - usar todos os dados
      return monthData.totals;
    } else {
      // Mês futuro - retornar zeros
      return { totalEntradas: 0, totalSaidas: 0, saldoFinal: 0 };
    }
  }, [monthData, currentMonth]);

  // Calculate available for investment (8.1% of income as per spreadsheet)
  const investmentPercentage = 8.1;
  const totalEntradas = currentDayTotals.totalEntradas;
  const availableForInvestment = (totalEntradas * investmentPercentage) / 100;

  // Calculate performance (entradas - saidas)
  const performance = useMemo(
    () => currentDayTotals.totalEntradas - currentDayTotals.totalSaidas,
    [currentDayTotals]
  );

  // Get last 6 months for trend (memoized to avoid recalculation)
  const last6Months = useMemo(
    () =>
      Object.keys(months)
        .sort()
        .slice(-6)
        .map((key) => ({
          month: months[key].monthName,
          saldo: months[key].totals.saldoFinal,
          entradas: months[key].totals.totalEntradas,
          saidas: months[key].totals.totalSaidas,
        })),
    [months]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Visão geral das suas finanças pessoais
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Saldo Atual"
            value={formatCurrency(currentDayTotals.saldoFinal)}
            icon={<DollarSign className="h-6 w-6" />}
            color={currentDayTotals.saldoFinal >= 0 ? 'green' : 'red'}
          />

          <SummaryCard
            title="Entradas do Mês"
            value={formatCurrency(currentDayTotals.totalEntradas)}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />

          <SummaryCard
            title="Saídas do Mês"
            value={formatCurrency(currentDayTotals.totalSaidas)}
            icon={<TrendingDown className="h-6 w-6" />}
            color="red"
          />

          <SummaryCard
            title="Performance do Mês"
            value={formatCurrency(performance)}
            icon={<BarChart3 className="h-6 w-6" />}
            color={performance >= 0 ? 'green' : 'red'}
            subtitle={performance >= 0 ? 'Positivo' : 'Negativo'}
          />

          <SummaryCard
            title="Total em Empréstimos"
            value={formatCurrency(totalLoansRemaining)}
            icon={<CreditCard className="h-6 w-6" />}
            color="yellow"
          />

          <SummaryCard
            title="Disponível para Investimento"
            value={formatCurrency(availableForInvestment)}
            icon={<PiggyBank className="h-6 w-6" />}
            color="blue"
            subtitle={`${investmentPercentage}% das entradas`}
          />
        </div>

        {/* Recent Months Overview */}
        {isLoading ? (
          <SkeletonCard className="mb-8" />
        ) : last6Months.length > 0 ? (
          <Card title="Histórico Recente" subtitle="Últimos 6 meses">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Mês
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Entradas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Saídas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Saldo Final
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {last6Months.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-success">
                        {formatCurrency(month.entradas)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-danger">
                        {formatCurrency(month.saidas)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right font-semibold ${
                          month.saldo >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {formatCurrency(month.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Nenhum histórico disponível"
            description="Comece a registrar suas movimentações para visualizar o histórico."
            action={{
              label: 'Ir para Fluxo de Caixa',
              onClick: () => window.location.href = '/fluxo-caixa',
            }}
          />
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <Card title="Ações Rápidas">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/fluxo-caixa"
                className="flex items-center justify-center px-6 py-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Lançar Movimentação
              </a>

              <a
                href="/emprestimos"
                className="flex items-center justify-center px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Gerenciar Empréstimos
              </a>

              <a
                href="/configuracoes"
                className="flex items-center justify-center px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Configurações
              </a>
            </div>
          </Card>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Dicas Financeiras
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Mantenha sempre um registro diário das suas movimentações</li>
            <li>• Reserve pelo menos 10% da sua renda para investimentos</li>
            <li>• Controle seus empréstimos e tente quitá-los o mais rápido possível</li>
            <li>
              • Use o Fluxo de Caixa para identificar padrões de gastos e economizar
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
