/**
 * Utilitários para integração entre Cartões de Crédito e Fluxo de Caixa
 */

import { format, parseISO, addMonths } from 'date-fns';
import { useCreditCardStore } from '../store/creditCardStore';
import { useCashFlowStore } from '../store/cashFlowStore';

/**
 * Processa uma transação de cartão de crédito e cria/atualiza a fatura consolidada
 * no dia de vencimento do cartão
 */
export function processarTransacaoCartao(
  cartaoId: string,
  descricao: string,
  valor: number,
  dataCompra: string,
  categoria?: string,
  parcelado?: boolean,
  numeroParcelas?: number
): void {
  const creditCardStore = useCreditCardStore.getState();

  const cartao = creditCardStore.getCartao(cartaoId);
  if (!cartao) {
    throw new Error('Cartão não encontrado');
  }

  const dataCompraDate = parseISO(dataCompra);

  if (parcelado && numeroParcelas && numeroParcelas > 1) {
    // Criar transação parcelada
    creditCardStore.addTransacaoParcelada(
      cartaoId,
      descricao,
      valor,
      numeroParcelas,
      dataCompra,
      categoria
    );

    // Para cada parcela, criar/atualizar a fatura consolidada no mês correspondente
    for (let i = 0; i < numeroParcelas; i++) {
      const dataParcela = addMonths(dataCompraDate, i);
      const mesReferencia = format(dataParcela, 'yyyy-MM');

      atualizarFaturaConsolidada(cartaoId, mesReferencia);
    }
  } else {
    // Criar transação única
    const mesReferencia = format(dataCompraDate, 'yyyy-MM');

    creditCardStore.addTransacao({
      cartaoId,
      descricao,
      valor,
      categoria,
      dataCompra,
      parcelado: false,
      mesReferencia,
    });

    // Atualizar fatura consolidada
    atualizarFaturaConsolidada(cartaoId, mesReferencia);
  }
}

/**
 * Atualiza ou cria a transação de fatura consolidada no dia de vencimento
 */
export function atualizarFaturaConsolidada(
  cartaoId: string,
  mesReferencia: string
): void {
  const creditCardStore = useCreditCardStore.getState();
  const cashFlowStore = useCashFlowStore.getState();

  const cartao = creditCardStore.getCartao(cartaoId);
  if (!cartao) return;

  // Calcular valor total da fatura do mês
  const valorFatura = creditCardStore.calcularValorFatura(cartaoId, mesReferencia);

  // Inicializar o mês se necessário
  cashFlowStore.initializeMonth(mesReferencia);

  const monthData = cashFlowStore.months[mesReferencia];
  if (!monthData) return;

  const diaVencimento = cartao.diaVencimento;

  // Encontrar ou criar a entrada do dia de vencimento
  const dayEntry = monthData.entries.find((e) => e.day === diaVencimento);
  if (!dayEntry) return;

  // Procurar por transação de fatura consolidada existente para este cartão
  const faturaExistente = dayEntry.transactions.find(
    (t) => t.isFaturaConsolidada && t.cartaoCreditoId === cartaoId
  );

  if (valorFatura === 0) {
    // Se não há valor na fatura, remover a transação consolidada se existir
    if (faturaExistente) {
      cashFlowStore.deleteTransaction(mesReferencia, diaVencimento, faturaExistente.id);
    }
  } else if (faturaExistente) {
    // Atualizar valor da fatura existente
    cashFlowStore.updateTransaction(mesReferencia, diaVencimento, faturaExistente.id, {
      amount: valorFatura,
      description: `Fatura ${cartao.nome} - ${cartao.banco}`,
    });
  } else {
    // Criar nova transação de fatura consolidada
    cashFlowStore.addTransaction(
      mesReferencia,
      diaVencimento,
      'despesa',
      `Fatura ${cartao.nome} - ${cartao.banco}`,
      valorFatura,
      'Cartão de Crédito',
      undefined,
      {
        isCartaoCredito: true,
        cartaoCreditoId: cartaoId,
        isFaturaConsolidada: true,
      }
    );
  }
}

/**
 * Remove uma transação de cartão de crédito e atualiza a fatura consolidada
 */
export function removerTransacaoCartao(
  transacaoId: string,
  mesReferencia: string
): void {
  const creditCardStore = useCreditCardStore.getState();
  const transacao = creditCardStore.getTransacao(transacaoId);

  if (!transacao) return;

  const cartaoId = transacao.cartaoId;

  // Deletar a transação
  creditCardStore.deleteTransacao(transacaoId);

  // Atualizar fatura consolidada
  atualizarFaturaConsolidada(cartaoId, mesReferencia);
}

/**
 * Recalcula todas as faturas consolidadas de um cartão
 */
export function recalcularTodasFaturasCartao(cartaoId: string): void {
  const creditCardStore = useCreditCardStore.getState();
  const transacoes = creditCardStore.getTransacoesByCartao(cartaoId);

  // Agrupar transações por mês
  const mesesComTransacoes = new Set(transacoes.map((t) => t.mesReferencia));

  // Atualizar cada mês
  mesesComTransacoes.forEach((mes) => {
    atualizarFaturaConsolidada(cartaoId, mes);
  });
}
