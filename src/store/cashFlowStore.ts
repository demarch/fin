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
        const state = get();
        const monthData = state.months[monthStr];

        if (!monthData) {
          get().initializeMonth(monthStr);
          return get().updateDailyEntry(monthStr, day, field, value);
        }

        // Não permitir atualizar o campo 'saldo' diretamente - ele é calculado
        if (field === 'saldo') {
          return;
        }

        // Atualizar apenas o campo específico do dia específico
        const updatedEntries = monthData.entries.map((entry) => {
          if (entry.day === day) {
            return {
              ...entry,
              [field]: value,
            };
          }
          return entry;
        });

        // Recalcular saldos a partir do saldo inicial do mês
        const saldoInicial = get().getSaldoInicial(monthStr);
        const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

        // Atualizar o mês atual
        set((state) => ({
          months: {
            ...state.months,
            [monthStr]: {
              ...monthData,
              entries: entriesWithSaldo,
              totals,
            },
          },
        }));

        // Recalcular todos os meses subsequentes
        const recalculateNextMonths = (currentMonthStr: string, currentSaldoFinal: number) => {
          const date = new Date(currentMonthStr + '-01');
          date.setMonth(date.getMonth() + 1);
          const nextMonthStr = formatMonthString(date);

          const nextMonthData = get().months[nextMonthStr];
          if (nextMonthData) {
            const nextEntriesWithSaldo = recalculateMonthSaldos(
              nextMonthData.entries,
              currentSaldoFinal
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
            }));

            // Recursivamente recalcular o próximo mês
            recalculateNextMonths(nextMonthStr, nextTotals.saldoFinal);
          }
        };

        recalculateNextMonths(monthStr, totals.saldoFinal);
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
        return prevMonth?.totals.saldoFinal || 0;
      },

      getCurrentMonthData: () => {
        const state = get();
        return state.months[state.currentMonth];
      },
    }),
    {
      name: 'cashflow-storage',
    }
  )
);
