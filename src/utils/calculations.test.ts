import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateTotalsFromTransactions,
  calculateDailySaldo,
  recalculateMonthSaldos,
  calculateMonthTotals,
  calculateMonthTotalsUpToDay,
  createEmptyMonthEntries,
  calculateLoanValues,
  sanitizeAndRecalculate,
} from './calculations';
import type { DailyEntry, Transaction } from '../types/cashflow';

describe('calculations', () => {
  describe('calculateTotalsFromTransactions', () => {
    it('should calculate totals for receita transactions', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Salário', amount: 5000, type: 'receita' },
        { id: '2', date: '2025-01-20', description: 'Freelance', amount: 1000, type: 'receita' },
      ];

      const result = calculateTotalsFromTransactions(transactions);
      expect(result.entrada).toBe(6000);
      expect(result.saida).toBe(0);
      expect(result.diario).toBe(0);
    });

    it('should calculate totals for despesa transactions', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Aluguel', amount: 1500, type: 'despesa' },
        { id: '2', date: '2025-01-20', description: 'Compras', amount: 500, type: 'despesa' },
      ];

      const result = calculateTotalsFromTransactions(transactions);
      expect(result.entrada).toBe(0);
      expect(result.saida).toBe(2000);
      expect(result.diario).toBe(0);
    });

    it('should calculate totals for diario transactions', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Gastos diários', amount: 50, type: 'diario' },
        { id: '2', date: '2025-01-20', description: 'Gastos diários', amount: 75, type: 'diario' },
      ];

      const result = calculateTotalsFromTransactions(transactions);
      expect(result.entrada).toBe(0);
      expect(result.saida).toBe(0);
      expect(result.diario).toBe(125);
    });

    it('should calculate mixed transactions', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Salário', amount: 5000, type: 'receita' },
        { id: '2', date: '2025-01-16', description: 'Aluguel', amount: 1500, type: 'despesa' },
        { id: '3', date: '2025-01-17', description: 'Gastos diários', amount: 50, type: 'diario' },
      ];

      const result = calculateTotalsFromTransactions(transactions);
      expect(result.entrada).toBe(5000);
      expect(result.saida).toBe(1500);
      expect(result.diario).toBe(50);
    });

    it('should handle empty transactions array', () => {
      const result = calculateTotalsFromTransactions([]);
      expect(result.entrada).toBe(0);
      expect(result.saida).toBe(0);
      expect(result.diario).toBe(0);
    });

    it('should round values to 2 decimal places', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Test', amount: 10.555, type: 'receita' },
        { id: '2', date: '2025-01-16', description: 'Test', amount: 20.444, type: 'receita' },
      ];

      const result = calculateTotalsFromTransactions(transactions);
      expect(result.entrada).toBe(31); // 10.555 + 20.444 = 30.999 rounded to 31
    });
  });

  describe('calculateDailySaldo', () => {
    it('should calculate daily saldo correctly', () => {
      const saldo = calculateDailySaldo(1000, 500, 50, 2000);
      expect(saldo).toBe(2450); // 2000 + 1000 - 500 - 50
    });

    it('should handle string inputs', () => {
      const saldo = calculateDailySaldo('1000', '500', '50', '2000');
      expect(saldo).toBe(2450);
    });

    it('should handle zero values', () => {
      const saldo = calculateDailySaldo(0, 0, 0, 1000);
      expect(saldo).toBe(1000);
    });

    it('should handle negative results', () => {
      const saldo = calculateDailySaldo(100, 500, 50, 0);
      expect(saldo).toBe(-450); // 0 + 100 - 500 - 50
    });

    it('should round to 2 decimal places', () => {
      const saldo = calculateDailySaldo(10.555, 5.444, 2.111, 100);
      expect(saldo).toBe(103); // 100 + 10.555 - 5.444 - 2.111 = 103
    });
  });

  describe('recalculateMonthSaldos', () => {
    it('should recalculate saldos for all days', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 1000, saida: 200, diario: 50, saldo: 0, transactions: [] },
        { day: 2, entrada: 500, saida: 100, diario: 30, saldo: 0, transactions: [] },
        { day: 3, entrada: 0, saida: 150, diario: 20, saldo: 0, transactions: [] },
      ];

      const result = recalculateMonthSaldos(entries, 0);

      expect(result[0].saldo).toBe(750); // 0 + 1000 - 200 - 50
      expect(result[1].saldo).toBe(1120); // 750 + 500 - 100 - 30
      expect(result[2].saldo).toBe(950); // 1120 + 0 - 150 - 20
    });

    it('should handle string inputs', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: '1000', saida: '200', diario: '50', saldo: 0, transactions: [] } as any,
      ];

      const result = recalculateMonthSaldos(entries, '0');
      expect(result[0].saldo).toBe(750);
    });

    it('should limit excessive values', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const entries: DailyEntry[] = [
        { day: 1, entrada: 20000000, saida: 0, diario: 0, saldo: 0, transactions: [] },
      ];

      const result = recalculateMonthSaldos(entries, 0);

      // Should limit to max value (10 million)
      expect(result[0].entrada).toBe(10000000);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should preserve transactions array', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Test', amount: 100, type: 'receita' },
      ];

      const entries: DailyEntry[] = [
        { day: 1, entrada: 100, saida: 0, diario: 0, saldo: 0, transactions },
      ];

      const result = recalculateMonthSaldos(entries, 0);
      expect(result[0].transactions).toEqual(transactions);
    });
  });

  describe('calculateMonthTotals', () => {
    it('should calculate month totals correctly', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 1000, saida: 200, diario: 50, saldo: 750, transactions: [] },
        { day: 2, entrada: 500, saida: 100, diario: 30, saldo: 1120, transactions: [] },
        { day: 3, entrada: 300, saida: 150, diario: 20, saldo: 1250, transactions: [] },
      ];

      const result = calculateMonthTotals(entries);
      expect(result.totalEntradas).toBe(1800); // 1000 + 500 + 300
      expect(result.totalSaidas).toBe(450); // 200 + 100 + 150
      expect(result.saldoFinal).toBe(1250);
    });

    it('should handle empty entries', () => {
      const result = calculateMonthTotals([]);
      expect(result.totalEntradas).toBe(0);
      expect(result.totalSaidas).toBe(0);
      expect(result.saldoFinal).toBe(0);
    });
  });

  describe('calculateMonthTotalsUpToDay', () => {
    it('should calculate totals up to specific day', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 1000, saida: 200, diario: 50, saldo: 750, transactions: [] },
        { day: 2, entrada: 500, saida: 100, diario: 30, saldo: 1120, transactions: [] },
        { day: 3, entrada: 300, saida: 150, diario: 20, saldo: 1250, transactions: [] },
      ];

      const result = calculateMonthTotalsUpToDay(entries, 2);
      expect(result.totalEntradas).toBe(1500); // 1000 + 500
      expect(result.totalSaidas).toBe(300); // 200 + 100
      expect(result.saldoFinal).toBe(1120);
    });

    it('should return zeros if upToDay is before first day', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 1000, saida: 200, diario: 50, saldo: 750, transactions: [] },
      ];

      const result = calculateMonthTotalsUpToDay(entries, 0);
      expect(result.totalEntradas).toBe(0);
      expect(result.totalSaidas).toBe(0);
      expect(result.saldoFinal).toBe(0);
    });
  });

  describe('createEmptyMonthEntries', () => {
    it('should create entries for January (31 days)', () => {
      const entries = createEmptyMonthEntries(2025, 1);
      expect(entries).toHaveLength(31);
      expect(entries[0].day).toBe(1);
      expect(entries[30].day).toBe(31);
    });

    it('should create entries for February (28 days)', () => {
      const entries = createEmptyMonthEntries(2025, 2);
      expect(entries).toHaveLength(28);
    });

    it('should create entries for February in leap year (29 days)', () => {
      const entries = createEmptyMonthEntries(2024, 2);
      expect(entries).toHaveLength(29);
    });

    it('should initialize all values to zero', () => {
      const entries = createEmptyMonthEntries(2025, 1);
      entries.forEach(entry => {
        expect(entry.entrada).toBe(0);
        expect(entry.saida).toBe(0);
        expect(entry.diario).toBe(0);
        expect(entry.saldo).toBe(0);
        expect(entry.transactions).toEqual([]);
      });
    });
  });

  describe('calculateLoanValues', () => {
    it('should calculate loan values correctly', () => {
      const result = calculateLoanValues(500, 12, 3);
      expect(result.valorTotalEmprestimo).toBe(6000); // 500 * 12
      expect(result.totalPago).toBe(1500); // 500 * 3
      expect(result.totalAPagar).toBe(4500); // 6000 - 1500
    });

    it('should handle string inputs', () => {
      const result = calculateLoanValues('500', '12', '3');
      expect(result.valorTotalEmprestimo).toBe(6000);
      expect(result.totalPago).toBe(1500);
      expect(result.totalAPagar).toBe(4500);
    });

    it('should handle zero parcelas pagas', () => {
      const result = calculateLoanValues(500, 12, 0);
      expect(result.totalPago).toBe(0);
      expect(result.totalAPagar).toBe(6000);
    });

    it('should handle all parcelas paid', () => {
      const result = calculateLoanValues(500, 12, 12);
      expect(result.totalPago).toBe(6000);
      expect(result.totalAPagar).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const result = calculateLoanValues(333.33, 3, 1);
      expect(result.valorTotalEmprestimo).toBe(999.99);
      expect(result.totalPago).toBe(333.33);
    });
  });

  describe('sanitizeAndRecalculate', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should sanitize and recalculate entries', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: '1000' as any, saida: '200' as any, diario: '50' as any, saldo: 999, transactions: [] },
        { day: 2, entrada: 500, saida: 100, diario: 30, saldo: 888, transactions: [] },
      ];

      const result = sanitizeAndRecalculate(entries, 0);

      expect(result[0].entrada).toBe(1000);
      expect(result[0].saida).toBe(200);
      expect(result[0].diario).toBe(50);
      expect(result[0].saldo).toBe(750); // Recalculated
      expect(result[1].saldo).toBe(1120); // Recalculated
    });

    it('should use zero as default saldo inicial', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 100, saida: 0, diario: 0, saldo: 0, transactions: [] },
      ];

      const result = sanitizeAndRecalculate(entries);
      expect(result[0].saldo).toBe(100);
    });

    it('should preserve transactions', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-01', description: 'Test', amount: 100, type: 'receita' },
      ];

      const entries: DailyEntry[] = [
        { day: 1, entrada: 100, saida: 0, diario: 0, saldo: 0, transactions },
      ];

      const result = sanitizeAndRecalculate(entries, 0);
      expect(result[0].transactions).toEqual(transactions);
    });
  });
});
