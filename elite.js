// ══════════════════════════════════════════════════════
// ELITE (Solarfective) — Toiles à rouleau (liste Roller SS 05-2026, prix MSRP)
// Gabarit VP : 1 Produit (Type → Modèle = tissu → Couleur) · 2 Dimensions · 3 Options (Entête · Couleur de la
// quincaillerie · Base · Coulisses · Mécanisme & Motorisation · Côté contrôle · Enroulement · Multiple toiles · Accessoires).
// Coût = MSRP × settings.elite.pct (22,5 % : 77,5 % de rabais sur la liste) ; vente = coût × multi.
// Données : elite.json (grilles A–I, coulisses, suppléments, tissus). Compatibilités : Control Guide Elite + pages de la liste.
// Phase 2 à venir : motorisation Smart Shades.
// ══════════════════════════════════════════════════════
window.ELITE = null;

function eliteCharger() {
  if (window.ELITE) return Promise.resolve(window.ELITE);
  if (window._elitePromesse) return window._elitePromesse;
  window._elitePromesse = fetch('elite.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(d => { window.ELITE = d; return d; })
    .catch(e => { window._elitePromesse = null; throw e; });
  return window._elitePromesse;
}
const eliteEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Entêtes : supplément (clé de elite.json.supp), couleurs, mécanismes compatibles, support des toiles liées
const ELITE_ENTETES = [
  { v: 'OR',     l: 'Open Roll (Z-125 / Z-150, sans entête)', s: null,                     coul: ['Blanc', 'Noir'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'ET'], lie: 125 },
  { v: 'ORV',    l: 'Open Roll + cantonnière Deluxe (PVC, insertion de tissu)', s: 'Deluxe Valance', coul: ['Blanc', 'Noir'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'ET'], lie: 125 },
  { v: 'SL102',  l: 'Caisson SL102', s: 'SL102 Headrail',                                  coul: ['Blanc'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'WC', 'PW', 'ET'] },
  { v: 'SL102V', l: 'Caisson SL102 + cantonnière', s: 'SL102 + Valance',                   coul: ['Blanc'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'WC', 'PW', 'ET'] },
  { v: 'Z300',   l: 'Fascia Z-300', s: 'Z-300 Fascia',                                    coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'PW', 'ET'], lie: 125, fascia: true },
  { v: 'Z400',   l: 'Fascia Z-400', s: 'Z-400 Fascia',                                    coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'WC', 'ET'], lie: 125, fascia: true },
  { v: 'Z550',   l: 'Fascia Z-550', s: 'Z-550 Fascia',                                    coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'WC', 'ET'], fascia: true },
  { v: 'S300',   l: 'Cassette S-300', s: 'S-300 Cassette',                                coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'PW', 'ET'], lie: 150 },
  { v: 'S325',   l: 'Cassette S-325', s: 'S-325 Cassette',                                coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'PW', 'ET'], lie: 150 },
  { v: 'V80',    l: 'Cassette V-80', s: 'V-80 Cassette',                                  coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'PW', 'ET'], lie: 150 },
  { v: 'M7E',    l: 'Cassette M7 apparente', s: 'M7 Exposed',                             coul: ['Blanc', 'Lin', 'Anodisé', 'Noir'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'PW', 'ET'], lie: 150, max: 120 },
  { v: 'M7EP',   l: 'Cassette M7 apparente + plaque de fond', s: 'M7 Exposed + Bottom Cover Plate', coul: ['Blanc', 'Lin', 'Anodisé', 'Noir'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'PW', 'ET'], lie: 150, max: 120 },
  { v: 'M7F',    l: 'Cassette M7 recouverte de tissu', s: 'M7 Fabric Wrapped',            coul: ['Blanc', 'Lin', 'Anodisé', 'Noir'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'FM', 'WC', 'PW', 'ET'], lie: 150, max: 120 },
  { v: 'TW150',  l: 'Double — Open Roll Z-150 Twin (2 toiles)', s: null, fixe: 125,       coul: ['Blanc'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'WC', 'ET'], twin: true },
  { v: 'TW550',  l: 'Double — Fascia Z-550 Twin (2 toiles)', s: 'Z-550 Twin Fascia',     coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'WC', 'ET'], twin: true, fascia: true },
  { v: 'TW550S', l: 'Double — Fascia Z-550 Twin Slim (2 toiles)', s: 'Z-550 Twin Slim Fascia', coul: ['Blanc', 'Noir', 'Anodisé'], meca: ['MOT-S', 'MOT-E', 'CG', 'WC', 'ET'], twin: true, fascia: true },
  { v: 'C550P',  l: 'Commercial — Fascia Z-550 Pro (simple, double ou Slim Line)', soum: true, coul: ['Blanc', 'Anodisé', 'Espresso'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'WC'] },
  { v: 'C700T',  l: 'Commercial — Fascia Z-700 Twin', soum: true, coul: ['Blanc', 'Anodisé', 'Espresso'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD', 'WC'] },
  { v: 'V90',    l: 'Double — Cassette V-90 Twin (2 toiles)', s: 'V-90 Cassette',        coul: ['Blanc', 'Anodisé', 'Albâtre', 'Espresso', 'Noir'], meca: ['MOT-S', 'MOT-E', 'CG', 'SD'], twin: true, max: 78 },
];
// Mécanismes (prix MSRP par toile ; limites des pages de la liste Roller 2026)
const ELITE_MECAS = [
  { v: 'CG', l: 'ChainGuard™ (chaînette, incluse)', p: 0 },
  { v: 'SD', l: 'SpringDrive™ (ressort, sans cordon)', p: 80, min: 23, pc: 60, pasCoul: true },
  { v: 'FM', l: 'FreeMotion™ (sans cordon, s\'arrête à toute hauteur)', p: 135, min: 21, maxL: 84, maxH: 84, pasCoul: true, pasInverseFascia: true },
  { v: 'WC', l: 'WandControl™ (baguette)', p: 185, min: 8, pc: 50, pasCoul: true },
  { v: 'PW', l: 'ProWand™ (baguette 2-en-1)', p: 185, min: 27, maxL: 92, maxH: 108 },
  { v: 'ET', l: 'E-Touch™ by Rollease (moteur à baguette rechargeable)', p: 443, min: 21, pc: 70 },
  { v: 'MOT-S', l: 'Motorisé — Somfy (RTS, Zigbee, filaire)', p: 0 },
  { v: 'MOT-E', l: 'Motorisé — E-Motion™ (BASICS ou 2.0, moteurs Elite)', p: 0 },
];
// Motorisation Smart Shades (liste Elite 10-2024, MSRP) : famille = protocole ; alim = alimentations offertes
const ELITE_MOTEURS = [
  { v: 'S28WF-RTS', f: 'RTS', l: 'Somfy Sonesse 28 WireFree Li-ion — RTS', p: 1156, min: 16.5, alim: 'liion', petit: { max: 24, p: 1244, l: 'Sonesse 28 + bloc-piles externe (toile de moins de 24")' } },
  { v: 'S28WF-Z', f: 'ZIG', l: 'Somfy Sonesse 28 WireFree Li-ion — Zigbee', p: 1204, min: 16.5, alim: 'liion', petit: { max: 24, p: 1440, l: 'Sonesse 28 + bloc-piles externe (toile de moins de 24")' } },
  { v: 'SU30WF-RTS', f: 'RTS', l: 'Somfy Sonesse Ultra 30 WireFree Li-ion — RTS', p: 1292, min: 28, alim: 'liion' },
  { v: 'SU30WF-Z', f: 'ZIG', l: 'Somfy Sonesse Ultra 30 WireFree Li-ion — Zigbee', p: 1336, min: 28, alim: 'liion' },
  { v: 'S40WF-RTS', f: 'RTS', l: 'Somfy Sonesse 40 WireFree Li-ion — RTS', p: 1855, min: 28, alim: 'liion' },
  { v: 'S40WF-Z', f: 'ZIG', l: 'Somfy Sonesse 40 WireFree Li-ion — Zigbee', p: 2208, min: 28, alim: 'liionz' },
  { v: 'S30-24-RTS', f: 'RTS', l: 'Somfy Sonesse 30 24 V — RTS', p: 1391, min: 21, alim: '24v' },
  { v: 'S30-24-Z', f: 'ZIG', l: 'Somfy Sonesse 30 24 V — Zigbee', p: 1469, min: 21, alim: '24v' },
  { v: 'S30-24-485', f: 'FIL', l: 'Somfy Sonesse 30 24 V — RS485 (filaire numérique)', p: 1464, min: 21, alim: '24v' },
  { v: 'SU50DC-RTS', f: 'RTS', l: 'Somfy Sonesse Ultra 50 DC 24 V — RTS', p: 3055, min: 37, alim: '24v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'SU50DC-485', f: 'FIL', l: 'Somfy Sonesse Ultra 50 DC 24 V — RS485', p: 3268, min: 37, alim: '24v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'S40AC-RTS', f: 'RTS', l: 'Somfy Sonesse 40 120 V — RTS', p: 1569, min: 24, alim: '120v' },
  { v: 'S40AC-Z', f: 'ZIG', l: 'Somfy Sonesse 40 120 V — Zigbee', p: 1981, min: 24, alim: '120v' },
  { v: 'S40AC-WT', f: 'FIL', l: 'Somfy Sonesse 40 120 V — WT (filaire)', p: 1258, min: 24, alim: '120v' },
  { v: 'S50AC-RTS', f: 'RTS', l: 'Somfy Sonesse 50 120 V — RTS', p: 2026, min: 31, alim: '120v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'SU50AC-RTS', f: 'RTS', l: 'Somfy Sonesse 50 120 V Ultra (silencieux) — RTS', p: 2400, min: 37, alim: '120v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'S50AC-485', f: 'FIL', l: 'Somfy Sonesse 50 120 V — RS485', p: 2812, min: 30, alim: '120v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'SU50AC-485', f: 'FIL', l: 'Somfy Sonesse 50 120 V Ultra — RS485', p: 2819, min: 37, alim: '120v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'S50AC-WT', f: 'FIL', l: 'Somfy Sonesse 50 120 V — WT (filaire)', p: 1750, min: 30, alim: '120v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'SU50AC-WT', f: 'FIL', l: 'Somfy Sonesse 50 120 V Ultra — WT (filaire)', p: 1987, min: 37, alim: '120v', note: 'vérifier la compatibilité de la quincaillerie' },
  { v: 'EMB', f: 'EMB', l: 'E-Motion™ BASICS Li-ion (chargeur inclus)', p: 476, min: 20, alim: 'emb' },
  { v: 'MQ25L', f: 'EM2', l: 'E-Motion™ 2.0 MIQO 25 Li-ion', p: 800, min: 16, alim: 'em2', petit: { max: 23, p: 1228, l: 'MIQO 25/2 DC + bloc-piles (toile de moins de 23")' } },
  { v: 'MQ28L', f: 'EM2', l: 'E-Motion™ 2.0 MIQO 28 Li-ion', p: 915, min: 30, alim: 'em2' },
  { v: 'MQ35L', f: 'EM2', l: 'E-Motion™ 2.0 MIQO 35 Li-ion', p: 1977, min: 38, alim: 'em2' },
  { v: 'MQ25DC', f: 'EM2', l: 'E-Motion™ 2.0 MIQO 25 DC 12 V', p: 842, min: 17, alim: 'em12' },
  { v: 'MQ28DC', f: 'EM2', l: 'E-Motion™ 2.0 MIQO 28 DC 12 V', p: 1014, min: 22, alim: 'em12' },
  { v: 'MQ35DC', f: 'EM2', l: 'E-Motion™ 2.0 MIQO 35 DC 12 V', p: 1388, min: 23, alim: 'em12', pasV90: true },
];
const ELITE_ALIMS = {
  liion: [{ v: 'CH203', l: 'Chargeur + câble magnétique rigide', p: 203 }, { v: 'EXT101', l: 'Rallonge 96" pour bloc-piles', p: 101 }],
  liionz: [{ v: 'CH229', l: 'Chargeur + câble magnétique USB-C (Sonesse 40 Zigbee)', p: 229 }, { v: 'EXT101', l: 'Rallonge 96" pour bloc-piles', p: 101 }],
  '24v': [{ v: 'PS276', l: 'Bloc d\'alimentation mural 24 V 1,5 A (1 moteur)', p: 276 }, { v: 'CAB10', l: 'Armoire RTS 10 A 24 V (jusqu\'à 5 moteurs)', p: 3772 },
    { v: 'CAB20', l: 'Armoire RTS 20 A 24 V (jusqu\'à 10 moteurs)', p: 5974 }, { v: 'CAB30', l: 'Armoire RTS 30 A 24 V (jusqu\'à 15 moteurs)', p: 7716 },
    { v: 'CAB40', l: 'Armoire RTS 40 A 24 V (jusqu\'à 20 moteurs)', p: 9182 }, { v: 'SDN20', l: 'Panneau SDN 20 A 24 V (jusqu\'à 10 moteurs SDN)', p: 6937 }],
  '120v': [{ v: 'TL44', l: 'Rallonge Twist & Lock 4,4 pi avec fiche NEMA (S40/S50)', p: 174 }, { v: 'TL84', l: 'Rallonge Twist & Lock 8,4 pi avec fiche NEMA', p: 195 },
    { v: 'TL18', l: 'Rallonge Twist & Lock 18 pi avec fiche NEMA', p: 282 }, { v: 'TL24', l: 'Rallonge Twist & Lock 24 pi avec fiche NEMA', p: 317 },
    { v: 'WT44', l: 'Rallonge WT 4,4 pi à fils libres', p: 190 }, { v: 'WT84', l: 'Rallonge WT 8,4 pi à fils libres', p: 196 },
    { v: 'WT164', l: 'Rallonge WT 16,4 pi à fils libres', p: 314 }, { v: 'WT224', l: 'Rallonge WT 22,4 pi à fils libres', p: 317 }],
  emb: [{ v: 'EMB47', l: 'Chargeur USB-C BASICS supplémentaire', p: 47 }],
  em2: [{ v: 'EM91', l: 'Chargeur USB + câble 4 m', p: 91 }, { v: 'EM542', l: 'Panneau solaire (recharge en continu)', p: 542 },
    { v: 'EM41', l: 'Rallonge 96" pour bloc-piles', p: 41 }, { v: 'EM22', l: 'Rallonge de câble de recharge 48"', p: 22 }],
  em12: [{ v: 'EM472', l: 'Bloc d\'alimentation 12 V 5 A (1 moteur MIQO 28 ou 35 DC)', p: 472 }, { v: 'EM1405', l: 'Armoire 15 V 24 A + cordon (jusqu\'à 18 MIQO 28 DC)', p: 1405 }],
};
const ELITE_CTRLS = {
  RTS: [{ v: 'SIT1', l: 'Télécommande Situo 1', p: 312 }, { v: 'SIT5', l: 'Télécommande Situo 5', p: 388 }, { v: 'SIT5V', l: 'Télécommande Situo 5 Variation Pure', p: 491 },
    { v: 'TEL16', l: 'Télécommande Telis 16 Pure', p: 1126 }, { v: 'DECO1', l: 'Interrupteur mural DecoFlex RTS 1 canal', p: 632 }, { v: 'DECO5', l: 'Interrupteur mural DecoFlex RTS 5 canaux', p: 660 },
    { v: 'SMO1B', l: 'Smoove RTS 1 canal — blanc', p: 429 }, { v: 'SMO4B', l: 'Smoove RTS 4 canaux — blanc', p: 517 },
    { v: 'SMO1A', l: 'Smoove RTS 1 canal — argent ou noir mat', p: 479 }, { v: 'SMO4A', l: 'Smoove RTS 4 canaux — argent ou noir mat', p: 567 },
    { v: 'SMO1C', l: 'Smoove RTS 1 canal — bambou pâle', p: 565 }, { v: 'SMO4C', l: 'Smoove RTS 4 canaux — bambou pâle', p: 656 },
    { v: 'TAHO', l: 'TaHoma Switch (application, voix)', p: 892 }, { v: 'TAHOE', l: 'Adaptateur Ethernet TaHoma Switch', p: 133 },
    { v: 'BOND', l: 'Bond Bridge', p: 893 }, { v: 'BONDS', l: 'Bond Sidekick', p: 130 }],
  ZIG: [{ v: 'YSIA1', l: 'Télécommande Ysia 1 canal (Zigbee)', p: 286 }, { v: 'YSIA5', l: 'Télécommande Ysia 5 canaux (Zigbee)', p: 378 },
    { v: 'ZPLUG', l: 'Prise intelligente Zigbee', p: 200 }, { v: 'TAHO', l: 'TaHoma Switch (application, voix)', p: 892 }, { v: 'TAHOE', l: 'Adaptateur Ethernet TaHoma Switch', p: 133 }],
  EMB: [{ v: 'EMB6', l: 'Télécommande BASICS 6 canaux', p: 80 }],
  EM2: [{ v: 'EM5', l: 'Télécommande 5 canaux', p: 310 }, { v: 'EM15', l: 'Télécommande 15 canaux', p: 400 }, { v: 'EM5M', l: 'Interrupteur mural 5 canaux (Decorator)', p: 310 },
    { v: 'EMSUN', l: 'Capteur solaire', p: 229 }, { v: 'EMREP', l: 'Répéteur USB', p: 623 }, { v: 'PULSE', l: 'Pulse 2.0 Smart Hub (télécommande requise)', p: 1053 },
    { v: 'BOND', l: 'Bond Bridge', p: 893 }, { v: 'BONDS', l: 'Bond Sidekick', p: 130 }],
  FIL: [],
};
const ELITE_COULISSES = [
  { v: 'ALU', l: 'Coulisses latérales aluminium (paire)' }, { v: 'PVC', l: 'Coulisses latérales PVC (paire)' },
  { v: 'LALU', l: 'Coulisses en L aluminium (50 %)' }, { v: 'LPVC', l: 'Coulisses en L PVC (50 %)' },
];
const ELITE_BASES = { E: 'Barre apparente (Exposed)', H: 'Pochette (Hem Pocket)', F: 'Barre recouverte de tissu (Fabric Wrap)' };

function eliteTissu(v) { return (window.ELITE ? window.ELITE.tissus : []).find(t => t.id === v); }

// ── 1 — Produit ─────────────────────────────────────────
function eliteOnFournisseur() {
  state.type = ''; state.modele = ''; state.options = {}; state.elite = {}; state.tissuCouleur = '';
  ['row-modele', 'row-couleur', 'row-tissu-nom', 'row-tissu-couleur', 'row-solr-tissu', 'row-norm-tissu', 'row-vtx',
   'row-altex', 'card-dim', 'card-options'].forEach(hide);
  resetResult();
  const sel = document.getElementById('sel-type');
  sel.innerHTML = '<option value="">— Sélectionner —</option><option value="elite-TR">Toile à rouleau</option>';
  sel.value = '';
  show('row-type');
  return eliteCharger().catch(e => {
    const a = document.getElementById('alert-dim');
    if (a) { a.textContent = 'Impossible de charger les prix Elite (' + e.message + ')'; a.classList.add('show'); }
  });
}

function eliteOnType() {
  state.type = document.getElementById('sel-type').value;
  state.modele = ''; state.elite = {}; state.options = {};
  hide('row-couleur'); hide('row-tissu-nom'); hide('row-tissu-couleur'); hide('card-dim'); hide('card-options');
  resetResult();
  if (!state.type) { hide('row-modele'); return; }
  eliteCharger().then(() => {
    const T = window.ELITE.tissus;
    const opts = (hl) => T.filter(t => !!t.hl === hl).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
      .map(t => '<option value="' + eliteEsc(t.id) + '">' + eliteEsc(t.nom + (hl && T.some(x => !x.hl && x.nom === t.nom) ? ' — High-Lite' : '')) + '</option>').join('');
    const sel = document.getElementById('sel-modele');
    sel.innerHTML = '<option value="">— Sélectionner —</option><optgroup label="Roller">' + opts(false) + '</optgroup>'
      + '<optgroup label="Roller High-Lite (bande opaque + voile ; idéal en double V-90)">' + opts(true) + '</optgroup>';
    sel.value = '';
    show('row-modele');
  });
}

function eliteOnModele() {
  const v = document.getElementById('sel-modele').value;
  if (!v) { hide('row-tissu-couleur'); hide('card-dim'); hide('card-options'); resetResult(); return; }
  state.elite = Object.assign(state.elite || {}, { t: v });
  const t = eliteTissu(v);
  state.modele = t ? t.nom : v; state.tissuNom = state.modele;
  const inp = document.getElementById('inp-tissu-couleur');
  if (inp) {
    inp.value = state.tissuCouleur || '';
    if (!inp._elite) { inp._elite = true; inp.addEventListener('input', () => { if (state.fournisseur === 'elite') calculatePriceElite(); }); }
  }
  show('row-tissu-couleur');
  show('card-dim');
  state._eliteOptCle = null;
  onDimChange();
}

// ── Prix ────────────────────────────────────────────────
function eliteCol(L, larg) { return L.findIndex(x => x >= larg - 1e-9); }
function elitePrixGrille(g, larg, haut) {
  const E = window.ELITE, G = E.grilles[g];
  const c = eliteCol(E.L, larg), r = G.H.findIndex(x => x >= haut - 1e-9);
  if (c < 0 || r < 0) return null;
  const v = G.P[r][c];
  return v ? { v, L: E.L[c], H: G.H[r] } : null;
}
function eliteSupp(nom, larg) {
  const S = window.ELITE.supp[nom]; if (!S) return null;
  const L = window.ELITE.suppL[nom] || window.ELITE.L;
  const c = eliteCol(L, larg); if (c < 0) return null;
  return S[c] == null ? null : S[c];
}
function eliteCoulisse(type, haut) {
  const C = window.ELITE.coulisses, r = C.H.findIndex(x => x >= haut - 1e-9);
  if (r < 0) return null;
  const base = C[/PVC/.test(type) ? 'PVC' : 'ALU'][r];
  return base == null ? null : (/^L/.test(type) ? Math.round(base * 50) / 100 : base);
}
function eliteMecaProbleme(m, larg, haut, ent) {
  if (!m) return null;
  if (!ent.meca.includes(m.v)) return 'non offert avec ' + ent.l;
  if (m.min && larg < m.min) return 'largeur minimum ' + m.min + '"';
  if (m.maxL && larg > m.maxL) return 'largeur maximum ' + m.maxL + '"';
  if (m.maxH && haut > m.maxH) return 'hauteur maximum ' + m.maxH + '"';
  if (m.pc && larg * haut / 144 > m.pc) return 'maximum ' + m.pc + ' pi²';
  if (m.pasCoul && state.options.eliteCoul) return 'pas compatible avec les coulisses latérales';
  if (m.pasInverseFascia && ent.fascia && state.options.eliteEnroul === 'inverse') return 'pas compatible avec l\'enroulement inversé sur un fascia';
  return null;
}

// Moteur / alimentation / contrôle (seulement si « Motorisé »)
function eliteMoteurProbleme(m, larg, ent) {
  if (!m) return null;
  if (larg < m.min) return 'largeur minimum ' + m.min + '"';
  if (m.pasV90 && ent.v === 'V90') return 'pas offert avec la cassette V-90';
  return null;
}
function eliteMotorisationHtml(larg, ent) {
  const opt = state.options;
  if (!/^MOT/.test(opt.eliteMeca)) return '';
  const famille = m => opt.eliteMeca === 'MOT-E' ? /^EM/.test(m.f) : !/^EM/.test(m.f);
  let h = eliteEtiquette('elite-opt-moteur', 'Moteur') + '<div>' + eliteSelect('elite-opt-moteur', [{ v: '', l: '— Choisir —' }, ...ELITE_MOTEURS.filter(famille).map(m => {
    const pb = eliteMoteurProbleme(m, larg, ent);
    const petit = m.petit && larg < m.petit.max;
    return { v: m.v, l: m.l + ' — +' + (petit ? m.petit.p : m.p) + ' $' + (petit ? ' (' + m.petit.l + ')' : '') + (pb ? ' ⚠ ' + pb : ''), off: !!pb };
  })], opt.eliteMoteur || '', 'state.options.eliteMoteur=this.value;delete state.options.eliteAlim;delete state.options.eliteCtrl;state._eliteOptCle=null;calculatePriceElite();') + '</div>';
  const mot = ELITE_MOTEURS.filter(famille).find(m => m.v === opt.eliteMoteur);
  if (mot) {
    const al = ELITE_ALIMS[mot.alim] || [];
    if (al.length) h += eliteEtiquette('elite-opt-alim', 'Alimentation' + (/liion/.test(mot.alim) ? ' (au moins un chargeur par installation)' : mot.alim === '24v' || mot.alim === 'em12' ? ' (électricien requis)' : ''))
      + '<div>' + eliteSelect('elite-opt-alim', [{ v: '', l: mot.alim === 'emb' ? 'Chargeur inclus avec le moteur' : 'Aucune (déjà sur place)' }, ...al.map(a => ({ v: a.v, l: a.l + ' — +' + a.p + ' $' }))],
        opt.eliteAlim || '', 'state.options.eliteAlim=this.value;calculatePriceElite();') + '</div>';
    const ct = ELITE_CTRLS[mot.f] || [];
    h += eliteEtiquette('elite-opt-ctrl', 'Contrôle (télécommande, interrupteur)') + '<div>' + eliteSelect('elite-opt-ctrl',
      [{ v: '', l: ct.length ? 'Aucun (déjà sur place)' : 'Contrôles filaires : sur demande (liste Smart Shades p. 9-10)' }, ...ct.map(c => ({ v: c.v, l: c.l + ' — +' + c.p + ' $' }))],
      opt.eliteCtrl || '', 'state.options.eliteCtrl=this.value;calculatePriceElite();') + '</div>';
    if (mot.note) h += eliteNote('⚠ ' + mot.note + ' (liste Smart Shades).');
    if (mot.f === 'ZIG') h += eliteNote('Somfy Zigbee : compte TaHoma Pro obligatoire pour commander.');
  }
  return h + eliteNote('Motorisation au multiplicateur Somfy (×' + ((settings.elite && settings.elite.multiSomfy) || 1.5) + '), comme chez VP. Préciser les canaux sur la commande.');
}

// ── 3 — Options ─────────────────────────────────────────
function eliteSection(titre, contenu) {
  return '<div><div class="section-divider">' + eliteEsc(titre) + '</div><div style="padding:0 20px 12px">' + contenu + '</div></div>';
}
function eliteSelect(id, opts, val, onch) {
  return '<select id="' + id + '" onchange="' + onch + '">'
    + opts.map(o => '<option value="' + eliteEsc(o.v) + '"' + (String(o.v) === String(val) ? ' selected' : '') + (o.off ? ' disabled' : '') + '>' + eliteEsc(o.l) + '</option>').join('')
    + '</select>';
}
function eliteEtiquette(id, t) { return '<label for="' + id + '" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">' + eliteEsc(t) + '</label>'; }
function eliteNote(t) { return '<div style="font-size:11px;color:var(--text-dim);margin-top:5px">' + t + '</div>'; }
const eliteFmt = v => v == null ? 'n/d' : (v ? '+' + v + ' $' : 'inclus');

function eliteN() { const m = state.options.eliteMultiple; return m === '3x1' ? 3 : m === '2x1' ? 2 : 1; }
function eliteLargeurs(larg) {
  const out = [larg];
  for (let i = 2; i <= eliteN(); i++) {
    const l = parseFloat((document.getElementById('inp-larg' + i) || {}).value || 0) + parseFloat((document.getElementById('frac-larg' + i) || {}).value || 0);
    out.push(l > 0 ? l : larg);
  }
  return out;
}
function eliteHauteurs(haut) {
  const out = [haut];
  for (let i = 2; i <= eliteN(); i++) {
    const h = parseFloat((document.getElementById('inp-haut' + i) || {}).value || 0) + parseFloat((document.getElementById('frac-haut' + i) || {}).value || 0);
    out.push(h > 0 ? h : haut);
  }
  return out;
}

function buildOptionsElite(larg, haut) {
  const opt = state.options, t = eliteTissu(state.elite.t);
  if (!opt.eliteEntete) opt.eliteEntete = 'OR';
  const ent = ELITE_ENTETES.find(e => e.v === opt.eliteEntete) || ELITE_ENTETES[0];
  const N = eliteN(), largTot = eliteLargeurs(larg).reduce((a, b) => a + b, 0);
  let html = '';

  // Entête (+ toile arrière pour les doubles)
  let en = eliteSelect('elite-opt-entete', ELITE_ENTETES.map(e => {
    if (e.soum) return { v: e.v, l: e.l + ' — prix sur soumission Elite' };
    const p = e.s ? eliteSupp(e.s, e.twin ? larg : largTot) : (e.fixe || 0);
    const off = (e.twin && N > 1) || (N > 1 && !e.lie) || (e.max && larg > e.max) || p == null;
    return { v: e.v, l: e.l + ' — ' + eliteFmt(p) + (e.max ? ' (max ' + e.max + '")' : ''), off };
  }), opt.eliteEntete, "state.options.eliteEntete=this.value;state._eliteOptCle=null;calculatePriceElite();");
  if (ent.twin) {
    const T = window.ELITE.tissus.filter(x => !x.hl).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    en += eliteEtiquette('elite-opt-arriere', 'Toile arrière (2e toile du double)') + '<div>' + eliteSelect('elite-opt-arriere',
      [{ v: '', l: '— Choisir —' }, ...T.map(x => ({ v: x.id, l: x.nom }))], opt.eliteArriere || '', 'state.options.eliteArriere=this.value;calculatePriceElite();') + '</div>'
      + eliteEtiquette('elite-opt-arriere-coul', 'Couleur de la toile arrière')
      + '<div><input type="text" id="elite-opt-arriere-coul" value="' + eliteEsc(opt.eliteArriereCoul || '') + '" placeholder="ex. Blanc" oninput="state.options.eliteArriereCoul=this.value.trim();calculatePriceElite();"></div>'
      + eliteNote('Prix = les deux toiles à la même mesure + le supplément du double. Le tissu opaque va à l\'arrière, sauf indication contraire.');
  }
  html += eliteSection('Entête', en);

  // Couleur de la quincaillerie (selon l'entête)
  if (!ent.coul.includes(opt.eliteCouleur)) opt.eliteCouleur = ent.coul[0];
  html += eliteSection('Couleur de la quincaillerie', eliteSelect('elite-opt-couleur', ent.coul.map(c => ({ v: c, l: c })), opt.eliteCouleur,
    'state.options.eliteCouleur=this.value;calculatePriceElite();'));

  // Base (barre de bas) : options offertes par le tissu
  const bases = (t && t.bas) || ['F', 'E'];
  if (!bases.includes(opt.eliteBase)) opt.eliteBase = bases.includes('E') ? 'E' : bases[0];
  html += eliteSection('Base (barre de bas)', eliteSelect('elite-opt-base', ['E', 'H', 'F'].filter(b => bases.includes(b)).map(b => {
    const p = eliteSupp({ E: 'Exposed (E)', H: 'Hem Pocket (H)', F: 'Fabric Wrap (F)' }[b], larg);
    return { v: b, l: ELITE_BASES[b] + ' — ' + eliteFmt(p), off: p == null };
  }), opt.eliteBase, 'state.options.eliteBase=this.value;calculatePriceElite();'));

  // Coulisses latérales (prix selon la hauteur)
  html += eliteSection("Coulisses d'obscurité — côtés", eliteSelect('elite-opt-coul', [{ v: '', l: 'Aucune' },
    ...ELITE_COULISSES.map(c => ({ v: c.v, l: c.l + ' — ' + eliteFmt(eliteCoulisse(c.v, haut)) }))], opt.eliteCoul || '',
    "state.options.eliteCoul=this.value;calculatePriceElite();")
    + eliteNote('Pas compatibles avec SpringDrive, FreeMotion ni WandControl. Couleur : celle de la quincaillerie.'));

  // Mécanisme & Motorisation
  if (!ELITE_MECAS.some(m => m.v === opt.eliteMeca) || !ent.meca.includes(opt.eliteMeca)) opt.eliteMeca = 'CG';
  html += eliteSection('Mécanisme & Motorisation', eliteSelect('elite-opt-meca', ELITE_MECAS.map(m => {
    const pb = eliteMecaProbleme(m, larg, haut, ent);
    return { v: m.v, l: m.l + ' — ' + eliteFmt(m.p) + (pb ? ' ⚠ ' + pb : ''), off: !!pb && m.v !== opt.eliteMeca };
  }), opt.eliteMeca, 'state.options.eliteMeca=this.value;delete state.options.eliteMoteur;state._eliteOptCle=null;calculatePriceElite();')
    + eliteMotorisationHtml(larg, ent));

  // Côté contrôle, enroulement, multiple toiles
  if (!opt.eliteCote) opt.eliteCote = 'droit';
  html += eliteSection('Côté contrôle', eliteSelect('elite-opt-cote', [{ v: 'droit', l: 'Contrôle droit' }, { v: 'gauche', l: 'Contrôle gauche' }], opt.eliteCote,
    'state.options.eliteCote=this.value;calculatePriceElite();'));
  if (!opt.eliteEnroul) opt.eliteEnroul = 'ordinaire';
  html += eliteSection('Enroulement', eliteSelect('elite-opt-enroul', [{ v: 'ordinaire', l: 'Ordinaire' }, { v: 'inverse', l: 'Inversé (reverse roll)' }], opt.eliteEnroul,
    'state.options.eliteEnroul=this.value;calculatePriceElite();'));
  if (!opt.eliteMultiple) opt.eliteMultiple = '1x1';
  const multOk = !!ent.lie && !ent.twin;
  html += eliteSection('Multiple toiles', eliteSelect('elite-opt-multiple', [
    { v: '1x1', l: '1 toile / 1 top' },
    { v: '2x1', l: '2 toiles liées / 1 top — +' + (ent.lie || 0) + ' $ (support)', off: !multOk },
    { v: '3x1', l: '3 toiles liées / 1 top — +' + 2 * (ent.lie || 0) + ' $ (supports)', off: !multOk },
  ], opt.eliteMultiple, "state.options.eliteMultiple=this.value;state._eliteOptCle=null;calculatePriceElite();")
    + eliteNote('Toiles liées : chaque toile à sa mesure, l\'entête sur la largeur totale' + (ent.v.startsWith('M7') ? ' (max 120" au total)' : '') + '.'));

  // Accessoires
  const acc = [
    { k: 'perche', l: 'Perche télescopique + poignée', p: 53 },
    { k: 'manivelle', l: 'Manivelle FreeMotion™', p: 53, si: 'FM' },
    { k: 'chargeur', l: 'Chargeur E-Touch™ (câble USB-C 4 m + bloc)', p: 122, si: 'ET' },
    { k: 'panneau', l: 'Panneau de fermeture (pochette au plafond)', s: 'Closure Panel' },
    { k: 'ressort', l: 'Spring Assist (aide-ressort, grandes toiles ex. 96 × 96)', p: 105, si: 'CG' },
  ].filter(a => !a.si || a.si === opt.eliteMeca);
  opt.eliteAcc = opt.eliteAcc || {};
  html += eliteSection('Accessoires', acc.map(a => {
    const p = a.s ? eliteSupp(a.s, largTot) : a.p, id = 'elite-acc-' + a.k;
    return '<div style="display:flex;align-items:center;gap:10px;margin-top:6px"><input type="checkbox" id="' + id + '"' + (opt.eliteAcc[a.k] ? ' checked' : '') + (p == null ? ' disabled' : '')
      + ' style="width:14px;height:14px;accent-color:var(--gold);cursor:pointer" onchange="state.options.eliteAcc[\'' + a.k + '\']=this.checked;calculatePriceElite();">'
      + '<label for="' + id + '" style="font-size:12px;color:var(--text-mid);cursor:pointer">' + eliteEsc(a.l + ' — ' + eliteFmt(p)) + '</label></div>';
  }).join(''));

  document.getElementById('options-container').innerHTML = html;
}

// ── Calcul ──────────────────────────────────────────────
function calculatePriceElite() {
  const e = state.elite || {}, t = eliteTissu(e.t);
  if (!window.ELITE || !t) { resetResult(); return; }
  const larg = (parseFloat(document.getElementById('inp-larg').value) || 0) + (parseFloat(document.getElementById('frac-larg').value) || 0);
  const haut = (parseFloat(document.getElementById('inp-haut').value) || 0) + (parseFloat(document.getElementById('frac-haut').value) || 0);
  if (!larg || !haut) { hide('card-options'); resetResult(); return; }
  const alertEl = document.getElementById('alert-dim'), noteEl = document.getElementById('note-dim');
  const opt = state.options;
  const N = eliteN();
  multiDimsUI(N, 'Toile', 'même entête');
  const largs = eliteLargeurs(larg), hauts = eliteHauteurs(haut), largTot = largs.reduce((a, b) => a + b, 0);

  show('card-options');
  const cle = [e.t, opt.eliteEntete, larg, haut, N, largTot, opt.eliteMeca, opt.eliteCoul, opt.eliteEnroul, opt.eliteMoteur].join('|');
  if (state._eliteOptCle !== cle) { buildOptionsElite(larg, haut); state._eliteOptCle = cle; }
  const ent = ELITE_ENTETES.find(x => x.v === opt.eliteEntete) || ELITE_ENTETES[0];

  const bloquer = msg => { alertEl.textContent = '⚠ ' + msg; alertEl.classList.add('show'); resetResult(); state.lastResult = null; };
  const breakdown = [];
  let pdsf = 0;
  const ajout = (label, p) => { pdsf += p; breakdown.push({ label, pdsf: p }); };
  let pdsfMoto = 0;
  const ajoutM = (label, p) => { pdsfMoto += p; breakdown.push({ label, pdsf: p, somfy: true }); };

  // Toile(s) : chaque toile à sa mesure, dans la grille de son groupe
  for (let i = 0; i < N; i++) {
    if (largs[i] > t.larg) return bloquer(`${t.nom} : largeur maximum ${t.larg}" (largeur du tissu) — toile ${i + 1} à ${largs[i]}"`);
    const c = elitePrixGrille(t.g, largs[i], hauts[i]);
    if (!c) return bloquer(`Non offert à ${largs[i]}" × ${hauts[i]}" (grille Elite : 30"–144" × 48"–144")`);
    if (i === 0) { state.largTip = c.L; state.hautTip = c.H; }
    ajout(`${t.nom} (groupe ${t.g}) ${c.L}"×${c.H}"${N > 1 ? ' — toile ' + (i + 1) : ''}`, c.v);
  }
  if (ent.soum) return bloquer(ent.l + ' : prix sur soumission seulement — demander une soumission au service des soumissions d\'Elite (liste Roller, section commerciale).');
  if (ent.max && (ent.twin ? larg : largTot) > ent.max) return bloquer(`${ent.l} : largeur maximum ${ent.max}"${N > 1 ? ' au total' : ''}`);
  // Double : 2e toile à la même mesure
  let arr = null;
  if (ent.twin) {
    arr = eliteTissu(opt.eliteArriere);
    if (!arr) return bloquer('Double : choisir la toile arrière.');
    if (larg > arr.larg) return bloquer(`${arr.nom} : largeur maximum ${arr.larg}" (largeur du tissu)`);
    const c2 = elitePrixGrille(arr.g, larg, haut);
    if (!c2) return bloquer(`Toile arrière non offerte à ${larg}" × ${haut}"`);
    ajout(`Toile arrière ${arr.nom} (groupe ${arr.g}) ${c2.L}"×${c2.H}"`, c2.v);
  }
  // Entête
  const pe = ent.s ? eliteSupp(ent.s, ent.twin ? larg : largTot) : (ent.fixe || 0);
  if (pe == null) return bloquer(`${ent.l} : non offert à ${ent.twin ? larg : largTot}" de largeur`);
  if (pe) ajout(ent.l + (N > 1 ? ' (largeur totale ' + largTot + '")' : ''), pe);
  if (N > 1) ajout('Support' + (N > 2 ? 's' : '') + ' intermédiaire' + (N > 2 ? 's' : '') + ' (toiles liées)', (N - 1) * ent.lie);
  // Base
  let pb = 0;
  for (let i = 0; i < N; i++) {
    const v = eliteSupp({ E: 'Exposed (E)', H: 'Hem Pocket (H)', F: 'Fabric Wrap (F)' }[opt.eliteBase], largs[i]);
    if (v == null) return bloquer(ELITE_BASES[opt.eliteBase] + ' : non offert à ' + largs[i] + '"');
    pb += v * (ent.twin ? 2 : 1);
  }
  if (pb) ajout(ELITE_BASES[opt.eliteBase] + (N > 1 ? ' ×' + N : ent.twin ? ' ×2' : ''), pb);
  // Coulisses
  if (opt.eliteCoul) {
    let pc = 0;
    for (let i = 0; i < N; i++) { const v = eliteCoulisse(opt.eliteCoul, hauts[i]); if (v == null) return bloquer('Coulisses : hauteur maximum 144"'); pc += v; }
    ajout((ELITE_COULISSES.find(c => c.v === opt.eliteCoul) || {}).l + (N > 1 ? ' ×' + N : ''), pc);
  }
  // Mécanisme
  const meca = ELITE_MECAS.find(m => m.v === opt.eliteMeca) || ELITE_MECAS[0];
  const pbm = eliteMecaProbleme(meca, Math.max(...largs), Math.max(...hauts), ent);
  if (pbm) return bloquer(meca.l.split(' (')[0] + ' : ' + pbm + ' — choisir un autre mécanisme');
  if (meca.p) ajout(meca.l.split(' (')[0], meca.p * (ent.twin ? 2 : 1));
  const moto = [];
  if (/^MOT/.test(meca.v)) {
    const mot = ELITE_MOTEURS.find(m => m.v === opt.eliteMoteur && (meca.v === 'MOT-E') === /^EM/.test(m.f));
    if (!mot) return bloquer('Motorisé : choisir le moteur.');
    const pbmo = eliteMoteurProbleme(mot, Math.min(...largs), ent);
    if (pbmo) return bloquer(mot.l + ' : ' + pbmo);
    const petit = mot.petit && Math.min(...largs) < mot.petit.max;
    const nb = ent.twin ? 2 : 1;
    ajoutM((petit ? mot.petit.l.split(' (')[0] : mot.l) + (nb > 1 ? ' ×2' : ''), (petit ? mot.petit.p : mot.p) * nb); moto.push('Moteur : ' + mot.l);
    const al = (ELITE_ALIMS[mot.alim] || []).find(a => a.v === opt.eliteAlim);
    if (al) { ajoutM(al.l, al.p); moto.push('Alimentation : ' + al.l); }
    const ct = (ELITE_CTRLS[mot.f] || []).find(c => c.v === opt.eliteCtrl);
    if (ct) { ajoutM(ct.l, ct.p); moto.push('Contrôle : ' + ct.l); }
  }
  // Accessoires
  const accTxt = [];
  const ACC = { ressort: ['Spring Assist (aide-ressort)', 105], perche: ['Perche télescopique + poignée', 53], manivelle: ['Manivelle FreeMotion™', 53], chargeur: ['Chargeur E-Touch™', 122], panneau: ['Panneau de fermeture', null] };
  Object.keys(opt.eliteAcc || {}).forEach(k => {
    if (!opt.eliteAcc[k] || !ACC[k]) return;
    if (k === 'manivelle' && opt.eliteMeca !== 'FM') return;
    if (k === 'chargeur' && opt.eliteMeca !== 'ET') return;
    if (k === 'ressort' && opt.eliteMeca !== 'CG') return;
    const p = ACC[k][1] != null ? ACC[k][1] : eliteSupp('Closure Panel', largTot);
    if (p == null) return;
    ajout(ACC[k][0], p); accTxt.push(ACC[k][0]);
  });
  alertEl.classList.remove('show');
  const badge = document.getElementById('badge-dim'); if (badge) badge.textContent = `${state.largTip}" × ${state.hautTip}"`;
  noteEl.textContent = `ℹ Grille utilisée : groupe ${t.g}, ${state.largTip}" × ${state.hautTip}" · liste Roller Elite SS 05-2026`;
  noteEl.classList.add('show');

  const cfg = settings.elite || { pct: 22.5, multi: 2.0, multiSomfy: 1.5 };
  const pdsfStore = Math.round(pdsf * 100) / 100, pdsfSomfy = Math.round(pdsfMoto * 100) / 100;
  const pdsfTotal = Math.round((pdsfStore + pdsfSomfy) * 100) / 100;
  const coutStore = Math.round(pdsfStore * cfg.pct) / 100, coutSomfy = Math.round(pdsfSomfy * cfg.pct) / 100;
  const venteStore = Math.round(coutStore * cfg.multi * 100) / 100, venteSomfy = Math.round(coutSomfy * (cfg.multiSomfy || 1.5) * 100) / 100;
  const cout = Math.round((coutStore + coutSomfy) * 100) / 100;
  const vente = Math.round((venteStore + venteSomfy) * 100) / 100;
  const marge = vente > 0 ? Math.round((vente - cout) / vente * 1000) / 10 : 0;

  const resume = [
    'Type de produit : Toile à rouleau',
    'Modèle : ' + t.nom + (t.hl ? ' (Roller High-Lite)' : '') + ' — groupe ' + t.g,
    'Couleur : ' + (state.tissuCouleur || ''),
    'Entête : ' + ent.l,
    arr ? 'Toile arrière : ' + arr.nom + (opt.eliteArriereCoul ? ' — ' + opt.eliteArriereCoul : '') : '',
    'Couleur de la quincaillerie : ' + opt.eliteCouleur,
    'Base : ' + ELITE_BASES[opt.eliteBase],
    opt.eliteCoul ? 'Coulisses : ' + (ELITE_COULISSES.find(c => c.v === opt.eliteCoul) || {}).l : '',
    'Mécanisme : ' + meca.l.split(' (')[0],
    ...moto,
    'Côté contrôle : ' + (opt.eliteCote === 'gauche' ? 'Contrôle gauche' : 'Contrôle droit'),
    'Enroulement : ' + (opt.eliteEnroul === 'inverse' ? 'Inversé' : 'Ordinaire'),
    'Multiple toiles : ' + (N > 1 ? N + ' toiles liées / 1 top' : '1 toile / 1 top'),
    accTxt.length ? 'Accessoires : ' + accTxt.join(', ') : '',
  ].filter(x => x && !/:\s*$/.test(x));
  state.eliteResume = resume;
  state.pdsf = pdsfTotal;
  renderResult({ pdsfStore, pdsfSomfy, pdsfTotal, cout, coutStore, coutSomfy, vente, venteStore, venteSomfy, marge, breakdown }, {
    cfg,
    fournisseur: 'Elite · Toile à rouleau',
    produit: t.nom,
    detail: `${state.largTip}" × ${state.hautTip}"${state.tissuCouleur ? '<br>' + eliteEsc(state.tissuCouleur) : ''}`,
    titre: 'Détail MSRP — liste Roller Elite SS 05-2026',
  });
  state.lastResult.desc = resume.join(' | ');
}

// ── Rouvrir une ligne du devis (✎ Modifier) ────────────
window.eliteRestore = function (saved, ctrls) {
  eliteCharger().then(() => {
    const e = saved.elite || {};
    if (!e.t) return;
    const sel = document.getElementById('sel-type'); sel.value = 'elite-TR';
    eliteOnType();
    setTimeout(() => {
      state.options = JSON.parse(JSON.stringify(saved.options || {}));
      state.tissuCouleur = saved.tissuCouleur || '';
      ['inp-larg', 'inp-haut', 'frac-larg', 'frac-haut', 'inp-larg2', 'inp-haut2', 'frac-larg2', 'frac-haut2', 'inp-larg3', 'inp-haut3', 'frac-larg3', 'frac-haut3']
        .forEach(id => { const el = document.getElementById(id); if (el && ctrls[id]) el.value = ctrls[id].v; });
      state.elite = { t: e.t };
      document.getElementById('sel-modele').value = e.t;
      eliteOnModele();
    }, 0);
  });
};
