import { Download, Upload, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import { useCashFlowStore } from '../store/cashFlowStore';
import { useLoansStore } from '../store/loansStore';

export default function Settings() {
  const cashFlowStore = useCashFlowStore();
  const loansStore = useLoansStore();

  const handleExportData = () => {
    const data = {
      cashFlow: cashFlowStore.months,
      loans: loansStore.loans,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fincontrol-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (
          window.confirm(
            'Importar dados substituirá todos os dados atuais. Deseja continuar?'
          )
        ) {
          // Import cashflow data
          if (data.cashFlow) {
            Object.keys(data.cashFlow).forEach((month) => {
              cashFlowStore.months[month] = data.cashFlow[month];
            });
          }

          // Import loans data
          if (data.loans) {
            loansStore.loans.splice(0, loansStore.loans.length, ...data.loans);
          }

          alert('Dados importados com sucesso!');
          window.location.reload();
        }
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está correto.');
        // console.error(error);
      }
    };

    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'ATENÇÃO: Esta ação irá apagar TODOS os dados. Esta ação não pode ser desfeita. Deseja continuar?'
      )
    ) {
      if (
        window.confirm(
          'Tem ABSOLUTA CERTEZA? Todos os dados de Fluxo de Caixa e Empréstimos serão perdidos!'
        )
      ) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">
            Gerencie suas configurações e dados do sistema
          </p>
        </div>

        {/* Backup and Restore */}
        <Card title="Backup e Restauração" className="mb-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Exportar Dados
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Faça backup de todos os seus dados em formato JSON
              </p>
              <button
                onClick={handleExportData}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </button>
            </div>

            <hr className="my-4" />

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Importar Dados
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Restaure seus dados de um arquivo de backup
              </p>
              <label className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer inline-flex">
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card title="Zona de Perigo" className="border-red-300">
          <div>
            <h4 className="text-sm font-semibold text-danger mb-2">
              Apagar Todos os Dados
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Esta ação irá remover PERMANENTEMENTE todos os dados do sistema.
              Esta ação não pode ser desfeita!
            </p>
            <button
              onClick={handleClearData}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-md hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Apagar Todos os Dados
            </button>
          </div>
        </Card>

        {/* System Info */}
        <Card title="Informações do Sistema" className="mt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Versão:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Armazenamento:</span>
              <span className="font-medium">LocalStorage (Navegador)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Framework:</span>
              <span className="font-medium">React 18 + TypeScript</span>
            </div>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Importante:</strong> Todos os dados são armazenados localmente
            no seu navegador. Faça backups regulares para não perder suas informações.
          </p>
        </div>
      </div>
    </div>
  );
}
