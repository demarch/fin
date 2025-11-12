import type { RecurrencePattern, Transaction } from '../types/cashflow';

/**
 * Calcula a próxima data de ocorrência baseada no padrão de recorrência
 */
export function getNextOccurrence(
  currentDate: Date,
  pattern: RecurrencePattern
): Date | null {
  const next = new Date(currentDate);

  switch (pattern.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;

    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;

    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;

    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      if (pattern.dayOfMonth) {
        next.setDate(pattern.dayOfMonth);
      }
      break;

    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      if (pattern.dayOfMonth) {
        next.setDate(pattern.dayOfMonth);
      }
      break;

    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      if (pattern.dayOfMonth) {
        next.setDate(pattern.dayOfMonth);
      }
      break;
  }

  // Verificar se passou da data final
  if (pattern.endDate) {
    const endDate = new Date(pattern.endDate);
    if (next > endDate) {
      return null;
    }
  }

  return next;
}

/**
 * Gera todas as ocorrências de uma transação recorrente para um mês específico
 */
export function generateRecurringTransactionsForMonth(
  baseTransaction: Transaction,
  targetMonth: string, // formato: "2024-11"
  parentRecurringId: string
): Transaction[] {
  if (!baseTransaction.recurrencePattern) {
    return [];
  }

  const pattern = baseTransaction.recurrencePattern;
  const [year, month] = targetMonth.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const transactions: Transaction[] = [];

  // Data inicial da recorrência
  let currentDate = new Date(pattern.startDate);

  // Se a data inicial é depois do mês alvo, não há transações para gerar
  if (currentDate > monthEnd) {
    return [];
  }

  // Se a data inicial é antes do início do mês, avançar para a primeira ocorrência no mês
  while (currentDate < monthStart) {
    const next = getNextOccurrence(currentDate, pattern);
    if (!next) {
      return []; // Recorrência terminou antes do mês alvo
    }
    currentDate = next;
  }

  // Gerar transações para o mês
  while (currentDate <= monthEnd) {
    // Verificar se a transação está dentro do período de recorrência
    if (pattern.endDate) {
      const endDate = new Date(pattern.endDate);
      if (currentDate > endDate) {
        break;
      }
    }

    // Criar transação para esta ocorrência
    const transaction: Transaction = {
      id: `${parentRecurringId}-${currentDate.getTime()}`,
      type: baseTransaction.type,
      description: baseTransaction.description,
      amount: baseTransaction.amount,
      category: baseTransaction.category,
      createdAt: currentDate.toISOString(),
      parentRecurringId: parentRecurringId,
    };

    transactions.push(transaction);

    // Calcular próxima ocorrência
    const next = getNextOccurrence(currentDate, pattern);
    if (!next) {
      break; // Fim da recorrência
    }
    currentDate = next;
  }

  return transactions;
}

/**
 * Verifica se uma transação recorrente deve gerar ocorrências em um determinado mês
 */
export function shouldGenerateForMonth(
  pattern: RecurrencePattern,
  targetMonth: string // formato: "2024-11"
): boolean {
  const [year, month] = targetMonth.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const startDate = new Date(pattern.startDate);

  // Recorrência começa depois do mês
  if (startDate > monthEnd) {
    return false;
  }

  // Recorrência termina antes do mês
  if (pattern.endDate) {
    const endDate = new Date(pattern.endDate);
    if (endDate < monthStart) {
      return false;
    }
  }

  return true;
}

/**
 * Calcula o dia do mês onde uma transação recorrente deve ocorrer
 */
export function getDayOfMonthForRecurrence(pattern: RecurrencePattern): number {
  if (!pattern.dayOfMonth) {
    // Para frequências diárias, semanais e quinzenais, usar o dia da data inicial
    const startDate = new Date(pattern.startDate);
    return startDate.getDate();
  }

  return pattern.dayOfMonth;
}

/**
 * Formata a frequência de recorrência para exibição
 */
export function formatRecurrenceFrequency(frequency: RecurrencePattern['frequency']): string {
  const labels = {
    daily: 'Diária',
    weekly: 'Semanal',
    biweekly: 'Quinzenal',
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    yearly: 'Anual',
  };

  return labels[frequency];
}
