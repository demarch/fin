# 🧪 Guia de Testes - FinControl

Este guia explica como testar e validar o funcionamento correto do sistema de fluxo de caixa.

## 🚀 Como Iniciar

```bash
# 1. Instalar dependências (se ainda não instalou)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Abrir no navegador
# O Vite mostrará a URL (geralmente http://localhost:5173)
```

## 🧮 Teste 1: Validação de Cálculos Automáticos

### Passo 1: Acessar Página de Testes
- URL: `http://localhost:5173/test`
- Esta página mostra cálculos detalhados e logs

### Passo 2: Executar Teste Automático
1. Clique no botão "Executar Teste"
2. Observe os valores nos primeiros 10 dias
3. Verifique a coluna "Cálculo" - deve mostrar a fórmula aplicada
4. Confira se os valores batem

### Valores Esperados (Teste Automático):
```
Dia 1:
  Entrada: R$ 1.000,00
  Saída: R$ 200,00
  Diário: R$ 50,00
  Saldo: R$ 750,00
  Cálculo: 0 + 1000 - 200 - 50 = 750

Dia 2:
  Entrada: R$ 500,00
  Saída: R$ 100,00
  Diário: R$ 0,00
  Saldo: R$ 1.150,00
  Cálculo: 750 + 500 - 100 - 0 = 1150

Dia 3 a 31:
  Saldo mantém em R$ 1.150,00 (sem movimentação)
```

### Passo 3: Verificar Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Procure por logs `[CashFlow]`
4. Verifique se os valores estão sendo atualizados corretamente

## 📊 Teste 2: Fluxo de Caixa Manual

### Passo 1: Acessar Fluxo de Caixa
- URL: `http://localhost:5173/fluxo-caixa`
- Você verá o mês atual com 31 dias

### Passo 2: Adicionar Entrada no Dia 1
1. **Localize** a linha do Dia 1
2. **Dê duplo-clique** na célula "Entrada"
3. **Digite**: `5000` (ou 5000,00)
4. **Pressione Enter**
5. **Verifique**:
   - ✅ Valor aparece como R$ 5.000,00 na célula
   - ✅ Saldo do Dia 1 = R$ 5.000,00
   - ✅ Saldo dos dias 2-31 também = R$ 5.000,00

### Passo 3: Adicionar Saída no Dia 1
1. **Dê duplo-clique** na célula "Saída" do Dia 1
2. **Digite**: `1500`
3. **Pressione Enter**
4. **Verifique**:
   - ✅ Saída = R$ 1.500,00
   - ✅ Saldo do Dia 1 = R$ 3.500,00 (5000 - 1500)
   - ✅ Saldo dos dias 2-31 = R$ 3.500,00

### Passo 4: Adicionar Entrada no Dia 5
1. **Localize** a linha do Dia 5
2. **Dê duplo-clique** na célula "Entrada"
3. **Digite**: `2000`
4. **Pressione Enter**
5. **Verifique**:
   - ✅ Dia 1 a 4: Saldo = R$ 3.500,00
   - ✅ Dia 5: Entrada = R$ 2.000,00
   - ✅ Dia 5 a 31: Saldo = R$ 5.500,00 (3500 + 2000)

### Passo 5: Verificar Totais
Role até o final da tabela e confira:
- **Total Entradas**: R$ 7.000,00 (5000 + 2000)
- **Total Saídas**: R$ 1.500,00
- **Saldo Final**: R$ 5.500,00

## 🔄 Teste 3: Fluxo Entre Meses

### Passo 1: Adicionar Valores no Mês Atual
1. Adicione entradas e saídas no mês atual
2. Anote o **Saldo Final** do mês

### Passo 2: Navegar para o Mês Seguinte
1. Clique no botão "Próximo"
2. Observe o **Saldo Inicial** do novo mês
3. **Verifique**: Saldo Inicial = Saldo Final do mês anterior ✅

### Passo 3: Alterar Mês Anterior
1. Volte para o mês anterior (botão "Anterior")
2. Altere algum valor (ex: adicione uma entrada de R$ 100,00)
3. Vá novamente para o mês seguinte
4. **Verifique**: Saldo Inicial foi atualizado com a nova diferença ✅

## 🔍 Teste 4: Validação de Bugs Anteriores

### Bug 1: "Valor replica para o passado"
**Teste**:
1. Adicione R$ 100,00 de entrada no Dia 10
2. **Verifique**:
   - ❌ NÃO deve aparecer R$ 100,00 nos Dias 1-9
   - ✅ Deve aparecer apenas no Dia 10
   - ✅ Saldo do Dia 10 = Saldo do Dia 9 + R$ 100,00

### Bug 2: "Valor não aparece no dia lançado"
**Teste**:
1. Dê duplo-clique em uma célula vazia
2. Digite um valor (ex: 500)
3. Pressione Enter
4. **Verifique**:
   - ✅ Valor aparece imediatamente na célula
   - ✅ Saldo é recalculado
   - ✅ Célula mostra o valor formatado (R$ 500,00)

## 📋 Checklist Completo

Execute esta lista para validação completa:

- [ ] Build compila sem erros (`npm run build`)
- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Página /test carrega corretamente
- [ ] Teste automático executa com sucesso
- [ ] Valores aparecem corretamente nos campos
- [ ] Saldo é calculado corretamente (dia a dia)
- [ ] Totais batem com soma das entradas/saídas
- [ ] Saldo flui corretamente entre meses
- [ ] Alteração em mês anterior atualiza meses seguintes
- [ ] Console não mostra erros (F12 > Console)
- [ ] LocalStorage persiste dados (recarregar página)
- [ ] Valores não replicam para dias anteriores
- [ ] Duplo-clique ativa edição
- [ ] Enter salva o valor
- [ ] Escape cancela edição

## 🐛 Como Reportar Problemas

Se encontrar algum problema:

1. **Abra o Console** (F12 > Console)
2. **Copie os logs** que começam com `[CashFlow]`
3. **Descreva o comportamento**:
   - O que você fez
   - O que esperava
   - O que aconteceu
4. **Tire screenshots** se possível

## 📊 Fórmulas de Cálculo

### Saldo Diário
```
saldo_dia_N = saldo_dia_anterior + entrada - saída - diário
```

### Primeiro Dia do Mês
```
saldo_dia_1 = saldo_final_mes_anterior + entrada - saída - diário
```

### Totais
```
total_entradas = SOMA(todas as entradas do mês)
total_saidas = SOMA(todas as saídas do mês)
saldo_final = saldo do último dia (dia 31, 30, 29 ou 28)
```

## 🎯 Casos de Teste Específicos

### Caso 1: Valor Zero
- Digite `0` em uma célula
- Deve mostrar `-` quando não está editando
- Deve ficar vazio ao editar (facilita nova digitação)

### Caso 2: Valores Decimais
- Digite `1500,50` ou `1500.50`
- Deve salvar como R$ 1.500,50
- Saldo deve considerar os centavos

### Caso 3: Valores Grandes
- Digite `1000000` (1 milhão)
- Deve formatar como R$ 1.000.000,00
- Cálculos devem estar corretos

### Caso 4: Valores Negativos
- Saída maior que entrada
- Saldo deve ficar negativo (vermelho)
- Cálculos continuam corretos

## ✅ Resultados Esperados

Ao final dos testes, você deve ter:

1. ✅ Valores aparecem corretamente nas células
2. ✅ Saldos calculados de forma acumulativa
3. ✅ Fluxo entre meses funciona
4. ✅ Dados persistem após recarregar
5. ✅ Nenhum erro no console
6. ✅ Interface responsiva e rápida
7. ✅ Edição inline funciona perfeitamente

---

**Versão do Guia**: 1.0
**Última Atualização**: 30/10/2025
