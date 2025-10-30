export interface DailyEntry {
  day: number;
  entrada: number;
  saida: number;
  diario: number;
  saldo: number;
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
