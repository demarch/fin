import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/ToastContainer';
import { useToastStore } from './hooks/useToast';
import Header from './components/common/Header';
import Dashboard from './pages/Dashboard';
import CashFlow from './pages/CashFlow';
import Loans from './pages/Loans';
import { CreditCards } from './pages/CreditCards';
import { Investments } from './pages/Investments';
import Settings from './pages/Settings';
import TestCalculations from './pages/TestCalculations';

function App() {
  const { toasts, removeToast } = useToastStore();

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fluxo-caixa" element={<CashFlow />} />
            <Route path="/emprestimos" element={<Loans />} />
            <Route path="/cartoes" element={<CreditCards />} />
            <Route path="/investimentos" element={<Investments />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/test" element={<TestCalculations />} />
          </Routes>
          <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
