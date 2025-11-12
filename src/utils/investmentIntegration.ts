/**
 * Utilitários para integração entre Investimentos e Fluxo de Caixa
 */

import { format, parseISO } from 'date-fns';
import { useInvestmentStore } from '../store/investmentStore';
import { useCashFlowStore } from '../store/cashFlowStore';
import type { InvestmentType } from '../types/investment';

/**
 * Processa uma transação de investimento e a vincula ao fluxo de caixa
 * A transação aparece como despesa no fluxo, mas é gerenciada como investimento
 */
export function processarInvestimento(
  tipo: InvestmentType,
  descricao: string,
  banco: string,
  valor: number,
  dataInvestimento: string,
  nomeAcao?: string,
  quantidade?: number,
  valorUnitario?: number,
  observacoes?: string,
  vencimento?: string,
  taxa?: number
): string {
  const investmentStore = useInvestmentStore.getState();
  const cashFlowStore = useCashFlowStore.getState();

  // Criar investimento no store de investimentos
  const investmentId = investmentStore.addInvestimento({
    tipo,
    descricao,
    banco,
    valor,
    dataInvestimento,
    nomeAcao,
    quantidade,
    valorUnitario,
    observacoes,
    vencimento,
    taxa,
    ativo: true,
  });

  // Adicionar transação no fluxo de caixa como despesa
  const dataInvestimentoDate = parseISO(dataInvestimento);
  const mesReferencia = format(dataInvestimentoDate, 'yyyy-MM');
  const dia = dataInvestimentoDate.getDate();

  cashFlowStore.addTransaction(
    mesReferencia,
    dia,
    'despesa',
    `Investimento: ${descricao}`,
    valor,
    'Investimento',
    undefined,
    undefined,
    {
      isInvestimento: true,
      investmentId,
    }
  );

  return investmentId;
}

/**
 * Remove um investimento e sua transação vinculada no fluxo de caixa
 */
export function removerInvestimento(investmentId: string): void {
  const investmentStore = useInvestmentStore.getState();
  const cashFlowStore = useCashFlowStore.getState();

  const investimento = investmentStore.getInvestimento(investmentId);
  if (!investimento) return;

  // Encontrar e remover a transação vinculada no fluxo de caixa
  const mesReferencia = format(parseISO(investimento.dataInvestimento), 'yyyy-MM');
  const monthData = cashFlowStore.months[mesReferencia];

  if (monthData) {
    const dia = new Date(investimento.dataInvestimento).getDate();
    const dayEntry = monthData.entries.find((e) => e.day === dia);

    if (dayEntry) {
      const transacao = dayEntry.transactions.find((t) => t.investmentId === investmentId);
      if (transacao) {
        cashFlowStore.deleteTransaction(mesReferencia, dia, transacao.id);
      }
    }
  }

  // Remover investimento
  investmentStore.deleteInvestimento(investmentId);
}

/**
 * Registra o resgate de um investimento
 * Adiciona uma receita no fluxo de caixa na data do resgate
 */
export function registrarResgateInvestimento(
  investmentId: string,
  valorResgate: number,
  dataResgate: string
): void {
  const investmentStore = useInvestmentStore.getState();
  const cashFlowStore = useCashFlowStore.getState();

  const investimento = investmentStore.getInvestimento(investmentId);
  if (!investimento) return;

  // Resgatar o investimento
  investmentStore.resgatar(investmentId, valorResgate, dataResgate);

  // Adicionar receita no fluxo de caixa
  const dataResgateDate = parseISO(dataResgate);
  const mesReferencia = format(dataResgateDate, 'yyyy-MM');
  const dia = dataResgateDate.getDate();

  const lucro = valorResgate - investimento.valor;
  const descricao = `Resgate: ${investimento.descricao} (Lucro: R$ ${lucro.toFixed(2)})`;

  cashFlowStore.addTransaction(
    mesReferencia,
    dia,
    'receita',
    descricao,
    valorResgate,
    'Investimento - Resgate',
    undefined,
    undefined,
    {
      isInvestimento: true,
      investmentId,
    }
  );
}
