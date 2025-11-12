/**
 * Tipos e interfaces para gestão de investimentos
 */

/**
 * Tipos de investimentos disponíveis
 */
export type InvestmentType =
  | 'acoes'           // Ações
  | 'fiis'            // Fundos Imobiliários
  | 'criptomoedas'    // Criptomoedas
  | 'renda-fixa'      // Renda Fixa Geral
  | 'tesouro-direto'  // Tesouro Direto
  | 'cdb'             // CDB
  | 'lci-lca'         // LCI/LCA
  | 'fundos'          // Fundos de Investimento
  | 'debentures'      // Debêntures
  | 'coe'             // COE
  | 'previdencia'     // Previdência Privada
  | 'outro';          // Outros

/**
 * Labels dos tipos de investimento para exibição
 */
export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  'acoes': 'Ações',
  'fiis': 'Fundos Imobiliários (FIIs)',
  'criptomoedas': 'Criptomoedas',
  'renda-fixa': 'Renda Fixa',
  'tesouro-direto': 'Tesouro Direto',
  'cdb': 'CDB',
  'lci-lca': 'LCI/LCA',
  'fundos': 'Fundos de Investimento',
  'debentures': 'Debêntures',
  'coe': 'COE',
  'previdencia': 'Previdência Privada',
  'outro': 'Outro',
};

/**
 * Cores para cada tipo de investimento
 */
export const INVESTMENT_TYPE_COLORS: Record<InvestmentType, string> = {
  'acoes': '#3B82F6',           // Azul
  'fiis': '#10B981',            // Verde
  'criptomoedas': '#F59E0B',    // Laranja
  'renda-fixa': '#8B5CF6',      // Roxo
  'tesouro-direto': '#14B8A6',  // Teal
  'cdb': '#6366F1',             // Indigo
  'lci-lca': '#EC4899',         // Rosa
  'fundos': '#EF4444',          // Vermelho
  'debentures': '#A855F7',      // Roxo claro
  'coe': '#F97316',             // Laranja escuro
  'previdencia': '#06B6D4',     // Cyan
  'outro': '#6B7280',           // Cinza
};

/**
 * Interface de uma transação de investimento
 */
export interface Investment {
  id: string;
  tipo: InvestmentType;
  descricao: string;              // Descrição do investimento
  banco: string;                  // Banco ou corretora
  valor: number;                  // Valor investido
  dataInvestimento: string;       // Data do investimento (ISO string)

  // Campos específicos para ações
  nomeAcao?: string;              // Código da ação (ex: PETR4, VALE3)
  quantidade?: number;            // Quantidade de ações/cotas
  valorUnitario?: number;         // Valor unitário na compra

  // Campos opcionais
  observacoes?: string;           // Observações adicionais
  vencimento?: string;            // Data de vencimento (para renda fixa)
  taxa?: number;                  // Taxa de rentabilidade (%)

  // Controle
  ativo: boolean;                 // Se o investimento ainda está ativo
  dataResgate?: string;           // Data do resgate (se já resgatado)
  valorResgate?: number;          // Valor do resgate
  createdAt: string;              // Data de criação (ISO string)
}

/**
 * Interface para posição consolidada de um ativo
 * (Para agrupar múltiplas compras do mesmo ativo)
 */
export interface InvestmentPosition {
  tipo: InvestmentType;
  identificador: string;          // Nome da ação, moeda, etc.
  banco: string;
  quantidadeTotal: number;        // Quantidade total acumulada
  valorTotalInvestido: number;    // Valor total investido
  precoMedio: number;             // Preço médio de compra
  transacoes: string[];           // IDs das transações que compõem a posição
}

/**
 * Interface para resumo de investimentos
 */
export interface InvestmentSummary {
  totalInvestido: number;
  totalResgatado: number;
  saldoInvestido: number;         // Total investido - Total resgatado
  investimentosPorTipo: Record<InvestmentType, number>;
  investimentosPorBanco: Record<string, number>;
  quantidadeAtivos: number;
  quantidadeResgatados: number;
}

/**
 * Interface para filtros de investimentos
 */
export interface InvestmentFilter {
  tipo?: InvestmentType;
  banco?: string;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
}
