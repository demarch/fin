import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Loan } from '../types/loans';
import { calculateLoanValues } from '../utils/calculations';

interface LoansStore {
  loans: Loan[];

  // Actions
  addLoan: (loan: Omit<Loan, 'id' | 'valorTotalEmprestimo' | 'totalPago' | 'totalAPagar'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  payInstallment: (id: string) => void;
  getTotalLoansAmount: () => number;
  getTotalPaidAmount: () => number;
  getTotalRemainingAmount: () => number;
}

export const useLoansStore = create<LoansStore>()(
  persist(
    (set, get) => ({
      loans: [],

      addLoan: (loanData) => {
        const { valorTotalEmprestimo, totalPago, totalAPagar } = calculateLoanValues(
          loanData.valorParcela,
          loanData.totalParcelas,
          loanData.parcelasPagas
        );

        const newLoan: Loan = {
          ...loanData,
          id: crypto.randomUUID(),
          valorTotalEmprestimo,
          totalPago,
          totalAPagar,
        };

        set((state) => ({
          loans: [...state.loans, newLoan],
        }));
      },

      updateLoan: (id, updates) => {
        set((state) => ({
          loans: state.loans.map((loan) => {
            if (loan.id !== id) return loan;

            const updatedLoan = { ...loan, ...updates };
            const calculatedValues = calculateLoanValues(
              updatedLoan.valorParcela,
              updatedLoan.totalParcelas,
              updatedLoan.parcelasPagas
            );

            return {
              ...updatedLoan,
              ...calculatedValues,
            };
          }),
        }));
      },

      deleteLoan: (id) => {
        set((state) => ({
          loans: state.loans.filter((loan) => loan.id !== id),
        }));
      },

      payInstallment: (id) => {
        get().updateLoan(id, {
          parcelasPagas: (get().loans.find((l) => l.id === id)?.parcelasPagas || 0) + 1,
        });
      },

      getTotalLoansAmount: () => {
        return get().loans.reduce((sum, loan) => sum + loan.valorTotalEmprestimo, 0);
      },

      getTotalPaidAmount: () => {
        return get().loans.reduce((sum, loan) => sum + loan.totalPago, 0);
      },

      getTotalRemainingAmount: () => {
        return get().loans.reduce((sum, loan) => sum + loan.totalAPagar, 0);
      },
    }),
    {
      name: 'loans-storage',
    }
  )
);
