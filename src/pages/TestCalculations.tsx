import { useState } from 'react';
import { useCashFlowStore } from '../store/cashFlowStore';
import { formatCurrency } from '../utils/formatters';
import Card from '../components/common/Card';

export default function TestCalculations() {
  const { months, updateDailyEntry, initializeMonth } = useCashFlowStore();
  const [testMonth] = useState('2025-01');

  // Inicializar mês de teste
  if (!months[testMonth]) {
    initializeMonth(testMonth);
  }

  const monthData = months[testMonth];

  const handleTestEntry = () => {
    // Testar entrada no dia 1
    updateDailyEntry(testMonth, 1, 'entrada', 1000);
    updateDailyEntry(testMonth, 1, 'saida', 200);
    updateDailyEntry(testMonth, 1, 'diario', 50);

    // Testar entrada no dia 2
    updateDailyEntry(testMonth, 2, 'entrada', 500);
    updateDailyEntry(testMonth, 2, 'saida', 100);
  };

  if (!monthData) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Teste de Cálculos</h1>

        <Card className="mb-6">
          <button
            onClick={handleTestEntry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
          >
            Executar Teste
          </button>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Mês: {testMonth}</h3>
            <p>Saldo Inicial: {formatCurrency(0)}</p>
            <p>Total Entradas: {formatCurrency(monthData.totals.totalEntradas)}</p>
            <p>Total Saídas: {formatCurrency(monthData.totals.totalSaidas)}</p>
            <p>Saldo Final: {formatCurrency(monthData.totals.saldoFinal)}</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Primeiros 10 dias</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Dia</th>
                <th className="text-right p-2">Entrada</th>
                <th className="text-right p-2">Saída</th>
                <th className="text-right p-2">Diário</th>
                <th className="text-right p-2">Saldo</th>
                <th className="text-left p-2">Cálculo</th>
              </tr>
            </thead>
            <tbody>
              {monthData.entries.slice(0, 10).map((entry, idx) => {
                const saldoAnterior = idx === 0 ? 0 : monthData.entries[idx - 1].saldo;
                const calculoEsperado = saldoAnterior + entry.entrada - entry.saida - entry.diario;

                return (
                  <tr key={entry.day} className="border-b">
                    <td className="p-2">{entry.day}</td>
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
                    <td className="text-xs p-2 text-gray-600">
                      {saldoAnterior.toFixed(2)} + {entry.entrada.toFixed(2)} - {entry.saida.toFixed(2)} - {entry.diario.toFixed(2)} = {calculoEsperado.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="mt-6">
          <h3 className="font-semibold mb-4">Debug: Estado Completo</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(monthData, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
