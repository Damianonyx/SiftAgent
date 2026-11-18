/* Synthetic workspace data for design checks and feature tests. No live calls.
 * Seeds tester 42 with approved rules, saved checks, calls with paper
 * outcomes, monitors and a group in review. */
export function seedWorkspace(f, { criteriaKey, evaluateAgent, CA }) {
  const a = f.agents, now = Date.now(), min = 60_000;
  
  const strategy = { name: 'Fresh launch scout', rules: [
    { field: 'marketCap', mode: 'require', min: 20000, max: 250000 },
    { field: 'liquidityUsd', mode: 'require', value: 15000 },
    { field: 'poolAgeMinutes', mode: 'warn', value: 180 },
  ], pendingRequirements: [] };
  a.put(42, { revision: 1, approved: strategy, draft: null });
  const key = criteriaKey(strategy);
  a.discoverySet(42, 'active', key);
  a.discoveryComplete(42, key, { checked: 9, matched: 4, suppressed: 0, issue: null }, now - 2 * min);
  
  // Deterministic synthetic 32-byte addresses (seeded PRNG, base58).
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const token = seed => {
    let x = seed * 2654435761 >>> 0, n = 0n;
    for (let i = 0; i < 32; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; n = n * 256n + BigInt(x & 255 || 1); }
    let out = ''; while (n > 0n) { out = B58[Number(n % 58n)] + out; n /= 58n; } return out;
  };
  const snap = (cap, liq, age) => ({ fetchedAt: now, selected: { marketCap: cap, liquidityUsd: liq, createdAt: now - age * min } });
  const rows = [
    [CA, snap(48200, 35100, 42)], [token(2211), snap(182000, 61000, 95)], [token(3322), snap(420000, 88000, 300)],
    [token(4433), snap(91000, null, 18)], [token(5544), snap(27500, 16900, 260)], [token(6655), null],
    [token(7766), snap(64300, 22800, 12)], [token(8877), snap(12000, 9000, 7)], [token(9988), snap(133000, 45200, 61)],
  ];
  rows.forEach(([t, s], i) => a.discoveryRecord(42, key, t, now - i * 7 * min,
    s ? evaluateAgent(strategy, s) : { matches: false, issue: 'MARKET_UNAVAILABLE' }));
  
  // Calls with paper outcomes at fixed horizons (synthetic numbers).
  const nets = [[18.4, 42.1, -12.5, null], [-6.2, 9.8, 31.4, 77.0], [4.1, -15.6, null, null], [2.2, null, null, null], [-3.4, 12.2, 5.1, -22.7]];
  nets.forEach((series, i) => {
    const t = i === 0 ? CA : token(1100 + i * 11);
    const at = now - (i * 9 + 2) * 60 * min;
    const id = a.signalRecord(42, 42, `dev-${i}`, { address: t, selected: { marketCap: 40000 + i * 21000, liquidityUsd: 20000 + i * 5000, priceUsd: 0.0001 * (i + 1) } }, strategy, at);
    a.signalDelivery(id, i === 3 ? 'uncertain' : i === 4 && false ? 'failed' : 'sent');
    [15, 60, 360, 1440].forEach((h, j) => {
      const v = series[j];
      if (at + h * min > now) return;
      if (v === null) a.signalOutcome(id, h, j === 2 ? 'missed' : 'unavailable', at + h * min, { reason: 'Synthetic gap' });
      else a.signalOutcome(id, h, 'observed', at + h * min, { netPct: v, grossPct: v + 1.1 });
    });
  });
  
  // Monitors.
  const w = a.watchCreate(42, token(4433), { dropPercent: 20, hours: 24, rules: [] }, now - 3 * 60 * min);
  const base = { address: token(4433), fetchedAt: now - 3 * 60 * min, selected: { address: token(1212), liquidityUsd: 54200, marketCap: 91000 } };
  if (w) a.watchStart(42, w.id, w.revision, base, now - 3 * 60 * min + 1000);
  a.watchCreate(42, token(7766), { dropPercent: 35, hours: 12, rules: [] }, now - 5 * min);
  if (w) { const e = a.watchReserve(42, w.id, 'drop', now - 40 * min, 'Synthetic monitor event'); if (e) a.watchDelivery(42, e, 'sent'); }
  
  // One group in review.
  try { a.groupStage(-1001234567890, 42, key, now); } catch {}
  return { strategy, key };
}
