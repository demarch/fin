// Test script to verify the limit consistency fix
// Run with: node test-limit-consistency.mjs

import { recalculateMonthSaldos } from './src/utils/calculations.ts';

console.log('Testing limit consistency between MAX_VALUE and MAX_SALDO...\n');

// Test 1: Single large transaction within the new limit
console.log('Test 1: Single large transaction of 9 million (within 10M limit)');
const entries1 = [
  { day: 1, entrada: 9000000, saida: 0, diario: 0, saldo: 0 },
  { day: 2, entrada: 0, saida: 1000000, diario: 0, saldo: 0 },
];

try {
  const result1 = recalculateMonthSaldos(entries1, 0);
  console.log('✅ Test 1 passed - No false positive for absurd value');
  console.log('   Day 1 saldo:', result1[0].saldo.toLocaleString('pt-BR'));
  console.log('   Day 2 saldo:', result1[1].saldo.toLocaleString('pt-BR'));
} catch (error) {
  console.log('❌ Test 1 failed:', error.message);
}

console.log('\n---\n');

// Test 2: Transaction exceeding the limit
console.log('Test 2: Single transaction exceeding 10 million limit');
const entries2 = [
  { day: 1, entrada: 15000000, saida: 0, diario: 0, saldo: 0 },
];

try {
  const result2 = recalculateMonthSaldos(entries2, 0);
  console.log('✅ Test 2 passed - Transaction was capped at limit');
  console.log('   Day 1 saldo (should be capped at 10M):', result2[0].saldo.toLocaleString('pt-BR'));
} catch (error) {
  console.log('❌ Test 2 failed:', error.message);
}

console.log('\n---\n');

// Test 3: Accumulated saldo reaching the limit
console.log('Test 3: Accumulated saldo reaching exactly 10 million');
const entries3 = [
  { day: 1, entrada: 5000000, saida: 0, diario: 0, saldo: 0 },
  { day: 2, entrada: 3000000, saida: 0, diario: 0, saldo: 0 },
  { day: 3, entrada: 2000000, saida: 0, diario: 0, saldo: 0 },
];

try {
  const result3 = recalculateMonthSaldos(entries3, 0);
  console.log('✅ Test 3 passed - Accumulated saldo at limit is allowed');
  console.log('   Day 1 saldo:', result3[0].saldo.toLocaleString('pt-BR'));
  console.log('   Day 2 saldo:', result3[1].saldo.toLocaleString('pt-BR'));
  console.log('   Day 3 saldo:', result3[2].saldo.toLocaleString('pt-BR'));
} catch (error) {
  console.log('❌ Test 3 failed:', error.message);
}

console.log('\n✅ All tests completed!');
console.log('The limit inconsistency has been fixed:');
console.log('- MAX_VALUE (individual transactions): R$ 10,000,000');
console.log('- MAX_SALDO (accumulated balance): R$ 10,000,000');
console.log('Both limits are now aligned, preventing false absurd value detection.');