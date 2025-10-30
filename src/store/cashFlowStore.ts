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
}

export const useCashFlowStore = create<CashFlowStore>()(
  persist(
    (set, get) => ({
      months: {},
      currentMonth: formatMonthString(new Date()),

      initializeMonth: (monthStr: string) => {
        const state = get();

        if (state.months[monthStr]) {
          return; // Month already exists
        }

        const date = new Date(monthStr + '-01');
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = getMonthName(date.getMonth());

        const entries = createEmptyMonthEntries(year, month);
        const saldoInicial = get().getSaldoInicial(monthStr);
        const entriesWithSaldo = recalculateMonthSaldos(entries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

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
        const saldoInicial = prevMonth?.totals.saldoFinal || 0;

        console.log(`[CashFlow] getSaldoInicial(${monthStr}):`, {
          prevMonthStr,
          prevMonthExists: !!prevMonth,
          saldoInicial,
          prevMonthSaldoFinal: prevMonth?.totals.saldoFinal,
        });

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
    }),
    {
      name: 'cashflow-storage',
      version: 1,
    }
  )
);
