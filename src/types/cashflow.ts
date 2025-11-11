export type TransactionType = 'receita' | 'despesa' | 'diario';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category?: string;
  createdAt: string; // ISO string
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
