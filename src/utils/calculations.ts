import type { DailyEntry } from '../types/cashflow';

/**
 * Calcula o saldo de um dia específico
 * Para o dia 1: saldo = entrada - saida - diario
 * Para demais dias: saldo = saldo_anterior + entrada - saida - diario
 */
export const calculateDailySaldo = (
  day: number,
  entrada: number,
  saida: number,
  diario: number,
  saldoAnterior: number
): number => {
  if (day === 1) {
    return saldoAnterior + entrada - saida - diario;
  }
  return saldoAnterior + entrada - saida - diario;
};

/**
 * Recalcula todos os saldos de um mês
 */
export const recalculateMonthSaldos = (
  entries: DailyEntry[],
  saldoInicial: number
): DailyEntry[] => {
  let currentSaldo = saldoInicial;

  return entries.map((entry) => {
    currentSaldo = currentSaldo + entry.entrada - entry.saida - entry.diario;
    return {
      ...entry,
      saldo: currentSaldo,
    };
  });
};

/**
 * Calcula os totais de um mês
 */
export const calculateMonthTotals = (entries: DailyEntry[]) => {
  const totalEntradas = entries.reduce((sum, entry) => sum + entry.entrada, 0);
  const totalSaidas = entries.reduce((sum, entry) => sum + entry.saida, 0);
  const saldoFinal = entries[entries.length - 1]?.saldo || 0;

  return {
    totalEntradas,
    totalSaidas,
    saldoFinal,
  };
};

/**
 * Cria entradas diárias vazias para um mês
 */
export const createEmptyMonthEntries = (year: number, month: number): DailyEntry[] => {
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    entrada: 0,
    saida: 0,
    diario: 0,
    saldo: 0,
  }));
};

/**
 * Calcula valores do empréstimo
 */
export const calculateLoanValues = (
  valorParcela: number,
  totalParcelas: number,
  parcelasPagas: number
) => {
  const valorTotalEmprestimo = valorParcela * totalParcelas;
  const totalPago = valorParcela * parcelasPagas;
  const totalAPagar = valorTotalEmprestimo - totalPago;

  return {
    valorTotalEmprestimo,
    totalPago,
    totalAPagar,
  };
};
