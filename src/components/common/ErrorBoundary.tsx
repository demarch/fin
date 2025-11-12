import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Aqui você poderia enviar para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            {/* Ícone de erro */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Ops! Algo deu errado
            </h1>

            {/* Descrição */}
            <p className="text-gray-600 text-center mb-8">
              Encontramos um erro inesperado. Não se preocupe, seus dados estão seguros e salvos no
              navegador.
            </p>

            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-8 bg-gray-100 rounded-lg p-4 overflow-auto max-h-64">
                <h2 className="font-semibold text-gray-900 mb-2">Detalhes do Erro:</h2>
                <pre className="text-sm text-red-600 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Recarregar Página
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                Ir para Início
              </button>
            </div>

            {/* Dicas */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Dicas:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Tente recarregar a página</li>
                <li>Verifique se seus dados estão salvos em "Configurações → Exportar Dados"</li>
                <li>Se o problema persistir, limpe o cache do navegador</li>
                <li>Seus dados financeiros estão salvos localmente e não foram perdidos</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
