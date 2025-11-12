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
      // SEMPRE setar para dia 1 antes de avançar o mês
      // Isso evita problemas de overflow (ex: 31/jan + 1 mês = 3/mar)
      next.setDate(1);
      next.setMonth(next.getMonth() + 1);

      if (pattern.useLastDayOfMonth) {
        // Obter o último dia do mês
        const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(lastDay);
      } else if (pattern.dayOfMonth) {
        // Agora sim setar para o dia desejado
        next.setDate(pattern.dayOfMonth);
      }
      break;

    case 'quarterly':
      // SEMPRE setar para dia 1 antes de avançar os meses
      // Isso evita problemas de overflow
      next.setDate(1);
      next.setMonth(next.getMonth() + 3);

      if (pattern.useLastDayOfMonth) {
        // Obter o último dia do mês
        const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(lastDay);
      } else if (pattern.dayOfMonth) {
        // Agora sim setar para o dia desejado
        next.setDate(pattern.dayOfMonth);
      }
      break;

    case 'yearly':
      // SEMPRE setar para dia 1 antes de avançar o ano
      // Isso evita problemas de overflow (ex: 29/fev em ano não bissexto)
      next.setDate(1);
      next.setFullYear(next.getFullYear() + 1);

      if (pattern.useLastDayOfMonth) {
        // Obter o último dia do mês
        const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(lastDay);
      } else if (pattern.dayOfMonth) {
        // Agora sim setar para o dia desejado
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
  console.log(`[Recurrence] 🔄 generateRecurringTransactionsForMonth para ${targetMonth}`, {
    description: baseTransaction.description,
    parentId: parentRecurringId
  });

  if (!baseTransaction.recurrencePattern) {
    console.log(`[Recurrence] ⚠️ Sem padrão de recorrência`);
    return [];
  }

  const pattern = baseTransaction.recurrencePattern;
  console.log(`[Recurrence] Pattern:`, {
    frequency: pattern.frequency,
    startDate: pattern.startDate,
    endDate: pattern.endDate,
    dayOfMonth: pattern.dayOfMonth,
    useLastDayOfMonth: pattern.useLastDayOfMonth
  });

  const [year, month] = targetMonth.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  console.log(`[Recurrence] Período do mês: ${monthStart.toISOString().split('T')[0]} até ${monthEnd.toISOString().split('T')[0]}`);

  const transactions: Transaction[] = [];

  // Data inicial da recorrência
  let currentDate = new Date(pattern.startDate);
  console.log(`[Recurrence] Data inicial: ${currentDate.toISOString()}`);

  // Se useLastDayOfMonth está ativado, ajustar para o último dia do mês da data inicial
  if (pattern.useLastDayOfMonth && ['monthly', 'quarterly', 'yearly'].includes(pattern.frequency)) {
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    currentDate.setDate(lastDay);
    console.log(`[Recurrence] Ajustado para último dia: ${currentDate.toISOString()}`);
  }

  // Se a data inicial é depois do mês alvo, não há transações para gerar
  if (currentDate > monthEnd) {
    console.log(`[Recurrence] ❌ Data inicial depois do mês, retornando vazio`);
    return [];
  }

  // Se a data inicial é antes do início do mês, avançar para a primeira ocorrência no mês
  let iterations = 0;
  while (currentDate < monthStart) {
    const next = getNextOccurrence(currentDate, pattern);
    if (!next) {
      console.log(`[Recurrence] ❌ Sem próxima ocorrência antes do mês, retornando vazio`);
      return []; // Recorrência terminou antes do mês alvo
    }
    currentDate = next;
    iterations++;
  }

  if (iterations > 0) {
    console.log(`[Recurrence] Avançou ${iterations} vezes, agora em: ${currentDate.toISOString().split('T')[0]}`);
  }

  // Gerar transações para o mês
  while (currentDate <= monthEnd) {
    // Verificar se a transação está dentro do período de recorrência
    if (pattern.endDate) {
      const endDate = new Date(pattern.endDate);
      console.log(`[Recurrence] Verificando: currentDate (${currentDate.toISOString().split('T')[0]}) > endDate (${endDate.toISOString().split('T')[0]})? ${currentDate > endDate}`);
      if (currentDate > endDate) {
        console.log(`[Recurrence] ⚠️ Passou da data final, parando`);
        break;
      }
    }

    // Criar transação para esta ocorrência
    console.log(`[Recurrence] ✓ Criando transação para ${currentDate.toISOString().split('T')[0]} (dia ${currentDate.getDate()})`);
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
      console.log(`[Recurrence] ⚠️ Sem próxima ocorrência, parando`);
      break; // Fim da recorrência
    }
    currentDate = next;
  }

  console.log(`[Recurrence] ✅ Total de transações geradas: ${transactions.length}`);
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
