import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLoansStore } from '../store/loansStore';
import Card from '../components/common/Card';
import LoanForm from '../components/loans/LoanForm';
import LoanRow from '../components/loans/LoanRow';
import { formatCurrency } from '../utils/formatters';

export default function Loans() {
  const [showForm, setShowForm] = useState(false);

  const {
    loans,
    addLoan,
    deleteLoan,
    payInstallment,
    getTotalLoansAmount,
    getTotalPaidAmount,
    getTotalRemainingAmount,
  } = useLoansStore();

  const handleAddLoan = (loanData: Parameters<typeof addLoan>[0]) => {
    addLoan(loanData);
    setShowForm(false);
  };

  const handleDeleteLoan = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este empréstimo?')) {
      deleteLoan(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Empréstimos</h1>
            <p className="text-gray-600">
              Gerencie seus empréstimos e parcelas
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Empréstimo
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Valor Total Emprestado</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(getTotalLoansAmount())}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Pago</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(getTotalPaidAmount())}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
              <p className="text-2xl font-bold text-danger">
                {formatCurrency(getTotalRemainingAmount())}
              </p>
            </div>
          </Card>
        </div>

        {/* Loans Table */}
        <Card>
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhum empréstimo cadastrado ainda.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="text-primary hover:text-blue-600 font-medium"
              >
                Adicionar primeiro empréstimo
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Valor Parcela
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Banco
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Total Parcelas
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Pagas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Valor Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Total Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      A Pagar
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                      Progresso
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <LoanRow
                      key={loan.id}
                      loan={loan}
                      onDelete={handleDeleteLoan}
                      onPayInstallment={payInstallment}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Use o botão "+" para marcar uma parcela como paga.
            O sistema recalculará automaticamente os valores.
          </p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <LoanForm
          onSubmit={handleAddLoan}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
