import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyEntry, MonthlyData, Transaction, TransactionType } from '../types/cashflow';
import {
  recalculateMonthSaldos,
  calculateMonthTotals,
  createEmptyMonthEntries,
  calculateTotalsFromTransactions,
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

  // Transaction Actions
  addTransaction: (monthStr: string, day: number, type: TransactionType, description: string, amount: number, category?: string) => void;
  updateTransaction: (monthStr: string, day: number, transactionId: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (monthStr: string, day: number, transactionId: string) => void;
}

export const useCashFlowStore = create<CashFlowStore>()(
  persist(
    (set, get) => ({
      months: {},
      currentMonth: formatMonthString(new Date()),

      initializeMonth: (monthStr: string) => {
        const state = get();

        // Se o mês já existe, SEMPRE valida e recalcula se necessário
        if (state.months[monthStr]) {
          const existingMonth = state.months[monthStr];
          const LIMITE_ABSURDO = 100000; // R$ 100 mil

          // Verifica se tem saldos absurdos em QUALQUER entrada
          const temSaldoAbsurdo = existingMonth.entries.some(e => Math.abs(e.saldo) > LIMITE_ABSURDO);
          const saldoFinalAbsurdo = Math.abs(existingMonth.totals.saldoFinal) > LIMITE_ABSURDO;

          if (temSaldoAbsurdo || saldoFinalAbsurdo) {
            console.error(`[CashFlow] 🚨 Mês ${monthStr} com saldos absurdos detectado!`);
            console.error(`[CashFlow] Alguns saldos:`, existingMonth.entries.slice(0, 3).map(e => e.saldo));
            console.error(`[CashFlow] Saldo final: ${existingMonth.totals.saldoFinal}`);
            console.error(`[CashFlow] 🔧 FORÇANDO RECÁLCULO COMPLETO COM SALDO INICIAL CORRETO`);

            // Obter saldo inicial correto (já validado)
            const saldoInicialSeguro = get().getSaldoInicial(monthStr);

            console.log(`[CashFlow] Saldo inicial seguro obtido: R$ ${saldoInicialSeguro}`);

            // Limpar saldos e recalcular do zero
            const entriesLimpas = existingMonth.entries.map(e => ({
              ...e,
              saldo: 0, // Zerar saldos corrompidos
            }));

            const entriesCorrigidas = recalculateMonthSaldos(entriesLimpas, saldoInicialSeguro);
            const totalsCorrigidos = calculateMonthTotals(entriesCorrigidas);

            // Atualizar com valores corrigidos
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

            console.log(`[CashFlow] ✅ Mês ${monthStr} RECALCULADO:`);
            console.log(`  - Saldo inicial: R$ ${saldoInicialSeguro}`);
            console.log(`  - Novo saldo final: R$ ${totalsCorrigidos.saldoFinal}`);
            console.log(`  - Primeiros saldos:`, entriesCorrigidas.slice(0, 3).map(e => e.saldo));
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
          // Tentar novamente após inicialização
          requestAnimationFrame(() => {
            get().updateDailyEntry(monthStr, day, field, value);
          });
          return;
        }

        // Não permitir atualizar o campo 'saldo' diretamente - ele é calculado
        if (field === 'saldo') {
          console.warn('[CashFlow] Tentativa de atualizar campo saldo diretamente - ignorado');
          return;
        }

        // Validar o valor de entrada
        if (isNaN(value) || !isFinite(value)) {
          console.error(`[CashFlow] Valor inválido: ${value}`);
          return;
        }

        // Limitar valores extremos
        const MAX_ALLOWED_VALUE = 10000000; // 10 milhões
        if (Math.abs(value) > MAX_ALLOWED_VALUE) {
          console.error(`[CashFlow] Valor muito alto: ${value}. Limitando a ${MAX_ALLOWED_VALUE}`);
          value = Math.sign(value) * MAX_ALLOWED_VALUE;
        }

        // Criar nova cópia PROFUNDA das entradas com a atualização
        const updatedEntries = monthData.entries.map((entry) => {
          if (entry.day === day) {
            return {
              day: entry.day,
              entrada: field === 'entrada' ? value : entry.entrada,
              saida: field === 'saida' ? value : entry.saida,
              diario: field === 'diario' ? value : entry.diario,
              saldo: 0, // Será recalculado
              transactions: entry.transactions || [], // Preservar transações
            };
          }
          return {
            day: entry.day,
            entrada: entry.entrada,
            saida: entry.saida,
            diario: entry.diario,
            saldo: 0, // Será recalculado
            transactions: entry.transactions || [], // Preservar transações
          };
        });

        // Recalcular saldos a partir do saldo inicial do mês
        const saldoInicial = get().getSaldoInicial(monthStr);

        console.log(`[CashFlow] Recalculando saldos do mês ${monthStr} com saldo inicial: ${saldoInicial}`);

        const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

        // Verificar se o saldo final é absurdo
        if (Math.abs(totals.saldoFinal) > 100000) {
          console.error(`[CashFlow] 🚨 ALERTA: Saldo final absurdo calculado: ${totals.saldoFinal}`);
          console.error(`[CashFlow] Valores do dia ${day}:`, entriesWithSaldo.find(e => e.day === day));

          // Tentar recalcular com saldo inicial zero
          const entriesRecalculadas = recalculateMonthSaldos(updatedEntries, 0);
          const totalsRecalculados = calculateMonthTotals(entriesRecalculadas);

          set((state) => ({
            months: {
              ...state.months,
              [monthStr]: {
                ...monthData,
                entries: entriesRecalculadas,
                totals: totalsRecalculados,
              },
            },
          }));

          console.log(`[CashFlow] Mês recalculado com saldo inicial 0. Novo saldo final: ${totalsRecalculados.saldoFinal}`);
        } else {
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
          }));

          console.log(`[CashFlow] Dia ${day} atualizado com sucesso. Novo saldo: ${entriesWithSaldo.find(e => e.day === day)?.saldo}`);
        }

        // Recalcular meses subsequentes (sem setTimeout para evitar condições de corrida)
        const recalculateNextMonths = () => {
          let currentMonthStr = monthStr;

          while (true) {
            const currentState = get();
            const currentMonthData = currentState.months[currentMonthStr];

            if (!currentMonthData) break;

            // DEBUG: Verificar conversão de datas
            console.log(`[CashFlow] DEBUG - Criando próxima data a partir de: ${currentMonthStr}`);

            // CORREÇÃO: Usar parseMonthString ao invés de concatenar string
            const [yearStr, monthStr] = currentMonthStr.split('-');
            const year = parseInt(yearStr);
            const month = parseInt(monthStr) - 1; // JavaScript usa meses de 0-11

            const date = new Date(year, month, 1);
            const originalMonth = date.getMonth();
            date.setMonth(date.getMonth() + 1);
            const newMonth = date.getMonth();
            const nextMonthStr = formatMonthString(date);

            console.log(`[CashFlow] DEBUG - Conversão de data:`, {
              currentMonthStr,
              ano: year,
              mes: month + 1,
              mesOriginal: originalMonth,
              mesNovo: newMonth,
              nextMonthStr,
              dateResultante: date.toISOString()
            });

            // Se não conseguiu avançar para o próximo mês, parar o loop
            if (nextMonthStr === currentMonthStr) {
              console.error(`[CashFlow] ERRO: Loop detectado - não conseguiu avançar do mês ${currentMonthStr}`);
              break;
            }

            const nextMonthData = currentState.months[nextMonthStr];

            if (!nextMonthData) break;

            // CORREÇÃO: Garantir conversão para número
            const rawSaldoFinal = currentMonthData.totals.saldoFinal;
            const nextSaldoInicial = typeof rawSaldoFinal === 'string' ? parseFloat(rawSaldoFinal) : Number(rawSaldoFinal);

            console.log(`[CashFlow] DEBUG - Propagando saldo:`, {
              mesAtual: currentMonthStr,
              proximoMes: nextMonthStr,
              saldoFinalBruto: rawSaldoFinal,
              tipoSaldoFinalBruto: typeof rawSaldoFinal,
              saldoFinalConvertido: nextSaldoInicial,
              tipoSaldoFinalConvertido: typeof nextSaldoInicial,
              entriesUltimoDia: currentMonthData.entries[currentMonthData.entries.length - 1]
            });

            // Validar saldo inicial antes de propagar
            if (Math.abs(nextSaldoInicial) > 100000) {
              console.error(`[CashFlow] Bloqueando propagação de saldo absurdo: ${nextSaldoInicial}`);
              console.error(`[CashFlow] Detalhes do mês ${currentMonthStr}:`, {
                totals: currentMonthData.totals,
                ultimaEntry: currentMonthData.entries[currentMonthData.entries.length - 1]
              });
              break;
            }

            const nextEntriesWithSaldo = recalculateMonthSaldos(
              nextMonthData.entries,
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
            }));

            currentMonthStr = nextMonthStr;
          }
        };

        // Executar recálculo dos próximos meses de forma síncrona
        recalculateNextMonths();
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

        // 🔒 VALIDAÇÃO RIGOROSA: Detectar e corrigir saldos absurdos
        // Limite reduzido para R$ 100.000 para pegar valores como R$ 6.790.750
        const LIMITE_ABSURDO = 100000; // R$ 100 mil

        // Primeiro, verificar se o mês anterior tem saldos absurdos
        if (prevMonth) {
          const saldoFinalAbsurdo = Math.abs(prevMonth.totals.saldoFinal) > LIMITE_ABSURDO;
          const algumaEntradaAbsurda = prevMonth.entries.some(e => Math.abs(e.saldo) > LIMITE_ABSURDO);

          if (saldoFinalAbsurdo || algumaEntradaAbsurda) {
            console.error(`[CashFlow] 🚨 MÊS ANTERIOR CORROMPIDO DETECTADO: ${prevMonthStr}`);
            console.error(`[CashFlow] Saldo final absurdo: R$ ${prevMonth.totals.saldoFinal.toLocaleString('pt-BR')}`);
            console.error(`[CashFlow] 🔧 Deletando mês corrompido e retornando saldo inicial ZERO`);

            // Deletar mês corrompido
            const newMonths = { ...get().months };
            delete newMonths[prevMonthStr];
            set({ months: newMonths });

            // Alertar o usuário
            if (typeof window !== 'undefined') {
              alert(`⚠️ Mês ${prevMonthStr} estava corrompido com valores absurdos.\n\n` +
                    `Foi detectado saldo de R$ ${Math.abs(prevMonth.totals.saldoFinal).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}.\n\n` +
                    `O mês foi deletado e o saldo inicial será ZERO.`);
            }

            return 0; // Retornar zero imediatamente
          }
        }

        // Se não há mês anterior ou foi deletado, retornar 0
        let saldoInicial = prevMonth?.totals.saldoFinal || 0;

        // Validação adicional do saldo inicial
        if (Math.abs(saldoInicial) > LIMITE_ABSURDO) {
          console.error(`[CashFlow] 🚨 SALDO INICIAL ABSURDO: R$ ${saldoInicial.toLocaleString('pt-BR')}`);
          saldoInicial = 0;
        }

        // Log apenas em casos específicos de debug (comentado para evitar loops)
        // if (prevMonth) {
        //   const ultimoDia = prevMonth.entries[prevMonth.entries.length - 1];
        //   console.log(`[CashFlow] 📊 getSaldoInicial(${monthStr}):`, {
        //     mesAnterior: prevMonthStr,
        //     ultimoDiaMesAnterior: ultimoDia?.day,
        //     saldoUltimoDia: ultimoDia?.saldo,
        //     saldoFinalTotals: prevMonth.totals.saldoFinal,
        //     saldoInicialHerdado: saldoInicial,
        //     confirmacao: `✅ Dia ${ultimoDia?.day}/${prevMonthStr} (R$ ${ultimoDia?.saldo?.toLocaleString('pt-BR')}) → Dia 1/${monthStr} (R$ ${saldoInicial.toLocaleString('pt-BR')})`
        //   });
        // } else {
        //   console.log(`[CashFlow] 📊 getSaldoInicial(${monthStr}):`, {
        //     mesAnterior: prevMonthStr,
        //     existe: false,
        //     saldoInicial: 0,
        //     confirmacao: '✅ Primeiro mês - iniciando com R$ 0'
        //   });
        // }

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

      // Transaction Actions
      addTransaction: (monthStr: string, day: number, type: TransactionType, description: string, amount: number, category?: string) => {
        console.log(`[CashFlow] Adicionando transação: ${type} de R$ ${amount} no dia ${day}/${monthStr}`);

        const state = get();
        const monthData = state.months[monthStr];

        if (!monthData) {
          console.log(`[CashFlow] Mês ${monthStr} não existe, inicializando...`);
          get().initializeMonth(monthStr);
          // Tentar novamente após inicialização
          requestAnimationFrame(() => {
            get().addTransaction(monthStr, day, type, description, amount, category);
          });
          return;
        }

        // Criar nova transação
        const newTransaction: Transaction = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          description,
          amount,
          category,
          createdAt: new Date().toISOString(),
        };

        // Atualizar o dia com a nova transação
        const updatedEntries = monthData.entries.map((entry) => {
          if (entry.day === day) {
            const updatedTransactions = [...(entry.transactions || []), newTransaction];
            const totals = calculateTotalsFromTransactions(updatedTransactions);

            return {
              ...entry,
              transactions: updatedTransactions,
              entrada: totals.entrada,
              saida: totals.saida,
              diario: totals.diario,
            };
          }
          return entry;
        });

        // Recalcular saldos do mês
        const saldoInicial = get().getSaldoInicial(monthStr);
        const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

        // Atualizar o estado
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

        console.log(`[CashFlow] Transação adicionada com sucesso!`);

        // Recalcular meses subsequentes
        get().updateDailyEntry(monthStr, day, 'entrada', entriesWithSaldo.find(e => e.day === day)!.entrada);
      },

      updateTransaction: (monthStr: string, day: number, transactionId: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
        console.log(`[CashFlow] Atualizando transação ${transactionId} no dia ${day}/${monthStr}`);

        const state = get();
        const monthData = state.months[monthStr];

        if (!monthData) {
          console.error(`[CashFlow] Mês ${monthStr} não existe!`);
          return;
        }

        // Atualizar a transação
        const updatedEntries = monthData.entries.map((entry) => {
          if (entry.day === day) {
            const updatedTransactions = (entry.transactions || []).map((transaction) => {
              if (transaction.id === transactionId) {
                return { ...transaction, ...updates };
              }
              return transaction;
            });

            const totals = calculateTotalsFromTransactions(updatedTransactions);

            return {
              ...entry,
              transactions: updatedTransactions,
              entrada: totals.entrada,
              saida: totals.saida,
              diario: totals.diario,
            };
          }
          return entry;
        });

        // Recalcular saldos do mês
        const saldoInicial = get().getSaldoInicial(monthStr);
        const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

        // Atualizar o estado
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

        console.log(`[CashFlow] Transação atualizada com sucesso!`);
      },

      deleteTransaction: (monthStr: string, day: number, transactionId: string) => {
        console.log(`[CashFlow] Deletando transação ${transactionId} no dia ${day}/${monthStr}`);

        const state = get();
        const monthData = state.months[monthStr];

        if (!monthData) {
          console.error(`[CashFlow] Mês ${monthStr} não existe!`);
          return;
        }

        // Remover a transação
        const updatedEntries = monthData.entries.map((entry) => {
          if (entry.day === day) {
            const updatedTransactions = (entry.transactions || []).filter(
              (transaction) => transaction.id !== transactionId
            );

            const totals = calculateTotalsFromTransactions(updatedTransactions);

            return {
              ...entry,
              transactions: updatedTransactions,
              entrada: totals.entrada,
              saida: totals.saida,
              diario: totals.diario,
            };
          }
          return entry;
        });

        // Recalcular saldos do mês
        const saldoInicial = get().getSaldoInicial(monthStr);
        const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
        const totals = calculateMonthTotals(entriesWithSaldo);

        // Atualizar o estado
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

        console.log(`[CashFlow] Transação deletada com sucesso!`);
      },
    }),
    {
      name: 'cashflow-storage',
      version: 6, // 🔧 VERSÃO 6 - Adiciona suporte a transações individuais por dia
      migrate: (persistedState: any) => {
        // Migração da versão 5 ou anterior
        if (persistedState?.months) {
          const LIMITE_ABSURDO = 100000;
          const monthsCorrigidos: Record<string, any> = {};

          Object.entries(persistedState.months).forEach(([monthKey, monthData]: [string, any]) => {
            // Verificar se o mês tem valores absurdos
            const temValorAbsurdo = monthData.entries?.some((e: any) => Math.abs(e.saldo) > LIMITE_ABSURDO) ||
                                   Math.abs(monthData.totals?.saldoFinal || 0) > LIMITE_ABSURDO;

            if (temValorAbsurdo) {
              console.log(`[Migration v6] Mês ${monthKey} com valores absurdos será excluído`);
              // Não incluir este mês na migração
            } else {
              // Adicionar transactions vazias em todas as entries que não possuem
              const entriesWithTransactions = monthData.entries?.map((entry: any) => ({
                ...entry,
                transactions: entry.transactions || [], // Adicionar array vazio se não existir
              })) || [];

              monthsCorrigidos[monthKey] = {
                ...monthData,
                entries: entriesWithTransactions,
              };
            }
          });

          console.log(`[Migration v6] ✅ Migração concluída. ${Object.keys(monthsCorrigidos).length} meses atualizados com suporte a transações.`);

          return {
            ...persistedState,
            months: monthsCorrigidos,
          };
        }
        return persistedState;
      },
    }
  )
);
