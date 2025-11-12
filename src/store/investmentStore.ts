import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Investment,
  InvestmentPosition,
  InvestmentSummary,
  InvestmentFilter,
  InvestmentType,
} from '../types/investment';
import { parseISO, isAfter, isBefore } from 'date-fns';

interface InvestmentStore {
  // Estado
  investimentos: Record<string, Investment>;

  // Actions - CRUD
  addInvestimento: (investimento: Omit<Investment, 'id' | 'createdAt'>) => string;
  updateInvestimento: (id: string, updates: Partial<Investment>) => void;
  deleteInvestimento: (id: string) => void;
  getInvestimento: (id: string) => Investment | undefined;
  getAllInvestimentos: () => Investment[];

  // Actions - Filtros
  getInvestimentosFiltrados: (filter: InvestmentFilter) => Investment[];
  getInvestimentosAtivos: () => Investment[];
  getInvestimentosResgatados: () => Investment[];
  getInvestimentosByTipo: (tipo: InvestmentType) => Investment[];
  getInvestimentosByBanco: (banco: string) => Investment[];

  // Actions - Posições
  getPosicoesConsolidadas: () => InvestmentPosition[];
  getPosicaoPorAtivo: (tipo: InvestmentType, identificador: string, banco: string) => InvestmentPosition | undefined;

  // Actions - Resgate
  resgatar: (id: string, valorResgate: number, dataResgate: string) => void;

  // Actions - Resumos
  getSummary: () => InvestmentSummary;
  getTotalInvestidoPorTipo: () => Record<InvestmentType, number>;
  getTotalInvestidoPorBanco: () => Record<string, number>;
  getBancosUnicos: () => string[];
}

export const useInvestmentStore = create<InvestmentStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      investimentos: {},

      // ==================== CRUD ====================

      addInvestimento: (investimento) => {
        const id = crypto.randomUUID();
        const novoInvestimento: Investment = {
          ...investimento,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          investimentos: { ...state.investimentos, [id]: novoInvestimento },
        }));

        return id;
      },

      updateInvestimento: (id, updates) => {
        set((state) => ({
          investimentos: {
            ...state.investimentos,
            [id]: { ...state.investimentos[id], ...updates },
          },
        }));
      },

      deleteInvestimento: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.investimentos;
          return { investimentos: rest };
        });
      },

      getInvestimento: (id) => {
        return get().investimentos[id];
      },

      getAllInvestimentos: () => {
        return Object.values(get().investimentos).sort(
          (a, b) => new Date(b.dataInvestimento).getTime() - new Date(a.dataInvestimento).getTime()
        );
      },

      // ==================== FILTROS ====================

      getInvestimentosFiltrados: (filter) => {
        let investimentos = get().getAllInvestimentos();

        if (filter.tipo) {
          investimentos = investimentos.filter((i) => i.tipo === filter.tipo);
        }

        if (filter.banco) {
          investimentos = investimentos.filter((i) => i.banco === filter.banco);
        }

        if (filter.ativo !== undefined) {
          investimentos = investimentos.filter((i) => i.ativo === filter.ativo);
        }

        if (filter.dataInicio) {
          const dataInicio = parseISO(filter.dataInicio);
          investimentos = investimentos.filter((i) =>
            isAfter(parseISO(i.dataInvestimento), dataInicio) ||
            parseISO(i.dataInvestimento).getTime() === dataInicio.getTime()
          );
        }

        if (filter.dataFim) {
          const dataFim = parseISO(filter.dataFim);
          investimentos = investimentos.filter((i) =>
            isBefore(parseISO(i.dataInvestimento), dataFim) ||
            parseISO(i.dataInvestimento).getTime() === dataFim.getTime()
          );
        }

        return investimentos;
      },

      getInvestimentosAtivos: () => {
        return get().getAllInvestimentos().filter((i) => i.ativo);
      },

      getInvestimentosResgatados: () => {
        return get().getAllInvestimentos().filter((i) => !i.ativo);
      },

      getInvestimentosByTipo: (tipo) => {
        return get().getAllInvestimentos().filter((i) => i.tipo === tipo);
      },

      getInvestimentosByBanco: (banco) => {
        return get().getAllInvestimentos().filter((i) => i.banco === banco);
      },

      // ==================== POSIÇÕES ====================

      getPosicoesConsolidadas: () => {
        const investimentos = get().getInvestimentosAtivos();
        const posicoesMap = new Map<string, InvestmentPosition>();

        investimentos.forEach((inv) => {
          // Criar chave única para a posição
          const identificador = inv.nomeAcao || inv.descricao;
          const chave = `${inv.tipo}-${identificador}-${inv.banco}`;

          if (posicoesMap.has(chave)) {
            // Atualizar posição existente
            const posicao = posicoesMap.get(chave)!;
            posicao.quantidadeTotal += inv.quantidade || 0;
            posicao.valorTotalInvestido += inv.valor;
            posicao.transacoes.push(inv.id);
            // Recalcular preço médio
            if (posicao.quantidadeTotal > 0) {
              posicao.precoMedio = posicao.valorTotalInvestido / posicao.quantidadeTotal;
            }
          } else {
            // Criar nova posição
            posicoesMap.set(chave, {
              tipo: inv.tipo,
              identificador,
              banco: inv.banco,
              quantidadeTotal: inv.quantidade || 0,
              valorTotalInvestido: inv.valor,
              precoMedio: inv.valorUnitario || (inv.quantidade ? inv.valor / inv.quantidade : 0),
              transacoes: [inv.id],
            });
          }
        });

        return Array.from(posicoesMap.values());
      },

      getPosicaoPorAtivo: (tipo, identificador, banco) => {
        const posicoes = get().getPosicoesConsolidadas();
        return posicoes.find(
          (p) => p.tipo === tipo && p.identificador === identificador && p.banco === banco
        );
      },

      // ==================== RESGATE ====================

      resgatar: (id, valorResgate, dataResgate) => {
        const investimento = get().investimentos[id];
        if (!investimento) return;

        set((state) => ({
          investimentos: {
            ...state.investimentos,
            [id]: {
              ...investimento,
              ativo: false,
              dataResgate,
              valorResgate,
            },
          },
        }));
      },

      // ==================== RESUMOS ====================

      getSummary: () => {
        const investimentos = get().getAllInvestimentos();
        const ativos = investimentos.filter((i) => i.ativo);
        const resgatados = investimentos.filter((i) => !i.ativo);

        const totalInvestido = investimentos.reduce((sum, i) => sum + i.valor, 0);
        const totalResgatado = resgatados.reduce((sum, i) => sum + (i.valorResgate || 0), 0);
        const saldoInvestido = ativos.reduce((sum, i) => sum + i.valor, 0);

        const investimentosPorTipo = get().getTotalInvestidoPorTipo();
        const investimentosPorBanco = get().getTotalInvestidoPorBanco();

        return {
          totalInvestido,
          totalResgatado,
          saldoInvestido,
          investimentosPorTipo,
          investimentosPorBanco,
          quantidadeAtivos: ativos.length,
          quantidadeResgatados: resgatados.length,
        };
      },

      getTotalInvestidoPorTipo: () => {
        const investimentos = get().getInvestimentosAtivos();
        const totais: Partial<Record<InvestmentType, number>> = {};

        investimentos.forEach((inv) => {
          if (!totais[inv.tipo]) {
            totais[inv.tipo] = 0;
          }
          totais[inv.tipo]! += inv.valor;
        });

        return totais as Record<InvestmentType, number>;
      },

      getTotalInvestidoPorBanco: () => {
        const investimentos = get().getInvestimentosAtivos();
        const totais: Record<string, number> = {};

        investimentos.forEach((inv) => {
          if (!totais[inv.banco]) {
            totais[inv.banco] = 0;
          }
          totais[inv.banco] += inv.valor;
        });

        return totais;
      },

      getBancosUnicos: () => {
        const investimentos = get().getAllInvestimentos();
        const bancosSet = new Set(investimentos.map((i) => i.banco));
        return Array.from(bancosSet).sort();
      },
    }),
    {
      name: 'investment-storage',
      version: 1,
    }
  )
);
