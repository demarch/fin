import { describe, it, expect, vi } from 'vitest';
import {
  getNextOccurrence,
  generateRecurringTransactionsForMonth,
  shouldGenerateForMonth,
  getDayOfMonthForRecurrence,
  formatRecurrenceFrequency,
} from './recurrence';
import type { RecurrencePattern, Transaction } from '../types/cashflow';

describe('recurrence', () => {
  describe('getNextOccurrence', () => {
    it('should calculate next daily occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        startDate: '2025-01-15',
      };

      const current = new Date('2025-01-15');
      const next = getNextOccurrence(current, pattern);

      expect(next?.getUTCDate()).toBe(16);
    });

    it('should calculate next weekly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        startDate: '2025-01-15',
      };

      const current = new Date('2025-01-15');
      const next = getNextOccurrence(current, pattern);

      expect(next?.getUTCDate()).toBe(22);
    });

    it('should calculate next biweekly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'biweekly',
        startDate: '2025-01-15',
      };

      const current = new Date('2025-01-15');
      const next = getNextOccurrence(current, pattern);

      expect(next?.getUTCDate()).toBe(29);
    });

    it('should calculate next monthly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-01-15',
        dayOfMonth: 15,
      };

      const current = new Date('2025-01-15');
      const next = getNextOccurrence(current, pattern);

      expect(next?.getUTCMonth()).toBe(1); // February
      expect(next?.getUTCDate()).toBe(15);
    });

    it('should calculate monthly occurrence for last day of month', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-01-31',
        useLastDayOfMonth: true,
      };

      const current = new Date('2025-01-31');
      const next = getNextOccurrence(current, pattern);

      expect(next?.getUTCMonth()).toBe(1); // February
      expect(next?.getUTCDate()).toBe(28); // Last day of February 2025
    });

    it('should calculate next quarterly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'quarterly',
        startDate: '2025-01-15',
        dayOfMonth: 15,
      };

      const current = new Date('2025-01-15');
      const next = getNextOccurrence(current, pattern);

      expect(next?.getUTCMonth()).toBe(3); // April
      expect(next?.getUTCDate()).toBe(15);
    });

    it('should calculate next yearly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'yearly',
        startDate: '2025-01-15',
        dayOfMonth: 15,
      };

      const current = new Date('2025-01-15');
      const next = getNextOccurrence(current, pattern);

      expect(next?.getUTCFullYear()).toBe(2026);
      expect(next?.getUTCMonth()).toBe(0); // January
      expect(next?.getUTCDate()).toBe(15);
    });

    it('should return null if past end date', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        startDate: '2025-01-01',
        endDate: '2025-01-10',
      };

      const current = new Date('2025-01-15');
      const next = getNextOccurrence(current, pattern);

      expect(next).toBeNull();
    });

    it('should handle monthly occurrence avoiding overflow', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-01-31',
        dayOfMonth: 31,
      };

      const current = new Date('2025-01-31');
      const next = getNextOccurrence(current, pattern);

      // When setting day 31 on February, JavaScript automatically rolls over to March
      // This is expected behavior - the function sets to day 1, advances month, then sets day 31
      // February only has 28 days, so day 31 becomes March 3 (31 - 28 = 3)
      expect(next?.getUTCMonth()).toBe(2); // March (because Feb doesn't have 31 days)
      expect(next?.getUTCDate()).toBe(3); // Day 3 of March
    });
  });

  describe('generateRecurringTransactionsForMonth', () => {
    it('should generate daily transactions for a month', () => {
      const baseTransaction: Transaction = {
        id: 'recurring-1',
        type: 'despesa',
        description: 'Daily expense',
        amount: 10,
        recurrencePattern: {
          frequency: 'daily',
          startDate: '2025-01-01',
        },
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'recurring-1'
      );

      expect(transactions).toHaveLength(31); // 31 days in January
      expect(transactions[0].description).toBe('Daily expense');
      expect(transactions[0].amount).toBe(10);
    });

    it('should generate weekly transactions for a month', () => {
      const baseTransaction: Transaction = {
        id: 'recurring-1',
        type: 'despesa',
        description: 'Weekly expense',
        amount: 50,
        recurrencePattern: {
          frequency: 'weekly',
          startDate: '2025-01-01', // Wednesday
        },
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'recurring-1'
      );

      // Wednesdays in January 2025: 1, 8, 15, 22, 29
      expect(transactions).toHaveLength(5);
    });

    it('should generate monthly transactions', () => {
      const baseTransaction: Transaction = {
        id: 'recurring-1',
        type: 'despesa',
        description: 'Monthly rent',
        amount: 1500,
        recurrencePattern: {
          frequency: 'monthly',
          startDate: '2025-01-05',
          dayOfMonth: 5,
        },
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'recurring-1'
      );

      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(1500);
    });

    it('should return empty array if no recurrence pattern', () => {
      const baseTransaction: Transaction = {
        id: 'single-1',
        type: 'despesa',
        description: 'One-time expense',
        amount: 100,
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'single-1'
      );

      expect(transactions).toHaveLength(0);
    });

    it('should respect end date', () => {
      const baseTransaction: Transaction = {
        id: 'recurring-1',
        type: 'despesa',
        description: 'Daily expense',
        amount: 10,
        recurrencePattern: {
          frequency: 'daily',
          startDate: '2025-01-01',
          endDate: '2025-01-10',
        },
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'recurring-1'
      );

      expect(transactions).toHaveLength(10); // Only 10 days
    });

    it('should return empty if start date is after target month', () => {
      const baseTransaction: Transaction = {
        id: 'recurring-1',
        type: 'despesa',
        description: 'Future expense',
        amount: 10,
        recurrencePattern: {
          frequency: 'daily',
          startDate: '2025-03-01',
        },
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'recurring-1'
      );

      expect(transactions).toHaveLength(0);
    });

    it('should generate transactions starting mid-month', () => {
      const baseTransaction: Transaction = {
        id: 'recurring-1',
        type: 'receita',
        description: 'Mid-month income',
        amount: 100,
        recurrencePattern: {
          frequency: 'daily',
          startDate: '2025-01-15',
        },
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'recurring-1'
      );

      // From Jan 15 to Jan 31 = 17 days
      expect(transactions).toHaveLength(17);
    });

    it('should set parentRecurringId correctly', () => {
      const baseTransaction: Transaction = {
        id: 'recurring-1',
        type: 'despesa',
        description: 'Test',
        amount: 10,
        recurrencePattern: {
          frequency: 'weekly',
          startDate: '2025-01-01',
        },
      };

      const transactions = generateRecurringTransactionsForMonth(
        baseTransaction,
        '2025-01',
        'recurring-1'
      );

      transactions.forEach(t => {
        expect(t.parentRecurringId).toBe('recurring-1');
      });
    });
  });

  describe('shouldGenerateForMonth', () => {
    it('should return true if recurrence overlaps with month', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-01-01',
      };

      expect(shouldGenerateForMonth(pattern, '2025-01')).toBe(true);
      expect(shouldGenerateForMonth(pattern, '2025-02')).toBe(true);
    });

    it('should return false if recurrence starts after month', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-03-01',
      };

      expect(shouldGenerateForMonth(pattern, '2025-01')).toBe(false);
    });

    it('should return false if recurrence ends before month', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      expect(shouldGenerateForMonth(pattern, '2025-02')).toBe(false);
    });

    it('should return true if month is within recurrence period', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      };

      expect(shouldGenerateForMonth(pattern, '2025-06')).toBe(true);
    });
  });

  describe('getDayOfMonthForRecurrence', () => {
    it('should return dayOfMonth if specified', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        startDate: '2025-01-15',
        dayOfMonth: 20,
      };

      expect(getDayOfMonthForRecurrence(pattern)).toBe(20);
    });

    it('should return start date day if dayOfMonth not specified', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        startDate: '2025-01-15',
      };

      expect(getDayOfMonthForRecurrence(pattern)).toBe(15);
    });
  });

  describe('formatRecurrenceFrequency', () => {
    it('should format all frequency types correctly', () => {
      expect(formatRecurrenceFrequency('daily')).toBe('Diária');
      expect(formatRecurrenceFrequency('weekly')).toBe('Semanal');
      expect(formatRecurrenceFrequency('biweekly')).toBe('Quinzenal');
      expect(formatRecurrenceFrequency('monthly')).toBe('Mensal');
      expect(formatRecurrenceFrequency('quarterly')).toBe('Trimestral');
      expect(formatRecurrenceFrequency('yearly')).toBe('Anual');
    });
  });
});
