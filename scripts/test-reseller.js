require('dotenv').config();
const { computeSplit, computePriceSplit, validateRetailPrice } = require('../packages/shared/reseller');

// Test 1: Compute split (no parent)
const split1 = computeSplit({
  retailPrice: 1000,
  platformFeePercent: 30,
  subSharePercent: 100,
  hasParent: false,
});
console.log('No parent:', split1);
// Expected: platformFee=300, pool=700, subPayout=700, parentPayout=0

// Test 2: Compute split (with parent, 40% share)
const split2 = computeSplit({
  retailPrice: 1000,
  platformFeePercent: 30,
  subSharePercent: 40,
  hasParent: true,
});
console.log('With parent (40%):', split2);
// Expected: platformFee=300, pool=700, subPayout=280, parentPayout=420

// Test 3: Price validator (below min)
try {
  validateRetailPrice(500, { pricing: { minRetailPriceETB: 800, maxRetailPriceETB: 5000 } });
  console.log('❌ Should have thrown');
} catch (e) {
  console.log('✅ Correctly rejected below-min price:', e.message);
}

// Test 4: Price validator (valid)
const valid = validateRetailPrice(1200, { pricing: { minRetailPriceETB: 800, maxRetailPriceETB: 5000 } });
console.log('✅ Valid price:', valid);