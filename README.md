# FinControl - Sistema de Controle Financeiro Pessoal

Sistema completo de controle financeiro pessoal desenvolvido em React + TypeScript, que roda 100% no navegador.

## 🚀 Funcionalidades

### Fluxo de Caixa
- ✅ Controle diário de entradas, saídas e despesas
- ✅ Cálculo automático de saldo acumulativo
- ✅ Visualização mensal com navegação entre meses
- ✅ Destaque do dia atual
- ✅ Totalizadores automáticos
- ✅ Edição inline com duplo clique
- ✅ Fluxo de saldo entre meses

### Empréstimos
- ✅ Cadastro de empréstimos com parcelas
- ✅ Cálculo automático de valores totais
- ✅ Marcação de parcelas pagas
- ✅ Barra de progresso visual
- ✅ Totalizadores gerais

### Dashboard
- ✅ Cards de resumo financeiro
- ✅ Saldo atual
- ✅ Performance do mês
- ✅ Total em empréstimos
- ✅ Cálculo de valor disponível para investimento (8.1%)
- ✅ Histórico dos últimos 6 meses
- ✅ Ações rápidas

### Configurações
- ✅ Exportar dados (JSON)
- ✅ Importar dados (JSON)
- ✅ Limpar dados
- ✅ Backup automático via LocalStorage

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones
- **LocalStorage** - Persistência de dados

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd fin

# Instale as dependências
npm install

# Execute o projeto em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## 🎯 Como Usar

### Fluxo de Caixa
1. Acesse "Fluxo de Caixa" no menu
2. Navegue entre os meses usando os botões ou "Hoje"
3. Clique duas vezes em qualquer célula para editar
4. Digite o valor e pressione Enter para salvar
5. O saldo é calculado automaticamente

### Empréstimos
1. Acesse "Empréstimos" no menu
2. Clique em "Adicionar Empréstimo"
3. Preencha os dados do empréstimo
4. Use o botão "+" para marcar parcelas como pagas
5. Acompanhe o progresso com a barra visual

### Backup e Restauração
1. Acesse "Configurações" no menu
2. Use "Exportar Dados" para fazer backup em JSON
3. Use "Importar Dados" para restaurar de um backup
4. ⚠️ A importação sobrescreve todos os dados atuais

## 🧮 Lógica de Cálculos

### Saldo Diário
```
Dia 1: saldo = saldo_inicial_mes + entrada - saida - diario
Dia N: saldo = saldo_dia_anterior + entrada - saida - diario
```

### Fluxo Entre Meses
```
saldo_inicial_mes_atual = saldo_final_mes_anterior
```

### Empréstimos
```
valor_total = valor_parcela × total_parcelas
total_pago = valor_parcela × parcelas_pagas
total_a_pagar = valor_total - total_pago
```

## 📊 Estrutura do Projeto

```
src/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   ├── cashflow/        # Componentes do fluxo de caixa
│   ├── loans/           # Componentes de empréstimos
│   └── dashboard/       # Componentes do dashboard
├── hooks/               # Hooks customizados
├── pages/               # Páginas da aplicação
├── store/               # Stores Zustand
├── types/               # Tipos TypeScript
├── utils/               # Funções utilitárias
└── App.tsx              # Componente principal
```

## 💾 Armazenamento

Todos os dados são armazenados localmente no navegador usando LocalStorage:
- `cashflow-storage`: Dados do fluxo de caixa
- `loans-storage`: Dados dos empréstimos

**⚠️ IMPORTANTE**: Faça backups regulares! Os dados são mantidos apenas no navegador.

## 🎨 Cores e Temas

- **Primária**: Azul (#3B82F6)
- **Sucesso**: Verde (#10B981)
- **Perigo**: Vermelho (#EF4444)
- **Aviso**: Amarelo (#F59E0B)

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (recomendado)
- Tablets
- Smartphones

## 🔒 Segurança

- Dados armazenados apenas localmente
- Sem envio para servidores externos
- Funciona 100% offline
- Backup manual recomendado

## 🚧 Próximas Funcionalidades

- [ ] Gráficos interativos com Recharts
- [ ] Exportação para Excel (XLSX)
- [ ] Sistema de categorias
- [ ] Relatórios detalhados
- [ ] PWA (Progressive Web App)
- [ ] Tema escuro
- [ ] Multi-moeda

## 📄 Licença

MIT License

## 👨‍💻 Desenvolvimento

Desenvolvido com React + TypeScript + Tailwind CSS
