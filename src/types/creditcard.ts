/**
 * Tipos e interfaces para gestão de cartões de crédito
 */

/**
 * Interface principal de um Cartão de Crédito
 */
export interface CreditCard {
  id: string;
  nome: string;                    // Ex: "Nubank", "Itaú Mastercard"
  banco: string;                   // Ex: "Nubank", "Itaú"
  limite: number;                  // Limite total do cartão
  diaVencimento: number;           // Dia do mês que vence a fatura (1-31)
  diaFechamento: number;           // Dia do mês que fecha a fatura (1-31)
  cor?: string;                    // Cor para identificação visual
  ativo: boolean;                  // Se o cartão está ativo
  createdAt: string;               // Data de criação (ISO string)
}

/**
 * Interface para uma transação de cartão de crédito
 * Estende as informações básicas com dados específicos de cartão
 */
export interface CreditCardTransaction {
  id: string;
  cartaoId: string;                // ID do cartão usado
  descricao: string;               // Descrição da compra
  valor: number;                   // Valor total da transação
  categoria?: string;              // Categoria da despesa
  dataCompra: string;              // Data da compra (ISO string)
  parcelado: boolean;              // Se é parcelado
  numeroParcelas?: number;         // Número de parcelas (se parcelado)
  parcelaAtual?: number;           // Parcela atual (se parcelado)
  transacaoPaiId?: string;         // ID da transação pai (se for parcela)
  mesReferencia: string;           // Mês de referência da fatura ("2024-11")
  createdAt: string;               // Data de criação (ISO string)
}

/**
 * Interface para uma fatura mensal de cartão
 */
export interface CreditCardInvoice {
  id: string;
  cartaoId: string;                // ID do cartão
  mesReferencia: string;           // Mês da fatura ("2024-11")
  dataFechamento: string;          // Data de fechamento da fatura
  dataVencimento: string;          // Data de vencimento da fatura
  valorTotal: number;              // Valor total da fatura
  valorPago: number;               // Valor já pago
  status: 'aberta' | 'fechada' | 'paga' | 'vencida'; // Status da fatura
  transacoes: string[];            // IDs das transações incluídas
  createdAt: string;               // Data de criação (ISO string)
}

/**
 * Tipo para resumo de uso do cartão
 */
export interface CreditCardSummary {
  cartaoId: string;
  limiteTotal: number;
  limiteUtilizado: number;
  limiteDisponivel: number;
  percentualUtilizado: number;
  faturaAtual: number;
  proximoVencimento: string;       // Data do próximo vencimento
}
