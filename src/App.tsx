import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Dashboard from './pages/Dashboard';
import CashFlow from './pages/CashFlow';
import Loans from './pages/Loans';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fluxo-caixa" element={<CashFlow />} />
          <Route path="/emprestimos" element={<Loans />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
