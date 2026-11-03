// Petites musiques d'ambiance générées par code (aucun droit d'auteur) : pad + arpège + basse + rythme léger.
// Chaque actu reçoit une musique différente (choisie par son identifiant). Sortie : fichier WAV stéréo 44,1 kHz.
const fs = require('fs');
const SR = 44100;
const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10], DOR = [0, 2, 3, 5, 7, 9, 10];
const RECIPES = [
  { name: 'aube', bpm: 96, root: 57, scale: MAJ, prog: [0, 4, 5, 3], arp: [0, 2, 1, 2, 0, 2, 1, 2], drums: 'soft', wave: 'tri' },
  { name: 'nocturne', bpm: 84, root: 52, scale: MIN, prog: [0, 5, 2, 6], arp: [0, 1, 2, 1, 0, 1, 2, 1], drums: 'none', wave: 'sine' },
  { name: 'stade', bpm: 110, root: 55, scale: MAJ, prog: [0, 3, 4, 4], arp: [0, 1, 2, 3, 2, 1, 2, 1], drums: 'drive', wave: 'saw' },
  { name: 'pulse', bpm: 118, root: 50, scale: DOR, prog: [0, 3, 0, 4], arp: [0, 2, 0, 2, 1, 2, 1, 2], drums: 'drive', wave: 'tri' },
  { name: 'brume', bpm: 78, root: 53, scale: MIN, prog: [0, 3, 6, 5], arp: [0, 2, 1, 0, 2, 1, 0, 2], drums: 'none', wave: 'sine' },
  { name: 'victoire', bpm: 104, root: 60, scale: MAJ, prog: [0, 5, 3, 4], arp: [0, 1, 2, 1, 3, 2, 1, 2], drums: 'soft', wave: 'tri' },
  { name: 'tension', bpm: 100, root: 48, scale: MIN, prog: [0, 0, 5, 4], arp: [0, 0, 2, 0, 1, 0, 2, 0], drums: 'soft', wave: 'saw' },
  { name: 'rue', bpm: 92, root: 54, scale: DOR, prog: [0, 6, 3, 4], arp: [2, 0, 1, 0, 2, 0, 1, 0], drums: 'drive', wave: 'sine' },
  { name: 'soiree-europeenne', bpm: 72, root: 50, scale: MIN, prog: [0, 5, 3, 4], arp: [0, 2, 4, 2, 0, 2, 4, 2], drums: 'timp', wave: 'saw', choir: true },
  { name: 'europa-nuit', bpm: 122, root: 52, scale: DOR, prog: [0, 6, 3, 4], arp: [0, 2, 1, 2, 0, 3, 1, 2], drums: 'drive', wave: 'saw' },
  { name: 'conference-lumiere', bpm: 108, root: 55, scale: MAJ, prog: [0, 4, 5, 3], arp: [0, 1, 2, 3, 2, 1, 2, 0], drums: 'soft', wave: 'tri' },
];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function osc(wave, ph) { const x = ph - Math.floor(ph); return wave === 'sine' ? Math.sin(2 * Math.PI * x) : wave === 'tri' ? 4 * Math.abs(x - .5) - 1 : 2 * x - 1; }
function render(id, seconds = 15, index) {
  const r = RECIPES[(Number.isInteger(index) ? index : hash(id)) % RECIPES.length], jit = 1 + ((hash(id + 'j') % 9) - 4) / 100;
  const bpm = r.bpm * jit, beat = 60 / bpm, N = Math.floor(seconds * SR);
  const L = new Float32Array(N), R = new Float32Array(N);
  const deg = (d, oct = 0) => r.root + r.scale[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
  const add = (t0, dur, f, amp, wave, att, pan, dec) => {
    const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
    for (let i = 0; i < n && i0 + i < N; i++) { const t = i / SR; const env = Math.min(1, t / att) * (dec ? Math.exp(-t * dec) : Math.max(0, Math.min(1, (dur - t) / .25))); const v = osc(wave, f * t) * env * amp; L[i0 + i] += v * (1 - pan); R[i0 + i] += v * (1 + pan); }
  };
  const bar = beat * 4, bars = Math.ceil(seconds / bar);
  for (let b = 0; b < bars; b++) {
    const d = r.prog[b % r.prog.length], t0 = b * bar;
    for (const k of [0, 2, 4]) { const f = hz(deg(d + k, 0)); add(t0, bar + .2, f, .05, r.wave, .35, -.3, 0); add(t0, bar + .2, f * 1.004, .04, 'sine', .35, .3, 0); }
    if (r.choir) for (const k of [0, 2, 4, 7]) { const f = hz(deg(d + k, 1)); for (const dt of [0.996, 1.004]) add(t0, bar + .3, f * dt, .035, 'sine', 1.1, dt < 1 ? -.5 : .5, 0); }
    add(t0, beat * 1.9, hz(deg(d, -2)), .16, 'sine', .02, 0, 1.6); add(t0 + beat * 2, beat * 1.9, hz(deg(d, -2)), .12, 'sine', .02, 0, 1.6);
    for (let s = 0; s < 8; s++) { const a = r.arp[s]; add(t0 + s * beat / 2, beat * .9, hz(deg(d + a * 2, 1)), .07, 'tri', .004, (s % 2 ? .35 : -.35), 5.5); }
    if (r.drums === 'timp') for (const q of [0, 2, 3]) { const i0 = Math.floor((t0 + q * beat) * SR); for (let i = 0; i < SR * .7 && i0 + i < N; i++) { const t = i / SR, f = 38 + 62 * Math.exp(-t * 9); const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4.2) * (q === 3 ? .3 : .6); L[i0 + i] += v; R[i0 + i] += v; } }
    if (r.drums !== 'none' && r.drums !== 'timp') for (let q = 0; q < 4; q++) {
      const tk = t0 + q * beat;
      if (r.drums === 'drive' || q % 2 === 0) { const i0 = Math.floor(tk * SR); for (let i = 0; i < SR * .18 && i0 + i < N; i++) { const t = i / SR, f = 45 + 90 * Math.exp(-t * 28); const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 14) * .38; L[i0 + i] += v; R[i0 + i] += v; } }
      const th = tk + beat / 2; const j0 = Math.floor(th * SR); let nz = 0; for (let i = 0; i < SR * .05 && j0 + i < N; i++) { const w = Math.random() * 2 - 1; const hp = w - nz; nz = w * .6 + nz * .4; const v = hp * Math.exp(-i / SR * 70) * (r.drums === 'drive' ? .06 : .035); L[j0 + i] += v; R[j0 + i] += v; }
    }
  }
  const out = Buffer.alloc(N * 4); let peak = 0.0001; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.55 / peak;
  for (let i = 0; i < N; i++) { const t = i / SR, f = Math.min(1, t / .4) * Math.min(1, (seconds - t) / 1.4); out.writeInt16LE(Math.round(Math.tanh(L[i] * g * f) * 32000), i * 4); out.writeInt16LE(Math.round(Math.tanh(R[i] * g * f) * 32000), i * 4 + 2); }
  const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + out.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(out.length, 40);
  return { wav: Buffer.concat([h, out]), name: r.name, bpm: Math.round(bpm) };
}
module.exports = { render, RECIPES };
if (require.main === module) { const id = process.argv[2] || 'test', o = render(id, 15); fs.writeFileSync(process.argv[3] || 'music-' + id + '.wav', o.wav); console.log(o.name, o.bpm); }
