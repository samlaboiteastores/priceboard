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

// ── Choix du fournisseur ────────────────────────────────
function altexOnFournisseur() {
  state.type = 'altex'; state.modele = ''; state.options = {};
  state.altex = {};
  ['row-type', 'row-modele', 'row-couleur', 'row-tissu-nom', 'row-tissu-couleur', 'row-solr-tissu',
   'row-norm-tissu', 'row-vtx', 'card-dim', 'card-options'].forEach(hide);
  resetResult();
  show('row-altex', true);
  const s = document.getElementById('altex-search'); if (s) s.value = '';
  const b = document.getElementById('altex-selected'); if (b) b.style.display = 'none';
  const c = document.getElementById('altex-choix'); if (c) c.innerHTML = '';
  const list = document.getElementById('altex-list');
  if (list) list.innerHTML = '<div style="padding:16px;font-size:12px;color:var(--text-dim);text-align:center;">Chargement des guides Altex 2026…</div>';
  return altexCharger().then(() => altexListe('')).catch(e => {
    if (list) list.innerHTML = '<div style="padding:16px;font-size:12px;color:var(--red);text-align:center;">Impossible de charger les prix Altex (' + altexEsc(e.message) + ')</div>';
  });
}

// ── Liste des tissus (sections = gammes) ────────────────
function altexListe(filtre) {
  const A = window.ALTEX; const list = document.getElementById('altex-list');
  if (!A || !list) return;
  filtre = (filtre || '').toLowerCase().trim();
  const clr = document.getElementById('altex-clear'); if (clr) clr.style.display = filtre ? 'block' : 'none';
  const parGuide = {};
  A.grilles.forEach(g => { (parGuide[g.g] = parGuide[g.g] || new Set()).add(g.t); });
  list.innerHTML = '';
  let n = 0;
  ['R', 'C', 'V', 'A'].forEach(code => {
    const gamme = A.guides[code];
    const tissus = [...(parGuide[code] || [])].sort((a, b) => a.localeCompare(b, 'fr'))
      .filter(t => !filtre || (t + ' ' + gamme).toLowerCase().includes(filtre));
    if (!tissus.length) return;
    const h = document.createElement('div');
    h.style.cssText = 'position:sticky;top:0;z-index:2;padding:7px 14px 5px;font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--gold);background:var(--surface);border-bottom:1px solid var(--border);text-transform:uppercase;';
    h.textContent = 'Altex · ' + gamme;
    list.appendChild(h);
    tissus.forEach(t => {
      n++;
      const sel = state.altex && state.altex.t === t && state.altex.g === code;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 14px 8px 22px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.03);background:' + (sel ? 'rgba(26,183,183,0.12)' : 'transparent') + ';';
      row.onmouseover = () => { if (!sel) row.style.background = 'rgba(255,255,255,.06)'; };
      row.onmouseout = () => { if (!sel) row.style.background = 'transparent'; };
      row.innerHTML = '<span style="font-size:12px;font-family:DM Mono,monospace;color:' + (sel ? 'var(--gold)' : 'var(--text)') + ';">' + altexEsc(t) + '</span>'
        + (sel ? '<span style="color:var(--gold);font-size:13px;">✓</span>' : '');
      row.onclick = () => { altexChoisirTissu(code, t); altexListe(document.getElementById('altex-search').value || ''); };
      list.appendChild(row);
    });
  });
  if (!n) list.innerHTML = '<div style="padding:20px;font-size:12px;color:var(--text-dim);text-align:center;">Aucun tissu trouvé pour « ' + altexEsc(filtre) + ' »</div>';
}

function altexGrillesTissu() {
  const a = state.altex || {};
  return (window.ALTEX ? window.ALTEX.grilles : []).filter(g => g.g === a.g && g.t === a.t);
}

// ── Tissu choisi → sélecteurs système / type / format ───
function altexChoisirTissu(code, tissu, garder) {
  // on GARDE système / type / options du tissu précédent pour comparer vite (validés dans altexChoix)
  const prec = state.altex || {};
  state.altex = Object.assign({ g: code, t: tissu }, garder || { s: prec.s, ty: prec.ty, f: prec.f });
  state.modele = tissu; state.type = 'altex'; state.tissuNom = tissu;
  const b = document.getElementById('altex-selected');
  if (b) {
    b.innerHTML = '<div style="font-size:10px;opacity:.6;margin-bottom:3px;">Altex · ' + altexEsc(window.ALTEX.guides[code]) + '</div><div>' + altexEsc(tissu) + '</div>';
    b.style.display = 'block';
  }
  altexChoix();
}

function altexSelectHtml(id, label, opts, val, onch) {
  return '<div style="padding:8px 20px 4px;"><label style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin-bottom:7px;">' + label + '</label>'
    + '<select id="' + id + '" onchange="' + onch + '" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:9px 12px;outline:none;">'
    + opts.map(o => '<option value="' + altexEsc(o.v) + '"' + (o.v === val ? ' selected' : '') + '>' + altexEsc(o.l) + '</option>').join('')
    + '</select></div>';
}

function altexChoix() {
  const a = state.altex; const G = altexGrillesTissu();
  const systemes = [...new Set(G.map(g => g.s))];
  if (!systemes.includes(a.s)) a.s = systemes.length === 1 ? systemes[0] : '';
  const G2 = G.filter(g => g.s === a.s);
  const types = [...new Set(G2.map(g => g.ty))];
  if (!types.includes(a.ty)) a.ty = types.length === 1 ? types[0] : '';
  const formats = [...new Set(G2.filter(g => g.ty === a.ty).map(g => g.f))].filter(Boolean);
  if (formats.length < 2) a.f = ''; else if (!['', ...formats].includes(a.f)) a.f = '';
  let html = altexSelectHtml('altex-sys', 'Système · manœuvre', [{ v: '', l: '— Choisir —' }, ...systemes.map(s => ({ v: s, l: altexSys(s) }))], a.s, 'altexSetChoix(\'s\',this.value)');
  if (a.s) html += altexSelectHtml('altex-type', 'Type', [{ v: '', l: '— Choisir —' }, ...types.map(t => ({ v: t, l: t }))], a.ty, 'altexSetChoix(\'ty\',this.value)');
  if (a.s && a.ty && formats.length > 1)
    html += altexSelectHtml('altex-format', 'Format de cassette', [{ v: '', l: 'Automatique (petite si possible)' }, ...formats.map(f => ({ v: f, l: f }))], a.f, 'altexSetChoix(\'f\',this.value)');
  html += '<div style="padding:4px 20px 0;">' + altexCouleurHtml() + '</div>';
  document.getElementById('altex-choix').innerHTML = html;
  if (a.s && a.ty) { show('card-dim'); onDimChange(); }
  else { hide('card-dim'); hide('card-options'); resetResult(); }
}

function altexCouleurHtml() {
  return '<label style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin:6px 0 7px;">Couleur du tissu</label>'
    + '<input type="text" id="altex-couleur" value="' + altexEsc(state.tissuCouleur || '') + '" placeholder="ex. Blanc, Charbon…" oninput="state.tissuCouleur=this.value.trim();if(state.lastResult)calculatePriceAltex();" '
    + 'style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:9px 12px;outline:none;box-sizing:border-box;">';
}

function altexSetChoix(k, v) {
  state.altex[k] = v;
  if (k === 's') { state.altex.ty = ''; state.altex.f = ''; state.options = {}; }
  if (k === 'ty') { state.altex.f = ''; }
  altexChoix();
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
  return (window.ALTEX.options[a.g + '|' + a.s] || []);
}

function altexPrixOpt(o, larg) {
  const L = nextDim(o.L, larg);
  if (!L) return null;
  return o.P[o.L.indexOf(L)] || null;
}

// ── Options (étape 3) ───────────────────────────────────
function buildOptionsAltex(larg) {
  const a = state.altex, opt = state.options;
  const ops = altexOptionsSysteme();
  const estApparent = a.ty === 'Rouleau apparent';
  const fmt = v => v == null ? 'n/d' : '+' + v + ' $';
  const lab = o => o.l.replace(/\s*•\s*BF\b/, ' (bronze foncé)');
  const diss = ops.filter(o => /^(Cassette|Fascia)/.test(o.l) && (estApparent || /•\s*BF/.test(o.l)));
  const bases = ops.filter(o => /^Base/.test(o.l));
  const coul = ops.filter(o => /^Coulisse du bas/.test(o.l));
  const autres = ops.filter(o => !diss.includes(o) && !bases.includes(o) && !coul.includes(o) && !/^(Cassette|Fascia)/.test(o.l)
    && !(/Recouvrement/.test(o.l) && estApparent && !/District/i.test(a.s)));
  const selRow = (id, titre, lst, vide, key) => lst.length ? altexSelectHtml(id, titre,
    [{ v: '', l: vide }, ...lst.map(o => { const p = altexPrixOpt(o, larg); return { v: o.l, l: lab(o) + ' — ' + fmt(p) }; })],
    opt[key] || '', 'state.options.' + key + '=this.value;calculatePriceAltex();') : '';
  let html = '';
  html += selRow('altex-opt-diss', estApparent ? 'Dissimulation (cassette / fascia)' : 'Supplément aluminium', diss, estApparent ? 'Aucune — rouleau apparent' : 'Aucun (couleur standard)', 'altexDiss');
  html += selRow('altex-opt-base', 'Base', bases, 'Base standard (incluse)', 'altexBase');
  html += selRow('altex-opt-coul', 'Coulisse du bas', coul, 'Aucune', 'altexCoul');
  autres.forEach((o, i) => {
    const p = altexPrixOpt(o, larg); const id = 'altex-opt-x' + i; const on = !!(opt.altexAutres || {})[o.l];
    html += '<div style="padding:6px 20px;"><label style="display:flex;gap:8px;align-items:center;font-size:12px;cursor:pointer;">'
      + '<input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + (p == null ? ' disabled' : '')
      + ' data-l="' + altexEsc(o.l) + '" onchange="altexToggle(this)">'
      + altexEsc(lab(o)) + ' <span style="color:var(--text-dim)">' + fmt(p) + '</span></label></div>';
  });
  if (/MOTORIS/.test(a.s)) {
    html += altexSelectHtml('altex-opt-kit', 'Motorisation (kit)', [{ v: '', l: 'Aucun moteur' }, ...ALTEX_KITS.map(k => ({ v: k.v, l: k.l + ' — +' + k.p + ' $' }))],
      opt.altexKit || '', 'state.options.altexKit=this.value;calculatePriceAltex();');
    html += altexSelectHtml('altex-opt-ctrl', 'Contrôle', [{ v: '', l: 'Aucun' }, ...ALTEX_CTRLS.map(k => ({ v: k.v, l: k.l + ' — +' + k.p + ' $' }))],
      opt.altexCtrl || '', 'state.options.altexCtrl=this.value;calculatePriceAltex();');
    html += '<div style="padding:4px 20px 10px;font-size:11px;color:var(--text-dim);">Prix de la toile SANS moteur : le kit s\'ajoute. Vérifier la compatibilité du moteur (couleur de la case dans le guide).</div>';
  }
  html += '<div style="padding:4px 20px 12px;"><label style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin-bottom:7px;">Quantité de toiles identiques</label>'
    + '<input type="number" id="altex-qte" min="1" step="1" value="' + (opt.altexQte || 1) + '" oninput="state.options.altexQte=Math.max(1,parseInt(this.value)||1);calculatePriceAltex();" '
    + 'style="width:90px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:8px 10px;"></div>';
  document.getElementById('options-container').innerHTML = html;
}

function altexToggle(el) {
  state.options.altexAutres = state.options.altexAutres || {};
  state.options.altexAutres[el.getAttribute('data-l')] = el.checked;
  calculatePriceAltex();
}

// ── Calcul ──────────────────────────────────────────────
function calculatePriceAltex() {
  const a = state.altex || {};
  if (!window.ALTEX || !a.t || !a.s || !a.ty) { resetResult(); return; }
  const larg = (parseFloat(document.getElementById('inp-larg').value) || 0) + (parseFloat(document.getElementById('frac-larg').value) || 0);
  const haut = (parseFloat(document.getElementById('inp-haut').value) || 0) + (parseFloat(document.getElementById('frac-haut').value) || 0);
  if (!larg || !haut) { resetResult(); return; }
  const alertEl = document.getElementById('alert-dim'), noteEl = document.getElementById('note-dim');
  const r = altexGrille(larg, haut);
  if (!r.c) {
    const g = r.g;
    alertEl.textContent = g ? `⚠ Non offert à ${larg}" × ${haut}" pour ce tissu / type (grille : ${g.L[0]}"–${g.L[g.L.length - 1]}" × ${g.H[0]}"–${g.H[g.H.length - 1]}"; « - » = non disponible). Guide p. ${g.p}.`
      : '⚠ Aucune grille pour ce choix';
    alertEl.classList.add('show'); noteEl.classList.remove('show');
    hide('card-options'); resetResult(); state.lastResult = null; return;
  }
  alertEl.classList.remove('show');
  const { g, c } = r;
  state.largTip = c.L; state.hautTip = c.H;
  noteEl.textContent = `ℹ Grille utilisée : ${c.L}" × ${c.H}"${g.f ? ' · ' + g.f : ''} · guide p. ${g.p}`;
  noteEl.classList.add('show');

  show('card-options');
  if (!document.getElementById('altex-qte') || state._altexOptCle !== [a.g, a.s, a.ty, c.L].join('|')) {
    buildOptionsAltex(larg); state._altexOptCle = [a.g, a.s, a.ty, c.L].join('|');
  }

  const opt = state.options, ops = altexOptionsSysteme();
  const lignes = [{ label: `${a.t} ${c.L}"×${c.H}"${g.f ? ' (' + g.f.toLowerCase() + ')' : ''}`, pdsf: c.v }];
  const specs = [];
  let pdsf = c.v;
  const ajout = (label, p) => { if (p > 0) { pdsf += p; lignes.push({ label, pdsf: p }); } };
  const lab = l => l.replace(/\s*•\s*BF\b/, ' (bronze foncé)');
  const parNom = l => ops.find(o => o.l === l);
  [['altexDiss', a.ty === 'Rouleau apparent' ? 'Dissimulation' : 'Aluminium'], ['altexBase', 'Base'], ['altexCoul', 'Coulisse du bas']].forEach(([k, t]) => {
    const o = opt[k] && parNom(opt[k]);
    if (o) { const p = altexPrixOpt(o, larg); if (p) { ajout(lab(o.l), p); specs.push(t + ' : ' + lab(o.l)); } }
  });
  Object.keys(opt.altexAutres || {}).forEach(l => {
    const o = opt.altexAutres[l] && parNom(l);
    if (o) { const p = altexPrixOpt(o, larg); if (p) { ajout(lab(o.l), p); specs.push(lab(o.l)); } }
  });
  const kit = ALTEX_KITS.find(k => k.v === opt.altexKit);
  if (kit) { ajout('Moteur ' + kit.l + ' [' + kit.v + ']', kit.p); specs.push('Moteur : ' + kit.l); }
  const ctrl = ALTEX_CTRLS.find(k => k.v === opt.altexCtrl);
  if (ctrl) { ajout(ctrl.l + ' [' + ctrl.v + ']', ctrl.p); specs.push('Contrôle : ' + ctrl.l); }

  const qte = Math.max(1, parseInt(opt.altexQte) || 1);
  const pdsfUnit = pdsf;
  const pdsfTotal = Math.round(pdsfUnit * qte * 100) / 100;
  const f = window.LBAS_ALTEX_FACTEUR;
  const multi = (settings.altex && settings.altex.multi) || 2.0;
  const cout = f ? Math.round(pdsfTotal * f * 100) / 100 : 0;
  const vente = f ? Math.round(cout * multi * 100) / 100 : 0;
  const marge = vente > 0 ? Math.round((vente - cout) / vente * 1000) / 10 : 0;

  const gamme = window.ALTEX.guides[a.g];
  const dimTxt = `${fmtPoAltex(larg)} × ${fmtPoAltex(haut)}`;
  const resume = [
    'Fournisseur : Altex (' + gamme + ')',
    'Produit : Toile à rouleau ' + altexSys(a.s),
    'Tissu : ' + a.t + (state.tissuCouleur ? ' — ' + state.tissuCouleur : ''),
    'Type : ' + a.ty + (g.f ? ' — ' + g.f : ''),
    'Dimensions : ' + dimTxt,
    ...specs,
  ];
  if (qte > 1) resume.push('Quantité : ' + qte);
  state.altexResume = resume;
  const desc = resume.slice(1).join(' | ');
  state.lastResult = { pdsfTotal, pdsf: pdsfTotal, cout, vente, marge, desc: 'Altex ' + gamme + ' | ' + desc };
  state.pdsf = pdsfTotal;

  const fmtCAD = v => '$ ' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const bd = lignes.map(b => `<div class="breakdown-item"><span>${altexEsc(b.label)}</span><span>${fmtCAD(b.pdsf)}</span></div>`).join('')
    + (qte > 1 ? `<div class="breakdown-item"><span>× ${qte} toiles</span><span>${fmtCAD(pdsfTotal)}</span></div>` : '');
  const prix = f ? `
      <div class="price-row"><span class="price-label">Ton coût (calculé par Odoo)</span><span class="price-value cout">${fmtCAD(cout)}</span></div>
      <div class="price-row" style="border-color:var(--gold-dim);background:rgba(26,183,183,0.12)">
        <span class="price-label" style="color:var(--gold);font-weight:500">PRIX VENDANT</span><span class="price-value vente">${fmtCAD(vente)}</span></div>
    </div>
    <div class="margin-bar-wrap"><div class="margin-label"><span>Marge brute</span><span style="color:var(--green)">${marge}%</span></div>
      <div class="margin-bar"><div class="margin-fill" style="width:${Math.min(marge, 100)}%"></div></div></div>`
    : `</div><div class="alert warn show" style="margin-top:10px">Coût et prix vendant : ouvre le Price Board depuis Odoo (le coût Altex est confidentiel et calculé par Odoo).</div>`;
  document.getElementById('result-body').innerHTML = `
    <div class="result-fournisseur">Altex · ${altexEsc(gamme)}</div>
    <div class="result-produit">${altexEsc(a.t)}</div>
    <div class="result-detail">${altexEsc(altexSys(a.s))} · ${altexEsc(a.ty)}${g.f ? ' · ' + altexEsc(g.f) : ''}<br>${c.L}" × ${c.H}"${state.tissuCouleur ? ' · ' + altexEsc(state.tissuCouleur) : ''}${qte > 1 ? ' · ' + qte + ' toiles' : ''}</div>
    <div class="result-prices">
      <div class="price-row"><span class="price-label">PDSF total</span><span class="price-value pdsf">${fmtCAD(pdsfTotal)}</span></div>
      ${prix}
    <div class="breakdown"><div class="breakdown-title">Détail PDSF — guide Altex 2026 p. ${g.p}</div>${bd}
      <div class="breakdown-item" style="color:var(--text);font-weight:500;margin-top:4px"><span>Total PDSF</span><span>${fmtCAD(pdsfTotal)}</span></div></div>`;
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
    state.options = JSON.parse(JSON.stringify(saved.options || {}));
    state.tissuCouleur = saved.tissuCouleur || '';
    ['inp-larg', 'inp-haut', 'frac-larg', 'frac-haut'].forEach(id => { const el = document.getElementById(id); if (el && ctrls[id]) el.value = ctrls[id].v; });
    state._altexOptCle = null;
    altexChoisirTissu(a.g, a.t, { s: a.s, ty: a.ty, f: a.f });
    altexListe('');
  });
};

// ── Facteur de coût : reçu d'Odoo uniquement ────────────
window.addEventListener('message', function (ev) {
  const d = ev.data || {};
  if (ev.origin !== ALTEX_ODOO_ORIGIN || d.source !== 'lbas-odoo' || d.type !== 'lbas_facteurs') return;
  const f = parseFloat(d.altex);
  window.LBAS_ALTEX_FACTEUR = (f > 0 && f < 1) ? f : null;
  if (state.fournisseur === 'altex' && state.lastResult) calculatePriceAltex();
});
try { if (window.parent && window.parent !== window) window.parent.postMessage({ source: 'lbas-priceboard', type: 'lbas_hello' }, ALTEX_ODOO_ORIGIN); } catch (e) {}
