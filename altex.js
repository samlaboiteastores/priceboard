// ══════════════════════════════════════════════════════
// ALTEX 2026 — toiles à rouleau (4 guides de prix PDSF)
// Recherche par TISSU → système (manœuvre) → type → dimensions → options.
// Données : altex.json (PDSF publics des guides 2026, chargé au besoin).
// CONFIDENTIEL : l'escompte fournisseur n'est JAMAIS dans ce fichier. Le coût est
// calculé par Odoo (paramètre privé) et transmis à l'iframe par le pont Odoo.
// ══════════════════════════════════════════════════════
window.ALTEX = null;
window.LBAS_ALTEX_FACTEUR = null;   // reçu d'Odoo seulement (message lbas_facteurs)
const ALTEX_ODOO_ORIGIN = 'https://tkl.tekstil.ca';

// Kits moteurs et contrôles (PDSF, guides 2026 — Motorisation simplifiée)
const ALTEX_KITS = [
  { v: 'K-S30i-U',   l: 'Somfy RTS — Sonesse 30 Ultra rechargeable', p: 844 },
  { v: 'K-S28i',     l: 'Somfy RTS — Sonesse 28 rechargeable', p: 766 },
  { v: 'K-S30',      l: 'Somfy RTS — Sonesse 30 branché 24V', p: 988 },
  { v: 'K-S40',      l: 'Somfy RTS — Sonesse 40 branché 120V', p: 1036 },
  { v: 'K-S30i-U-Z', l: 'Somfy Zigbee — Sonesse 30 Ultra rechargeable', p: 891 },
  { v: 'K-S28i-Z',   l: 'Somfy Zigbee — Sonesse 28 rechargeable', p: 801 },
  { v: 'K-S30-Z',    l: 'Somfy Zigbee — Sonesse 30 branché 24V', p: 1194 },
  { v: 'K-S40-Z',    l: 'Somfy Zigbee — Sonesse 40 branché 120V', p: 1251 },
  { v: 'K-CM-45-B',  l: 'Motionblinds Bluetooth — CM-45', p: 340 },
  { v: 'K-CM-03-B',  l: 'Motionblinds Bluetooth — CM-03', p: 613 },
  { v: 'K-CM-05-B',  l: 'Motionblinds Bluetooth — CM-05', p: 882 },
  { v: 'K-CM-06-B',  l: 'Motionblinds Bluetooth — CM-06', p: 799 },
  { v: 'K-CM-03-E',  l: 'Motionblinds Eve — CM-03', p: 702 },
  { v: 'K-CM-06-E',  l: 'Motionblinds Eve — CM-06', p: 983 },
  { v: 'K-CM-45',    l: 'Motionblinds Pull — CM-45 PO (Absolute)', p: 259 },
];
const ALTEX_CTRLS = [
  { v: 'SITUO1',  l: 'Télécommande Situo 1 canal (RTS)', p: 186 },
  { v: 'SITUO5',  l: 'Télécommande Situo 5 canaux (RTS)', p: 245 },
  { v: 'SMOOVE1', l: 'Interrupteur Smoove 1 canal (RTS)', p: 239 },
  { v: 'SMOOVE4', l: 'Interrupteur Smoove 4 canaux (RTS)', p: 306 },
  { v: 'YSIA1',   l: 'Télécommande Ysia 1 canal (Zigbee)', p: 196 },
  { v: 'YSIA5',   l: 'Télécommande Ysia 5 canaux (Zigbee)', p: 260 },
  { v: 'SURF2',   l: 'Interrupteur Decoflex 2 canaux (Zigbee)', p: 504 },
  { v: 'SURF4',   l: 'Interrupteur Decoflex 4 canaux (Zigbee)', p: 504 },
  { v: 'TAHOM',   l: 'Concentrateur TaHoma (Zigbee)', p: 687 },
  { v: 'CM-11',   l: 'Télécommande Motionblinds 1 canal', p: 84 },
  { v: 'CM-12',   l: 'Télécommande Motionblinds 5 canaux', p: 119 },
  { v: 'CM-13',   l: 'Télécommande Motionblinds 15 canaux', p: 204 },
];

function altexCharger() {
  if (window.ALTEX) return Promise.resolve(window.ALTEX);
  if (window._altexPromesse) return window._altexPromesse;
  window._altexPromesse = fetch('altex.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(d => { window.ALTEX = d; return d; })
    .catch(e => { window._altexPromesse = null; throw e; });
  return window._altexPromesse;
}

function altexEsc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function altexTitre(s) { return String(s || '').toLowerCase().replace(/(^|[\s(\-«\/])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase()); }
function altexSys(s) { return altexTitre(s).replace(/\bRts\b/, 'RTS').replace(/\bAtx\b/, 'ATX').replace(/\bAvec\b/, 'avec'); }

// ── Motorisation à la carte (guide Résidentiel 2026, p. 345-369) ──
// p = prix par colonne du guide : D = District (et Ambio), A = Absolute 2.0 (et Ambio), X = toile ATX ; min = largeur minimale finie
// pr = protocole (contrôles offerts) ; alim = alimentations et accessoires offerts ; br = branchements 120 V (prix du moteur AVEC ce branchement)
const ALTEX_BR = {
  S40: [['402', 'Fast Connect femelle 1,4 pi, fiche Nema', 1008], ['403', 'Fast Connect femelle 4,4 pi, fiche Nema', 1021], ['404', 'Fast Connect femelle 10,4 pi, fiche Nema *', 1068],
        ['405', 'Fast Connect femelle 18 pi, fiche Nema *', 1098], ['406', 'Fast Connect femelle 24 pi, fiche Nema *', 1123], ['407', 'Fast Connect femelle 8,4 pi, fil nu', 1036],
        ['408', 'Wago femelle seulement (aucun filage)', 1022], ['409', 'Wago femelle 10 pi, fil nu', 1063], ['410', 'Wago femelle 24 pi, fil nu', 1122]],
  S50: [['502', 'Fil 1,5 pi, fiche Nema', 1018], ['503', 'Fil 6 pi, fiche Nema', 1026], ['504', 'Fil 18 pi, fiche Nema *', 1037], ['505', 'Fil 24 pi, fiche Nema *', 1073],
        ['506', 'Fast Connect femelle 1,4 pi, fiche Nema *', 1137], ['507', 'Fast Connect femelle 4,4 pi, fiche Nema *', 1150], ['508', 'Fast Connect femelle 8,4 pi, fiche Nema *', 1165],
        ['509', 'Fast Connect femelle 10,4 pi, fiche Nema *', 1197], ['510', 'Fast Connect femelle 18 pi, fiche Nema *', 1227], ['511', 'Fast Connect femelle 24 pi, fiche Nema *', 1252],
        ['512', 'Fast Connect femelle 8,4 pi, fil nu *', 1165], ['513', 'Wago femelle seulement *', 1029], ['514', 'Wago femelle 10 pi, fil nu *', 1070], ['515', 'Wago femelle 24 pi, fil nu *', 1129]],
  S50U: [['502', 'Fil 1,5 pi, fiche Nema', 1274], ['503', 'Fil 6 pi, fiche Nema', 1282], ['504', 'Fil 18 pi, fiche Nema *', 1293], ['505', 'Fil 24 pi, fiche Nema *', 1329],
        ['506', 'Fast Connect femelle 1,4 pi, fiche Nema *', 1393], ['507', 'Fast Connect femelle 4,4 pi, fiche Nema *', 1406], ['508', 'Fast Connect femelle 8,4 pi, fiche Nema *', 1421],
        ['509', 'Fast Connect femelle 10,4 pi, fiche Nema *', 1453], ['510', 'Fast Connect femelle 18 pi, fiche Nema *', 1483], ['511', 'Fast Connect femelle 24 pi, fiche Nema *', 1508],
        ['512', 'Fast Connect femelle 8,4 pi, fil nu *', 1421], ['513', 'Wago femelle seulement *', 1285], ['514', 'Wago femelle 10 pi, fil nu *', 1326], ['515', 'Wago femelle 24 pi, fil nu *', 1385]],
  S40Z: [['412', 'Fast Connect femelle 1,4 pi, fiche Nema', 1223], ['413', 'Fast Connect femelle 4,4 pi, fiche Nema', 1236], ['414', 'Fast Connect femelle 10,4 pi, fiche Nema *', 1283],
        ['415', 'Fast Connect femelle 18 pi, fiche Nema *', 1313], ['416', 'Fast Connect femelle 24 pi, fiche Nema *', 1338], ['417', 'Fast Connect femelle 8,4 pi, fil nu', 1251],
        ['418', 'Wago femelle seulement (aucun filage)', 1237], ['419', 'Wago femelle 10 pi, fil nu', 1278], ['420', 'Wago femelle 24 pi, fil nu', 1337]],
};
const ALTEX_MOTEURS = [
  { v: 'S28E-RTS', pr: 'RTS', l: 'Somfy Sonesse 28 RTS pile externe (bloc-piles requis)', p: { D: 589, A: 589 }, min: { D: 18, A: 17 }, alim: 'piles', req: ['BLOC'] },
  { v: 'S28R-RTS', pr: 'RTS', l: 'Somfy Sonesse 28 RTS rechargeable', p: { D: 686, A: 686 }, min: { D: 26, A: 24 }, alim: 'piles' },
  { v: 'S30U-RTS', pr: 'RTS', l: 'Somfy Sonesse 30 Ultra RTS rechargeable (ultra-silencieux)', p: { D: 764, A: 764 }, min: { D: 30, A: 28 }, alim: 'piles' },
  { v: 'S40R-RTS', pr: 'RTS', l: 'Somfy Sonesse 40 RTS rechargeable', p: { D: 1127, A: 1127 }, min: { D: 30, A: 28 }, alim: 'piles' },
  { v: 'S30-24-RTS', pr: 'RTS', l: 'Somfy Sonesse 30 RTS 24 V (branché)', p: { D: 847, A: 847 }, min: { D: 22, A: 21 }, alim: '24v' },
  { v: 'S50U-24-RTS', pr: 'RTS', l: 'Somfy Sonesse 50 Ultra RTS 24 V (branché)', p: { X: 1603 }, min: { X: 39 }, alim: '24v' },
  { v: 'S40-120-RTS', pr: 'RTS', l: 'Somfy Sonesse 40 RTS 120 V (branché, électricien requis)', p: { D: 1036, A: 1036 }, min: { D: 26, A: 22 }, br: 'S40', std: '401' },
  { v: 'S50-120-RTS', pr: 'RTS', l: 'Somfy Sonesse 50 RTS 120 V (branché, électricien requis)', p: { A: 1032, X: 1032 }, min: { A: 29, X: 35 }, apparentA: true, br: 'S50', std: '501' },
  { v: 'S50U-120-RTS', pr: 'RTS', l: 'Somfy Sonesse 50 Ultra RTS 120 V (ultra-silencieux, électricien requis)', p: { A: 1288, X: 1288 }, min: { A: 35, X: 39 }, apparentA: true, br: 'S50U', std: '501' },
  { v: 'S28E-Z', pr: 'ZIG', l: 'Somfy Sonesse 28 Zigbee pile externe (bloc-piles requis)', p: { D: 631, A: 631 }, min: { D: 18, A: 17 }, alim: 'piles', req: ['BLOC'] },
  { v: 'S28R-Z', pr: 'ZIG', l: 'Somfy Sonesse 28 Zigbee rechargeable', p: { D: 721, A: 721 }, min: { D: 26, A: 24 }, alim: 'piles' },
  { v: 'S30U-Z', pr: 'ZIG', l: 'Somfy Sonesse 30 Ultra Zigbee rechargeable (ultra-silencieux)', p: { D: 811, A: 811 }, min: { D: 30, A: 28 }, alim: 'piles' },
  { v: 'S40R-Z', pr: 'ZIG', l: 'Somfy Sonesse 40 Zigbee rechargeable (composantes USB-C)', p: { D: 1345, A: 1345 }, min: { D: 30, A: 28 }, alim: 'usbc' },
  { v: 'S30-24-Z', pr: 'ZIG', l: 'Somfy Sonesse 30 Zigbee 24 V (branché)', p: { D: 1053, A: 1053 }, min: { D: 23, A: 22 }, alim: '24v' },
  { v: 'S40-120-Z', pr: 'ZIG', l: 'Somfy Sonesse 40 Zigbee 120 V (branché, électricien requis)', p: { D: 1251, A: 1251 }, min: { D: 26, A: 22 }, br: 'S40Z', std: '411' },
  { v: 'MB-CM45-PO', pr: 'MB', l: 'Motionblinds Pull CM-45 PO (sans télécommande)', p: { D: 234, A: 234, X: 234 }, alim: 'mb', abs: true },
  { v: 'MB-CM45-B', pr: 'MB', l: 'Motionblinds Bluetooth CM-45', p: { D: 315, A: 315, X: 315 }, alim: 'mb' },
  { v: 'MB-CM03-B', pr: 'MB', l: 'Motionblinds Bluetooth CM-03', p: { D: 588, A: 588, X: 588 }, alim: 'mb' },
  { v: 'MB-CM05-B', pr: 'MB', l: 'Motionblinds Bluetooth CM-05', p: { D: 857, A: 857, X: 857 }, alim: 'mb' },
  { v: 'MB-CM06-B', pr: 'MB', l: 'Motionblinds Bluetooth CM-06', p: { D: 774, A: 774, X: 774 }, alim: 'mb' },
  { v: 'MB-CM03-E', pr: 'MB', l: 'Motionblinds Eve CM-03', p: { D: 677, A: 677, X: 677 }, alim: 'mb' },
  { v: 'MB-CM06-E', pr: 'MB', l: 'Motionblinds Eve CM-06', p: { D: 958, A: 958, X: 958 }, alim: 'mb' },
];
const ALTEX_ALIMS = {
  piles: [['CH56', 'Chargeur Li-ion V2 [9025166] (obligatoire pour recharger)', 56], ['SOL309', 'Panneau solaire Li-ion [9027294]', 309], ['ADM29', 'Adaptateur magnétique [9028562] (1 par moteur)', 29],
          ['CRM39', 'Câble rigide magnétique [9028560]', 39], ['EXT17', 'Fil d\'extension 7,5 po [9021131] (inclus avec fascia ou cassette)', 17], ['EXT24', 'Fil d\'extension 94,5 po [9021016]', 24],
          ['BLOC', 'Bloc piles rechargeables Li-ion [9021217]', 203]],
  usbc: [['CHC68', 'Chargeur rapide Li-ion USB-C [9028923]', 68], ['ADMC14', 'Adaptateur magnétique USB-C [9028564] (1 par moteur)', 14], ['CRMC41', 'Câble rigide magnétique USB-C [9028563]', 41],
         ['EXTC38', 'Câble d\'extension 8 po USB-C [9028565] (inclus avec fascia ou cassette)', 38], ['SOL309', 'Panneau solaire Li-ion [9027294]', 309]],
  '24v': [['TR141', 'Transformateur individuel mural [1822209] (sans électricien)', 141], ['BX5', 'Boîtier d\'alimentation — jusqu\'à 5 moteurs [1870196]', 2535],
          ['BX10', 'Boîtier d\'alimentation — jusqu\'à 10 moteurs [1870192]', 4043], ['BX15', 'Boîtier d\'alimentation — jusqu\'à 15 moteurs [1870197]', 5236],
          ['BX20', 'Boîtier d\'alimentation — jusqu\'à 20 moteurs [1870198]', 6240]],
  mb: [['MBUSB', 'Fil de charge USB-C 10 pi [CD02-0180]', 25]],
};
const ALTEX_CTRLS_PR = {
  RTS: [['SITUO1', 'Télécommande Situo 1 canal', 186], ['SITUO5', 'Télécommande Situo 5 canaux', 245], ['SITUO5V', 'Télécommande Situo 5 Variation (Ambio)', 323],
        ['TELIS16', 'Télécommande Telis 16 canaux (écran)', 723], ['SMOOVE1', 'Interrupteur Smoove 1 canal', 239], ['SMOOVE4', 'Interrupteur Smoove 4 canaux', 306],
        ['DECO1', 'Interrupteur DecoFlex 1 canal (encastré, à piles)', 385], ['DECO5', 'Interrupteur DecoFlex 5 canaux (encastré, à piles)', 403],
        ['DECO5S', 'Interrupteur DecoFlex 5 Surface RTS', 445], ['DECO5A', 'Adaptateur encastrable DecoFlex 5', 72], ['REPRTS', 'Répéteur RTS', 534], ['URTSI', 'Interface URTSI RTS 16 canaux', 1485],
        ['TAHOM', 'Kit TaHoma (concentrateur + adaptateur Ethernet)', 687], ['TAHOS', 'Concentrateur TaHoma Switch (wifi seulement)', 611], ['TAHOE', 'Adaptateur Ethernet TaHoma', 92]],
  ZIG: [['YSIA1', 'Télécommande Ysia 1 canal', 196], ['YSIA5', 'Télécommande Ysia 5 canaux', 260], ['YSIA5V', 'Télécommande Ysia 5 Variation (Ambio)', 379],
        ['DZ2E', 'Interrupteur DecoFlex Zigbee 2 canaux encastré', 504], ['DZ4E', 'Interrupteur DecoFlex Zigbee 4 canaux encastré', 504],
        ['DZ2S', 'Interrupteur DecoFlex Zigbee 2 canaux surface', 504], ['DZ4S', 'Interrupteur DecoFlex Zigbee 4 canaux surface', 504], ['ZPLUG', 'Prise intelligente Zigbee', 138],
        ['TAHOM', 'Kit TaHoma (concentrateur + adaptateur Ethernet)', 687], ['TAHOS', 'Concentrateur TaHoma Switch (wifi seulement)', 611], ['TAHOE', 'Adaptateur Ethernet TaHoma', 92]],
  MB: [['CM-11', 'Télécommande Motionblinds 1 canal', 84], ['CM-12', 'Télécommande Motionblinds 5 canaux', 119], ['CM-13', 'Télécommande Motionblinds 15 canaux', 204]],
};
// moteur contenu dans chaque kit (même largeur minimum que le moteur à la carte)
const ALTEX_KIT_MOTEUR = { 'K-S30i-U': 'S30U-RTS', 'K-S28i': 'S28R-RTS', 'K-S30': 'S30-24-RTS', 'K-S40': 'S40-120-RTS',
  'K-S30i-U-Z': 'S30U-Z', 'K-S28i-Z': 'S28R-Z', 'K-S30-Z': 'S30-24-Z', 'K-S40-Z': 'S40-120-Z' };
function altexKitProbleme(k, larg) { const m = ALTEX_MOTEURS.find(x => x.v === ALTEX_KIT_MOTEUR[k]); return m ? altexMoteurProbleme(m, larg) : null; }
// protocole d'un kit « motorisation simplifiée »
const altexPrKit = k => /^K-CM/.test(k) ? 'MB' : /-Z$/.test(k) ? 'ZIG' : 'RTS';
function altexColMoteur() { const s = state.altex.s || ''; return /ATX/.test(s) ? 'X' : /ABSOLUTE/.test(s) ? 'A' : 'D'; }
function altexMoteurProbleme(m, larg) {
  const c = altexColMoteur();
  if (!m.p[c]) return 'non offert avec ce système';
  if (m.apparentA && c === 'A' && state.altex.ty !== 'Rouleau apparent') return 'rouleau apparent seulement';
  if (m.min && m.min[c] && larg < m.min[c]) return 'largeur minimum ' + m.min[c] + '"';
  if (m.abs && c !== 'A') return 'Absolute 2.0 seulement';
  if (state.altex.g === 'V' && m.pr !== 'MB') return 'Meilleure valeur : Motionblinds seulement';
  if (state.altex.g === 'A' && m.pr === 'ZIG') return 'pas offert dans ce guide';
  return null;
}
function altexSelectGroupes(id, groupes, val, onch) {
  return '<select id="' + id + '" onchange="' + onch + '">' + groupes.map(g => g.opts.length ? (g.titre ? '<optgroup label="' + altexEsc(g.titre) + '">' : '')
    + g.opts.map(o => '<option value="' + altexEsc(o.v) + '"' + (String(o.v) === String(val) ? ' selected' : '') + (o.off ? ' disabled' : '') + '>' + altexEsc(o.l) + '</option>').join('')
    + (g.titre ? '</optgroup>' : '') : '').join('') + '</select>';
}

// ── Gabarit VP (2026-10-08, demande de Sam) ─────────────
// 1 — Produit : Type de produit (Toile à rouleau) → Tissu (par guide) → Couleur du tissu
// 2 — Dimensions
// 3 — Options, dans l'ordre de VP : Entête · Couleur de l'aluminium · Base · Coulisses · Mécanisme & Motorisation
//     · Côté contrôle · Accessoires. Le système (mécanisme) choisit la grille ; l'entête choisit le type (rouleau
//     apparent, cassette ronde, cassette semi-ouverte et son format) ou la dissimulation ajoutée au rouleau apparent.
const ALTEX_COULEURS_ALU = ['Blanc', 'Clair anodisé', 'Noir', 'Bronze foncé'];
const ALTEX_BF = 'Bronze foncé';
// Couleurs des composantes de plastique (guides 2026) ; avec l'aluminium bronze foncé, les composantes sont noires
function altexCouleursComposantes() {
  const a = state.altex;
  if (state.options.altexAlu === ALTEX_BF) return ['Noir'];
  if (/DISTRICT/.test(a.s)) return ['Blanc pur', 'Gris', 'Noir'];
  if (a.g === 'V' || (altexCoulLat() && state.options.altexCoulLat != null)) return ['Blanc', 'Gris', 'Noir'];
  return ['Blanc', 'Écru', 'Gris', 'Anthracite', 'Bronze', 'Noir'];
}
const ALTEX_COULEURS_BATONS = ['Blanc mat', 'Clair anodisé', 'Acier inoxydable', 'Noir mat'];
function altexABatons() { return /BÂTONS|TWIN PULL/.test(state.altex.s || ''); }
function altexChaines() { const a = state.altex; return (window.ALTEX.chaines || {})[a.g + '|' + a.s] || null; }
// Kits offerts selon l'application : résidentiel (gaine de sécurité obligatoire au Canada) ou commercial
function altexKitsChaine(ch) { return state.options.altexMarche === 'com' ? ch.com : ch.kits; }
// Bronze foncé offert seulement si le guide a des options « • BF » pour ce système
function altexCouleursAlu() {
  return altexOptionsSysteme().some(o => /•\s*BF\b/.test(o.l)) ? ALTEX_COULEURS_ALU : ALTEX_COULEURS_ALU.filter(c => c !== ALTEX_BF);
}

function altexOnFournisseur() {
  state.type = ''; state.modele = ''; state.options = {}; state.altex = {}; state.tissuCouleur = '';
  ['row-modele', 'row-couleur', 'row-tissu-nom', 'row-tissu-couleur', 'row-solr-tissu', 'row-norm-tissu', 'row-vtx',
   'row-altex', 'card-dim', 'card-options'].forEach(hide);
  resetResult();
  const sel = document.getElementById('sel-type');
  sel.innerHTML = '<option value="">— Sélectionner —</option><option value="altex-TR">Toile à rouleau</option>';
  sel.value = '';
  show('row-type');
  return altexCharger().catch(e => {
    const a = document.getElementById('alert-dim');
    if (a) { a.textContent = 'Impossible de charger les prix Altex (' + e.message + ')'; a.classList.add('show'); }
  });
}

// Type de produit choisi → liste des tissus, regroupés par guide (un même nom dans 2 guides = 2 produits distincts)
function altexOnType() {
  state.type = document.getElementById('sel-type').value;
  state.modele = ''; state.altex = {}; state.options = {};
  hide('row-couleur'); hide('row-tissu-nom'); hide('row-tissu-couleur'); hide('card-dim'); hide('card-options');
  resetResult();
  if (!state.type) { hide('row-modele'); return; }
  altexCharger().then(() => {
    const A = window.ALTEX, parGuide = {}, compte = {};
    A.grilles.forEach(g => { (parGuide[g.g] = parGuide[g.g] || new Set()).add(g.t); });
    Object.keys(parGuide).forEach(c => parGuide[c].forEach(t => { compte[t] = (compte[t] || 0) + 1; }));
    const sel = document.getElementById('sel-modele');
    let h = '<option value="">— Sélectionner —</option>';
    ['R', 'C', 'V', 'A'].forEach(code => {
      if (!parGuide[code]) return;
      h += '<optgroup label="' + altexEsc(A.guides[code]) + '">'
        + [...parGuide[code]].sort((a, b) => a.localeCompare(b, 'fr')).map(t =>
          '<option value="' + altexEsc(code + '|' + t) + '">' + altexEsc(t + (compte[t] > 1 ? ' — ' + A.guides[code] : '')) + '</option>').join('')
        + '</optgroup>';
    });
    sel.innerHTML = h; sel.value = '';
    show('row-modele');
  });
}

function altexGrillesTissu() {
  const a = state.altex || {};
  return (window.ALTEX ? window.ALTEX.grilles : []).filter(g => g.g === a.g && g.t === a.t);
}

// Tissu choisi → couleur du tissu, puis dimensions (on garde mesures, mécanisme et options pour comparer vite)
function altexOnModele() {
  const v = document.getElementById('sel-modele').value;
  if (!v) { hide('row-tissu-couleur'); hide('card-dim'); hide('card-options'); resetResult(); return; }
  const i = v.indexOf('|');
  const prec = state.altex || {};
  state.altex = { g: v.slice(0, i), t: v.slice(i + 1), s: prec.s, e: prec.e };
  state.modele = state.altex.t; state.tissuNom = state.altex.t;
  altexDefauts();
  const inp = document.getElementById('inp-tissu-couleur');
  if (inp) {
    inp.value = state.tissuCouleur || '';
    if (!inp._altex) { inp._altex = true; inp.addEventListener('input', () => { if (state.fournisseur === 'altex') calculatePriceAltex(); }); }
  }
  show('row-tissu-couleur');
  show('card-dim');
  state._altexOptCle = null;
  onDimChange();
}

// Mécanisme et entête valides pour ce tissu (par défaut : chaînette, rouleau apparent)
function altexDefauts() {
  const a = state.altex, G = altexGrillesTissu();
  const systemes = [...new Set(G.map(g => g.s))];
  if (!systemes.includes(a.s)) a.s = systemes.find(s => /CHAÎNETTE/.test(s)) || systemes[0] || '';
  const ent = altexEntetes().map(x => x.v);
  if (!ent.includes(a.e)) a.e = ent.includes('RA') ? 'RA' : (ent[0] || '');
  altexAppliquerEntete();
}

// Entêtes offertes pour le mécanisme choisi : types de la grille + dissimulations ajoutées au rouleau apparent
function altexEntetes() {
  const a = state.altex, G = altexGrillesTissu().filter(g => g.s === a.s);
  const out = [];
  [...new Set(G.map(g => g.ty))].forEach(ty => {
    if (ty === 'Rouleau apparent') {
      out.push({ v: 'RA', l: 'Rouleau apparent (sans entête)', ty });
      altexOptionsSysteme().filter(o => /^(Cassette|Fascia)/.test(o.l) && !/•\s*BF\b/.test(o.l))
        .forEach(o => out.push({ v: 'D:' + o.l, l: o.l, ty, diss: o }));
    } else {
      const formats = [...new Set(G.filter(g => g.ty === ty).map(g => g.f))].filter(Boolean);
      out.push({ v: 'T:' + ty, l: ty + (formats.length > 1 ? ' — format automatique' : '') + ' (incluse au prix)', ty, f: '' });
      if (formats.length > 1) formats.forEach(f => out.push({ v: 'T:' + ty + '|' + f, l: ty + ' — ' + f + ' (incluse au prix)', ty, f }));
    }
  });
  return out;
}
function altexAppliquerEntete() {
  const a = state.altex, e = altexEntetes().find(x => x.v === a.e);
  a.ty = e ? e.ty : ''; a.f = e && e.f ? e.f : '';
}

// ── Grille active + prix d'une case ─────────────────────
function altexCase(g, larg, haut) {
  const L = nextDim(g.L, larg), H = nextDim(g.H, haut);
  if (!L || !H) return null;
  const v = g.P[g.H.indexOf(H)][g.L.indexOf(L)];
  return v ? { v, L, H } : null;
}

function altexGrille(larg, haut) {
  const a = state.altex;
  const G = altexGrillesTissu().filter(g => g.s === a.s && g.ty === a.ty);
  if (!G.length) return { err: 'Aucune grille' };
  if (a.f) { const g = G.find(x => x.f === a.f); const c = g && altexCase(g, larg, haut); return c ? { g, c } : { g, err: 'n/d' }; }
  for (const g of G) { const c = altexCase(g, larg, haut); if (c) return { g, c }; }   // petite d'abord, sinon moyenne
  return { g: G[G.length - 1], err: 'n/d' };
}

function altexOptionsSysteme() {
  const a = state.altex;
  return (window.ALTEX.options[a.g + '|' + a.s] || []).filter(o =>
    (!o.tissus || new RegExp(o.tissus, 'i').test(a.t)) && (!o.sauf || !new RegExp(o.sauf, 'i').test(a.t)));
}

// Moteurs et contrôles offerts dans CE guide (Meilleure valeur : Motionblinds seulement ; Ambio : sans Somfy Zigbee)
function altexKitsGuide(liste) {
  const ok = (window.ALTEX.kitsParGuide || {})[state.altex.g];
  return ok ? liste.filter(k => ok.includes(k.v)) : liste;
}

// Coulisses latérales (paire) : prix selon la HAUTEUR, max 96" × 96"
function altexCoulLat() { const a = state.altex; return (window.ALTEX.coulLat || {})[a.g + '|' + a.s] || null; }
function altexPrixCoulLat(cl, col, larg, haut) {
  if (larg > 96 || haut > 96) return null;
  const H = nextDim(cl.H, haut); if (!H) return null;
  return cl.P[cl.H.indexOf(H)][col] || null;
}
// Choix de coulisses latérales présentés : District = SCH28 / SCH38 (la couleur suit l'aluminium) ; Absolute = pose
function altexChoixCoulLat(cl) {
  if (cl.cols.length === 4) return [{ v: 0, l: 'SCH28 (avec fascia)' }, { v: 1, l: 'SCH38 (avec cassette carrée)' }];
  return cl.cols.map((c, i) => ({ v: i, l: c }));
}
function altexColCoulLat(cl, choix) { return cl.cols.length === 4 && state.options.altexAlu === ALTEX_BF ? choix + 2 : choix; }

function altexPrixOpt(o, larg) {
  const L = nextDim(o.L, larg);
  if (!L) return null;
  return o.P[o.L.indexOf(L)] || null;
}

// Variante bronze foncé d'une option (cassette, fascia, base, coulisse du bas), sinon l'option elle-même
function altexVarianteCouleur(o) {
  if (!o || state.options.altexAlu !== ALTEX_BF) return o;
  const ops = altexOptionsSysteme();
  const bf = ops.find(x => x.l === o.l + ' • BF')
    || ops.find(x => x.l === o.l.replace(/\s*-\s*Couleurs standards$/, ' - Couleur Premium (bronze foncé)'))
    || ops.find(x => x.l === o.l + ' (bronze)');
  return bf || o;
}
const altexLab = l => l.replace(/\s*•\s*BF\b/, ' (bronze foncé)');

// ── 3 — Options, ordre VP ───────────────────────────────
function altexSection(titre, contenu) {
  return '<div><div class="section-divider">' + altexEsc(titre) + '</div><div style="padding:0 20px 12px">' + contenu + '</div></div>';
}
function altexSelect(id, opts, val, onch) {
  return '<select id="' + id + '" onchange="' + onch + '">'
    + opts.map(o => '<option value="' + altexEsc(o.v) + '"' + (String(o.v) === String(val) ? ' selected' : '') + (o.off ? ' disabled' : '') + '>' + altexEsc(o.l) + '</option>').join('')
    + '</select>';
}
function altexCase_(id, label, on, off, onch) {
  return '<div style="display:flex;align-items:center;gap:10px;margin-top:6px"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + (off ? ' disabled' : '')
    + ' style="width:14px;height:14px;accent-color:var(--gold);cursor:pointer" onchange="' + onch + '"><label for="' + id + '" style="font-size:12px;color:var(--text-mid);cursor:pointer">' + altexEsc(label) + '</label></div>';
}

function buildOptionsAltex(larg, haut) {
  const a = state.altex, opt = state.options, ops = altexOptionsSysteme();
  const fmt = v => v == null ? 'n/d' : '+' + v + ' $';
  if (!altexCouleursAlu().includes(opt.altexAlu)) opt.altexAlu = 'Blanc';
  const comps = altexCouleursComposantes();
  if (!comps.includes(opt.altexComp)) opt.altexComp = comps[0];
  if (!opt.altexCote) opt.altexCote = 'droit';
  let html = '';

  // Entête
  html += altexSection('Entête', altexSelect('altex-opt-entete', altexEntetes().map(e => {
    if (!e.diss) return { v: e.v, l: e.l };
    const p = altexPrixOpt(altexVarianteCouleur(e.diss), larg);
    return { v: e.v, l: e.l + ' — ' + fmt(p), off: p == null };
  }), a.e, 'altexSetEntete(this.value)'));

  // Couleur de l'aluminium (bronze foncé = prix Premium des cassettes, fascias, bases et coulisses)
  let alu = altexSelect('altex-opt-alu', altexCouleursAlu().map(c => ({ v: c, l: c === ALTEX_BF ? 'Bronze foncé (Premium, supplément)' : c })), opt.altexAlu,
    'state.options.altexAlu=this.value;state._altexOptCle=null;calculatePriceAltex();');
  if (opt.altexAlu === ALTEX_BF && a.e !== 'RA' && !/^D:/.test(a.e || '')) {
    const supp = ops.filter(o => /•\s*BF\b/.test(o.l) && /^(Cassette|Fascia)/.test(o.l));
    if (supp.length) alu += '<label for="altex-opt-bf" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Supplément bronze foncé</label><div>' + altexSelect('altex-opt-bf', [{ v: '', l: '— Choisir —' },
      ...supp.map(o => { const p = altexPrixOpt(o, larg); return { v: o.l, l: altexLab(o.l) + ' — ' + fmt(p), off: p == null }; })],
      opt.altexDiss || '', 'state.options.altexDiss=this.value;calculatePriceAltex();') + '</div>';
  }
  alu += '<label for="altex-opt-comp" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Couleur des composantes (plastique)</label><div>'
    + altexSelect('altex-opt-comp', comps.map(c => ({ v: c, l: c })), opt.altexComp, 'state.options.altexComp=this.value;calculatePriceAltex();') + '</div>'
    + (altexChaines() && /ABSOLUTE/.test(a.s) ? '<div style="font-size:11px;color:var(--text-dim);margin-top:5px">La chaînette de plastique prend la couleur des composantes.</div>' : '');
  if (opt.altexAlu === ALTEX_BF) alu += '<div style="font-size:11px;color:var(--text-dim);margin-top:5px">Avec l\'aluminium bronze foncé, les composantes de plastique et de métal sont noires.</div>';
  html += altexSection("Couleur de l'aluminium", alu);

  // Base
  const bases = ops.filter(o => /^Base/.test(o.l) && !/•\s*BF\b|\(bronze\)/.test(o.l));
  if (bases.length) html += altexSection('Base', altexSelect('altex-opt-base', [{ v: '', l: 'Base standard (incluse au prix)' },
    ...bases.map(o => { const p = altexPrixOpt(altexVarianteCouleur(o), larg); return { v: o.l, l: o.l + ' — ' + fmt(p), off: p == null }; })],
    opt.altexBase || '', 'state.options.altexBase=this.value;calculatePriceAltex();'));

  // Coulisses : coulisse du bas + coulisses latérales (paire)
  const coul = ops.filter(o => /^Coulisse du bas/.test(o.l) && !/Premium/.test(o.l));
  const cl = altexCoulLat();
  let cou = '';
  if (coul.length) cou += '<label for="altex-opt-coul" style="font-size:11px;color:var(--text-dim);display:block;margin-bottom:5px">Coulisse du bas</label>' + altexSelect('altex-opt-coul',
    [{ v: '', l: 'Aucune' }, ...coul.map(o => { const p = altexPrixOpt(altexVarianteCouleur(o), larg); return { v: o.l, l: o.l.replace(/^Coulisse du bas\s*-?\s*/, '').replace(/\s*-\s*Couleurs standards$/, '') + ' — ' + fmt(p), off: p == null }; })],
    opt.altexCoul || '', 'state.options.altexCoul=this.value;calculatePriceAltex();');
  if (cl) {
    cou += '<label for="altex-opt-clat" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Coulisses latérales (paire), prix selon la hauteur</label>' + altexSelect('altex-opt-clat',
      [{ v: '', l: 'Aucune' }, ...altexChoixCoulLat(cl).map(c => { const p = altexPrixCoulLat(cl, altexColCoulLat(cl, c.v), larg, haut); return { v: c.v, l: c.l + ' — ' + fmt(p), off: p == null }; })],
      opt.altexCoulLat == null ? '' : opt.altexCoulLat, "state.options.altexCoulLat=this.value===''?null:parseInt(this.value);calculatePriceAltex();")
      + '<div style="font-size:11px;color:var(--text-dim);margin-top:5px">Maximum 96" × 96". ' + (/DISTRICT/.test(a.s)
        ? 'SCH28 avec fascia, SCH38 avec cassette carrée ; bases Profil ou pochette fermée seulement.'
        : "Avec fascia d'aluminium M ou ML ; base carrée ou pochette fermée seulement.") + ' Guide p. ' + cl.p + '.</div>';
  }
  if (cou) html += altexSection('Coulisses', cou);

  // Mécanisme & Motorisation : le système choisit la grille
  const systemes = [...new Set(altexGrillesTissu().map(g => g.s))];
  let meca = altexSelect('altex-opt-meca', systemes.map(s => ({ v: s, l: altexSys(s) })), a.s, 'altexSetMecanisme(this.value)');
  const ch = altexChaines();
  if (ch) {
    if (opt.altexMarche !== 'com') opt.altexMarche = 'res';
    const kitsCh = altexKitsChaine(ch);
    if (!kitsCh.some(k => k.kit === opt.altexChaine)) opt.altexChaine = kitsCh[0].kit;
    meca += '<label for="altex-opt-marche" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Application de la chaînette</label><div>'
      + altexSelect('altex-opt-marche', [{ v: 'res', l: 'Résidentiel (gaine de sécurité obligatoire)' }, { v: 'com', l: 'Commercial' }], opt.altexMarche,
        'state.options.altexMarche=this.value;delete state.options.altexChaine;state._altexOptCle=null;calculatePriceAltex();') + '</div>';
    meca += '<label for="altex-opt-chaine" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Type de chaînette (guide p. ' + (opt.altexMarche === 'com' ? ch.pc : ch.p) + ')</label><div>'
      + altexSelect('altex-opt-chaine', kitsCh.map(k => ({ v: k.kit, l: k.t + ' [' + k.kit + '] — ' + (k.p ? (k.p > 0 ? '+' : '') + k.p + ' $' : 'incluse') })), opt.altexChaine,
        'state.options.altexChaine=this.value;calculatePriceAltex();') + '</div>';
  }
  if (altexABatons()) {
    if (!ALTEX_COULEURS_BATONS.includes(opt.altexBatons)) opt.altexBatons = ALTEX_COULEURS_BATONS[0];
    meca += '<label for="altex-opt-batons" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Couleur des bâtons</label><div>'
      + altexSelect('altex-opt-batons', ALTEX_COULEURS_BATONS.map(c => ({ v: c, l: c })), opt.altexBatons, 'state.options.altexBatons=this.value;calculatePriceAltex();') + '</div>';
  }
  if (/MOTORIS/.test(a.s)) {
    const kits = altexKitsGuide(ALTEX_KITS).map(k => { const pb = altexKitProbleme(k.v, larg); return { v: k.v, l: 'Kit ' + k.l + ' — +' + k.p + ' $' + (pb ? ' ⚠ ' + pb : ''), off: !!pb }; });
    const carte = pr => ALTEX_MOTEURS.filter(m => m.pr === pr).map(m => { const pb = altexMoteurProbleme(m, larg); const c = altexColMoteur();
      return { v: 'M:' + m.v, l: m.l + (m.p[c] ? ' — +' + m.p[c] + ' $' : '') + (pb ? ' ⚠ ' + pb : ''), off: !!pb }; });
    meca += '<label for="altex-opt-kit" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Moteur</label><div>' + altexSelectGroupes('altex-opt-kit', [
      { opts: [{ v: '', l: 'Aucun moteur' }] },
      { titre: 'Kits « motorisation simplifiée » (moteur + alimentation inclus)', opts: kits },
      { titre: 'Somfy RTS — moteur à la carte', opts: carte('RTS') },
      { titre: 'Somfy Zigbee — moteur à la carte', opts: carte('ZIG') },
      { titre: 'Motionblinds — moteur à la carte', opts: carte('MB') },
    ], opt.altexKit || '', 'state.options.altexKit=this.value;delete state.options.altexBr;state.options.altexAlims={};delete state.options.altexCtrl;state._altexOptCle=null;calculatePriceAltex();') + '</div>';
    const mot = /^M:/.test(opt.altexKit || '') ? ALTEX_MOTEURS.find(m => 'M:' + m.v === opt.altexKit) : null;
    const pr = mot ? mot.pr : opt.altexKit ? altexPrKit(opt.altexKit) : null;
    if (mot && mot.br) {
      meca += '<label for="altex-opt-br" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Branchement 120 V (prix du moteur avec ce branchement)</label><div>'
        + altexSelect('altex-opt-br', [{ v: '', l: 'Standard — fil 10 pi avec fiche Nema à plat (code ' + mot.std + ') — +' + mot.p[altexColMoteur()] + ' $' },
          ...ALTEX_BR[mot.br].map(b => ({ v: b[0], l: 'Code ' + b[0] + ' — ' + b[1] + ' — +' + b[2] + ' $' }))], opt.altexBr || '', 'state.options.altexBr=this.value;calculatePriceAltex();') + '</div>'
        + '<div style="font-size:11px;color:var(--text-dim);margin-top:5px">* Commande spéciale : délais possibles, aucun retour.</div>';
    }
    if (mot && ALTEX_ALIMS[mot.alim]) {
      opt.altexAlims = opt.altexAlims || {};
      (mot.req || []).forEach(k => { opt.altexAlims[k] = true; });
      meca += '<label style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Alimentation et accessoires du moteur</label>'
        + ALTEX_ALIMS[mot.alim].map(x => altexCase_('altex-alim-' + x[0], x[1] + ' — +' + x[2] + ' $' + ((mot.req || []).includes(x[0]) ? ' (requis)' : ''), !!opt.altexAlims[x[0]], (mot.req || []).includes(x[0]),
          "state.options.altexAlims=state.options.altexAlims||{};state.options.altexAlims['" + x[0] + "']=this.checked;calculatePriceAltex();")).join('');
    }
    if (pr) {
      meca += '<label for="altex-opt-ctrl" style="font-size:11px;color:var(--text-dim);display:block;margin:10px 0 5px">Contrôle (télécommande, interrupteur, concentrateur)</label><div>'
        + altexSelect('altex-opt-ctrl', [{ v: '', l: 'Aucun' }, ...ALTEX_CTRLS_PR[pr].map(k => ({ v: k[0], l: k[1] + ' — +' + k[2] + ' $' }))], opt.altexCtrl || '',
          'state.options.altexCtrl=this.value;calculatePriceAltex();') + '</div>';
    }
    meca += '<div style="font-size:11px;color:var(--text-dim);margin-top:5px">Prix de la toile SANS moteur : le moteur s\'ajoute. Kit = moteur + alimentation déjà comptés ; à la carte = ajouter l\'alimentation. Vérifier la compatibilité du moteur (couleur de la case dans le guide). Préciser les canaux sur le bon de commande.</div>';
  }
  html += altexSection('Mécanisme & Motorisation', meca);

  // Côté contrôle
  html += altexSection('Côté contrôle', altexSelect('altex-opt-cote', [{ v: 'droit', l: 'Contrôle droit' }, { v: 'gauche', l: 'Contrôle gauche' }], opt.altexCote,
    'state.options.altexCote=this.value;calculatePriceAltex();'));

  // Accessoires : cantonnière, recouvrement… (tout le reste du guide pour ce système)
  const estApparent = a.ty === 'Rouleau apparent';
  const acc = ops.filter(o => !/^(Cassette|Fascia|Base|Coulisse du bas)/.test(o.l) && !/•\s*BF\b/.test(o.l)
    && !(/Recouvrement/.test(o.l) && estApparent && !/District/i.test(a.s)));
  let ac = acc.map((o, i) => {
    const p = altexPrixOpt(o, larg);
    return altexCase_('altex-opt-x' + i, o.l + ' — ' + fmt(p), !!(opt.altexAutres || {})[o.l], p == null, "altexToggle(this,'" + altexEsc(o.l).replace(/'/g, "\\'") + "')");
  }).join('');
  ac += '<div style="font-size:11px;color:var(--text-dim);margin-top:8px">Toiles tandem / multimécanismes : additionner les toiles et valider la faisabilité avec Altex.</div>';
  html += altexSection('Accessoires', ac);

  document.getElementById('options-container').innerHTML = html;
}

function altexSetEntete(v) { state.altex.e = v; altexAppliquerEntete(); state._altexOptCle = null; calculatePriceAltex(); }
function altexSetMecanisme(s) {
  state.altex.s = s;
  ['altexKit', 'altexCtrl', 'altexDiss', 'altexCoulLat', 'altexBr', 'altexAlims'].forEach(k => { delete state.options[k]; });
  altexDefauts(); state._altexOptCle = null; calculatePriceAltex();
}
function altexToggle(el, l) {
  state.options.altexAutres = state.options.altexAutres || {};
  state.options.altexAutres[l] = el.checked;
  calculatePriceAltex();
}

// ── Calcul ──────────────────────────────────────────────
function calculatePriceAltex() {
  const a = state.altex || {};
  if (!window.ALTEX || !a.t || !a.s || !a.ty) { resetResult(); return; }
  const larg = (parseFloat(document.getElementById('inp-larg').value) || 0) + (parseFloat(document.getElementById('frac-larg').value) || 0);
  const haut = (parseFloat(document.getElementById('inp-haut').value) || 0) + (parseFloat(document.getElementById('frac-haut').value) || 0);
  if (!larg || !haut) { hide('card-options'); resetResult(); return; }
  const alertEl = document.getElementById('alert-dim'), noteEl = document.getElementById('note-dim');
  const r = altexGrille(larg, haut);
  const cle = [a.g, a.t, a.s, a.e, larg, haut, state.options.altexAlu, state.options.altexCoulLat, state.options.altexMarche, state.options.altexKit].join('|');
  if (!r.c) {
    const g = r.g;
    alertEl.textContent = g ? `⚠ Non offert à ${larg}" × ${haut}" pour ce tissu / mécanisme / entête (grille : ${g.L[0]}"–${g.L[g.L.length - 1]}" × ${g.H[0]}"–${g.H[g.H.length - 1]}"; « - » = non disponible). Guide p. ${g.p}.`
      : '⚠ Aucune grille pour ce choix';
    alertEl.classList.add('show'); noteEl.classList.remove('show');
    show('card-options'); if (state._altexOptCle !== cle) { buildOptionsAltex(larg, haut); state._altexOptCle = cle; }
    resetResult(); state.lastResult = null; return;
  }
  alertEl.classList.remove('show');
  const { g, c } = r;
  state.largTip = c.L; state.hautTip = c.H;
  const badge = document.getElementById('badge-dim'); if (badge) badge.textContent = `${c.L}" × ${c.H}"`;
  noteEl.textContent = `ℹ Grille utilisée : ${c.L}" × ${c.H}"${g.f ? ' · ' + g.f : ''} · guide p. ${g.p}`;
  noteEl.classList.add('show');
  show('card-options');
  if (state._altexOptCle !== cle) { buildOptionsAltex(larg, haut); state._altexOptCle = cle; }

  const opt = state.options, ops = altexOptionsSysteme();
  const parNom = l => ops.find(o => o.l === l);
  const breakdown = [{ label: `${a.t} ${c.L}"×${c.H}"${g.f ? ' (' + g.f.toLowerCase() + ')' : ''}`, pdsf: c.v }];
  let pdsf = c.v;
  const ajout = (label, p) => { pdsf += p; breakdown.push({ label, pdsf: p }); };
  const nonOffertes = [];
  const ent = altexEntetes().find(x => x.v === a.e);
  const spec = { entete: ent ? ent.l.replace(/\s*\(incluse au prix\)/, '') : '' };

  // Entête : dissimulation ajoutée au rouleau apparent (couleur selon l'aluminium)
  if (ent && ent.diss) {
    const o = altexVarianteCouleur(ent.diss), p = altexPrixOpt(o, larg);
    if (p) ajout(altexLab(o.l), p); else nonOffertes.push(altexLab(o.l));
  }
  // Aluminium bronze foncé sur une cassette incluse : supplément choisi
  if (opt.altexAlu === ALTEX_BF && ent && !ent.diss && ent.v !== 'RA' && opt.altexDiss) {
    const o = parNom(opt.altexDiss), p = o && altexPrixOpt(o, larg);
    if (p) ajout(altexLab(o.l), p); else nonOffertes.push(altexLab(opt.altexDiss));
  }
  // Base, coulisse du bas
  [['altexBase', 'base'], ['altexCoul', 'coul']].forEach(([k, s]) => {
    if (!opt[k]) return;
    const o = altexVarianteCouleur(parNom(opt[k]));
    if (!o) { nonOffertes.push(opt[k]); return; }
    const p = altexPrixOpt(o, larg);
    if (p) { ajout(altexLab(o.l), p); spec[s] = altexLab(o.l); } else nonOffertes.push(altexLab(o.l));
  });
  // Coulisses latérales (paire)
  const clat = altexCoulLat();
  if (clat && opt.altexCoulLat != null) {
    const col = altexColCoulLat(clat, opt.altexCoulLat), p = altexPrixCoulLat(clat, col, larg, haut);
    const t = 'Coulisses latérales (paire) ' + clat.cols[col];
    if (p) { ajout(t, p); spec.clat = t; } else nonOffertes.push(t + ' (max 96" × 96")');
  }
  // Type de chaînette (ajustement $/mécanisme du guide)
  const chs = altexChaines(), kitCh = chs && altexKitsChaine(chs).find(k => k.kit === opt.altexChaine);
  if (kitCh) {
    const t = 'Chaînette ' + (opt.altexMarche === 'com' ? 'commerciale ' : '') + kitCh.t + ' [' + kitCh.kit + ']';
    if (kitCh.p) ajout(t, kitCh.p);
    spec.chaine = (opt.altexMarche === 'com' ? 'commercial, ' : '') + kitCh.t + ' [' + kitCh.kit + ']';
  }
  // Moteur + contrôle (même multiplicateur que la toile)
  if (/MOTORIS/.test(a.s) && opt.altexKit) {
    const kit = ALTEX_KITS.find(k => k.v === opt.altexKit);
    const mot = /^M:/.test(opt.altexKit) ? ALTEX_MOTEURS.find(m => 'M:' + m.v === opt.altexKit) : null;
    let pr = null;
    if (kit && altexKitProbleme(kit.v, larg)) { alertEl.textContent = '⚠ Kit ' + kit.l + ' : ' + altexKitProbleme(kit.v, larg) + ' — choisir un autre moteur.'; alertEl.classList.add('show'); resetResult(); state.lastResult = null; return; }
    if (kit) { ajout('Kit moteur ' + kit.l + ' [' + kit.v + ']', kit.p); spec.kit = 'Kit ' + kit.l + ' [' + kit.v + ']'; pr = altexPrKit(kit.v); }
    else if (mot) {
      const pb = altexMoteurProbleme(mot, larg);
      if (pb) { alertEl.textContent = '⚠ ' + mot.l + ' : ' + pb + ' — choisir un autre moteur.'; alertEl.classList.add('show'); resetResult(); state.lastResult = null; return; }
      const br = mot.br && opt.altexBr ? ALTEX_BR[mot.br].find(b => b[0] === opt.altexBr) : null;
      ajout(mot.l + (br ? ' — branchement code ' + br[0] : mot.std ? ' — branchement standard (code ' + mot.std + ')' : ''), br ? br[2] : mot.p[altexColMoteur()]);
      spec.kit = mot.l + (br ? ' — branchement code ' + br[0] + ' (' + br[1].replace(' *', '') + ')' : '');
      pr = mot.pr;
      (ALTEX_ALIMS[mot.alim] || []).forEach(x => { if ((opt.altexAlims || {})[x[0]] || (mot.req || []).includes(x[0])) { ajout(x[1].replace(/ \(.*\)$/, ''), x[2]); (spec.alims = spec.alims || []).push(x[1].replace(/ \(.*\)$/, '')); } });
    }
    const ctrl = pr && (ALTEX_CTRLS_PR[pr] || []).find(k => k[0] === opt.altexCtrl);
    if (ctrl) { ajout(ctrl[1] + ' [' + ctrl[0] + ']', ctrl[2]); spec.ctrl = ctrl[1]; }
  }
  // Accessoires
  const acc = [];
  Object.keys(opt.altexAutres || {}).forEach(l => {
    const o = opt.altexAutres[l] && parNom(l);
    if (!o) return;
    const p = altexPrixOpt(o, larg);
    if (p) { ajout(altexLab(o.l), p); acc.push(altexLab(o.l)); } else nonOffertes.push(altexLab(o.l));
  });
  if (nonOffertes.length) {
    alertEl.textContent = '⚠ Option non offerte à ' + larg + '" × ' + haut + '" : ' + nonOffertes.join(', ') + ' — retire-la ou change les mesures.';
    alertEl.classList.add('show'); resetResult(); state.lastResult = null; return;
  }

  // Prix : PDSF du guide → coût (facteur confidentiel reçu d'Odoo) → vente (multiplicateur des Paramètres)
  const pdsfTotal = Math.round(pdsf * 100) / 100;
  const f = window.LBAS_ALTEX_FACTEUR;
  const multi = (settings.altex && settings.altex.multi) || 2.0;
  const cout = f ? Math.round(pdsfTotal * f * 100) / 100 : 0;
  const vente = f ? Math.round(cout * multi * 100) / 100 : 0;
  const marge = vente > 0 ? Math.round((vente - cout) / vente * 1000) / 10 : 0;
  const gamme = window.ALTEX.guides[a.g];

  // Résumé / description du devis : même ordre que VP
  const resume = [
    'Type de produit : Toile à rouleau',
    'Modèle : ' + a.t + ' (Altex ' + gamme + ')',
    'Couleur : ' + (state.tissuCouleur || ''),
    'Entête : ' + spec.entete,
    "Couleur d'aluminium : " + opt.altexAlu,
    'Couleur des composantes : ' + (opt.altexComp || ''),
    spec.base ? 'Base : ' + spec.base : 'Base : standard',
    spec.coul ? 'Coulisse du bas : ' + spec.coul : '',
    spec.clat ? spec.clat : '',
    'Mécanisme : ' + altexSys(a.s),
    spec.chaine ? 'Chaînette : ' + spec.chaine : '',
    altexABatons() ? 'Couleur des bâtons : ' + (opt.altexBatons || '') : '',
    spec.kit ? 'Moteur : ' + spec.kit : '',
    spec.alims ? 'Alimentation : ' + spec.alims.join(', ') : '',
    spec.ctrl ? 'Contrôle : ' + spec.ctrl : '',
    'Côté contrôle : ' + (opt.altexCote === 'gauche' ? 'Contrôle gauche' : 'Contrôle droit'),
    acc.length ? 'Accessoires : ' + acc.join(', ') : '',
  ].filter(x => x && !/:\s*$/.test(x));
  state.altexResume = resume;
  state.pdsf = pdsfTotal;

  renderResult({ pdsfStore: pdsfTotal, pdsfSomfy: 0, pdsfTotal, cout, vente, venteStore: vente, venteSomfy: 0, marge, breakdown }, {
    cfg: { multi, pct: '' },
    fournisseur: 'Altex · Toile à rouleau · ' + gamme,
    produit: a.t,
    detail: `${c.L}" × ${c.H}"${state.tissuCouleur ? '<br>' + altexEsc(state.tissuCouleur) : ''}`,
    pctLabel: 'Ton coût (calculé par Odoo)',
    titre: 'Détail PDSF — guide Altex 2026 p. ' + g.p,
  });
  state.lastResult.desc = resume.join(' | ');
  state.lastResult.pdsf = pdsfTotal;
  if (!f) {
    state.lastResult = null;
    document.getElementById('result-body').insertAdjacentHTML('beforeend',
      '<div class="alert warn show" style="margin-top:10px">Coût et prix vendant : ouvre le Price Board depuis Odoo (le coût Altex est confidentiel et calculé par Odoo).</div>');
  }
}

function fmtPoAltex(v) {
  v = parseFloat(v) || 0;
  let w = Math.floor(v + 0.0001), fr = Math.round((v - w) * 8) / 8;
  if (fr >= 1) { w += 1; fr = 0; }
  const m = { 0.125: '1/8', 0.25: '1/4', 0.375: '3/8', 0.5: '1/2', 0.625: '5/8', 0.75: '3/4', 0.875: '7/8' };
  return m[fr] ? `${w} ${m[fr]}"` : `${w}"`;
}

// ── Rouvrir une ligne du devis (✎ Modifier) ────────────
window.altexRestore = function (saved, ctrls) {
  altexCharger().then(() => {
    const a = saved.altex || {};
    if (!a.g || !a.t) return;
    const sel = document.getElementById('sel-type');
    sel.value = 'altex-TR';
    altexOnType();
    setTimeout(() => {
      state.options = JSON.parse(JSON.stringify(saved.options || {}));
      state.tissuCouleur = saved.tissuCouleur || '';
      ['inp-larg', 'inp-haut', 'frac-larg', 'frac-haut'].forEach(id => { const el = document.getElementById(id); if (el && ctrls[id]) el.value = ctrls[id].v; });
      // anciennes lignes (avant le gabarit VP) : type + dissimulation → entête
      if (!a.e) {
        a.e = a.ty === 'Rouleau apparent' ? (state.options.altexDiss ? 'D:' + state.options.altexDiss : 'RA') : 'T:' + a.ty + (a.f ? '|' + a.f : '');
        if (a.ty === 'Rouleau apparent') delete state.options.altexDiss;
      }
      state.altex = { g: a.g, t: a.t, s: a.s, e: a.e };
      const m = document.getElementById('sel-modele'); m.value = a.g + '|' + a.t;
      altexOnModele();
    }, 0);
  });
};

function altexListe() {}   // ancienne recherche par tissu (remplacée par le gabarit VP)

// ── Facteur de coût : reçu d'Odoo uniquement ────────────
window.addEventListener('message', function (ev) {
  const d = ev.data || {};
  if (ev.origin !== ALTEX_ODOO_ORIGIN || d.source !== 'lbas-odoo' || d.type !== 'lbas_facteurs') return;
  const f = parseFloat(d.altex);
  window.LBAS_ALTEX_FACTEUR = (f > 0 && f < 1) ? f : null;
  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin) navAdmin.style.display = (d.admin === true) ? '' : 'none';
  if (state.fournisseur === 'altex' && state.lastResult) calculatePriceAltex();
  if (typeof updateAdminMarge === 'function') try { updateAdminMarge(); } catch (e) {}
});
try { if (window.parent && window.parent !== window) window.parent.postMessage({ source: 'lbas-priceboard', type: 'lbas_hello' }, ALTEX_ODOO_ORIGIN); } catch (e) {}
