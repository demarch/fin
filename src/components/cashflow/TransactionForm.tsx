import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { TransactionType, RecurrenceFrequency, RecurrencePattern } from '../../types/cashflow';
import { useCreditCardStore } from '../../store/creditCardStore';

/**
 * Converte uma data no formato "YYYY-MM-DD" (do input type="date") para ISO string
 * em horário local (meia-noite). Isso evita problemas de timezone onde a data pode
 * ser interpretada como o dia anterior ao converter para UTC.
 */
function convertDateToLocalISO(dateString: string): string {
  // Criar data em horário local (não UTC)
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return date.toISOString();
}

interface TransactionFormProps {
  onSubmit: (
    type: TransactionType,
    description: string,
    amount: number,
    category?: string,
    recurrencePattern?: RecurrencePattern,
    creditCardData?: {
      isCartaoCredito: boolean;
      cartaoCreditoId?: string;
      parcelado?: boolean;
      numeroParcelas?: number;
    }
  ) => void;
  onCancel: () => void;
  initialDay?: number; // Dia do mês para sugerir como data inicial
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, initialDay }) => {
  const { getCartoesAtivos } = useCreditCardStore();
  const cartoesAtivos = getCartoesAtivos();

  const [type, setType] = useState<TransactionType>('receita');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [recurrenceStartDate, setRecurrenceStartDate] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(initialDay?.toString() || '1');
  const [useLastDayOfMonth, setUseLastDayOfMonth] = useState(false);

  // Campos de Cartão de Crédito
  const [isCartaoCredito, setIsCartaoCredito] = useState(false);
  const [cartaoCreditoId, setCartaoCreditoId] = useState('');
  const [isParcelado, setIsParcelado] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount.replace(',', '.'));

    if (!description.trim()) {
      alert('Por favor, informe uma descrição');
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Por favor, informe um valor válido');
      return;
    }

    // Validações de cartão de crédito
    if (isCartaoCredito) {
      if (!cartaoCreditoId) {
        alert('Por favor, selecione um cartão de crédito');
        return;
      }

      if (isParcelado) {
        const parcelas = parseInt(numeroParcelas);
        if (isNaN(parcelas) || parcelas < 2 || parcelas > 48) {
          alert('Por favor, informe um número de parcelas válido (2-48)');
          return;
        }
      }

      // Não permitir transação de cartão recorrente ao mesmo tempo
      if (isRecurring) {
        alert('Transações de cartão não podem ser recorrentes. Use o parcelamento para dividir o valor.');
        return;
      }
    }

    // Validações de recorrência
    if (isRecurring) {
      if (!recurrenceStartDate) {
        alert('Por favor, informe a data inicial da recorrência');
        return;
      }

      // Validar dayOfMonth para frequências que precisam (apenas se não for último dia do mês)
      if (['monthly', 'quarterly', 'yearly'].includes(recurrenceFrequency) && !useLastDayOfMonth) {
        const day = parseInt(dayOfMonth);
        if (isNaN(day) || day < 1 || day > 31) {
          alert('Por favor, informe um dia do mês válido (1-31)');
          return;
        }
      }
    }

    // Construir padrão de recorrência se aplicável
    const recurrencePattern: RecurrencePattern | undefined = isRecurring
      ? {
          frequency: recurrenceFrequency,
          startDate: convertDateToLocalISO(recurrenceStartDate),
          endDate: recurrenceEndDate ? convertDateToLocalISO(recurrenceEndDate) : undefined,
          dayOfMonth: ['monthly', 'quarterly', 'yearly'].includes(recurrenceFrequency) && !useLastDayOfMonth
            ? parseInt(dayOfMonth)
            : undefined,
          useLastDayOfMonth: ['monthly', 'quarterly', 'yearly'].includes(recurrenceFrequency) && useLastDayOfMonth
            ? true
            : undefined,
        }
      : undefined;

    // Construir dados de cartão de crédito se aplicável
    const creditCardData = isCartaoCredito
      ? {
          isCartaoCredito: true,
          cartaoCreditoId,
          parcelado: isParcelado,
          numeroParcelas: isParcelado ? parseInt(numeroParcelas) : undefined,
        }
      : undefined;

    onSubmit(type, description.trim(), amountNum, category.trim() || undefined, recurrencePattern, creditCardData);

    // Resetar formulário
    setDescription('');
    setAmount('');
    setCategory('');
    setIsRecurring(false);
    setRecurrenceStartDate('');
    setRecurrenceEndDate('');
    setDayOfMonth(initialDay?.toString() || '1');
    setUseLastDayOfMonth(false);
    setIsCartaoCredito(false);
    setCartaoCreditoId('');
    setIsParcelado(false);
    setNumeroParcelas('1');
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Nova Transação</h3>

        <form onSubmit={handleSubmit}>
          {/* Tipo de Transação */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('receita')}
                className={`flex-1 py-2 px-4 rounded ${
                  type === 'receita'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType('despesa')}
                className={`flex-1 py-2 px-4 rounded ${
                  type === 'despesa'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('diario')}
                className={`flex-1 py-2 px-4 rounded ${
                  type === 'diario'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Diário
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Salário, Conta de luz, Mercado..."
              required
            />
          </div>

          {/* Valor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
              required
            />
          </div>

          {/* Categoria (opcional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria (opcional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Alimentação, Transporte, Lazer..."
            />
          </div>

          {/* Cartão de Crédito (apenas para despesas) */}
          {type === 'despesa' && cartoesAtivos.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCartaoCredito}
                  onChange={(e) => {
                    setIsCartaoCredito(e.target.checked);
                    if (!e.target.checked) {
                      setCartaoCreditoId('');
                      setIsParcelado(false);
                      setNumeroParcelas('1');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Pagar com cartão de crédito
                </span>
              </label>
            </div>
          )}

          {/* Campos de Cartão de Crédito */}
          {isCartaoCredito && (
            <div className="mb-4 p-4 bg-purple-50 rounded border border-purple-200">
              {/* Selecionar Cartão */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o cartão
                </label>
                <select
                  value={cartaoCreditoId}
                  onChange={(e) => setCartaoCreditoId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={isCartaoCredito}
                >
                  <option value="">Selecione um cartão...</option>
                  {cartoesAtivos.map((cartao) => (
                    <option key={cartao.id} value={cartao.id}>
                      {cartao.nome} - {cartao.banco}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parcelamento */}
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={isParcelado}
                    onChange={(e) => {
                      setIsParcelado(e.target.checked);
                      if (!e.target.checked) {
                        setNumeroParcelas('1');
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Parcelar compra
                  </span>
                </label>

                {isParcelado && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de parcelas (2-48)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="48"
                      value={numeroParcelas}
                      onChange={(e) => setNumeroParcelas(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: 12"
                      required={isParcelado}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor da parcela: R${' '}
                      {amount && !isNaN(parseFloat(amount.replace(',', '.')))
                        ? (parseFloat(amount.replace(',', '.')) / parseInt(numeroParcelas || '1')).toFixed(2)
                        : '0,00'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Recorrência */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Transação recorrente
              </span>
            </label>
          </div>

          {/* Campos de Recorrência (aparecem apenas se isRecurring for true) */}
          {isRecurring && (
            <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
              {/* Frequência */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periodicidade
                </label>
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value as RecurrenceFrequency)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              {/* Dia do Mês (apenas para mensal, trimestral e anual) */}
              {['monthly', 'quarterly', 'yearly'].includes(recurrenceFrequency) && (
                <div className="mb-3">
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLastDayOfMonth}
                      onChange={(e) => setUseLastDayOfMonth(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Último dia do mês
                    </span>
                  </label>
                  {!useLastDayOfMonth && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dia do mês (1-31)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={dayOfMonth}
                        onChange={(e) => setDayOfMonth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 5"
                      />
                    </>
                  )}
                </div>
              )}

              {/* Data Inicial */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={recurrenceStartDate}
                  onChange={(e) => setRecurrenceStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={isRecurring}
                />
              </div>

              {/* Data Final (opcional) */}
              <div className="mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data final (opcional)
                </label>
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={recurrenceStartDate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para recorrência indefinida
                </p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
