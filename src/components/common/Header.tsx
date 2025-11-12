import { Link, useLocation } from 'react-router-dom';
import { Wallet, TrendingUp, CreditCard, Settings, Banknote, LineChart } from 'lucide-react';
import { ThemeToggleIcon } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              FinControl
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </Link>

            <Link
              to="/fluxo-caixa"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/fluxo-caixa')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Fluxo de Caixa
            </Link>

            <Link
              to="/emprestimos"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/emprestimos')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Banknote className="h-4 w-4 mr-2" />
              Empréstimos
            </Link>

            <Link
              to="/cartoes"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/cartoes')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cartões
            </Link>

            <Link
              to="/investimentos"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/investimentos')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <LineChart className="h-4 w-4 mr-2" />
              Investimentos
            </Link>

            <Link
              to="/configuracoes"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/configuracoes')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggleIcon />
          </nav>
        </div>
      </div>
    </header>
  );
}
