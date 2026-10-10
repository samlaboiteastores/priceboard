// ══════════════════════════════════════════════════════
// SIGNATURE TEXTILES — Rideaux confectionnés, liste de prix (PDSF) 2022
// Voiles : prix selon la LARGEUR finie plissée, tant que la hauteur ne dépasse pas le maximum indiqué.
// Tissus opaques : grille LARGEUR × HAUTEUR. Coût = 50 % du PDSF (réglage Draperie/Signature).
// Rails et composantes (rail ADS de la liste ou autre rail Signature + accessoires) : offerts pour tous les tissus.
// Données : sig_grilles_data.js (SIG_GRILLES).
// ══════════════════════════════════════════════════════
const SIG_STYLES = {
  RF100: 'Plis ondulés (Ripple Fold) — ampleur 100 %',
  RF120: 'Plis ondulés (Ripple Fold) — ampleur 120 %',
  W200: 'Wave ou plis français — ampleur 200 % (2 pour 1)',
  W250: 'Wave ou plis français — ampleur 250 % (2½ pour 1)',
  W300: 'Wave ou plis français — ampleur 300 % (3 pour 1)',
};
const SIG_DOUBLURES = [
  { v: '', l: 'Aucune doublure', pct: 0 },
  { v: 'opaque', l: 'Doublure opaque / blackout (+30 %)', pct: 30 },
  { v: 'polycoton', l: 'Doublure poly-coton (+25 %)', pct: 25 },
];
const SIG_DIVISIONS = [
  { v: 'demi', l: 'Demi-paire (1 panneau)' },
  { v: 'paire-c', l: '1 paire centrée (2 panneaux identiques)' },
  { v: 'paire-dc', l: '1 paire décentrée (panneaux non identiques)' },
];

function sigEsc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function sigRailsAutres() { return Object.keys(NORM_RAILS).filter(k => /^SIG_/.test(k) && !/^SIG_K_/.test(k)); }

// ── Démarrage du mode ───────────────────────────────────
function sigGrilleStart() {
  state.sig = state.sig || {};
  ['row-norm-tissu', 'card-dim', 'card-options'].forEach(hide);
  show('row-sig', true);
  const s = document.getElementById('sig-search'); if (s) s.value = '';
  sigListe('');
  sigChoix();
}

function sigListe(filtre) {
  const list = document.getElementById('sig-list'); if (!list) return;
  filtre = (filtre || '').toLowerCase().trim();
  const clr = document.getElementById('sig-clear'); if (clr) clr.style.display = filtre ? 'block' : 'none';
  const groupes = {};
  Object.keys(SIG_GRILLES).sort((a, b) => a.localeCompare(b, 'fr')).forEach(n => {
    const p = SIG_GRILLES[n];
    if (filtre && !(n + ' ' + p.section).toLowerCase().includes(filtre)) return;
    (groupes[p.section] = groupes[p.section] || []).push(n);
  });
  list.innerHTML = '';
  const ordre = Object.keys(groupes).sort((a, b) => (a === 'Tissus opaques') - (b === 'Tissus opaques') || a.localeCompare(b, 'fr'));
  if (!ordre.length) { list.innerHTML = '<div style="padding:20px;font-size:12px;color:var(--text-dim);text-align:center;">Aucun tissu trouvé</div>'; return; }
  ordre.forEach(sec => {
    const h = document.createElement('div');
    h.style.cssText = 'position:sticky;top:0;z-index:2;padding:7px 14px 5px;font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--gold);background:var(--surface);border-bottom:1px solid var(--border);text-transform:uppercase;';
    h.textContent = 'Signature · ' + (sec === 'Tissus opaques' ? 'Tissus opaques — grille largeur × hauteur' : sec + ' — prix selon la largeur');
    list.appendChild(h);
    groupes[sec].forEach(n => {
      const sel = state.sig && state.sig.t === n;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 14px 8px 22px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.03);background:' + (sel ? 'rgba(26,183,183,0.12)' : 'transparent') + ';';
      row.innerHTML = '<span style="font-size:12px;font-family:DM Mono,monospace;color:' + (sel ? 'var(--gold)' : 'var(--text)') + ';">' + sigEsc(n) + '</span>' + (sel ? '<span style="color:var(--gold)">✓</span>' : '');
      row.onclick = () => { sigChoisir(n); sigListe(document.getElementById('sig-search').value || ''); };
      list.appendChild(row);
    });
  });
}

function sigChoisir(nom, garder) {
  const prec = state.sig || {};
  state.sig = Object.assign({ t: nom }, garder || { st: prec.st });
  state.modele = nom; state.tissuNom = nom;
  const b = document.getElementById('sig-selected');
  if (b) {
    const p = SIG_GRILLES[nom];
    b.innerHTML = '<div style="font-size:10px;opacity:.6;margin-bottom:3px;">Signature Textiles · ' + sigEsc(p.section) + '</div><div>' + sigEsc(nom) + '</div>';
    b.style.display = 'block';
  }
  sigChoix();
}

function sigSelect(id, label, opts, val, onch) {
  return '<div style="padding:8px 20px 4px;"><label style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin-bottom:7px;">' + label + '</label>'
    + '<select id="' + id + '" onchange="' + onch + '" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:9px 12px;outline:none;">'
    + opts.map(o => '<option value="' + sigEsc(o.v) + '"' + (o.v === val ? ' selected' : '') + '>' + sigEsc(o.l) + '</option>').join('') + '</select></div>';
}

function sigChoix() {
  const box = document.getElementById('sig-choix'); if (!box) return;
  const a = state.sig || {};
  if (!a.t || !SIG_GRILLES[a.t]) { box.innerHTML = ''; hide('card-dim'); hide('card-options'); resetResult(); return; }
  const styles = Object.keys(SIG_GRILLES[a.t].styles).filter(s => SIG_STYLES[s]);
  if (!styles.includes(a.st)) a.st = styles.length === 1 ? styles[0] : (styles.includes('RF100') ? 'RF100' : '');
  let html = sigSelect('sig-style', 'Confection', [{ v: '', l: '— Choisir —' }, ...styles.map(s => ({ v: s, l: SIG_STYLES[s] }))], a.st, "state.sig.st=this.value;sigChoix();");
  html += '<div style="padding:6px 20px 0;"><label style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin-bottom:7px;">Couleur du tissu</label>'
    + '<input id="sig-couleur" value="' + sigEsc(state.tissuCouleur || '') + '" placeholder="ex. Blanc, Naturel…" oninput="state.tissuCouleur=this.value.trim();if(state.lastResult)calculatePriceSigGrille();" '
    + 'style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:9px 12px;box-sizing:border-box;"></div>';
  box.innerHTML = html;
  if (a.st) { show('card-dim'); state._sigOptCle = null; onDimChange(); } else { hide('card-dim'); hide('card-options'); resetResult(); }
}

// ── Grille ──────────────────────────────────────────────
function sigGrille() { const a = state.sig || {}; return a.t && a.st ? SIG_GRILLES[a.t].styles[a.st] : null; }

function sigPrixBase(g, type, larg, haut, plomb) {
  const L = nextDim(g.L, larg);
  if (!L) return { err: `Largeur maximale ${g.L[g.L.length - 1]}"` };
  const li = g.L.indexOf(L);
  if (type === 'voile') {
    const hmax = plomb ? (g.hmaxPlomb || g.hmax) : g.hmax;
    if (hmax && haut > hmax) return { err: `Hauteur maximale ${hmax}"${plomb ? ' (avec bas plombé)' : ''} pour ce tissu` };
    const v = g.P[li];
    return v ? { v, L, H: null } : { err: 'Non offert à cette largeur' };
  }
  const H = nextDim(g.H, haut);
  if (!H) return { err: `Hauteur maximale ${g.H[g.H.length - 1]}"` };
  const v = g.P[g.H.indexOf(H)][li];
  return v ? { v, L, H } : { err: 'Non offert à ces dimensions' };
}

// ── Voile plus large que la grille : calcul au mètre, tissu inversé (Draperie Normandie) ──
const SIG_STYLE_MULTI = { RF100: 2.5, RF120: 3.0, W200: 2.0, W250: 2.5, W300: 3.0 };
const sigNorme = n => String(n || '').toUpperCase().replace(/I?\.?F\.R\.?/g, '').replace(/["”″]/g, '').replace(/\s+/g, ' ').trim();
function sigTissuMetre(nomGrille) {
  const cle = sigNorme(nomGrille);
  return (typeof NORM_CATALOG !== 'undefined' ? NORM_CATALOG : []).find(t => t.collection === 'Signature' && !/\(doublure\)/.test(t.nom) && sigNorme(t.nom) === cle) || null;
}
function sigHorsGrille(nom, st, larg, haut) {
  const t = sigTissuMetre(nom);
  if (!t) return { err: nom + ' : plus large que la grille de la liste et absent des tissus au mètre — prix sur demande à Signature' };
  const multi = SIG_STYLE_MULTI[st] || 2.5, r = sigmMetrage(t, larg, multi, haut + SIGM_SURPLUS);
  const lignes = [{ label: `${t.nom} — plus large que la grille : ${r.vg} vg (≈ ${r.m} m) × ${t.pdsf} $${r.inverse ? ' — tissu inversé' : ', confection incluse'}`, pdsf: r.vg * t.pdsf }];
  if (r.inverse) lignes.push({ label: `Confection tissu inversé (calcul Draperie Normandie) — ${r.vg} vg × ${NORM_CONF_SD.inverse[1]} $`, pdsf: r.vg * NORM_CONF_SD.inverse[1] });
  return { lignes, total: lignes.reduce((x, l) => x + l.pdsf, 0), r, t };
}

// ── Options (étape 3) ───────────────────────────────────
function sigOptions() {
  const a = state.sig, o = state.options, p = SIG_GRILLES[a.t];
  const on = 'calculatePriceSigGrille();';
  let h = sigSelect('sig-div', 'Panneaux', SIG_DIVISIONS, o.sigDiv || 'demi', "state.options.sigDiv=this.value;" + on);
  h += '<div style="padding:6px 20px;"><label style="display:flex;gap:8px;align-items:center;font-size:12px;cursor:pointer;"><input type="checkbox" id="sig-tete6"' + (o.sigTete6 ? ' checked' : '') + ' onchange="state.options.sigTete6=this.checked;' + on + '"> Tête 6 po (+10 %) <span style="color:var(--text-dim)">— standard : tête 4 po</span></label></div>';
  if (p.type === 'opaque') h += sigSelect('sig-doub', 'Doublure', SIG_DOUBLURES.map(d => ({ v: d.v, l: d.l })), o.sigDoub || '', "state.options.sigDoub=this.value;" + on);
  else h += '<div style="padding:6px 20px;"><label style="display:flex;gap:8px;align-items:center;font-size:12px;cursor:pointer;"><input type="checkbox" id="sig-plomb"' + (o.sigPlomb ? ' checked' : '') + ' onchange="state.options.sigPlomb=this.checked;' + on + '"> Bas plombé <span style="color:var(--text-dim)">— change la hauteur maximale</span></label></div>';
  // Rails et composantes (tous les tissus)
  const rails = [{ v: 'ads', l: 'Rail ADS de la liste (chariots, capuchons, supports inclus)' }, { v: '', l: 'Aucun rail' },
    ...sigRailsAutres().map(k => ({ v: k, l: NORM_RAILS[k].label.replace(/^Signature — /, 'Autre rail : ') + ' (au pied)' }))];
  h += sigSelect('sig-rail', 'Rails et composantes', rails, o.sigRail == null ? 'ads' : o.sigRail, "state.options.sigRail=this.value;state._sigOptCle=null;" + on);
  const rk = o.sigRail;
  if (rk && NORM_RAILS[rk]) {
    const r = NORM_RAILS[rk];
    const couls = r.prixParCouleur ? Object.keys(r.prixParCouleur) : (r.couleurs || ['Blanc']);
    h += sigSelect('sig-rail-coul', 'Couleur du rail', couls.map(c => ({ v: c, l: c })), o.sigRailCoul || couls[0], "state.options.sigRailCoul=this.value;" + on);
    (r.accessoires || []).forEach((acc, i) => {
      h += '<div style="padding:3px 20px;display:flex;align-items:center;gap:8px;font-size:12px;"><input type="number" min="0" step="1" id="sig-acc-' + i + '" value="' + ((o.sigAcc || {})[acc.id] || 0)
        + '" data-acc="' + sigEsc(acc.id) + '" oninput="state.options.sigAcc=state.options.sigAcc||{};state.options.sigAcc[this.dataset.acc]=Math.max(0,parseInt(this.value)||0);' + on + '" '
        + 'style="width:60px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:5px;"> <span>' + sigEsc(acc.label) + '</span></div>';
    });
  }
  h += '<div style="padding:6px 20px;display:flex;align-items:center;gap:8px;font-size:12px;"><input type="number" min="0" step="1" id="sig-courbes" value="' + (o.sigCourbes || 0) + '" oninput="state.options.sigCourbes=Math.max(0,parseInt(this.value)||0);' + on + '" style="width:60px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:5px;"> <span>Courbe(s) dans le rail (+20 $ chacune)</span></div>';
  h += '<div style="padding:6px 20px 12px;display:flex;align-items:center;gap:8px;font-size:12px;"><input type="number" min="1" step="1" id="sig-qte" value="' + (o.sigQte || 1) + '" oninput="state.options.sigQte=Math.max(1,parseInt(this.value)||1);' + on + '" style="width:60px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:5px;"> <span>Quantité (rideaux identiques)</span></div>';
  document.getElementById('options-container').innerHTML = h;
}

// ── Calcul ──────────────────────────────────────────────
function calculatePriceSigGrille() {
  const a = state.sig || {}, g = sigGrille();
  if (!g) { resetResult(); return; }
  const p = SIG_GRILLES[a.t];
  const larg = (parseFloat(document.getElementById('inp-larg').value) || 0) + (parseFloat(document.getElementById('frac-larg').value) || 0);
  const haut = (parseFloat(document.getElementById('inp-haut').value) || 0) + (parseFloat(document.getElementById('frac-haut').value) || 0);
  if (!larg || !haut) { resetResult(); return; }
  show('card-options');
  const cle = [a.t, a.st, state.options.sigRail].join('|');
  if (state._sigOptCle !== cle || !document.getElementById('sig-qte')) { sigOptions(); state._sigOptCle = cle; }
  const o = state.options;
  const alertEl = document.getElementById('alert-dim'), noteEl = document.getElementById('note-dim');
  let r = sigPrixBase(g, p.type, larg, haut, !!o.sigPlomb), hors = null;
  if (r.err && p.type === 'voile' && larg > g.L[g.L.length - 1]) {
    hors = sigHorsGrille(a.t, a.st, larg, haut);
    if (hors.err) r = { err: hors.err };
    else r = { v: Math.round(hors.total * 100) / 100, L: larg, H: null };
  }
  if (r.err) {
    alertEl.textContent = '⚠ ' + r.err + ' — liste Signature p. ' + g.page;
    alertEl.classList.add('show'); noteEl.classList.remove('show'); resetResult(); state.lastResult = null; return;
  }
  alertEl.classList.remove('show');
  noteEl.textContent = hors ? `ℹ Plus large que la grille (max ${g.L[g.L.length - 1]}") : calcul au mètre — ${hors.r.inverse ? 'tissu inversé, comme Draperie Normandie' : 'en laizes, confection incluse'} · liste p. 6-10`
    : p.type === 'voile'
    ? `ℹ Prix à la largeur ${r.L}" (hauteur jusqu'à ${(o.sigPlomb ? (g.hmaxPlomb || g.hmax) : g.hmax) || '?'}") · liste p. ${g.page}`
    : `ℹ Grille utilisée : ${r.L}" × ${r.H}" · liste p. ${g.page}`;
  noteEl.classList.add('show');

  const lignes = hors ? hors.lignes.map(l => ({ label: l.label, pdsf: Math.round(l.pdsf * 100) / 100 })) : [{ label: `${a.t} — ${r.L}"${r.H ? ' × ' + r.H + '"' : ''}`, pdsf: r.v }];
  let pdsf = r.v;
  const ajout = (label, v) => { if (v > 0) { v = Math.round(v * 100) / 100; pdsf += v; lignes.push({ label, pdsf: v }); } };
  if (o.sigTete6) ajout('Tête 6 po (+10 %)', r.v * 0.10);
  const doub = SIG_DOUBLURES.find(d => d.v === (o.sigDoub || ''));
  if (p.type === 'opaque' && doub && doub.pct) ajout(doub.l, r.v * doub.pct / 100);
  const rail = o.sigRail == null ? 'ads' : o.sigRail;
  let railTxt = 'Aucun rail';
  if (rail === 'ads' && g.rail) {
    const RL = g.railL || g.L, L2 = nextDim(RL, larg);
    const v = L2 ? g.rail[RL.indexOf(L2)] : null;
    if (v) { ajout(`Rail ADS ${L2}" (chariots, capuchons, supports inclus)`, v); railTxt = `Rail ADS (liste) ${L2}"`; }
    else if (hors && typeof sigmTrousse === 'function') {
      const T = sigmTrousse(larg, a.st === 'RF120' ? 'rf120' : 'rf100', { sigmRail: 'ADS', sigmPose: 'plafond' });
      if (!T.err) { ajout(`Trousse Ripple Fold ${T.variante} — ${T.k.pi} pi : ${T.k.sup} supports, ${T.k.ch} chariots détachables${T.extra}`, T.k.prix); railTxt = `Trousse ADS ${T.k.pi} pi`; }
    }
  } else if (rail && NORM_RAILS[rail]) {
    const R = NORM_RAILS[rail], coul = o.sigRailCoul || (R.couleurs || ['Blanc'])[0], blanc = /blanc/i.test(coul);
    const pieds = Math.ceil(larg / 12);
    ajout(`${R.label.replace(/^Signature — /, '')} — ${pieds} pi (${coul})`, pieds * normPrixRailC(R, coul, blanc));
    railTxt = R.label.replace(/^Signature — /, '') + ' — ' + coul;
    (R.accessoires || []).forEach(acc => {
      const q = (o.sigAcc || {})[acc.id] || 0;
      if (q > 0) ajout(`${acc.label} × ${q}`, q * normPrixAccC(acc, coul, blanc));
    });
  }
  if (o.sigCourbes) ajout(`Courbe(s) × ${o.sigCourbes}`, o.sigCourbes * 20);

  const qte = Math.max(1, parseInt(o.sigQte) || 1);
  const pdsfTotal = Math.round(pdsf * qte * 100) / 100;
  const pct = getPct(), multi = getMulti();
  const cout = Math.round(pdsfTotal * pct * 100) / 100;
  const vente = Math.round(cout * multi * 100) / 100;
  const marge = vente > 0 ? Math.round((vente - cout) / vente * 1000) / 10 : 0;

  const div = (SIG_DIVISIONS.find(d => d.v === (o.sigDiv || 'demi')) || SIG_DIVISIONS[0]).l;
  const fmtPo = v => { let w = Math.floor(v + 1e-4), f = Math.round((v - w) * 8) / 8; if (f >= 1) { w++; f = 0; } const m = { 0.125: '1/8', 0.25: '1/4', 0.375: '3/8', 0.5: '1/2', 0.625: '5/8', 0.75: '3/4', 0.875: '7/8' }; return m[f] ? `${w} ${m[f]}"` : `${w}"`; };
  const resume = [
    'Fournisseur : Signature Textiles',
    'Rideau confectionné : ' + SIG_STYLES[a.st],
    'Tissu : ' + a.t + (state.tissuCouleur ? ' — ' + state.tissuCouleur : '') + (p.type === 'voile' ? ' (' + p.section.toLowerCase() + ')' : ''),
    'Dimensions : ' + fmtPo(larg) + ' × ' + fmtPo(haut) + ' (largeur finie plissée × hauteur)',
    'Panneaux : ' + div,
    'Tête : ' + (o.sigTete6 ? '6 po' : '4 po'),
  ];
  if (hors) resume.push('Calcul au mètre : plus large que la grille de la liste (' + hors.r.vg + ' vg' + (hors.r.inverse ? ', tissu inversé' : '') + ')');
  if (p.type === 'opaque') resume.push('Doublure : ' + (doub && doub.pct ? doub.l.replace(/^Doublure /, '').replace(/ \(\+\d+ %\)/, '') : 'Aucune'));
  else if (o.sigPlomb) resume.push('Bas plombé');
  resume.push('Rail : ' + railTxt + (o.sigCourbes ? ' · ' + o.sigCourbes + ' courbe(s)' : ''));
  if (qte > 1) resume.push('Quantité : ' + qte);
  state.sigResume = resume;
  state.lastResult = { pdsfTotal, pdsf: pdsfTotal, cout, vente, marge, desc: resume.join(' | ') };

  const fmtCAD = v => '$ ' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const bd = lignes.map(b => `<div class="breakdown-item"><span>${sigEsc(b.label)}</span><span>${fmtCAD(b.pdsf)}</span></div>`).join('')
    + (qte > 1 ? `<div class="breakdown-item"><span>× ${qte}</span><span>${fmtCAD(pdsfTotal)}</span></div>` : '');
  document.getElementById('result-body').innerHTML = `
    <div class="result-fournisseur">Signature Textiles · rideau confectionné</div>
    <div class="result-produit">${sigEsc(a.t)}</div>
    <div class="result-detail">${sigEsc(SIG_STYLES[a.st])}<br>${fmtPo(larg)} × ${fmtPo(haut)} · ${sigEsc(div)}${state.tissuCouleur ? ' · ' + sigEsc(state.tissuCouleur) : ''}</div>
    <div class="result-prices">
      <div class="price-row"><span class="price-label">PDSF total</span><span class="price-value pdsf">${fmtCAD(pdsfTotal)}</span></div>
      <div class="price-row"><span class="price-label">Ton coût (${Math.round(pct * 100)} %)</span><span class="price-value cout">${fmtCAD(cout)}</span></div>
      <div class="price-row" style="border-color:var(--gold-dim);background:rgba(26,183,183,0.12)"><span class="price-label" style="color:var(--gold);font-weight:500">PRIX VENDANT</span><span class="price-value vente">${fmtCAD(vente)}</span></div>
    </div>
    <div class="margin-bar-wrap"><div class="margin-label"><span>Marge brute</span><span style="color:var(--green)">${marge}%</span></div>
      <div class="margin-bar"><div class="margin-fill" style="width:${Math.min(marge, 100)}%"></div></div></div>
    <div class="breakdown"><div class="breakdown-title">Détail PDSF — liste Signature 2022 p. ${g.page}</div>${bd}
      <div class="breakdown-item" style="color:var(--text);font-weight:500;margin-top:4px"><span>Total PDSF</span><span>${fmtCAD(pdsfTotal)}</span></div></div>`;
}

// ── Rouvrir une ligne du devis (✎ Modifier) ────────────
window.sigGrilleRestore = function (saved, ctrls) {
  const a = saved.sig || {};
  state.options = JSON.parse(JSON.stringify(saved.options || {}));
  state.tissuCouleur = saved.tissuCouleur || '';
  ['inp-larg', 'inp-haut', 'frac-larg', 'frac-haut'].forEach(id => { const el = document.getElementById(id); if (el && ctrls[id]) el.value = ctrls[id].v; });
  state._sigOptCle = null;
  if (a.t && SIG_GRILLES[a.t]) { sigChoisir(a.t, { st: a.st }); sigListe(''); }
};
