import type { DailyEntry } from '../types/cashflow';

/**
 * 🔒 Converte valor para número garantindo tipo correto
 * Remove formatação de moeda e garante que é um número válido
 */
const toSafeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  // Remove formatação de moeda e converte
  const cleaned = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);

  // Validação de sanidade
  if (isNaN(num)) {
    console.warn('[Calculations] Valor inválido detectado:', value, '-> usando 0');
    return 0;
  }

  // Limitar valores absurdos
  const MAX_VALUE = 999999999; // 999 milhões
  if (Math.abs(num) > MAX_VALUE) {
    console.error('[Calculations] ⚠️ VALOR ABSURDO DETECTADO:', num, '-> resetando para 0');
    return 0;
  }

  return num;
};

/**
 * Calcula o saldo de um dia específico
 * Para o dia 1: saldo = entrada - saida - diario
 * Para demais dias: saldo = saldo_anterior + entrada - saida - diario
 */
export const calculateDailySaldo = (
  entrada: number | string,
  saida: number | string,
  diario: number | string,
  saldoAnterior: number | string
): number => {
  // 🔒 CONVERSÃO SEGURA PARA NÚMERO
  const entradaNum = toSafeNumber(entrada);
  const saidaNum = toSafeNumber(saida);
  const diarioNum = toSafeNumber(diario);
  const saldoAntNum = toSafeNumber(saldoAnterior);

  const resultado = saldoAntNum + entradaNum - saidaNum - diarioNum;

  // Arredondar para 2 casas decimais
  return Math.round(resultado * 100) / 100;
};

/**
 * Recalcula todos os saldos de um mês com validação rigorosa
 */
export const recalculateMonthSaldos = (
  entries: DailyEntry[],
  saldoInicial: number | string
): DailyEntry[] => {
  // 🔒 GARANTIR que saldo inicial é número
  let currentSaldo = toSafeNumber(saldoInicial);

  console.log('[Calculations] Recalculando saldos:', {
    totalDias: entries.length,
    saldoInicial: currentSaldo,
  });

  const result = entries.map((entry, index) => {
    // 🔒 CONVERSÃO SEGURA de todos os valores
    const entrada = toSafeNumber(entry.entrada);
    const saida = toSafeNumber(entry.saida);
    const diario = toSafeNumber(entry.diario);

    // Calcular novo saldo
    const novoSaldo = currentSaldo + entrada - saida - diario;

    // Log detalhado do primeiro dia para debug
    if (index === 0) {
      console.log('[Calculations] 📊 PRIMEIRO DIA DO MÊS:', {
        saldoHerdadoMesAnterior: currentSaldo,
        entrada,
        saida,
        diario,
        formula: 'saldo = saldoAnterior + entrada - saida - diario',
        calculo: `${currentSaldo} + ${entrada} - ${saida} - ${diario} = ${novoSaldo}`,
        resultado: novoSaldo,
        confirmacao: currentSaldo === 0
          ? '✅ Primeiro mês do sistema ou mês anterior zerado'
          : `✅ Herdou R$ ${currentSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} do último dia do mês anterior`
      });
    }

    // Validação de sanidade
    if (Math.abs(novoSaldo) > 10000000) {
      console.error(`[Calculations] ⚠️ SALDO ABSURDO no dia ${entry.day}:`, novoSaldo);
      console.error('Valores:', { currentSaldo, entrada, saida, diario });
      // Reset para evitar propagação
      currentSaldo = entrada - saida - diario;
    } else {
      currentSaldo = novoSaldo;
    }

    // Arredondar para 2 casas decimais
    currentSaldo = Math.round(currentSaldo * 100) / 100;

    return {
      ...entry,
      entrada,
      saida,
      diario,
      saldo: currentSaldo,
    };
  });

  console.log('[Calculations] Recálculo concluído. Saldo final:', currentSaldo);

  return result;
};

/**
 * Calcula os totais de um mês
 */
export const calculateMonthTotals = (entries: DailyEntry[]) => {
  const totalEntradas = entries.reduce((sum, entry) => sum + toSafeNumber(entry.entrada), 0);
  const totalSaidas = entries.reduce((sum, entry) => sum + toSafeNumber(entry.saida), 0);
  const saldoFinal = entries[entries.length - 1]?.saldo || 0;

  return {
    totalEntradas: Math.round(totalEntradas * 100) / 100,
    totalSaidas: Math.round(totalSaidas * 100) / 100,
    saldoFinal: Math.round(toSafeNumber(saldoFinal) * 100) / 100,
  };
};

/**
 * Cria entradas diárias vazias para um mês
 */
export const createEmptyMonthEntries = (year: number, month: number): DailyEntry[] => {
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    entrada: 0,
    saida: 0,
    diario: 0,
    saldo: 0,
  }));
};

/**
 * Calcula valores do empréstimo
 */
export const calculateLoanValues = (
  valorParcela: number | string,
  totalParcelas: number | string,
  parcelasPagas: number | string
) => {
  const parcela = toSafeNumber(valorParcela);
  const total = toSafeNumber(totalParcelas);
  const pagas = toSafeNumber(parcelasPagas);

  const valorTotalEmprestimo = Math.round(parcela * total * 100) / 100;
  const totalPago = Math.round(parcela * pagas * 100) / 100;
  const totalAPagar = Math.round((valorTotalEmprestimo - totalPago) * 100) / 100;

  return {
    valorTotalEmprestimo,
    totalPago,
    totalAPagar,
  };
};

/**
 * 🔧 FUNÇÃO DE EMERGÊNCIA: Sanitiza e recalcula todos os saldos
 * Use quando detectar dados corrompidos
 */
export const sanitizeAndRecalculate = (
  entries: DailyEntry[],
  saldoInicial: number = 0
): DailyEntry[] => {
  console.log('[Calculations] 🔧 SANITIZAÇÃO EMERGENCIAL iniciada...');

  // Limpar e validar todos os valores
  const cleanedEntries = entries.map(entry => ({
    ...entry,
    entrada: toSafeNumber(entry.entrada),
    saida: toSafeNumber(entry.saida),
    diario: toSafeNumber(entry.diario),
    saldo: 0, // Vai ser recalculado
  }));

  // Recalcular com saldo inicial zero se não fornecido
  const result = recalculateMonthSaldos(cleanedEntries, saldoInicial);

  console.log('[Calculations] ✅ Sanitização concluída');

  return result;
};
