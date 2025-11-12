# FinControl - Sistema de Controle Financeiro Pessoal

Sistema completo de controle financeiro pessoal desenvolvido em React + TypeScript, que roda 100% no navegador.

## 📊 Visão Geral

O **FinControl** é uma aplicação robusta de gestão financeira pessoal que oferece controle completo de:
- **Fluxo de Caixa** com cálculos automáticos e transações recorrentes
- **Empréstimos** com controle detalhado de parcelas
- **Cartões de Crédito** com gestão de faturas e parcelamentos
- **Investimentos** em diversos tipos de ativos com controle de rentabilidade
- **Dashboard** consolidado com métricas e histórico

Todos os dados são armazenados localmente (LocalStorage), garantindo privacidade total e funcionamento offline.

---

## 🚀 Funcionalidades Implementadas

### 💰 Fluxo de Caixa
- ✅ Controle diário de entradas, saídas e despesas
- ✅ Cálculo automático de saldo acumulativo
- ✅ Visualização mensal com navegação entre meses
- ✅ Destaque do dia atual
- ✅ Totalizadores automáticos por mês
- ✅ Edição inline com duplo clique
- ✅ Fluxo de saldo entre meses (saldo final → saldo inicial)
- ✅ Sistema de transações individuais com descrição e categoria
- ✅ **Transações recorrentes** (diária, semanal, quinzenal, mensal, trimestral, anual)
- ✅ **Integração automática** com cartões de crédito e investimentos
- ✅ Sanitização automática de dados corrompidos
- ✅ Sistema de emergência para recálculo completo

### 💳 Cartões de Crédito
- ✅ Cadastro de múltiplos cartões
- ✅ Configuração de limite, dia de vencimento e fechamento
- ✅ Controle de transações por cartão
- ✅ **Parcelamento automático** de compras
- ✅ Geração automática de faturas mensais
- ✅ Cálculo de limite disponível
- ✅ Integração com fluxo de caixa (faturas lançadas no vencimento)
- ✅ Status de faturas (aberta, fechada, paga, vencida)
- ✅ Inativação de cartões

### 💵 Empréstimos
- ✅ Cadastro de empréstimos com parcelas
- ✅ Informações: valor da parcela, banco, total de parcelas, descrição
- ✅ Cálculo automático de valores totais
- ✅ Marcação de parcelas pagas
- ✅ Barra de progresso visual
- ✅ Totalizadores gerais (total emprestado, pago, a pagar)

### 📈 Investimentos
- ✅ Cadastro de diversos tipos:
  - Ações, FIIs, Criptomoedas
  - Renda Fixa, Tesouro Direto, CDB, LCI/LCA
  - Fundos, Debêntures, COE, Previdência
- ✅ Controle de quantidade e preço médio
- ✅ Registro de resgates com rentabilidade
- ✅ Posições consolidadas por ativo
- ✅ Filtros por tipo, banco, período
- ✅ Resumos por tipo e banco
- ✅ Integração com fluxo de caixa

### 📊 Dashboard
- ✅ Cards de resumo financeiro:
  - Saldo atual
  - Entradas do mês
  - Saídas do mês
  - Performance do mês (entradas - saídas)
  - Total em empréstimos
  - Disponível para investimento (8.1% das entradas)
- ✅ Histórico dos últimos 6 meses
- ✅ Ações rápidas para navegação
- ✅ Dicas financeiras

### 🌐 Internacionalização (i18n)
- ✅ Suporte a 3 idiomas: Português (BR), Inglês (US), Espanhol (ES)
- ✅ Detecção automática do idioma do navegador
- ✅ Seletor de idioma no header com flags
- ✅ Persistência de preferência do usuário
- ✅ Traduções em 33+ strings por idioma
- ✅ Suporte a interpolação de valores
- ✅ Fallback automático para português

### 🎨 Tema Escuro (Dark Mode)
- ✅ Três modos: Light, Dark e System
- ✅ Detecção automática de preferência do sistema (prefers-color-scheme)
- ✅ Toggle de tema no header
- ✅ Persistência de preferência do usuário
- ✅ Listeners em tempo real para mudanças do SO
- ✅ Aplicação consistente em 16+ componentes
- ✅ Transições suaves entre temas

### ♿ Acessibilidade (A11y)
- ✅ Focus trap em modais
- ✅ Suporte a navegação por teclado (Tab, Shift+Tab, Esc)
- ✅ Atributos ARIA (role, aria-label, aria-pressed, etc.)
- ✅ Focus rings visíveis em elementos interativos
- ✅ Notificações com role="alert"
- ✅ Tags HTML semânticas (header, nav, button)
- ✅ Hooks customizados (useFocusTrap, useKeyboardShortcut)

### 🛡️ Tratamento de Erros e Logs
- ✅ Error Boundary completo com UI amigável
- ✅ Sistema de notificações (Toast) com 4 tipos
- ✅ Sistema de logging estruturado (9 loggers especializados)
- ✅ Mensagens de erro amigáveis ao usuário
- ✅ Auto-dismiss em notificações
- ✅ Logs condicionais (dev vs prod)

### ⚙️ Configurações
- ✅ Exportar dados completos (JSON)
- ✅ Importar dados de backup (JSON)
- ✅ Limpar todos os dados
- ✅ Backup automático via LocalStorage
- ✅ Versionamento de schemas
- ✅ Migrações automáticas

---

## 🛠️ Stack Tecnológico

### Core
- **React 19.1.1** - Framework principal (com React 19 RC)
- **TypeScript 5.9.3** - Tipagem estática forte
- **Vite 7.1.7** - Build tool otimizado

### Gerenciamento de Estado
- **Zustand 5.0.8** - State management leve e performático
- **Zustand Persist** - Persistência automática em LocalStorage

### UI e Estilização
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **Lucide React 0.548.0** - Biblioteca de ícones moderna
- **PostCSS + Autoprefixer** - Processamento CSS

### Roteamento e Utilidades
- **React Router DOM 7.9.5** - Roteamento SPA
- **date-fns 4.1.0** - Manipulação de datas
- **Recharts 3.3.0** - Gráficos e visualizações
- **XLSX 0.18.5** - Exportação para Excel

### Internacionalização e Temas
- **react-i18next 15.3.3** - Sistema de i18n completo
- **i18next 24.4.0** - Framework de internacionalização

### Qualidade de Código
- **ESLint 9.36.0** - Linting
- **TypeScript ESLint 8.45.0** - Regras TypeScript

---

## 📦 Instalação e Execução

```bash
# Clone o repositório
git clone <repository-url>
cd fin

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Análise de código
npm run lint
```

---

## 🎯 Como Usar

### Fluxo de Caixa
1. Acesse "Fluxo de Caixa" no menu
2. Navegue entre os meses usando os botões ou "Hoje"
3. Clique duas vezes em qualquer célula para editar valores diários
4. Use "Gerenciar Transações" para adicionar transações individuais
5. Configure transações recorrentes para automatizar lançamentos
6. O saldo é calculado automaticamente

### Cartões de Crédito
1. Acesse "Cartões" no menu
2. Adicione um novo cartão com limite e datas
3. Registre compras (à vista ou parceladas)
4. Acompanhe as faturas mensais
5. Marque faturas como pagas (lançamento automático no fluxo de caixa)

### Empréstimos
1. Acesse "Empréstimos" no menu
2. Clique em "Adicionar Empréstimo"
3. Preencha os dados: valor da parcela, banco, quantidade de parcelas
4. Use o botão "+" para marcar parcelas como pagas
5. Acompanhe o progresso com a barra visual

### Investimentos
1. Acesse "Investimentos" no menu
2. Adicione novos investimentos especificando tipo e banco
3. Para ações/criptos, informe quantidade e preço médio
4. Registre resgates quando necessário
5. Visualize resumos consolidados por tipo e banco

### Backup e Restauração
1. Acesse "Configurações" no menu
2. Use "Exportar Dados" para fazer backup completo em JSON
3. Use "Importar Dados" para restaurar de um backup
4. ⚠️ **ATENÇÃO**: A importação sobrescreve todos os dados atuais

---

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

### Cartões de Crédito
```
limite_disponivel = limite_total - valor_fatura_aberta
valor_fatura = soma(transações_não_pagas_do_período)
```

### Investimentos
```
total_investido = soma(valores_aplicados)
total_resgatado = soma(valores_resgates)
rentabilidade = valor_resgate - valor_aplicacao
```

---

## 📊 Estrutura do Projeto

```
src/
├── components/
│   ├── common/              # Componentes reutilizáveis
│   │   ├── Header.tsx       # Navegação principal
│   │   ├── Card.tsx         # Card genérico
│   │   └── CurrencyInput.tsx # Input de moeda
│   ├── cashflow/            # Componentes de fluxo de caixa
│   │   ├── MonthGrid.tsx    # Grade mensal
│   │   ├── DayRow.tsx       # Linha de dia
│   │   ├── TransactionsList.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── RecurringTransactionsManager.tsx
│   │   └── EmergencyReset.tsx
│   ├── loans/               # Componentes de empréstimos
│   │   ├── LoanForm.tsx
│   │   └── LoanRow.tsx
│   ├── creditcard/          # Componentes de cartões
│   │   ├── CreditCardForm.tsx
│   │   └── CreditCardCard.tsx
│   └── investment/          # Componentes de investimentos
│       ├── InvestmentForm.tsx
│       └── InvestmentCard.tsx
├── pages/                   # Páginas principais
│   ├── Dashboard.tsx        # Dashboard com visão geral
│   ├── CashFlow.tsx         # Fluxo de caixa mensal
│   ├── Loans.tsx            # Gestão de empréstimos
│   ├── CreditCards.tsx      # Gestão de cartões
│   ├── Investments.tsx      # Gestão de investimentos
│   └── Settings.tsx         # Configurações/backup
├── store/                   # Stores Zustand
│   ├── cashFlowStore.ts     # Estado do fluxo de caixa
│   ├── loansStore.ts        # Estado dos empréstimos
│   ├── creditCardStore.ts   # Estado dos cartões
│   └── investmentStore.ts   # Estado dos investimentos
├── types/                   # Definições TypeScript
│   ├── cashflow.ts          # Tipos de transações/fluxo
│   ├── loans.ts             # Tipos de empréstimos
│   ├── creditcard.ts        # Tipos de cartões
│   └── investment.ts        # Tipos de investimentos
├── utils/                   # Funções utilitárias
│   ├── calculations.ts      # Cálculos financeiros
│   ├── formatters.ts        # Formatação de valores/datas
│   ├── recurrence.ts        # Lógica de recorrência
│   ├── creditCardIntegration.ts
│   └── investmentIntegration.ts
├── hooks/                   # Hooks customizados
│   └── useLocalStorage.ts
└── App.tsx                  # Componente raiz com rotas
```

---

## 💾 Armazenamento

Todos os dados são armazenados localmente no navegador usando LocalStorage:

- **`cashflow-storage`** (v8): Fluxo de caixa e transações recorrentes
- **`loans-storage`**: Dados dos empréstimos
- **`credit-card-storage`**: Cartões, transações e faturas
- **`investment-storage`**: Investimentos e resgates

### Sistema de Versionamento
- Migrações automáticas entre versões
- Sanitização de dados corrompidos
- Validação de tipos e valores
- Logs detalhados para debug

**⚠️ IMPORTANTE**:
- Faça backups regulares através de "Configurações → Exportar Dados"
- Os dados são mantidos apenas no navegador local
- Limpar cache do navegador pode resultar em perda de dados
- Recomenda-se backup semanal ou após grandes lançamentos

---

## 🎨 Temas e Cores

### Paleta de Cores
- **Primária**: Azul `#3B82F6`
- **Sucesso**: Verde `#10B981`
- **Perigo**: Vermelho `#EF4444`
- **Aviso**: Amarelo `#F59E0B`

### Customização Tailwind
- Sistema de cores configurado no `tailwind.config.js`
- Classes utilitárias customizadas para valores monetários
- Responsividade com breakpoints padrão

---

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- ✅ **Desktop** (recomendado para melhor experiência)
- ✅ **Tablets** (iPad, Android tablets)
- ✅ **Smartphones** (iOS, Android)

Layout adaptável com Tailwind CSS Grid e Flexbox.

---

## 🔒 Segurança e Privacidade

- ✅ Dados armazenados **apenas localmente**
- ✅ **Sem envio** para servidores externos
- ✅ Funciona **100% offline**
- ✅ Sem cookies ou rastreamento
- ✅ Validação de valores para evitar corrupção
- ✅ Sistema de sanitização automática

**Privacidade Garantida**: Suas informações financeiras nunca saem do seu dispositivo.

---

## 🎉 Progresso Recente

### Últimas Implementações (Novembro 2025)

**✅ Concluídas:**
1. **Internacionalização (i18n)** - Sistema completo com 3 idiomas (pt-BR, en-US, es-ES)
2. **Dark Mode** - Tema escuro completo com detecção do sistema
3. **Acessibilidade** - Focus trap, keyboard shortcuts, ARIA attributes
4. **Error Handling** - Error Boundary + Sistema de Toast notifications
5. **Logging System** - Logger estruturado com 9 loggers especializados
6. **Console Cleanup** - Remoção de console.logs de produção
7. **Testes Automatizados** - 127 testes com 88.75% de cobertura ⭐ NOVO!

**📊 Status Atual:**
- **Funcionalidades Core**: 100% completas (Fluxo de Caixa, Cartões, Empréstimos, Investimentos)
- **UX/UI Moderna**: 80% completa (i18n, dark mode, a11y)
- **Qualidade de Código**: 90% completa (logging, error handling, testes implementados) ⬆️
- **Performance**: 40% otimizada (falta memoization, virtualização)

**🎯 Próximas Prioridades:**
1. ~~Implementar suite de testes automatizados~~ ✅ Concluído (88.75% coverage)
2. Estados de carregamento e feedback visual
3. Otimização de performance (React.memo, useMemo, useCallback)
4. Testes para stores Zustand e testes de integração
5. Sistema de categorias para transações

---

## 🚧 Roadmap - Próximos Passos

### 🔴 PRIORIDADE ALTA - Qualidade e Estabilidade

#### 1. Testes Automatizados
**Status**: ✅ Implementado (88.75% de cobertura)
**Impacto**: CRÍTICO
- [x] Configurar **Vitest** + **React Testing Library**
- [x] Instalar dependências de teste (vitest, @testing-library/react, @vitest/coverage-v8)
- [x] Criar arquivo de setup (`src/test/setup.ts`)
- [x] Testes unitários para utils (formatters - 23 testes, calculations - 31 testes, recurrence - 24 testes)
- [x] Testes unitários para hooks customizados (useToast - 17 testes)
- [x] Testes de componentes React (ErrorBoundary - 13 testes, Toast - 19 testes)
- [ ] Testes unitários para stores (Zustand) - pendente
- [ ] Testes de integração para fluxos principais - pendente
- [ ] Testes E2E com **Playwright** ou **Cypress** - pendente
- [x] Configurar coverage (88.75% atual)
- [x] **Meta Parcial**: 127 testes implementados, 88.75% coverage

**Progresso**: **127 testes passando** com **88.75% de cobertura** (statements)
**Detalhes de Coverage**:
- `formatters.ts`: 100% cobertura
- `calculations.ts`: 85.04% cobertura
- `recurrence.ts`: 85.22% cobertura
- `useToast.ts`: 100% cobertura
- `ErrorBoundary.tsx`: 100% cobertura
- `Toast.tsx`: 100% cobertura

**Arquivos de Teste**:
- `src/utils/formatters.test.ts`
- `src/utils/calculations.test.ts`
- `src/utils/recurrence.test.ts`
- `src/hooks/useToast.test.ts`
- `src/components/common/ErrorBoundary.test.tsx`
- `src/components/common/Toast.test.tsx`

**Benefícios**: Previne regressões, facilita refatorações, aumenta confiança no código.

---

#### 2. Limpeza de Console Logs
**Status**: ✅ Concluído
**Impacto**: MÉDIO
- [x] Remover `console.log` do `cashFlowStore.ts` (linhas 278, 291, 315+)
- [x] Remover `console.log` de outros arquivos de produção
- [x] Implementar sistema de logging estruturado (logger.ts)
- [x] Configurar ESLint para alertar sobre console.logs
- [x] Adicionar ferramenta de logging condicional (dev vs prod)

**Concluído**: Sistema de logger criado, console.logs comentados, ESLint configurado
**Benefícios**: Código mais limpo, melhor performance, profissionalismo.

---

#### 3. Tratamento de Erros Robusto
**Status**: ✅ Implementado (核心功能)
**Impacto**: ALTO
- [x] Implementar **Error Boundaries** (React) - completo com UI amigável
- [x] Criar sistema de notificações de erro (toast/snackbar) - 4 tipos (success, error, warning, info)
- [x] Sistema de logging estruturado com 9 loggers especializados
- [ ] Adicionar tratamento de erros em operações assíncronas
- [ ] Validação de entrada em todos os formulários com feedback visual
- [ ] Tratamento de erros de parse JSON (import/export)
- [x] Fallback para dados corrompidos no localStorage (já existe)
- [x] Mensagens de erro amigáveis ao usuário

**Progresso**: ErrorBoundary completo, sistema de Toast com Zustand, Logger com 5 níveis
**Arquivos**: `ErrorBoundary.tsx`, `Toast.tsx`, `ToastContainer.tsx`, `useToast.ts`, `logger.ts`
**Benefícios**: Melhor UX, menos crashes, maior confiabilidade, debugging facilitado.

---

#### 4. Validação e Sanitização de Dados
**Status**: ⚠️ Parcialmente implementado
**Impacto**: ALTO
- [ ] Validação de formulários com **Zod** ou **Yup**
- [x] Validação de entrada para valores monetários (toSafeNumber)
- [x] Sanitização de entrada de texto (XSS prevention)
- [x] Validação de datas e períodos
- [x] Limites de valores (já existe - R$ 10 milhões)
- [ ] Validação de CPF/CNPJ (se aplicável)
- [ ] Feedback visual de validação em tempo real

**Progresso**: Validações básicas implementadas, falta validação com schema
**Benefícios**: Dados consistentes, prevenção de bugs, segurança.

---

### 🟡 PRIORIDADE MÉDIA - UX e Performance

#### 5. Estados de Carregamento e Feedback Visual
**Status**: ❌ Não implementado
**Impacto**: MÉDIO
- [ ] Loading spinners para operações pesadas
- [ ] Skeleton screens para listagens
- [ ] Feedback de sucesso/erro com toasts
- [ ] Animações de transição suaves
- [ ] Confirmações visuais de ações (ex: "Salvo com sucesso")
- [ ] Progress bars para operações longas
- [ ] Estados vazios (empty states) informativos

**Benefícios**: Melhor percepção de performance, UX mais fluida.

---

#### 6. Otimização de Performance
**Status**: ⚠️ Pouco otimizado (apenas 5 usos de memo/callback)
**Impacto**: MÉDIO
- [ ] Adicionar `React.memo` em componentes pesados
- [ ] Usar `useMemo` para cálculos complexos
- [ ] Usar `useCallback` para funções passadas como props
- [ ] Virtualização de listas longas (**react-window** ou **react-virtual**)
- [ ] Code splitting por rota
- [ ] Lazy loading de componentes pesados
- [ ] Debounce em inputs de busca/filtro
- [ ] Otimizar re-renders com Zustand selectors

**Benefícios**: App mais rápido, melhor experiência em dispositivos lentos.

---

#### 7. Acessibilidade (A11y)
**Status**: ✅ Implementado (70% completo)
**Impacto**: ALTO
- [x] Adicionar atributos ARIA (`aria-label`, `aria-describedby`, `aria-pressed`, `role`, etc) - 15+ instâncias
- [x] Suporte a navegação por teclado (Tab, Shift+Tab, Esc)
- [x] Focus management (foco visível com focus rings, trap de foco em modais)
- [x] Hooks customizados: `useFocusTrap`, `useKeyboardShortcut`
- [x] Atributos `role` em elementos interativos (dialog, alert, document)
- [x] Tags HTML semânticas (header, nav, button, input)
- [x] Focus rings visíveis em todos elementos interativos
- [x] Modal com role="dialog" e aria-modal="true"
- [x] Toast com role="alert"
- [ ] Skip links para navegação rápida
- [ ] Contraste de cores conforme WCAG 2.1 (AAA) - parcialmente implementado
- [ ] Testes com leitores de tela (NVDA, JAWS, VoiceOver)
- [ ] Mensagens de erro associadas a inputs (`aria-invalid`, `aria-describedby` em erros)
- [ ] Testes automatizados de acessibilidade (axe-core)

**Progresso**: Fundamentos sólidos implementados, falta polimento e testes
**Arquivos**: `useFocusTrap.ts`, `useKeyboardShortcut.ts`, `Modal.tsx`, `Toast.tsx`, `ThemeToggle.tsx`
**Benefícios**: Inclusão, conformidade legal, melhor UX para todos.

---

#### 8. Internacionalização (i18n)
**Status**: ✅ Concluído (funcionalidade básica completa)
**Impacto**: BAIXO (curto prazo) / ALTO (longo prazo)
- [x] Configurar **react-i18next** (v15.3.3) + **i18next** (v24.4.0)
- [x] Extrair strings para arquivos de tradução (33+ strings por idioma)
- [x] Suporte a pt-BR, en-US, es-ES
- [x] Detecção automática de idioma do navegador
- [x] Seletor de idioma no header com flags de países
- [x] Persistir preferência de idioma (localStorage: 'fin-language-preference')
- [x] Fallback automático para português (BR)
- [x] Hook `useTranslation()` integrado em múltiplos componentes
- [x] Setter de idioma no HTML root (document.documentElement.lang)
- [ ] Formatação de moeda por locale (ainda usa formato BR para todos)
- [ ] Formatação de datas por locale (ainda usa date-fns sem i18n)
- [ ] Expandir traduções para telas específicas (CashFlow, Loans, Investments)

**Progresso**: Fundamentos completos, traduções básicas implementadas
**Arquivos**: `i18n/config.ts`, `i18n/locales/{pt-BR,en-US,es-ES}.json`, `LanguageSwitcher.tsx`
**Benefícios**: Alcance internacional, maior base de usuários.

---

#### 9. Tema Escuro (Dark Mode)
**Status**: ✅ Concluído
**Impacto**: MÉDIO
- [x] Configurar dark mode no Tailwind CSS (`darkMode: 'class'`)
- [x] Criar paleta de cores para tema escuro (gray-900, gray-800, gray-100)
- [x] Toggle de tema no header com 3 opções (Light/Dark/System)
- [x] Componentes de UI: `ThemeToggle` e `ThemeToggleIcon`
- [x] Persistir preferência do usuário (localStorage: 'fin-theme-preference')
- [x] Suporte a preferência do sistema (`prefers-color-scheme`)
- [x] Listeners em tempo real para mudanças do SO
- [x] Context Provider completo (`ThemeContext`)
- [x] Classes `dark:` aplicadas em 16+ componentes
- [x] Transições suaves com `transition-colors`
- [x] Garantir contraste adequado em ambos os temas

**Progresso**: Implementação completa e funcional
**Arquivos**: `ThemeContext.tsx`, `ThemeToggle.tsx`, `tailwind.config.js`, `App.tsx`
**Benefícios**: Conforto visual, economia de bateria (OLED), modernidade.

---

### 🟢 PRIORIDADE BAIXA - Recursos Avançados

#### 10. PWA (Progressive Web App)
**Status**: ❌ Não implementado
**Impacto**: MÉDIO
- [ ] Configurar Service Worker
- [ ] Adicionar `manifest.json` (ícones, nome, cores)
- [ ] Implementar cache de assets
- [ ] Offline first com estratégia de cache
- [ ] Notificações push (opcional)
- [ ] Instalação no dispositivo (Add to Home Screen)
- [ ] Sincronização em background (opcional)

**Benefícios**: Funcionamento offline melhorado, experiência nativa, engajamento.

---

#### 11. Gráficos e Visualizações Avançadas
**Status**: ⚠️ Recharts instalado, pouco usado
**Impacto**: MÉDIO
- [ ] Gráfico de linha: evolução do saldo mensal (6-12 meses)
- [ ] Gráfico de pizza: distribuição de gastos por categoria
- [ ] Gráfico de barras: comparação de entradas vs saídas
- [ ] Gráfico de área: patrimônio líquido ao longo do tempo
- [ ] Gráfico de composição de investimentos
- [ ] Filtros interativos (período, tipo, categoria)
- [ ] Exportação de gráficos como imagem (PNG/SVG)

**Benefícios**: Insights visuais, análise de tendências, decisões informadas.

---

#### 12. Sistema de Categorias
**Status**: ❌ Não implementado
**Impacto**: ALTO
- [ ] Criar modelo de dados para categorias
- [ ] Categorias padrão (Alimentação, Transporte, Saúde, etc)
- [ ] CRUD de categorias customizadas
- [ ] Ícones e cores por categoria
- [ ] Associar transações a categorias
- [ ] Filtros por categoria
- [ ] Relatórios por categoria
- [ ] Gráficos de gastos por categoria

**Benefícios**: Organização, análise detalhada, controle por área de gasto.

---

#### 13. Relatórios e Exportações
**Status**: ⚠️ Exportação JSON implementada, XLSX instalado mas não usado
**Impacto**: MÉDIO
- [ ] Exportar fluxo de caixa para Excel (.xlsx)
- [ ] Exportar relatórios consolidados (PDF)
- [ ] Relatório mensal formatado
- [ ] Relatório anual com comparativos
- [ ] Relatório de investimentos com rentabilidade
- [ ] Relatório de cartões de crédito
- [ ] Filtros de período personalizados
- [ ] Templates de relatórios customizáveis

**Benefícios**: Análise externa, compartilhamento, documentação fiscal.

---

#### 14. Multi-moeda
**Status**: ❌ Não implementado (apenas BRL)
**Impacto**: BAIXO
- [ ] Suporte a múltiplas moedas (USD, EUR, BRL, etc)
- [ ] Seletor de moeda padrão
- [ ] Conversão automática com APIs de câmbio (ex: Open Exchange Rates)
- [ ] Histórico de taxas de câmbio
- [ ] Cálculos considerando variação cambial
- [ ] Investimentos em moedas diferentes
- [ ] Formatação automática por moeda

**Benefícios**: Uso internacional, investimentos no exterior, viagens.

---

#### 15. Metas e Orçamentos
**Status**: ❌ Não implementado
**Impacto**: MÉDIO
- [ ] Definir metas de economia mensais/anuais
- [ ] Definir orçamento por categoria
- [ ] Acompanhamento de progresso (% atingido)
- [ ] Alertas ao ultrapassar orçamento
- [ ] Gráficos de meta vs realizado
- [ ] Histórico de cumprimento de metas
- [ ] Sugestões de ajuste de orçamento

**Benefícios**: Disciplina financeira, alcance de objetivos, controle de gastos.

---

#### 16. Planejamento Financeiro
**Status**: ❌ Não implementado
**Impacto**: BAIXO
- [ ] Simulador de aposentadoria
- [ ] Calculadora de juros compostos
- [ ] Projeção de patrimônio futuro
- [ ] Simulador de empréstimos (Tabela Price, SAC)
- [ ] Calculadora de investimentos
- [ ] Análise de viabilidade de compras grandes
- [ ] Cenários "what-if" (simulações)

**Benefícios**: Planejamento de longo prazo, decisões estratégicas, educação financeira.

---

#### 17. Importação de Extratos Bancários
**Status**: ❌ Não implementado
**Impacto**: ALTO
- [ ] Parser de OFX (Open Financial Exchange)
- [ ] Parser de CSV de bancos principais (Nubank, Inter, etc)
- [ ] Importação de extratos de cartões de crédito
- [ ] Mapeamento automático de categorias (IA/regras)
- [ ] Reconciliação com transações existentes (deduplicação)
- [ ] Suporte a múltiplos formatos de arquivo
- [ ] Preview antes de importar

**Benefícios**: Reduz trabalho manual, maior precisão, economia de tempo.

---

#### 18. Lembretes e Notificações
**Status**: ❌ Não implementado
**Impacto**: MÉDIO
- [ ] Lembretes de vencimento de faturas
- [ ] Alertas de metas não cumpridas
- [ ] Notificações de despesas recorrentes
- [ ] Alertas de orçamento excedido
- [ ] Lembretes de backup de dados
- [ ] Configuração de notificações (ativar/desativar por tipo)
- [ ] Notificações push (PWA)

**Benefícios**: Não esquecer pagamentos, proatividade, melhor controle.

---

### 🔧 INFRAESTRUTURA E DevOps

#### 19. CI/CD Pipeline
**Status**: ❌ Não implementado
**Impacto**: MÉDIO
- [ ] Configurar GitHub Actions ou GitLab CI
- [ ] Pipeline de build automático
- [ ] Testes automatizados no CI
- [ ] Linting no CI
- [ ] Build de preview para PRs
- [ ] Deploy automático para produção
- [ ] Versionamento semântico (Semantic Release)
- [ ] Changelog automático

**Benefícios**: Deploys mais rápidos, menos erros, automação completa.

---

#### 20. Containerização e Deploy
**Status**: ❌ Não implementado
**Impacto**: BAIXO (app estático)
- [ ] Dockerfile otimizado (multi-stage build)
- [ ] Docker Compose para desenvolvimento
- [ ] Deploy em Vercel, Netlify ou GitHub Pages
- [ ] Configuração de domínio customizado
- [ ] HTTPS obrigatório
- [ ] CDN para assets estáticos
- [ ] Monitoramento de uptime

**Benefícios**: Deploy consistente, fácil replicação, disponibilidade.

---

#### 21. Monitoramento e Analytics
**Status**: ❌ Não implementado
**Impacto**: BAIXO
- [ ] Integração com Google Analytics ou Plausible (privacy-focused)
- [ ] Monitoramento de erros com Sentry
- [ ] Métricas de performance (Web Vitals)
- [ ] Heatmaps de uso (Hotjar, opcional)
- [ ] Funnel de conversão (se houver)
- [ ] Dashboard de métricas
- [ ] Alertas de erros críticos

**Benefícios**: Entender uso real, identificar problemas, otimizar UX.

---

#### 22. Documentação Técnica
**Status**: ⚠️ README básico
**Impacto**: MÉDIO
- [ ] Documentação de componentes (Storybook)
- [ ] Documentação de arquitetura (diagramas)
- [ ] Guia de contribuição (CONTRIBUTING.md)
- [ ] Changelog estruturado (CHANGELOG.md)
- [ ] Documentação de APIs internas (TSDoc)
- [ ] Exemplos de uso de hooks e utils
- [ ] Guia de setup para novos desenvolvedores

**Benefícios**: Onboarding rápido, manutenção facilitada, colaboração.

---

### 🎨 MELHORIAS DE UX/UI

#### 23. Melhorias de Interface
**Status**: ⚠️ Interface funcional, mas pode melhorar
**Impacto**: MÉDIO
- [ ] Onboarding interativo para novos usuários
- [ ] Tour guiado (tooltips interativos)
- [ ] Atalhos de teclado (shortcuts)
- [ ] Busca global (Cmd+K / Ctrl+K)
- [ ] Breadcrumbs de navegação
- [ ] Histórico de ações (undo/redo)
- [ ] Modo de edição em lote
- [ ] Drag-and-drop para reordenar itens

**Benefícios**: Produtividade, facilidade de uso, UX moderna.

---

#### 24. Design System
**Status**: ⚠️ Componentes customizados, mas sem sistema formal
**Impacto**: MÉDIO
- [ ] Documentação de componentes (Storybook)
- [ ] Sistema de espaçamento consistente
- [ ] Sistema de tipografia definido
- [ ] Biblioteca de componentes reutilizáveis
- [ ] Tokens de design (cores, tamanhos, espaçamentos)
- [ ] Guia de estilo visual
- [ ] Padrões de interação documentados

**Benefícios**: Consistência visual, desenvolvimento mais rápido, escalabilidade.

---

#### 25. Mobile-First Otimizações
**Status**: ⚠️ Responsivo, mas não otimizado para mobile
**Impacto**: MÉDIO
- [ ] Melhorar UX em telas pequenas
- [ ] Gestos touch otimizados (swipe, pinch-to-zoom)
- [ ] Bottom sheet para modais no mobile
- [ ] Tab bar inferior no mobile
- [ ] Inputs otimizados para mobile (teclado numérico)
- [ ] Testar em dispositivos reais (iOS, Android)
- [ ] Performance em redes lentas (3G)

**Benefícios**: Melhor experiência mobile, maior acessibilidade.

---

### 🔐 SEGURANÇA E PRIVACIDADE

#### 26. Backup Automático na Nuvem (Opcional)
**Status**: ❌ Não implementado (apenas manual local)
**Impacto**: MÉDIO
- [ ] Integração com Google Drive
- [ ] Integração com Dropbox
- [ ] Criptografia end-to-end dos backups
- [ ] Agendamento de backups automáticos
- [ ] Restauração de backups da nuvem
- [ ] Versionamento de backups (histórico)
- [ ] Autenticação OAuth segura

**Benefícios**: Proteção contra perda de dados, sincronização entre dispositivos.

---

#### 27. Criptografia de Dados (Opcional)
**Status**: ❌ Não implementado
**Impacto**: BAIXO (dados já são locais)
- [ ] Criptografia AES-256 dos dados no localStorage
- [ ] Senha mestra para desbloqueio
- [ ] Timeout de inatividade (auto-lock)
- [ ] Descriptografia apenas em memória
- [ ] Opção de "modo privado" (dados não persistem)

**Benefícios**: Proteção extra, privacidade em dispositivos compartilhados.

---

### 📊 ANÁLISE E INTELIGÊNCIA

#### 28. IA e Machine Learning (Futuro)
**Status**: ❌ Não implementado
**Impacto**: BAIXO (longo prazo)
- [ ] Sugestões inteligentes de categorização (ML)
- [ ] Previsão de gastos futuros (time series forecasting)
- [ ] Detecção de anomalias (gastos fora do padrão)
- [ ] Recomendações personalizadas de economia
- [ ] Análise de sentimento em descrições de transações
- [ ] Chatbot para consultas (NLP)

**Benefícios**: Automação, insights preditivos, experiência personalizada.

---

#### 29. Integração com Open Banking (Futuro)
**Status**: ❌ Não implementado
**Impacto**: BAIXO (requer backend)
- [ ] Integração com APIs de Open Banking (PIX, Open Finance)
- [ ] Sincronização automática de saldos bancários
- [ ] Importação automática de transações
- [ ] Alertas em tempo real de movimentações
- [ ] Conformidade com LGPD e regulamentações

**Benefícios**: Automação total, dados sempre atualizados, redução de trabalho manual.

---

## 📈 Cronograma Sugerido (6-12 meses)

### ✅ Fase 1 - Estabilização (Mês 1-2) - PARCIALMENTE CONCLUÍDA
1. ⚠️ Testes automatizados (apenas infraestrutura)
2. ✅ Limpeza de console logs
3. ✅ Tratamento de erros robusto (ErrorBoundary + Toast + Logger)
4. ⚠️ Validação e sanitização (parcial)

### ✅ Fase 2 - UX Essencial (Mês 3-4) - PARCIALMENTE CONCLUÍDA
5. ❌ Estados de carregamento
6. ⚠️ Otimização de performance (5 usos de memo/callback)
7. ✅ Acessibilidade (A11y) - 70% completo
8. ✅ Tema escuro (100% completo)

### 🔄 Fase 3 - Recursos Avançados (Mês 5-8) - EM ANDAMENTO
9. ❌ Sistema de categorias
10. ⚠️ Gráficos e visualizações (Recharts instalado, pouco usado)
11. ⚠️ Relatórios e exportações (JSON OK, XLSX instalado mas não usado)
12. ❌ Metas e orçamentos
13. ✅ Internacionalização (100% básico completo)

### 📅 Fase 4 - Escala e Polimento (Mês 9-12) - PLANEJADA
14. ❌ PWA
15. ❌ CI/CD e deploy automático
16. ❌ Importação de extratos

---

## 🎯 Métricas de Sucesso

Para acompanhar a evolução do projeto, sugere-se monitorar:

- **Cobertura de Testes**: Alvo de 80%+
- **Performance**: Lighthouse Score 90+
- **Acessibilidade**: WCAG 2.1 Level AA compliance
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bugs Reportados**: Tendência de redução mensal
- **Número de Usuários Ativos**: Crescimento consistente

---

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Padrões de código**:
- Seguir convenções do ESLint
- Escrever testes para novas funcionalidades
- Documentar componentes complexos
- Usar TypeScript estrito

---

## 📄 Licença

MIT License - Veja o arquivo LICENSE para mais detalhes.

---

## 👨‍💻 Sobre o Desenvolvimento

**Tecnologias**: React 19 + TypeScript + Tailwind CSS + Zustand
**Arquitetura**: Component-based, State Management com Zustand, Offline-first
**Filosofia**: Privacidade first, 100% local, sem rastreamento

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para ajudar pessoas a terem controle total de suas finanças pessoais.

**Stack de bibliotecas open-source utilizadas**:
- React & React DOM
- Zustand
- Tailwind CSS
- date-fns
- Recharts
- Lucide React
- XLSX
- Vite

---

## 📞 Suporte e Contato

Para sugestões, bugs ou dúvidas:
- Abra uma **issue** no GitHub
- Contribua com código via **pull requests**
- Compartilhe o projeto com amigos

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
