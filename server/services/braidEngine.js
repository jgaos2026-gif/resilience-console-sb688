/**
 * braidEngine.js — Braided Computational Topology Core
 *
 * Foundation: Braid group Bₙ on n strands.
 * Generator σᵢ: strand i crosses OVER strand i+1 (positive crossing).
 * Generator σᵢ⁻¹: strand i crosses UNDER strand i+1 (negative crossing).
 *
 * Each data block is woven into the braid as a crossing event.
 * The braid word (sequence of σᵢ^±1) forms a verifiable proof sequence.
 * Integrity is verified via the Burau representation and the Alexander
 * polynomial invariant — if data is tampered, the invariant changes.
 */

import crypto from 'crypto';

// ── Constants ────────────────────────────────────────────────────────────────

export const STRAND_COUNT = 7; // Braid group B₇ — 7 strands for 7 verification gates

/**
 * Compute SHA-256 hash of a string.
 * @param {string} data
 * @returns {string} hex digest
 */
export function sha256(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Compute SHA-256 HMAC.
 * @param {string} key
 * @param {string} data
 * @returns {string} hex digest
 */
export function hmac256(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex');
}

// ── Burau Representation ─────────────────────────────────────────────────────

/**
 * Reduced Burau representation of σᵢ in B_n.
 * Uses t = hash-derived parameter ∈ (0,1) to bind data to the representation.
 * Returns an (n-1) × (n-1) matrix over floating-point approximating the ring Z[t,t⁻¹].
 *
 * @param {number} i   generator index (1-based)
 * @param {number} n   number of strands
 * @param {number} t   parameter (hash-derived)
 * @param {number} sign +1 for σᵢ, -1 for σᵢ⁻¹
 * @returns {number[][]} (n-1)×(n-1) matrix
 */
export function burauGenerator(i, n, t, sign = 1) {
  const m = n - 1;
  // Identity matrix
  const M = Array.from({ length: m }, (_, r) =>
    Array.from({ length: m }, (_, c) => (r === c ? 1 : 0))
  );

  const row = i - 1; // 0-based row index in reduced matrix
  if (row < 0 || row >= m) return M;

  if (sign === 1) {
    // σᵢ: row i-1 becomes [-t, 1, 0, ...] with adjustments at neighbors
    if (row > 0)     M[row][row - 1] = 1;
    M[row][row]     = -t;
    if (row < m - 1) M[row][row + 1] = t;
  } else {
    // σᵢ⁻¹
    if (row > 0)     M[row][row - 1] = 1 / t;
    M[row][row]     = -1 / t;
    if (row < m - 1) M[row][row + 1] = 1;
  }

  return M;
}

/**
 * Multiply two square matrices.
 */
function matMul(A, B) {
  const n = A.length;
  const C = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let k = 0; k < n; k++)
      for (let j = 0; j < n; j++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}

/**
 * Compute the Burau matrix product for a braid word.
 * @param {Array<{i: number, sign: number}>} braidWord  sequence of generators
 * @param {number} n   strand count
 * @param {number} t   parameter
 * @returns {number[][]}
 */
export function burauMatrix(braidWord, n, t) {
  const m = n - 1;
  let M = Array.from({ length: m }, (_, r) =>
    Array.from({ length: m }, (_, c) => (r === c ? 1 : 0))
  );
  for (const { i, sign } of braidWord) {
    M = matMul(M, burauGenerator(i, n, t, sign));
  }
  return M;
}

/**
 * Trace of a matrix (sum of diagonal).
 */
function matTrace(M) {
  return M.reduce((s, row, i) => s + row[i], 0);
}

/**
 * Compute the Alexander polynomial invariant approximation
 * by evaluating trace(Burau(t)) at t = 0.3 and t = 0.7.
 * Returns a two-element fingerprint that changes under braid deformation.
 */
export function alexanderFingerprint(braidWord, n = STRAND_COUNT) {
  const t1 = burauMatrix(braidWord, n, 0.3);
  const t2 = burauMatrix(braidWord, n, 0.7);
  return {
    trace03: parseFloat(matTrace(t1).toFixed(6)),
    trace07: parseFloat(matTrace(t2).toFixed(6)),
  };
}

// ── Braid Word Construction ───────────────────────────────────────────────────

/**
 * Derive a braid generator from a data block.
 * Maps the first byte of the SHA-256 hash to a generator index and sign.
 * @param {string} data  arbitrary string (block content + prev hash)
 * @returns {{ i: number, sign: number, hash: string }}
 */
export function dataToGenerator(data, n = STRAND_COUNT) {
  const h = sha256(data);
  const byte0 = parseInt(h.slice(0, 2), 16);
  const byte1 = parseInt(h.slice(2, 4), 16);
  const i = (byte0 % (n - 1)) + 1; // σ₁ … σₙ₋₁
  const sign = byte1 % 2 === 0 ? 1 : -1;
  return { i, sign, hash: h };
}

// ── Braid Chain (the ledger) ─────────────────────────────────────────────────

/**
 * A single block in the braid chain.
 * @typedef {Object} BraidBlock
 * @property {number}  index      block position
 * @property {string}  data       content
 * @property {string}  prevHash   previous block's hash
 * @property {string}  hash       SHA-256(index + data + prevHash + generator)
 * @property {number}  generator  σᵢ index
 * @property {number}  sign       +1 / -1
 * @property {number}  timestamp  Unix ms
 * @property {object}  invariant  Alexander fingerprint at this block
 */

/**
 * Compute a block hash binding all fields together.
 */
export function computeBlockHash(index, data, prevHash, generator, sign, timestamp) {
  return sha256(`${index}:${data}:${prevHash}:${generator}:${sign}:${timestamp}`);
}

/**
 * Create the genesis (first) braid block.
 * @param {string} data
 * @returns {BraidBlock}
 */
export function genesisBlock(data = 'GENESIS:SB688:BRAIDED_TOPOLOGY') {
  const timestamp = Date.now();
  const prevHash = '0'.repeat(64);
  const gen = dataToGenerator(data + prevHash);
  const hash = computeBlockHash(0, data, prevHash, gen.i, gen.sign, timestamp);
  const invariant = alexanderFingerprint([{ i: gen.i, sign: gen.sign }]);
  return { index: 0, data, prevHash, hash, generator: gen.i, sign: gen.sign, timestamp, invariant };
}

/**
 * Append a new block to the chain.
 * @param {BraidBlock} prev   previous block
 * @param {string}     data   new block content
 * @param {BraidBlock[]} chain  full chain (for invariant computation)
 * @returns {BraidBlock}
 */
export function appendBlock(prev, data, chain) {
  const timestamp = Date.now();
  const gen = dataToGenerator(data + prev.hash);
  const hash = computeBlockHash(prev.index + 1, data, prev.hash, gen.i, gen.sign, timestamp);

  // Build full braid word from chain + new generator for invariant
  const word = chain.map(b => ({ i: b.generator, sign: b.sign }));
  word.push({ i: gen.i, sign: gen.sign });
  const invariant = alexanderFingerprint(word);

  return {
    index: prev.index + 1,
    data,
    prevHash: prev.hash,
    hash,
    generator: gen.i,
    sign: gen.sign,
    timestamp,
    invariant,
  };
}

// ── Chain Verification ────────────────────────────────────────────────────────

/**
 * Verify a chain of braid blocks.
 * Checks:
 *   1. Hash continuity (prevHash linkage)
 *   2. Block hash integrity (recompute and compare)
 *   3. Alexander invariant stability (detects topology-breaking tampering)
 *
 * @param {BraidBlock[]} chain
 * @returns {{ valid: boolean, errors: string[], integrityPct: number, invariant: object }}
 */
export function verifyChain(chain) {
  const errors = [];

  if (!chain || chain.length === 0) {
    return { valid: false, errors: ['Empty chain'], integrityPct: 0, invariant: null };
  }

  let goodBlocks = 0;

  for (let i = 0; i < chain.length; i++) {
    const b = chain[i];

    // 1. prev hash linkage
    if (i === 0) {
      if (b.prevHash !== '0'.repeat(64)) {
        errors.push(`Block 0: genesis prevHash invalid`);
        continue;
      }
    } else {
      if (b.prevHash !== chain[i - 1].hash) {
        errors.push(`Block ${i}: prevHash mismatch (chain broken at ${i})`);
        continue;
      }
    }

    // 2. block hash integrity
    const expected = computeBlockHash(b.index, b.data, b.prevHash, b.generator, b.sign, b.timestamp);
    if (expected !== b.hash) {
      errors.push(`Block ${i}: hash tampered`);
      continue;
    }

    goodBlocks++;
  }

  // 3. Alexander invariant of the full braid word
  const word = chain.map(b => ({ i: b.generator, sign: b.sign }));
  const invariant = alexanderFingerprint(word);

  // Compare stored last block invariant with recomputed
  const stored = chain[chain.length - 1].invariant;
  const drift =
    stored &&
    (Math.abs(stored.trace03 - invariant.trace03) > 0.001 ||
      Math.abs(stored.trace07 - invariant.trace07) > 0.001);

  if (drift) {
    errors.push('Braid invariant drift detected — topology tampered');
  }

  const integrityPct = parseFloat(((goodBlocks / chain.length) * 100).toFixed(2));
  return {
    valid: errors.length === 0,
    errors,
    integrityPct,
    invariant,
    strandCount: STRAND_COUNT,
    chainLength: chain.length,
  };
}

// ── Strand Health ─────────────────────────────────────────────────────────────

/**
 * Compute per-strand utilization from a chain.
 * Returns array of { strand, crossings, positiveRate }.
 */
export function strandHealth(chain) {
  const counts = Array.from({ length: STRAND_COUNT - 1 }, (_, i) => ({
    strand: i + 1,
    crossings: 0,
    positive: 0,
  }));

  for (const b of chain) {
    const idx = b.generator - 1;
    if (idx >= 0 && idx < counts.length) {
      counts[idx].crossings++;
      if (b.sign === 1) counts[idx].positive++;
    }
  }

  return counts.map(c => ({
    strand: c.strand,
    label: `σ${c.strand}`,
    crossings: c.crossings,
    positiveRate: c.crossings > 0 ? parseFloat((c.positive / c.crossings).toFixed(3)) : 0,
  }));
}
