import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatMonthString, parseMonthString, getMonthName } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('deve formatar números como moeda brasileira', () => {
      expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000,00/);
      expect(formatCurrency(1234.56)).toMatch(/R\$\s*1\.234,56/);
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
    });

    it('deve formatar números negativos corretamente', () => {
      expect(formatCurrency(-1000)).toMatch(/-R\$\s*1\.000,00/);
      expect(formatCurrency(-1234.56)).toMatch(/-R\$\s*1\.234,56/);
    });

    it('deve lidar com valores decimais pequenos', () => {
      expect(formatCurrency(0.99)).toMatch(/R\$\s*0,99/);
      expect(formatCurrency(0.01)).toMatch(/R\$\s*0,01/);
    });
  });

  describe('formatDate', () => {
    it('deve formatar datas no formato brasileiro', () => {
      const date = new Date(2025, 0, 15); // 15 de Janeiro de 2025
      expect(formatDate(date)).toBe('15/01/2025');
    });

    it('deve adicionar zero à esquerda quando necessário', () => {
      const date = new Date(2025, 0, 1); // 01 de Janeiro de 2025
      expect(formatDate(date)).toBe('01/01/2025');
    });
  });

  describe('formatMonthString', () => {
    it('deve formatar data como YYYY-MM', () => {
      const date = new Date(2025, 0, 15); // Janeiro de 2025
      expect(formatMonthString(date)).toBe('2025-01');
    });

    it('deve adicionar zero à esquerda para meses < 10', () => {
      const date = new Date(2025, 8, 15); // Setembro de 2025
      expect(formatMonthString(date)).toBe('2025-09');
    });

    it('deve formatar corretamente meses >= 10', () => {
      const date = new Date(2025, 11, 15); // Dezembro de 2025
      expect(formatMonthString(date)).toBe('2025-12');
    });
  });

  describe('parseMonthString', () => {
    it('deve converter YYYY-MM para Date', () => {
      const date = parseMonthString('2025-01');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // Janeiro é 0
      expect(date.getDate()).toBe(1); // Dia 1
    });

    it('deve criar data em UTC para evitar problemas de timezone', () => {
      const date = parseMonthString('2025-06');
      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(5); // Junho é 5
    });
  });

  describe('getMonthName', () => {
    it('deve retornar nomes corretos dos meses', () => {
      expect(getMonthName(0)).toBe('Janeiro');
      expect(getMonthName(5)).toBe('Junho');
      expect(getMonthName(11)).toBe('Dezembro');
    });

    it('deve retornar todos os 12 meses', () => {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      months.forEach((month, index) => {
        expect(getMonthName(index)).toBe(month);
      });
    });
  });
});
