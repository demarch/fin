import React, { useState } from 'react';
import { useCashFlowStore } from '../../store/cashFlowStore';
import { recalculateMonthSaldos, calculateMonthTotals } from '../../utils/calculations';

export const EmergencyReset: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const store = useCashFlowStore();

  const handleResetCurrentMonth = () => {
    if (!confirm('⚠️ Isso irá recalcular o mês atual com saldo inicial ZERO.\n\nContinuar?')) {
      return;
    }

    const currentMonth = store.currentMonth;
    const currentMonthData = store.months[currentMonth];

    if (!currentMonthData) {
      alert('❌ Mês atual não encontrado!');
      return;
    }

    // Recalcula com saldo ZERO (sem herdar do mês anterior)
    const entriesCorrigidas = recalculateMonthSaldos(
      currentMonthData.entries.map(e => ({ ...e })),
      0 // FORÇA SALDO INICIAL = 0
    );
    const totals = calculateMonthTotals(entriesCorrigidas);

    // Atualiza o estado
    const updatedMonths = {
      ...store.months,
      [currentMonth]: {
        ...currentMonthData,
        entries: entriesCorrigidas,
        totals,
      },
    };

    // Força atualização
    useCashFlowStore.setState({ months: updatedMonths });

    console.log('✅ Mês recalculado com saldo inicial zero:', {
      mes: currentMonth,
      primeiroSaldo: entriesCorrigidas[0]?.saldo,
      saldoFinal: totals.saldoFinal,
    });

    alert(`✅ Mês ${currentMonth} recalculado com sucesso!\n\nPrimeiro saldo: R$ ${entriesCorrigidas[0]?.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    setShowOptions(false);

    // Recarrega a página para garantir atualização visual
    setTimeout(() => window.location.reload(), 500);
  };

  const handleResetAllMonths = () => {
    if (!confirm('⚠️⚠️⚠️ ATENÇÃO ⚠️⚠️⚠️\n\nIsso irá recalcular TODOS os meses começando do zero.\nTodos os saldos serão recalculados em sequência.\n\nContinuar?')) {
      return;
    }

    console.log('🔧 Iniciando reset completo de todos os meses...');

    const monthKeys = Object.keys(store.months).sort();
    const LIMITE_ABSURDO = 100000; // R$ 100 mil

    let deletados = 0;
    let corrigidos = 0;
    let saldoAcumulado = 0;

    const newMonths: Record<string, any> = {};

    monthKeys.forEach((monthKey, index) => {
      const monthData = store.months[monthKey];

      if (!monthData) return;

      // Verificar se tem saldo absurdo inicial
      const primeiroSaldo = monthData.entries[0]?.saldo || 0;
      if (Math.abs(primeiroSaldo) > LIMITE_ABSURDO) {
        console.warn(`⚠️ Mês ${monthKey} com saldo absurdo (${primeiroSaldo}), será deletado`);
        deletados++;
        return; // Pula este mês
      }

      // Recalcula este mês com o saldo acumulado correto
      const entriesCorrigidas = recalculateMonthSaldos(
        monthData.entries.map(e => ({ ...e })),
        saldoAcumulado // Usa o saldo do mês anterior
      );
      const totals = calculateMonthTotals(entriesCorrigidas);

      newMonths[monthKey] = {
        ...monthData,
        entries: entriesCorrigidas,
        totals,
      };

      // Atualiza saldo para próximo mês
      saldoAcumulado = totals.saldoFinal;
      corrigidos++;

      console.log(`✅ Mês ${monthKey} recalculado:`, {
        saldoInicial: index === 0 ? 0 : Object.values(newMonths)[index - 1]?.totals.saldoFinal,
        saldoFinal: totals.saldoFinal,
      });
    });

    // Atualiza estado
    useCashFlowStore.setState({ months: newMonths });

    const mensagem = `✅ Reset completo concluído!\n\n- ${corrigidos} meses recalculados\n- ${deletados} meses deletados\n- Saldo final: R$ ${saldoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    console.log(mensagem);
    alert(mensagem);

    setShowOptions(false);

    // Recarrega a página
    setTimeout(() => window.location.reload(), 500);
  };

  const handleDeleteCorruptedMonths = () => {
    if (!confirm('⚠️ Deletar todos os meses com saldos absurdos (> R$ 100.000)?\n\nEsta ação não pode ser desfeita.')) {
      return;
    }

    const LIMITE_ABSURDO = 100000;
    const monthKeys = Object.keys(store.months);
    let deletados = 0;

    const newMonths: Record<string, any> = {};

    monthKeys.forEach((monthKey) => {
      const monthData = store.months[monthKey];

      if (!monthData) return;

      const saldoFinal = Math.abs(monthData.totals.saldoFinal || 0);
      const primeiroSaldo = Math.abs(monthData.entries[0]?.saldo || 0);

      // Se tem saldo absurdo, deleta
      if (saldoFinal > LIMITE_ABSURDO || primeiroSaldo > LIMITE_ABSURDO) {
        console.warn(`🗑️ Deletando mês corrompido: ${monthKey} (saldo: ${saldoFinal})`);
        deletados++;
      } else {
        // Mantém o mês
        newMonths[monthKey] = monthData;
      }
    });

    useCashFlowStore.setState({ months: newMonths });

    alert(`✅ ${deletados} meses corrompidos deletados!\n\nClique em "Recalcular Todos os Meses" para corrigir os saldos.`);

    setShowOptions(false);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showOptions ? (
        <button
          onClick={() => setShowOptions(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 animate-pulse"
        >
          <span>🚨</span>
          <span>Corrigir Saldo Absurdo</span>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl p-4 border-4 border-red-500 max-w-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-red-600 text-lg">Correções de Emergência</h3>
            <button
              onClick={() => setShowOptions(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Use estas ferramentas se os saldos estiverem absurdos (ex: milhões)
          </p>

          <div className="space-y-2">
            <button
              onClick={handleResetCurrentMonth}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded font-semibold transition-colors"
              title="Recalcula o mês atual começando do zero (sem herdar saldo anterior)"
            >
              🔧 Recalcular Mês Atual
            </button>

            <button
              onClick={handleDeleteCorruptedMonths}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded font-semibold transition-colors"
              title="Remove todos os meses com saldos maiores que R$ 100.000"
            >
              🗑️ Deletar Meses Corrompidos
            </button>

            <button
              onClick={handleResetAllMonths}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold transition-colors"
              title="Recalcula todos os meses em sequência, começando do zero"
            >
              ⚠️ Recalcular TODOS os Meses
            </button>

            <button
              onClick={() => {
                if (confirm('⚠️ Limpar TODOS os dados?\n\nEsta ação não pode ser desfeita!')) {
                  store.clearAllData();
                  alert('✅ Todos os dados foram limpos!');
                  window.location.reload();
                }
              }}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded font-semibold transition-colors"
              title="Remove TODOS os dados do sistema"
            >
              🔥 Limpar Tudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
