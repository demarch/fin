import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyEntry, MonthlyData, Transaction, TransactionType, RecurrencePattern } from '../types/cashflow';
import {
  recalculateMonthSaldos,
  calculateMonthTotals,
  createEmptyMonthEntries,
  calculateTotalsFromTransactions,
} from '../utils/calculations';
import { formatMonthString, getMonthName, parseMonthString } from '../utils/formatters';
import { generateRecurringTransactionsForMonth, shouldGenerateForMonth } from '../utils/recurrence';

interface CashFlowStore {
  months: Record<string, MonthlyData>;
  currentMonth: string;
  recurringTransactions: Record<string, Transaction>; // Transações recorrentes base (templates)

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
  addTransaction: (
    monthStr: string,
    day: number,
    type: TransactionType,
    description: string,
    amount: number,
    category?: string,
    recurrencePattern?: RecurrencePattern,
    creditCardData?: {
      isCartaoCredito?: boolean;
      cartaoCreditoId?: string;
      creditCardTransactionId?: string;
      isFaturaConsolidada?: boolean;
    },
    investmentData?: {
      isInvestimento?: boolean;
      investmentId?: string;
    }
  ) => void;
  updateTransaction: (monthStr: string, day: number, transactionId: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (monthStr: string, day: number, transactionId: string) => void;

  // Recurring Transaction Actions
  generateRecurringTransactionsForMonth: (monthStr: string) => void;
  getRecurringTransactions: () => Transaction[];
  updateRecurringTransaction: (recurringId: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteRecurringTransaction: (recurringId: string) => void; // Deleta toda a série
  deleteRecurringOccurrence: (monthStr: string, day: number, transactionId: string) => void; // Deleta apenas uma ocorrência
}

export const useCashFlowStore = create<CashFlowStore>()(
  persist(
    (set, get) => {
      // 🔒 GARANTIR que currentMonth seja SEMPRE o mês atual
      const getCurrentMonth = () => {
        const mesAtual = formatMonthString(new Date());
        console.log(`[CashFlow Store] 🗓️ Inicializando com mês atual: ${mesAtual}`);
        return mesAtual;
      };

      return {
      months: {},
      currentMonth: getCurrentMonth(),
      recurringTransactions: {},

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

        // 🔒 USAR parseMonthString para evitar problemas de timezone
        const date = parseMonthString(monthStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = getMonthName(date.getMonth());

        console.log(`[CashFlow] 📅 Inicializando mês ${monthStr}:`, {
          monthStr,
          year,
          month,
          monthName,
          dateCreated: date.toISOString()
        });

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

        // Gerar transações recorrentes para este mês
        get().generateRecurringTransactionsForMonth(monthStr);
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
        // Usar parseMonthString para evitar problemas de timezone
        const date = parseMonthString(monthStr);
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

        // Log para debug de propagação de saldos
        console.log(`[CashFlow] 💰 getSaldoInicial(${monthStr}):`, {
          mesAnterior: prevMonthStr,
          existe: !!prevMonth,
          saldoFinal: prevMonth?.totals.saldoFinal,
          saldoInicial,
          tipo: typeof saldoInicial
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
      addTransaction: (
        monthStr: string,
        day: number,
        type: TransactionType,
        description: string,
        amount: number,
        category?: string,
        recurrencePattern?: RecurrencePattern,
        creditCardData?: {
          isCartaoCredito?: boolean;
          cartaoCreditoId?: string;
          creditCardTransactionId?: string;
          isFaturaConsolidada?: boolean;
        },
        investmentData?: {
          isInvestimento?: boolean;
          investmentId?: string;
        }
      ) => {
        console.log(`[CashFlow] Adicionando transação: ${type} de R$ ${amount} no dia ${day}/${monthStr}${recurrencePattern ? ' (RECORRENTE)' : ''}${creditCardData?.isCartaoCredito ? ' (CARTÃO)' : ''}${investmentData?.isInvestimento ? ' (INVESTIMENTO)' : ''}`);

        const state = get();
        const monthData = state.months[monthStr];

        if (!monthData) {
          console.log(`[CashFlow] Mês ${monthStr} não existe, inicializando...`);
          get().initializeMonth(monthStr);
          // Tentar novamente após inicialização
          requestAnimationFrame(() => {
            get().addTransaction(monthStr, day, type, description, amount, category, recurrencePattern, creditCardData, investmentData);
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
          isRecurring: !!recurrencePattern,
          recurrencePattern,
          // Campos de cartão de crédito
          isCartaoCredito: creditCardData?.isCartaoCredito,
          cartaoCreditoId: creditCardData?.cartaoCreditoId,
          creditCardTransactionId: creditCardData?.creditCardTransactionId,
          isFaturaConsolidada: creditCardData?.isFaturaConsolidada,
          // Campos de investimento
          isInvestimento: investmentData?.isInvestimento,
          investmentId: investmentData?.investmentId,
        };

        // Se for recorrente, armazenar no registro de transações recorrentes
        if (recurrencePattern) {
          console.log(`[CashFlow] 📅 Salvando transação recorrente com ID: ${newTransaction.id}`);
          set((state) => ({
            recurringTransactions: {
              ...state.recurringTransactions,
              [newTransaction.id]: newTransaction,
            },
          }));

          // Gerar transações recorrentes para todos os meses existentes
          const allMonths = Object.keys(get().months);
          allMonths.forEach((month) => {
            if (shouldGenerateForMonth(recurrencePattern, month)) {
              get().generateRecurringTransactionsForMonth(month);
            }
          });

          // Transação recorrente foi salva e gerada - não adicionar manualmente ao dia atual
          return;
        }

        // Atualizar o dia com a nova transação (apenas para transações não-recorrentes)
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

      // Recurring Transaction Actions
      generateRecurringTransactionsForMonth: (monthStr: string) => {
        console.log(`[CashFlow] 📅 Gerando transações recorrentes para o mês ${monthStr}...`);

        const state = get();
        const monthData = state.months[monthStr];

        if (!monthData) {
          console.warn(`[CashFlow] Mês ${monthStr} não existe, não é possível gerar transações recorrentes.`);
          return;
        }

        const recurringTransactions = Object.values(state.recurringTransactions);

        if (recurringTransactions.length === 0) {
          console.log(`[CashFlow] Nenhuma transação recorrente configurada.`);
          return;
        }

        let transactionsAdded = 0;

        // Para cada transação recorrente, gerar ocorrências para este mês
        recurringTransactions.forEach((recurringTx) => {
          if (!recurringTx.recurrencePattern) return;

          // Verificar se deve gerar para este mês
          if (!shouldGenerateForMonth(recurringTx.recurrencePattern, monthStr)) {
            return;
          }

          // Gerar transações para o mês
          const generatedTransactions = generateRecurringTransactionsForMonth(
            recurringTx,
            monthStr,
            recurringTx.id
          );

          // Adicionar cada transação gerada ao dia correspondente
          generatedTransactions.forEach((transaction) => {
            const day = new Date(transaction.createdAt).getUTCDate();

            // Verificar se a transação já existe (evitar duplicatas)
            const dayEntry = monthData.entries.find((e) => e.day === day);
            const alreadyExists = dayEntry?.transactions?.some(
              (t) => t.id === transaction.id
            );

            if (!alreadyExists) {
              // Adicionar a transação ao dia
              const updatedEntries = monthData.entries.map((entry) => {
                if (entry.day === day) {
                  const updatedTransactions = [...(entry.transactions || []), transaction];
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

              // Recalcular saldos
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

              transactionsAdded++;
            }
          });
        });

        console.log(`[CashFlow] ✅ ${transactionsAdded} transações recorrentes geradas para ${monthStr}`);
      },

      getRecurringTransactions: () => {
        const state = get();
        return Object.values(state.recurringTransactions);
      },

      updateRecurringTransaction: (recurringId: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
        console.log(`[CashFlow] 📅 Atualizando transação recorrente ${recurringId}...`);

        const state = get();
        const recurringTx = state.recurringTransactions[recurringId];

        if (!recurringTx) {
          console.error(`[CashFlow] Transação recorrente ${recurringId} não encontrada!`);
          return;
        }

        // Atualizar o template da transação recorrente
        const updatedRecurringTx = {
          ...recurringTx,
          ...updates,
        };

        set((state) => ({
          recurringTransactions: {
            ...state.recurringTransactions,
            [recurringId]: updatedRecurringTx,
          },
        }));

        // Regenerar todas as ocorrências nos meses existentes
        const allMonths = Object.keys(get().months);

        // Primeiro, remover todas as ocorrências antigas desta recorrência
        allMonths.forEach((monthStr) => {
          const monthData = get().months[monthStr];
          if (!monthData) return;

          const updatedEntries = monthData.entries.map((entry) => {
            const filteredTransactions = (entry.transactions || []).filter(
              (t) => t.parentRecurringId !== recurringId
            );

            if (filteredTransactions.length !== entry.transactions?.length) {
              const totals = calculateTotalsFromTransactions(filteredTransactions);
              return {
                ...entry,
                transactions: filteredTransactions,
                entrada: totals.entrada,
                saida: totals.saida,
                diario: totals.diario,
              };
            }

            return entry;
          });

          // Recalcular saldos
          const saldoInicial = get().getSaldoInicial(monthStr);
          const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
          const totals = calculateMonthTotals(entriesWithSaldo);

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
        });

        // Regenerar as ocorrências com os novos dados
        if (updatedRecurringTx.recurrencePattern) {
          allMonths.forEach((monthStr) => {
            if (shouldGenerateForMonth(updatedRecurringTx.recurrencePattern!, monthStr)) {
              get().generateRecurringTransactionsForMonth(monthStr);
            }
          });
        }

        console.log(`[CashFlow] ✅ Transação recorrente ${recurringId} atualizada!`);
      },

      deleteRecurringTransaction: (recurringId: string) => {
        console.log(`[CashFlow] 📅 Deletando série completa da transação recorrente ${recurringId}...`);

        const state = get();
        const recurringTx = state.recurringTransactions[recurringId];

        if (!recurringTx) {
          console.error(`[CashFlow] Transação recorrente ${recurringId} não encontrada!`);
          return;
        }

        // Remover o template da recorrência
        const newRecurringTransactions = { ...state.recurringTransactions };
        delete newRecurringTransactions[recurringId];

        set({ recurringTransactions: newRecurringTransactions });

        // Remover todas as ocorrências geradas desta recorrência
        const allMonths = Object.keys(get().months);

        allMonths.forEach((monthStr) => {
          const monthData = get().months[monthStr];
          if (!monthData) return;

          let hasChanges = false;
          const updatedEntries = monthData.entries.map((entry) => {
            const filteredTransactions = (entry.transactions || []).filter(
              (t) => t.parentRecurringId !== recurringId && t.id !== recurringId
            );

            if (filteredTransactions.length !== entry.transactions?.length) {
              hasChanges = true;
              const totals = calculateTotalsFromTransactions(filteredTransactions);
              return {
                ...entry,
                transactions: filteredTransactions,
                entrada: totals.entrada,
                saida: totals.saida,
                diario: totals.diario,
              };
            }

            return entry;
          });

          if (hasChanges) {
            // Recalcular saldos
            const saldoInicial = get().getSaldoInicial(monthStr);
            const entriesWithSaldo = recalculateMonthSaldos(updatedEntries, saldoInicial);
            const totals = calculateMonthTotals(entriesWithSaldo);

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
          }
        });

        console.log(`[CashFlow] ✅ Série completa da transação recorrente ${recurringId} deletada!`);
      },

      deleteRecurringOccurrence: (monthStr: string, day: number, transactionId: string) => {
        console.log(`[CashFlow] Deletando ocorrência única ${transactionId} no dia ${day}/${monthStr}`);

        // Esta função simplesmente chama deleteTransaction, que já remove uma ocorrência específica
        get().deleteTransaction(monthStr, day, transactionId);
      },
    };
  },
    {
      name: 'cashflow-storage',
      version: 8, // 🔧 VERSÃO 8 - Corrige inicialização do currentMonth para sempre usar mês atual
      // Excluir currentMonth da persistência - sempre usar valor padrão (mês atual)
      partialize: (state: CashFlowStore) => ({
        months: state.months,
        recurringTransactions: state.recurringTransactions,
        // currentMonth não será persistido
      }),
      onRehydrateStorage: () => (state) => {
        // 🔒 FORÇAR currentMonth para o mês atual após carregar do localStorage
        if (state) {
          const mesAtual = formatMonthString(new Date());
          console.log(`[CashFlow Store] 🔄 Após hidratação - Forçando mês atual: ${mesAtual}`);
          console.log(`[CashFlow Store] 📅 Mês que estava no estado: ${state.currentMonth}`);
          state.currentMonth = mesAtual;
          console.log(`[CashFlow Store] ✅ Mês atualizado para: ${state.currentMonth}`);
        }
      },
      migrate: (persistedState: any) => {
        // Migração da versão anterior
        if (persistedState?.months) {
          const LIMITE_ABSURDO = 100000;
          const monthsCorrigidos: Record<string, any> = {};

          Object.entries(persistedState.months).forEach(([monthKey, monthData]: [string, any]) => {
            // Verificar se o mês tem valores absurdos
            const temValorAbsurdo = monthData.entries?.some((e: any) => Math.abs(e.saldo) > LIMITE_ABSURDO) ||
                                   Math.abs(monthData.totals?.saldoFinal || 0) > LIMITE_ABSURDO;

            if (temValorAbsurdo) {
              console.log(`[Migration v8] Mês ${monthKey} com valores absurdos será excluído`);
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

          console.log(`[Migration v8] ✅ Migração concluída. ${Object.keys(monthsCorrigidos).length} meses atualizados.`);
          console.log(`[Migration v8] ⚠️ currentMonth NÃO será persistido - sempre usará mês atual ao inicializar`);

          return {
            months: monthsCorrigidos,
            recurringTransactions: persistedState.recurringTransactions || {},
            // currentMonth será SEMPRE inicializado com o valor padrão (mês atual)
            // NÃO recuperar do persistedState para evitar mostrar mês antigo
          };
        }
        return persistedState;
      },
    }
  )
);
