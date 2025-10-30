import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyEntry, MonthlyData } from '../types/cashflow';
import {
  recalculateMonthSaldos,
  calculateMonthTotals,
  createEmptyMonthEntries,
} from '../utils/calculations';
import { formatMonthString, getMonthName } from '../utils/formatters';

interface CashFlowStore {
  months: Record<string, MonthlyData>;
  currentMonth: string;

  // Actions
  initializeMonth: (monthStr: string) => void;
  updateDailyEntry: (monthStr: string, day: number, field: keyof DailyEntry, value: number) => void;
  setCurrentMonth: (monthStr: string) => void;
  getSaldoInicial: (monthStr: string) => number;
  getCurrentMonthData: () => MonthlyData | undefined;
  clearAllData: () => void;
  deleteMonth: (monthStr: string) => void;
  sanitizeAllMonths: () => void;
}

export const useCashFlowStore = create<CashFlowStore>()(
  persist(
    (set, get) => ({
      months: {},
      currentMonth: formatMonthString(new Date()),

      initializeMonth: (monthStr: string) => {
        const state = get();

        // Se o mês já existe, valida antes de retornar
        if (state.months[monthStr]) {
          const existingMonth = state.months[monthStr];
          const LIMITE_ABSURDO = 100000; // R$ 100 mil

          // Verifica se tem saldos absurdos
          const primeiroSaldo = existingMonth.entries[0]?.saldo || 0;
          const saldoFinal = existingMonth.totals.saldoFinal || 0;

          if (Math.abs(primeiroSaldo) > LIMITE_ABSURDO || Math.abs(saldoFinal) > LIMITE_ABSURDO) {
            console.error(`[CashFlow] 🚨 Mês ${monthStr} existente com saldo absurdo detectado!`);
            console.error(`[CashFlow] Primeiro saldo: ${primeiroSaldo}, Saldo final: ${saldoFinal}`);

            // Recalcula o mês com saldo inicial seguro
            const saldoInicialSeguro = get().getSaldoInicial(monthStr);
            const entriesCorrigidas = recalculateMonthSaldos(
              existingMonth.entries.map(e => ({ ...e })),
              saldoInicialSeguro
            );
            const totalsCorrigidos = calculateMonthTotals(entriesCorrigidas);

            // Atualiza com valores corrigidos
            set((state) => ({
              months: {
                ...state.months,
                [monthStr]: {
                  ...existingMonth,
                  entries: entriesCorrigidas,
                  totals: totalsCorrigidos,
                },
              },
            }));

            console.log(`[CashFlow] ✅ Mês ${monthStr} recalculado automaticamente`);
          }

          return; // Month already exists (e foi validado/corrigido se necessário)
        }

        const date = new Date(monthStr + '-01');
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = getMonthName(date.getMonth());

        const entries = createEmptyMonthEntries(year, month);
        const saldoInicial = get().getSaldoInicial(monthStr);
        const entriesWithSaldo = recalculateMonthSaldos(entries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

        console.log(`[CashFlow] ✅ Mês ${monthStr} inicializado com saldo inicial: R$ ${saldoInicial.toLocaleString('pt-BR')}`);

        set((state) => ({
          months: {
            ...state.months,
            [monthStr]: {
              month: monthStr,
              year,
              monthName,
              entries: entriesWithSaldo,
              totals,
            },
          },
        }));
      },

      updateDailyEntry: (monthStr: string, day: number, field: keyof DailyEntry, value: number) => {
        console.log(`[CashFlow] Atualizando ${field} do dia ${day} do mês ${monthStr} para ${value}`);

        const state = get();
        const monthData = state.months[monthStr];

        if (!monthData) {
          console.log(`[CashFlow] Mês ${monthStr} não existe, inicializando...`);
          get().initializeMonth(monthStr);
          setTimeout(() => {
            get().updateDailyEntry(monthStr, day, field, value);
          }, 0);
          return;
        }

        // Não permitir atualizar o campo 'saldo' diretamente - ele é calculado
        if (field === 'saldo') {
          console.warn('[CashFlow] Tentativa de atualizar campo saldo diretamente - ignorado');
          return;
        }

        // Verificar valor anterior
        const oldEntry = monthData.entries.find(e => e.day === day);
        console.log(`[CashFlow] Valor anterior do dia ${day}:`, oldEntry);

        // Criar nova cópia do array de entradas com a atualização
        const updatedEntries = monthData.entries.map((entry) => {
          if (entry.day === day) {
            // Criar novo objeto com o campo atualizado
            const updated = {
              ...entry,
              [field]: value,
            };
            console.log(`[CashFlow] Dia ${day} atualizado:`, updated);
            return updated;
          }
          // Retornar cópia do entry original
          return { ...entry };
        });

        // Recalcular saldos a partir do saldo inicial do mês
        const saldoInicial = get().getSaldoInicial(monthStr);
        const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

        // Atualizar o estado com os novos dados
        set((state) => ({
          months: {
            ...state.months,
            [monthStr]: {
              ...monthData,
              entries: entriesWithSaldo,
              totals,
            },
          },
        }), false); // false = não substituir o estado inteiro

        // Recalcular meses subsequentes em cascade
        setTimeout(() => {
          const recalculateNextMonth = (currentMonthStr: string) => {
            const currentState = get();
            const currentMonthData = currentState.months[currentMonthStr];

            if (!currentMonthData) return;

            const date = new Date(currentMonthStr + '-01');
            date.setMonth(date.getMonth() + 1);
            const nextMonthStr = formatMonthString(date);
            const nextMonthData = currentState.months[nextMonthStr];

            if (nextMonthData) {
              const nextSaldoInicial = currentMonthData.totals.saldoFinal;
              const nextEntriesWithSaldo = recalculateMonthSaldos(
                nextMonthData.entries.map(e => ({ ...e })),
                nextSaldoInicial
              );
              const nextTotals = calculateMonthTotals(nextEntriesWithSaldo);

              set((state) => ({
                months: {
                  ...state.months,
                  [nextMonthStr]: {
                    ...nextMonthData,
                    entries: nextEntriesWithSaldo,
                    totals: nextTotals,
                  },
                },
              }), false);

              // Continuar para o próximo mês
              recalculateNextMonth(nextMonthStr);
            }
          };

          recalculateNextMonth(monthStr);
        }, 0);
      },

      setCurrentMonth: (monthStr: string) => {
        get().initializeMonth(monthStr);
        set({ currentMonth: monthStr });
      },

      getSaldoInicial: (monthStr: string) => {
        const date = new Date(monthStr + '-01');
        date.setMonth(date.getMonth() - 1);
        const prevMonthStr = formatMonthString(date);

        const prevMonth = get().months[prevMonthStr];
        let saldoInicial = prevMonth?.totals.saldoFinal || 0;

        // 🔒 VALIDAÇÃO RIGOROSA: Detectar e corrigir saldos absurdos
        // Limite reduzido para R$ 100.000 para pegar valores como R$ 6.790.750
        const LIMITE_ABSURDO = 100000; // R$ 100 mil
        if (Math.abs(saldoInicial) > LIMITE_ABSURDO) {
          console.error(`[CashFlow] 🚨 SALDO INICIAL ABSURDO DETECTADO: R$ ${saldoInicial.toLocaleString('pt-BR')}`);
          console.error(`[CashFlow] Mês anterior corrompido: ${prevMonthStr}`);
          console.error(`[CashFlow] 🔧 Forçando saldo inicial para 0 e deletando mês corrompido`);

          // Alertar o usuário
          if (typeof window !== 'undefined') {
            alert(`⚠️ Detectado saldo incorreto de R$ ${Math.abs(saldoInicial).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} vindo de ${prevMonthStr}.\n\nValor será resetado para evitar propagação do erro.`);
          }

          // Deletar mês anterior corrompido
          if (prevMonth) {
            const newMonths = { ...get().months };
            delete newMonths[prevMonthStr];
            set({ months: newMonths });
          }

          saldoInicial = 0;
        }

        // Log detalhado para debug
        if (prevMonth) {
          const ultimoDia = prevMonth.entries[prevMonth.entries.length - 1];
          console.log(`[CashFlow] 📊 getSaldoInicial(${monthStr}):`, {
            mesAnterior: prevMonthStr,
            ultimoDiaMesAnterior: ultimoDia?.day,
            saldoUltimoDia: ultimoDia?.saldo,
            saldoFinalTotals: prevMonth.totals.saldoFinal,
            saldoInicialHerdado: saldoInicial,
            confirmacao: `✅ Dia ${ultimoDia?.day}/${prevMonthStr} (R$ ${ultimoDia?.saldo?.toLocaleString('pt-BR')}) → Dia 1/${monthStr} (R$ ${saldoInicial.toLocaleString('pt-BR')})`
          });
        } else {
          console.log(`[CashFlow] 📊 getSaldoInicial(${monthStr}):`, {
            mesAnterior: prevMonthStr,
            existe: false,
            saldoInicial: 0,
            confirmacao: '✅ Primeiro mês - iniciando com R$ 0'
          });
        }

        return saldoInicial;
      },

      getCurrentMonthData: () => {
        const state = get();
        return state.months[state.currentMonth];
      },

      clearAllData: () => {
        console.log('[CashFlow] Limpando todos os dados...');
        set({
          months: {},
          currentMonth: formatMonthString(new Date()),
        });
        localStorage.removeItem('cashflow-storage');
        console.log('[CashFlow] Dados limpos com sucesso!');
      },

      deleteMonth: (monthStr: string) => {
        console.log(`[CashFlow] Deletando mês ${monthStr}...`);
        const state = get();
        const newMonths = { ...state.months };
        delete newMonths[monthStr];
        set({ months: newMonths });
        console.log(`[CashFlow] Mês ${monthStr} deletado!`);
      },

      sanitizeAllMonths: () => {
        console.log('[CashFlow] 🔧 Iniciando saneamento de todos os meses...');
        const state = get();
        const monthKeys = Object.keys(state.months).sort();

        if (monthKeys.length === 0) {
          console.log('[CashFlow] Nenhum mês para sanear.');
          return;
        }

        const LIMITE_ABSURDO = 100000; // R$ 100 mil (mesmo limite do getSaldoInicial)
        let corrigidos = 0;
        let deletados = 0;

        // Percorrer meses em ordem cronológica
        const newMonths: Record<string, MonthlyData> = {};
        let saldoAcumulado = 0;

        monthKeys.forEach((monthKey) => {
          const monthData = state.months[monthKey];

          // Verificar se o mês tem saldo absurdo
          if (Math.abs(monthData.totals.saldoFinal) > LIMITE_ABSURDO) {
            console.warn(`[CashFlow] ⚠️ Mês ${monthKey} com saldo absurdo (R$ ${monthData.totals.saldoFinal.toLocaleString('pt-BR')}), deletando...`);
            deletados++;
            return; // Pula este mês
          }

          // Recalcular este mês com saldo inicial correto
          const entriesWithSaldo = recalculateMonthSaldos(monthData.entries, saldoAcumulado);
          const totals = calculateMonthTotals(entriesWithSaldo);

          newMonths[monthKey] = {
            ...monthData,
            entries: entriesWithSaldo,
            totals,
          };

          saldoAcumulado = totals.saldoFinal;
          corrigidos++;
        });

        set({ months: newMonths });

        console.log(`[CashFlow] ✅ Saneamento concluído:`);
        console.log(`  - ${corrigidos} meses corrigidos`);
        console.log(`  - ${deletados} meses deletados`);
        console.log(`  - Saldo final acumulado: R$ ${saldoAcumulado.toLocaleString('pt-BR')}`);
      },
    }),
    {
      name: 'cashflow-storage',
      version: 4, // 🔧 VERSÃO 4 - Correção de saldo inicial entre meses + validação rigorosa
    }
  )
);
