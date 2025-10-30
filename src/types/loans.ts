export interface Loan {
  id: string;
  valorParcela: number;
  banco: string;
  totalParcelas: number;
  parcelasPagas: number;
  dataInicio: Date;
  descricao?: string;
  // Campos calculados:
  valorTotalEmprestimo: number;
  totalPago: number;
  totalAPagar: number;
}

export interface LoansState {
  loans: Loan[];
}
