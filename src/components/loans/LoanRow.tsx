import type { Loan } from '../../types/loans';
import { formatCurrency } from '../../utils/formatters';
import { Trash2, Plus } from 'lucide-react';

interface LoanRowProps {
  loan: Loan;
  onDelete: (id: string) => void;
  onPayInstallment: (id: string) => void;
}

export default function LoanRow({ loan, onDelete, onPayInstallment }: LoanRowProps) {
  const progressPercentage = (loan.parcelasPagas / loan.totalParcelas) * 100;
  const isPaidOff = loan.parcelasPagas >= loan.totalParcelas;

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isPaidOff ? 'bg-green-50' : ''}`}>
      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
        {loan.descricao || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
        {formatCurrency(loan.valorParcela)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
        {loan.banco}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
        {loan.totalParcelas}
      </td>
      <td className="px-4 py-3 text-sm text-center border-r border-gray-200">
        <span className={`font-semibold ${isPaidOff ? 'text-success' : 'text-primary'}`}>
          {loan.parcelasPagas}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
        {formatCurrency(loan.valorTotalEmprestimo)}
      </td>
      <td className="px-4 py-3 text-sm text-success border-r border-gray-200">
        {formatCurrency(loan.totalPago)}
      </td>
      <td className="px-4 py-3 text-sm text-danger border-r border-gray-200">
        {formatCurrency(loan.totalAPagar)}
      </td>
      <td className="px-4 py-3 border-r border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${isPaidOff ? 'bg-success' : 'bg-primary'} transition-all`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 w-12 text-right">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center space-x-2">
          {!isPaidOff && (
            <button
              onClick={() => onPayInstallment(loan.id)}
              className="p-1.5 text-primary hover:bg-blue-50 rounded transition-colors"
              title="Pagar Parcela"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(loan.id)}
            className="p-1.5 text-danger hover:bg-red-50 rounded transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
