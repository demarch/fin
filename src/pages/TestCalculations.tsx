import { useState } from 'react';
import { useCashFlowStore } from '../store/cashFlowStore';
import { formatCurrency } from '../utils/formatters';
import Card from '../components/common/Card';

export default function TestCalculations() {
  const { months, updateDailyEntry, initializeMonth, clearAllData, deleteMonth, getSaldoInicial } = useCashFlowStore();
  const [testMonth] = useState('2025-01');

  // Inicializar mês de teste
  if (!months[testMonth]) {
    initializeMonth(testMonth);
  }

  const monthData = months[testMonth];
  const saldoInicial = getSaldoInicial(testMonth);

  const handleTestEntry = () => {
    console.log('=== INICIANDO TESTE ===');
    // Testar entrada no dia 1
    updateDailyEntry(testMonth, 1, 'entrada', 1000);
    updateDailyEntry(testMonth, 1, 'saida', 200);
    updateDailyEntry(testMonth, 1, 'diario', 50);

    // Testar entrada no dia 2
    updateDailyEntry(testMonth, 2, 'entrada', 500);
    updateDailyEntry(testMonth, 2, 'saida', 100);
    console.log('=== TESTE CONCLUÍDO ===');
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!')) {
      clearAllData();
      window.location.reload();
    }
  };

  const handleDeletePrevMonths = () => {
    if (window.confirm('Deseja deletar todos os meses ANTERIORES a 2025-01?')) {
      Object.keys(months).forEach(monthKey => {
        if (monthKey < '2025-01') {
          deleteMonth(monthKey);
        }
      });
      window.location.reload();
    }
  };

  if (!monthData) {
    return <div>Carregando...</div>;
  }

  const allMonthKeys = Object.keys(months).sort();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Teste de Cálculos</h1>

        {/* Alertas */}
        {saldoInicial > 1000000 && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
            <h3 className="text-red-800 font-bold mb-2">⚠️ SALDO INICIAL ABSURDO DETECTADO!</h3>
            <p className="text-red-700">
              O saldo inicial do mês {testMonth} é {formatCurrency(saldoInicial)}, que parece estar incorreto.
              Isso indica que há dados corrompidos de meses anteriores.
            </p>
            <button
              onClick={handleDeletePrevMonths}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Deletar Meses Anteriores
            </button>
          </div>
        )}

        {/* Controles */}
        <Card className="mb-6">
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleTestEntry}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
            >
              Executar Teste
            </button>

            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Limpar Todos os Dados
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Recarregar Página
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Mês de Teste: {testMonth}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Saldo Inicial:</p>
                <p className={`text-lg font-bold ${saldoInicial >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(saldoInicial)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Entradas:</p>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(monthData.totals.totalEntradas)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Saídas:</p>
                <p className="text-lg font-bold text-danger">
                  {formatCurrency(monthData.totals.totalSaidas)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Final:</p>
                <p className={`text-lg font-bold ${monthData.totals.saldoFinal >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(monthData.totals.saldoFinal)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <h4 className="font-semibold text-sm mb-2">✅ Valores Esperados (se saldo inicial = 0):</h4>
              <ul className="text-sm space-y-1">
                <li>Dia 1: Saldo = 0 + 1000 - 200 - 50 = <strong>R$ 750,00</strong></li>
                <li>Dia 2: Saldo = 750 + 500 - 100 - 0 = <strong>R$ 1.150,00</strong></li>
                <li>Dia 3-31: Saldo = <strong>R$ 1.150,00</strong> (sem movimentação)</li>
                <li>Total Entradas: <strong>R$ 1.500,00</strong></li>
                <li>Total Saídas: <strong>R$ 300,00</strong></li>
                <li>Saldo Final: <strong>R$ 1.150,00</strong></li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Meses Salvos */}
        {allMonthKeys.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-semibold mb-4">Meses Salvos no LocalStorage ({allMonthKeys.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mês</th>
                    <th className="text-right p-2">Entradas</th>
                    <th className="text-right p-2">Saídas</th>
                    <th className="text-right p-2">Saldo Final</th>
                    <th className="text-center p-2">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {allMonthKeys.map(monthKey => {
                    const m = months[monthKey];
                    return (
                      <tr key={monthKey} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{m.monthName} {m.year}</td>
                        <td className="text-right p-2 text-success">
                          {formatCurrency(m.totals.totalEntradas)}
                        </td>
                        <td className="text-right p-2 text-danger">
                          {formatCurrency(m.totals.totalSaidas)}
                        </td>
                        <td className={`text-right p-2 font-semibold ${m.totals.saldoFinal >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(m.totals.saldoFinal)}
                        </td>
                        <td className="text-center p-2">
                          <button
                            onClick={() => {
                              if (window.confirm(`Deletar mês ${monthKey}?`)) {
                                deleteMonth(monthKey);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Detalhes dos Primeiros 10 Dias */}
        <Card>
          <h3 className="font-semibold mb-4">Primeiros 10 dias - Detalhamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Dia</th>
                  <th className="text-right p-2">Entrada</th>
                  <th className="text-right p-2">Saída</th>
                  <th className="text-right p-2">Diário</th>
                  <th className="text-right p-2">Saldo</th>
                  <th className="text-left p-2 text-xs">Cálculo (esperado)</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthData.entries.slice(0, 10).map((entry, idx) => {
                  const saldoAnterior = idx === 0 ? saldoInicial : monthData.entries[idx - 1].saldo;
                  const calculoEsperado = saldoAnterior + entry.entrada - entry.saida - entry.diario;
                  const isCorrect = Math.abs(entry.saldo - calculoEsperado) < 0.01;

                  return (
                    <tr key={entry.day} className={`border-b ${!isCorrect ? 'bg-red-50' : ''}`}>
                      <td className="p-2 font-medium">{entry.day}</td>
                      <td className="text-right p-2 text-success">
                        {formatCurrency(entry.entrada)}
                      </td>
                      <td className="text-right p-2 text-danger">
                        {formatCurrency(entry.saida)}
                      </td>
                      <td className="text-right p-2">
                        {formatCurrency(entry.diario)}
                      </td>
                      <td className={`text-right p-2 font-semibold ${entry.saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(entry.saldo)}
                      </td>
                      <td className="text-xs p-2 text-gray-600 font-mono">
                        {saldoAnterior.toFixed(2)} + {entry.entrada.toFixed(2)} - {entry.saida.toFixed(2)} - {entry.diario.toFixed(2)} = {calculoEsperado.toFixed(2)}
                      </td>
                      <td className="text-center p-2">
                        {isCorrect ? (
                          <span className="text-success text-xl">✓</span>
                        ) : (
                          <span className="text-danger text-xl">✗</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Debug JSON */}
        <Card className="mt-6">
          <h3 className="font-semibold mb-4">Debug: Estado Completo (JSON)</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(monthData, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
