import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  getMonthName,
  parseMonthString,
  formatMonthString,
  parseCurrency,
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as BRL currency', () => {
      expect(formatCurrency(1000)).toContain('1.000,00');
      expect(formatCurrency(1234.56)).toContain('1.234,56');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toContain('0,00');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-500)).toContain('500,00');
      expect(formatCurrency(-500)).toContain('-');
    });

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(10.5)).toContain('10,50');
      expect(formatCurrency(10.99)).toContain('10,99');
    });
  });

  describe('formatDate', () => {
    it('should format date in pt-BR format (DD/MM/YYYY)', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      expect(formatDate(date)).toBe('15/01/2025');
    });

    it('should handle different months correctly', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      expect(formatDate(date)).toBe('31/12/2025');
    });

    it('should pad single digit days and months', () => {
      const date = new Date(2025, 0, 1); // January 1, 2025
      expect(formatDate(date)).toBe('01/01/2025');
    });
  });

  describe('getMonthName', () => {
    it('should return correct month names in Portuguese', () => {
      expect(getMonthName(0)).toBe('Janeiro');
      expect(getMonthName(1)).toBe('Fevereiro');
      expect(getMonthName(11)).toBe('Dezembro');
    });

    it('should return undefined for invalid month indices', () => {
      expect(getMonthName(-1)).toBeUndefined();
      expect(getMonthName(12)).toBeUndefined();
    });
  });

  describe('parseMonthString', () => {
    it('should parse YYYY-MM string to Date', () => {
      const date = parseMonthString('2025-01');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(1);
    });

    it('should handle different months correctly', () => {
      const date = parseMonthString('2025-12');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(11); // December
    });

    it('should handle leading zeros in month', () => {
      const date = parseMonthString('2025-03');
      expect(date.getMonth()).toBe(2); // March
    });
  });

  describe('formatMonthString', () => {
    it('should format Date to YYYY-MM string', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      expect(formatMonthString(date)).toBe('2025-01');
    });

    it('should pad single digit months with zero', () => {
      const date = new Date(2025, 2, 1); // March 1, 2025
      expect(formatMonthString(date)).toBe('2025-03');
    });

    it('should handle December correctly', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      expect(formatMonthString(date)).toBe('2025-12');
    });
  });

  describe('parseCurrency', () => {
    it('should parse Brazilian currency format', () => {
      expect(parseCurrency('R$ 1.000,00')).toBe(1000);
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56);
    });

    it('should parse simple numbers', () => {
      expect(parseCurrency('1000')).toBe(1000);
      expect(parseCurrency('123.45')).toBe(123.45);
    });

    it('should handle empty or whitespace strings', () => {
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency('   ')).toBe(0);
    });

    it('should handle negative values', () => {
      expect(parseCurrency('-R$ 500,00')).toBe(-500);
      expect(parseCurrency('-1234.56')).toBe(-1234.56);
    });

    it('should remove non-numeric characters except comma, dot, and minus', () => {
      expect(parseCurrency('R$ 1.000,50')).toBe(1000.5);
      // USD format uses comma as thousands separator, not decimal
      expect(parseCurrency('USD 1234.56')).toBe(1234.56);
    });

    it('should handle comma as decimal separator', () => {
      expect(parseCurrency('1.500,75')).toBe(1500.75);
      expect(parseCurrency('10,5')).toBe(10.5);
    });

    it('should return 0 for invalid input', () => {
      expect(parseCurrency('abc')).toBe(0);
      expect(parseCurrency('invalid')).toBe(0);
    });

    it('should handle values without currency symbols', () => {
      expect(parseCurrency('1500,50')).toBe(1500.5);
      expect(parseCurrency('1500.50')).toBe(1500.5);
    });
  });
});
