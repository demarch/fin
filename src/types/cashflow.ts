export type TransactionType = 'receita' | 'despesa' | 'diario';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  startDate: string; // ISO string
  endDate?: string; // ISO string, opcional (se não informado, recorre indefinidamente)
  dayOfMonth?: number; // Para recorrências mensais, trimestrais e anuais (1-31)
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category?: string;
  createdAt: string; // ISO string
  isRecurring?: boolean; // Indica se é uma transação recorrente
  recurrencePattern?: RecurrencePattern; // Padrão de recorrência
  parentRecurringId?: string; // ID da transação recorrente pai (para transações geradas automaticamente)
}

export interface DailyEntry {
  day: number;
  entrada: number; // Calculado automaticamente das transações
  saida: number; // Calculado automaticamente das transações
  diario: number; // Calculado automaticamente das transações
  saldo: number;
  transactions: Transaction[]; // Array de transações individuais
}

export interface MonthlyData {
  month: string; // Format: "2024-11"
  year: number;
  monthName: string; // Ex: "Novembro"
  entries: DailyEntry[];
  totals: {
    totalEntradas: number;
    totalSaidas: number;
    saldoFinal: number;
  };
}

export interface CashFlowState {
  months: Record<string, MonthlyData>;
  currentMonth: string;
  saldoAnterior: number;
}
