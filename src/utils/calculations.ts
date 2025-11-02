import type { DailyEntry } from '../types/cashflow';

/**
 * 🔒 Converte valor para número garantindo tipo correto
 * Remove formatação de moeda e garante que é um número válido
 *
 * IMPORTANTE: MAX_VALUE aqui deve ser consistente com MAX_SALDO em recalculateMonthSaldos
 * para evitar falsos positivos na detecção de valores absurdos
 */
const toSafeNumber = (value: any): number => {
  // Casos básicos
  if (value === null || value === undefined || value === '') return 0;

  // Se já é número, validar
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      console.warn('[Calculations] Número inválido detectado:', value, '-> usando 0');
      return 0;
    }
    // Limitar valores extremos
    const MAX_VALUE = 10000000; // 10 milhões
    if (Math.abs(value) > MAX_VALUE) {
      console.error('[Calculations] ⚠️ VALOR MUITO ALTO:', value, '-> limitando a', MAX_VALUE);
      return Math.sign(value) * MAX_VALUE;
    }
    return value;
  }

  // Converter string para número
  if (typeof value === 'string') {
    // Remove formatação de moeda brasileira
    const cleaned = value
      .replace(/[R$\s]/g, '') // Remove R$, espaços
      .replace(/\./g, '') // Remove pontos de milhar
      .replace(',', '.'); // Substitui vírgula decimal por ponto

    const num = parseFloat(cleaned);

    // Validação
    if (isNaN(num) || !isFinite(num)) {
      console.warn('[Calculations] String inválida para conversão:', value, '-> usando 0');
      return 0;
    }

    // Limitar valores extremos
    const MAX_VALUE = 10000000; // 10 milhões
    if (Math.abs(num) > MAX_VALUE) {
      console.error('[Calculations] ⚠️ VALOR MUITO ALTO da string:', value, '-> limitando a', MAX_VALUE);
      return Math.sign(num) * MAX_VALUE;
    }

    return num;
  }

  // Qualquer outro tipo
  console.warn('[Calculations] Tipo inesperado para conversão:', typeof value, value, '-> usando 0');
  return 0;
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
  // 🔒 GARANTIR que saldo inicial é número seguro
  let currentSaldo = toSafeNumber(saldoInicial);

  // Validar saldo inicial
  const MAX_SALDO = 10000000; // R$ 10 milhões - alinhado com MAX_VALUE para transações individuais
  if (Math.abs(currentSaldo) > MAX_SALDO) {
    console.error(`[Calculations] 🚨 Saldo inicial absurdo: ${currentSaldo}. Resetando para 0`);
    currentSaldo = 0;
  }

  const result = entries.map((entry, index) => {
    // 🔒 CONVERSÃO SEGURA de todos os valores
    const entrada = toSafeNumber(entry.entrada);
    const saida = toSafeNumber(entry.saida);
    const diario = toSafeNumber(entry.diario);

    // Calcular movimento do dia
    const movimento = entrada - saida - diario;

    // Calcular novo saldo
    const novoSaldo = currentSaldo + movimento;

    // Validação de sanidade do novo saldo
    if (Math.abs(novoSaldo) > MAX_SALDO) {
      console.error(`[Calculations] ⚠️ SALDO ABSURDO no dia ${entry.day}: R$ ${novoSaldo.toFixed(2)} (limite: R$ ${MAX_SALDO.toLocaleString('pt-BR')})`);
      console.error('  Detalhes:', {
        dia: entry.day,
        saldoAnterior: currentSaldo.toFixed(2),
        entrada: entrada.toFixed(2),
        saida: saida.toFixed(2),
        diario: diario.toFixed(2),
        movimento: movimento.toFixed(2),
        saldoCalculado: novoSaldo.toFixed(2)
      });

      // Em caso de saldo absurdo, usar apenas o movimento do dia
      currentSaldo = movimento;
      console.log(`[Calculations] Saldo corrigido para: R$ ${currentSaldo.toFixed(2)}`);
    } else {
      currentSaldo = novoSaldo;
    }

    // Arredondar para 2 casas decimais para evitar problemas de ponto flutuante
    currentSaldo = Math.round(currentSaldo * 100) / 100;

    return {
      day: entry.day,
      entrada: Math.round(entrada * 100) / 100,
      saida: Math.round(saida * 100) / 100,
      diario: Math.round(diario * 100) / 100,
      saldo: currentSaldo,
    };
  });

  // Log final apenas se houver problemas
  const saldoFinal = result[result.length - 1]?.saldo || 0;
  if (Math.abs(saldoFinal) > MAX_SALDO) {
    console.error(`[Calculations] 🚨 ALERTA: Mês terminou com saldo absurdo: R$ ${saldoFinal.toFixed(2)} (limite: R$ ${MAX_SALDO.toLocaleString('pt-BR')})`);
  }

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
