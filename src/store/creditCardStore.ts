import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CreditCard,
  CreditCardTransaction,
  CreditCardInvoice,
  CreditCardSummary,
} from '../types/creditcard';
import { format, addMonths, parseISO } from 'date-fns';

interface CreditCardStore {
  // Estado
  cartoes: Record<string, CreditCard>;                           // Todos os cartões
  transacoes: Record<string, CreditCardTransaction>;             // Todas as transações de cartão
  faturas: Record<string, CreditCardInvoice>;                    // Todas as faturas

  // Actions - Cartões
  addCartao: (cartao: Omit<CreditCard, 'id' | 'createdAt'>) => string;
  updateCartao: (id: string, updates: Partial<CreditCard>) => void;
  deleteCartao: (id: string) => void;
  getCartao: (id: string) => CreditCard | undefined;
  getCartoesAtivos: () => CreditCard[];
  getAllCartoes: () => CreditCard[];

  // Actions - Transações
  addTransacao: (transacao: Omit<CreditCardTransaction, 'id' | 'createdAt'>) => string;
  updateTransacao: (id: string, updates: Partial<CreditCardTransaction>) => void;
  deleteTransacao: (id: string) => void;
  getTransacao: (id: string) => CreditCardTransaction | undefined;
  getTransacoesByCartao: (cartaoId: string, mesReferencia?: string) => CreditCardTransaction[];
  getTransacoesByMes: (mesReferencia: string) => CreditCardTransaction[];

  // Actions - Faturas
  getFatura: (cartaoId: string, mesReferencia: string) => CreditCardInvoice | undefined;
  getFaturasByCartao: (cartaoId: string) => CreditCardInvoice[];
  pagarFatura: (cartaoId: string, mesReferencia: string, valor: number) => void;
  fecharFatura: (cartaoId: string, mesReferencia: string) => void;

  // Actions - Resumos e Cálculos
  getCartaoSummary: (cartaoId: string, mesReferencia: string) => CreditCardSummary;
  getLimiteDisponivel: (cartaoId: string, mesReferencia: string) => number;
  calcularValorFatura: (cartaoId: string, mesReferencia: string) => number;

  // Actions - Parcelamento
  addTransacaoParcelada: (
    cartaoId: string,
    descricao: string,
    valorTotal: number,
    numeroParcelas: number,
    dataCompra: string,
    categoria?: string
  ) => string[];

  // Internal helper method
  _atualizarFatura: (cartaoId: string, mesReferencia: string) => void;
}

export const useCreditCardStore = create<CreditCardStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      cartoes: {},
      transacoes: {},
      faturas: {},

      // ==================== CARTÕES ====================

      addCartao: (cartao) => {
        const id = crypto.randomUUID();
        const novoCartao: CreditCard = {
          ...cartao,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          cartoes: { ...state.cartoes, [id]: novoCartao },
        }));

        return id;
      },

      updateCartao: (id, updates) => {
        set((state) => ({
          cartoes: {
            ...state.cartoes,
            [id]: { ...state.cartoes[id], ...updates },
          },
        }));
      },

      deleteCartao: (id) => {
        set((state) => {
          const { [id]: removed, ...restCartoes } = state.cartoes;

          // Remove também todas as transações do cartão
          const novasTransacoes = Object.fromEntries(
            Object.entries(state.transacoes).filter(([_, t]) => t.cartaoId !== id)
          );

          // Remove todas as faturas do cartão
          const novasFaturas = Object.fromEntries(
            Object.entries(state.faturas).filter(([_, f]) => f.cartaoId !== id)
          );

          return {
            cartoes: restCartoes,
            transacoes: novasTransacoes,
            faturas: novasFaturas,
          };
        });
      },

      getCartao: (id) => {
        return get().cartoes[id];
      },

      getCartoesAtivos: () => {
        return Object.values(get().cartoes).filter((c) => c.ativo);
      },

      getAllCartoes: () => {
        return Object.values(get().cartoes);
      },

      // ==================== TRANSAÇÕES ====================

      addTransacao: (transacao) => {
        const id = crypto.randomUUID();
        const novaTransacao: CreditCardTransaction = {
          ...transacao,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          transacoes: { ...state.transacoes, [id]: novaTransacao },
        }));

        // Atualiza ou cria fatura do mês
        get()._atualizarFatura(transacao.cartaoId, transacao.mesReferencia);

        return id;
      },

      updateTransacao: (id, updates) => {
        const transacao = get().transacoes[id];
        if (!transacao) return;

        set((state) => ({
          transacoes: {
            ...state.transacoes,
            [id]: { ...transacao, ...updates },
          },
        }));

        // Atualiza fatura
        get()._atualizarFatura(transacao.cartaoId, transacao.mesReferencia);
      },

      deleteTransacao: (id) => {
        const transacao = get().transacoes[id];
        if (!transacao) return;

        const cartaoId = transacao.cartaoId;
        const mesReferencia = transacao.mesReferencia;
        const transacaoPaiId = transacao.transacaoPaiId;

        set((state) => {
          const { [id]: removed, ...restTransacoes } = state.transacoes;

          // Se for uma transação pai (parcelamento), remove todas as parcelas
          let transacoesFinais = restTransacoes;
          if (!transacaoPaiId) {
            transacoesFinais = Object.fromEntries(
              Object.entries(restTransacoes).filter(
                ([_, t]) => t.transacaoPaiId !== id
              )
            );
          }

          return { transacoes: transacoesFinais };
        });

        // Atualiza fatura
        get()._atualizarFatura(cartaoId, mesReferencia);
      },

      getTransacao: (id) => {
        return get().transacoes[id];
      },

      getTransacoesByCartao: (cartaoId, mesReferencia) => {
        const transacoes = Object.values(get().transacoes).filter(
          (t) => t.cartaoId === cartaoId
        );

        if (mesReferencia) {
          return transacoes.filter((t) => t.mesReferencia === mesReferencia);
        }

        return transacoes;
      },

      getTransacoesByMes: (mesReferencia) => {
        return Object.values(get().transacoes).filter(
          (t) => t.mesReferencia === mesReferencia
        );
      },

      // ==================== FATURAS ====================

      _atualizarFatura: (cartaoId: string, mesReferencia: string) => {
        const cartao = get().cartoes[cartaoId];
        if (!cartao) return;

        const transacoes = get().getTransacoesByCartao(cartaoId, mesReferencia);
        const valorTotal = transacoes.reduce((sum, t) => sum + t.valor, 0);

        const [ano, mes] = mesReferencia.split('-').map(Number);
        const dataVencimento = new Date(ano, mes - 1, cartao.diaVencimento);
        const dataFechamento = new Date(ano, mes - 1, cartao.diaFechamento);

        const faturaId = `${cartaoId}-${mesReferencia}`;
        const faturaExistente = get().faturas[faturaId];

        const novaFatura: CreditCardInvoice = {
          id: faturaId,
          cartaoId,
          mesReferencia,
          dataFechamento: dataFechamento.toISOString(),
          dataVencimento: dataVencimento.toISOString(),
          valorTotal,
          valorPago: faturaExistente?.valorPago || 0,
          status: faturaExistente?.status || 'aberta',
          transacoes: transacoes.map((t) => t.id),
          createdAt: faturaExistente?.createdAt || new Date().toISOString(),
        };

        set((state) => ({
          faturas: { ...state.faturas, [faturaId]: novaFatura },
        }));
      },

      getFatura: (cartaoId, mesReferencia) => {
        const faturaId = `${cartaoId}-${mesReferencia}`;
        return get().faturas[faturaId];
      },

      getFaturasByCartao: (cartaoId) => {
        return Object.values(get().faturas)
          .filter((f) => f.cartaoId === cartaoId)
          .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia));
      },

      pagarFatura: (cartaoId, mesReferencia, valor) => {
        const faturaId = `${cartaoId}-${mesReferencia}`;
        const fatura = get().faturas[faturaId];
        if (!fatura) return;

        const novoValorPago = fatura.valorPago + valor;
        const status = novoValorPago >= fatura.valorTotal ? 'paga' : 'aberta';

        set((state) => ({
          faturas: {
            ...state.faturas,
            [faturaId]: {
              ...fatura,
              valorPago: novoValorPago,
              status,
            },
          },
        }));
      },

      fecharFatura: (cartaoId, mesReferencia) => {
        const faturaId = `${cartaoId}-${mesReferencia}`;
        const fatura = get().faturas[faturaId];
        if (!fatura) return;

        set((state) => ({
          faturas: {
            ...state.faturas,
            [faturaId]: {
              ...fatura,
              status: 'fechada',
            },
          },
        }));
      },

      // ==================== RESUMOS E CÁLCULOS ====================

      getCartaoSummary: (cartaoId, mesReferencia) => {
        const cartao = get().cartoes[cartaoId];
        if (!cartao) {
          return {
            cartaoId,
            limiteTotal: 0,
            limiteUtilizado: 0,
            limiteDisponivel: 0,
            percentualUtilizado: 0,
            faturaAtual: 0,
            proximoVencimento: new Date().toISOString(),
          };
        }

        const faturaAtual = get().calcularValorFatura(cartaoId, mesReferencia);
        const limiteUtilizado = faturaAtual;
        const limiteDisponivel = Math.max(0, cartao.limite - limiteUtilizado);
        const percentualUtilizado = (limiteUtilizado / cartao.limite) * 100;

        const [ano, mes] = mesReferencia.split('-').map(Number);
        const proximoVencimento = new Date(ano, mes - 1, cartao.diaVencimento);

        return {
          cartaoId,
          limiteTotal: cartao.limite,
          limiteUtilizado,
          limiteDisponivel,
          percentualUtilizado,
          faturaAtual,
          proximoVencimento: proximoVencimento.toISOString(),
        };
      },

      getLimiteDisponivel: (cartaoId, mesReferencia) => {
        const summary = get().getCartaoSummary(cartaoId, mesReferencia);
        return summary.limiteDisponivel;
      },

      calcularValorFatura: (cartaoId, mesReferencia) => {
        const transacoes = get().getTransacoesByCartao(cartaoId, mesReferencia);
        return transacoes.reduce((sum, t) => sum + t.valor, 0);
      },

      // ==================== PARCELAMENTO ====================

      addTransacaoParcelada: (
        cartaoId,
        descricao,
        valorTotal,
        numeroParcelas,
        dataCompra,
        categoria
      ) => {
        const valorParcela = valorTotal / numeroParcelas;
        const dataCompraDate = parseISO(dataCompra);
        const ids: string[] = [];

        // Cria transação pai
        const transacaoPaiId = crypto.randomUUID();
        const transacaoPai: CreditCardTransaction = {
          id: transacaoPaiId,
          cartaoId,
          descricao: `${descricao} (${numeroParcelas}x)`,
          valor: 0, // Transação pai não tem valor, só as parcelas
          categoria,
          dataCompra,
          parcelado: true,
          numeroParcelas,
          mesReferencia: format(dataCompraDate, 'yyyy-MM'),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          transacoes: { ...state.transacoes, [transacaoPaiId]: transacaoPai },
        }));

        // Cria as parcelas
        for (let i = 1; i <= numeroParcelas; i++) {
          const dataParcela = addMonths(dataCompraDate, i - 1);
          const mesReferencia = format(dataParcela, 'yyyy-MM');

          const id = get().addTransacao({
            cartaoId,
            descricao: `${descricao} (${i}/${numeroParcelas})`,
            valor: valorParcela,
            categoria,
            dataCompra: dataParcela.toISOString(),
            parcelado: true,
            numeroParcelas,
            parcelaAtual: i,
            transacaoPaiId,
            mesReferencia,
          });

          ids.push(id);
        }

        return ids;
      },
    }),
    {
      name: 'credit-card-storage',
      version: 1,
    }
  )
);
