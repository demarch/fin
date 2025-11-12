import { describe, it, expect } from 'vitest';
import {
  createEmptyMonthEntries,
  calculateMonthTotals,
  recalculateMonthSaldos,
  calculateTotalsFromTransactions,
} from '../calculations';
import type { DailyEntry, Transaction } from '../../types/cashflow';

describe('calculations', () => {
  describe('createEmptyMonthEntries', () => {
    it('deve criar 31 entradas para janeiro', () => {
      const entries = createEmptyMonthEntries(2025, 1);
      expect(entries).toHaveLength(31);
      expect(entries[0].day).toBe(1);
      expect(entries[30].day).toBe(31);
    });

    it('deve criar 28 entradas para fevereiro (ano não bissexto)', () => {
      const entries = createEmptyMonthEntries(2025, 2);
      expect(entries).toHaveLength(28);
    });

    it('deve criar 29 entradas para fevereiro (ano bissexto)', () => {
      const entries = createEmptyMonthEntries(2024, 2);
      expect(entries).toHaveLength(29);
    });

    it('deve criar 30 entradas para abril', () => {
      const entries = createEmptyMonthEntries(2025, 4);
      expect(entries).toHaveLength(30);
    });

    it('deve inicializar todas as entradas com zeros', () => {
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

  describe('calculateTotalsFromTransactions', () => {
    it('deve calcular totais com transações de entrada', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'entrada',
          description: 'Salário',
          amount: 5000,
          createdAt: new Date().toISOString(),
        },
      ];

      const totals = calculateTotalsFromTransactions(transactions);
      expect(totals.entrada).toBe(5000);
      expect(totals.saida).toBe(0);
      expect(totals.diario).toBe(0);
    });

    it('deve calcular totais com transações de saída', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'saida',
          description: 'Mercado',
          amount: 200,
          createdAt: new Date().toISOString(),
        },
      ];

      const totals = calculateTotalsFromTransactions(transactions);
      expect(totals.entrada).toBe(0);
      expect(totals.saida).toBe(200);
      expect(totals.diario).toBe(0);
    });

    it('deve calcular totais com transações diárias', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'diario',
          description: 'Almoço',
          amount: 50,
          createdAt: new Date().toISOString(),
        },
      ];

      const totals = calculateTotalsFromTransactions(transactions);
      expect(totals.entrada).toBe(0);
      expect(totals.saida).toBe(0);
      expect(totals.diario).toBe(50);
    });

    it('deve somar múltiplas transações do mesmo tipo', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'entrada',
          description: 'Salário',
          amount: 5000,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'entrada',
          description: 'Freelance',
          amount: 1000,
          createdAt: new Date().toISOString(),
        },
      ];

      const totals = calculateTotalsFromTransactions(transactions);
      expect(totals.entrada).toBe(6000);
    });

    it('deve calcular totais mistos corretamente', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          type: 'entrada',
          description: 'Salário',
          amount: 5000,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'saida',
          description: 'Aluguel',
          amount: 1500,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'diario',
          description: 'Almoço',
          amount: 50,
          createdAt: new Date().toISOString(),
        },
      ];

      const totals = calculateTotalsFromTransactions(transactions);
      expect(totals.entrada).toBe(5000);
      expect(totals.saida).toBe(1500);
      expect(totals.diario).toBe(50);
    });
  });

  describe('recalculateMonthSaldos', () => {
    it('deve calcular saldos diários corretamente', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 5000, saida: 1000, diario: 50, saldo: 0, transactions: [] },
        { day: 2, entrada: 0, saida: 200, diario: 50, saldo: 0, transactions: [] },
        { day: 3, entrada: 1000, saida: 0, diario: 50, saldo: 0, transactions: [] },
      ];

      const saldoInicial = 1000;
      const result = recalculateMonthSaldos(entries, saldoInicial);

      // Dia 1: 1000 + 5000 - 1000 - 50 = 4950
      expect(result[0].saldo).toBe(4950);
      // Dia 2: 4950 + 0 - 200 - 50 = 4700
      expect(result[1].saldo).toBe(4700);
      // Dia 3: 4700 + 1000 - 0 - 50 = 5650
      expect(result[2].saldo).toBe(5650);
    });

    it('deve funcionar com saldo inicial zero', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 1000, saida: 500, diario: 100, saldo: 0, transactions: [] },
      ];

      const result = recalculateMonthSaldos(entries, 0);

      // Dia 1: 0 + 1000 - 500 - 100 = 400
      expect(result[0].saldo).toBe(400);
    });

    it('deve lidar com saldos negativos', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 100, saida: 500, diario: 50, saldo: 0, transactions: [] },
      ];

      const result = recalculateMonthSaldos(entries, 200);

      // Dia 1: 200 + 100 - 500 - 50 = -250
      expect(result[0].saldo).toBe(-250);
    });

    it('deve propagar saldos entre dias', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 1000, saida: 0, diario: 0, saldo: 0, transactions: [] },
        { day: 2, entrada: 0, saida: 0, diario: 0, saldo: 0, transactions: [] },
        { day: 3, entrada: 0, saida: 500, diario: 0, saldo: 0, transactions: [] },
      ];

      const result = recalculateMonthSaldos(entries, 0);

      expect(result[0].saldo).toBe(1000); // 0 + 1000
      expect(result[1].saldo).toBe(1000); // 1000 + 0
      expect(result[2].saldo).toBe(500);  // 1000 - 500
    });
  });

  describe('calculateMonthTotals', () => {
    it('deve calcular totais do mês corretamente', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 5000, saida: 1000, diario: 50, saldo: 3950, transactions: [] },
        { day: 2, entrada: 0, saida: 200, diario: 50, saldo: 3700, transactions: [] },
        { day: 3, entrada: 1000, saida: 0, diario: 50, saldo: 4650, transactions: [] },
      ];

      const totals = calculateMonthTotals(entries);

      expect(totals.totalEntrada).toBe(6000);
      expect(totals.totalSaida).toBe(1200);
      expect(totals.totalDiario).toBe(150);
      expect(totals.saldoFinal).toBe(4650); // Último saldo
    });

    it('deve retornar zeros para array vazio', () => {
      const totals = calculateMonthTotals([]);

      expect(totals.totalEntrada).toBe(0);
      expect(totals.totalSaida).toBe(0);
      expect(totals.totalDiario).toBe(0);
      expect(totals.saldoFinal).toBe(0);
    });

    it('deve calcular saldo final como último saldo do array', () => {
      const entries: DailyEntry[] = [
        { day: 1, entrada: 100, saida: 0, diario: 0, saldo: 100, transactions: [] },
        { day: 2, entrada: 200, saida: 0, diario: 0, saldo: 300, transactions: [] },
        { day: 3, entrada: 0, saida: 150, diario: 0, saldo: 150, transactions: [] },
      ];

      const totals = calculateMonthTotals(entries);
      expect(totals.saldoFinal).toBe(150);
    });
  });
});
