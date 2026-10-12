// ══════════════════════════════════════════════════════
// SIGNATURE TEXTILES — Rideaux sur mesure AU MÈTRE (tissus de la liste p. 6-11), décoratifs ou séparateurs / médicaux.
// Règles de Sam (2026-10-09) :
//  • Le prix au mètre de la liste INCLUT la confection, sauf quand le tissu est INVERSÉ (tissu large tourné : sa largeur
//    couvre la hauteur) → même calcul que Draperie Normandie (verges = largeur × ampleur ÷ 36, + confection « voilage inversé »).
//  • Métrage selon l'ampleur choisie ; rideaux décoratifs = Ripple Fold détachable seulement (chariots détachables).
//  • Séparateur / médical : hauteur depuis le sol (espace au sol), bande de filet 18 / 24 / 48 po (liste p. 11) et
//    déduction du rail → hauteur du tissu réduite ; œillets comptés et facturés à l'unité (prix dans ⚙ Paramètres).
//  • Rail Meditrack : toutes les pièces calculées seules (supports aux 3 pi, chariots AVEC crochet, capuchon, petite porte,
//    joints, poteaux ou tubes de suspension, courbes). Rails décoratifs : trousse Ripple Fold assemblée (AKS, ADS, CRS).
// Prix : PDSF = prix de la liste Signature ; coût = % Signature des Paramètres (50 %).
// ══════════════════════════════════════════════════════
const SIGM_AMPLEURS_DECO = ['rf60', 'rf80', 'rf100', 'rf120'];          // NORM_FINITIONS (Ripple Fold détachable)
const SIGM_AMPLEURS_SEP = [
  { v: 'a0', l: 'Sans ampleur (rideau à plat)', multi: 1.0 },
  { v: 'a25', l: 'Ampleur 25 %', multi: 1.25 },
  { v: 'a50', l: 'Ampleur 50 %', multi: 1.5 },
  { v: 'a75', l: 'Ampleur 75 %', multi: 1.75 },
  { v: 'a100', l: 'Ampleur 100 %', multi: 2.0 },
];
// Filet pour rideaux séparateurs (liste p. 11) : prix de la liste au mètre linéaire (= PDSF)
const SIGM_FILETS = [
  { v: '', l: 'Aucun filet', h: 0, pdsfM: 0 },
  { v: '18', l: 'Filet 18" (46 cm)', h: 18, pdsfM: 7 },
  { v: '24', l: 'Filet 24" (61 cm)', h: 24, pdsfM: 8.5 },
  { v: '48', l: 'Filet 48" (122 cm)', h: 48, pdsfM: 16 },
];
const SIGM_FILET_TROUS = ['Trous de 1/2" (ouverture 70 %)', 'Trous de 1/4"'];
const SIGM_OEILLETS = ['Ronds', 'Carrés'];
const SIGM_OEILLET_COUL = ['Argent', 'Laiton antique', 'Argent brossé', 'Cuivre antique', 'Noir', 'Canon de fusil'];
const SIGM_DEDUCTION_MEDI = 3.25;   // rail Meditrack 3/4" + chariot avec crochet 2 1/2" (fiche Meditrack)
const SIGM_SURPLUS = 8;             // tête 6" + bas 2" (comme Normandie, tête 3½–4")
const SIGM_MEDI_ESPACEMENT = 3;     // supports aux 3 pieds (Sam 2026-10-09)

function sigmEsc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function sigmTissus(doublures) {
  return NORM_CATALOG.filter(t => t.collection === 'Signature' && (/\(doublure\)/.test(t.nom) === !!doublures));
}
function sigmTissu(nom) { return NORM_CATALOG.find(t => t.collection === 'Signature' && t.nom === nom); }
function sigmNomPropre(n) { return String(n || '').replace(/\s*\(doublure\)$/, ''); }
function sigmAcc(rail, id) { return (NORM_RAILS[rail].accessoires || []).find(a => a.id === id); }
function sigmPoMm(v) { let w = Math.floor(v + 1e-4), f = Math.round((v - w) * 8) / 8; if (f >= 1) { w++; f = 0; } const m = { 0.125: '1/8', 0.25: '1/4', 0.375: '3/8', 0.5: '1/2', 0.625: '5/8', 0.75: '3/4', 0.875: '7/8' }; return m[f] ? `${w} ${m[f]}"` : `${w}"`; }

// ── 1 — Produit ─────────────────────────────────────────
function sigMetreStart() {
  state.sigm = state.sigm || {};
  ['row-norm-tissu', 'row-sig', 'card-dim', 'card-options'].forEach(hide);
  show('row-sigm', true);
  const s = document.getElementById('sigm-search'); if (s) s.value = '';
  sigmListe('');
  sigmChoix();
}

function sigmListe(filtre) {
  const list = document.getElementById('sigm-list'); if (!list) return;
  filtre = (filtre || '').toLowerCase().trim();
  const clr = document.getElementById('sigm-clear'); if (clr) clr.style.display = filtre ? 'block' : 'none';
  const T = sigmTissus(false).filter(t => !filtre || t.nom.toLowerCase().includes(filtre)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  const larges = T.filter(t => t.largeur >= 110), etroits = T.filter(t => t.largeur < 110);
  list.innerHTML = '';
  if (!T.length) { list.innerHTML = '<div style="padding:20px;font-size:12px;color:var(--text-dim);text-align:center;">Aucun tissu trouvé</div>'; return; }
  [['Tissus larges (110" et plus) — souvent posés inversés', larges], ['Tissus 54" à 82" — en laizes (séparateurs, opaques…)', etroits]].forEach(([titre, liste]) => {
    if (!liste.length) return;
    const h = document.createElement('div');
    h.style.cssText = 'position:sticky;top:0;z-index:2;padding:7px 14px 5px;font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--gold);background:var(--surface);border-bottom:1px solid var(--border);text-transform:uppercase;';
    h.textContent = 'Signature · ' + titre;
    list.appendChild(h);
    liste.forEach(t => {
      const sel = state.sigm && state.sigm.t === t.nom;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;gap:10px;padding:8px 14px 8px 22px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.03);background:' + (sel ? 'rgba(26,183,183,0.12)' : 'transparent') + ';';
      row.innerHTML = '<span style="font-size:12px;font-family:DM Mono,monospace;color:' + (sel ? 'var(--gold)' : 'var(--text)') + ';">' + sigmEsc(t.nom) + '</span>'
        + '<span style="font-size:11px;color:var(--text-dim);white-space:nowrap;">' + t.largeur + '"' + (t.filsPlomb ? ' · bas plombé' : '') + (sel ? ' ✓' : '') + '</span>';
      row.onclick = () => { sigmChoisir(t.nom); sigmListe(document.getElementById('sigm-search').value || ''); };
      list.appendChild(row);
    });
  });
}

function sigmChoisir(nom, garder) {
  const prec = state.sigm || {};
  state.sigm = Object.assign({ t: nom }, garder || { u: prec.u || 'deco' });
  state.modele = nom; state.tissuNom = nom;
  const t = sigmTissu(nom), b = document.getElementById('sigm-selected');
  if (b && t) {
    b.innerHTML = '<div style="font-size:10px;opacity:.6;margin-bottom:3px;">Signature Textiles · tissu au mètre · ' + t.largeur + '"</div><div>' + sigmEsc(nom) + '</div>';
    b.style.display = 'block';
  }
  sigmChoix();
}

function sigmSelect(id, label, opts, val, onch) {
  return '<div style="padding:8px 20px 4px;"><label for="' + id + '" style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin-bottom:7px;">' + label + '</label>'
    + '<select id="' + id + '" onchange="' + onch + '" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:9px 12px;outline:none;">'
    + opts.map(o => '<option value="' + sigmEsc(o.v) + '"' + (String(o.v) === String(val) ? ' selected' : '') + '>' + sigmEsc(o.l) + '</option>').join('') + '</select></div>';
}
function sigmNombre(id, label, val, onch, aide) {
  return '<div style="padding:8px 20px 4px;"><label for="' + id + '" style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin-bottom:7px;">' + label + '</label>'
    + '<input type="number" min="0" step="0.125" id="' + id + '" value="' + (val == null ? '' : val) + '" oninput="' + onch + '" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:9px 12px;box-sizing:border-box;">'
    + (aide ? '<div style="font-size:10px;color:var(--text-dim);margin-top:4px;">' + aide + '</div>' : '') + '</div>';
}

function sigmChoix() {
  const box = document.getElementById('sigm-choix'); if (!box) return;
  const a = state.sigm || {};
  if (!a.t || !sigmTissu(a.t)) { box.innerHTML = ''; hide('card-dim'); hide('card-options'); resetResult(); return; }
  let html = sigmSelect('sigm-usage', 'Usage du rideau', [{ v: 'deco', l: 'Rideau décoratif (Ripple Fold détachable)' }, { v: 'sep', l: 'Rideau séparateur / médical (filet, œillets, Meditrack)' }],
    a.u || 'deco', "state.sigm.u=this.value;state.options={};state._sigmOptCle=null;sigmChoix();");
  html += '<div style="padding:6px 20px 0;"><label for="sigm-couleur" style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);display:block;margin-bottom:7px;">Couleur du tissu</label>'
    + '<input id="sigm-couleur" value="' + sigmEsc(state.tissuCouleur || '') + '" placeholder="ex. Blanc, Naturel…" oninput="state.tissuCouleur=this.value.trim();if(state.lastResult)calculatePriceSigMetre();" '
    + 'style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:DM Mono,monospace;font-size:12px;padding:9px 12px;box-sizing:border-box;"></div>';
  box.innerHTML = html;
  show('card-dim'); state._sigmOptCle = null; onDimChange();
}

// ── 3 — Options ─────────────────────────────────────────
function sigmOptions() {
  const a = state.sigm, o = state.options, sep = a.u === 'sep', on = 'calculatePriceSigMetre();';
  let h = '';
  if (sep) {
    if (!SIGM_AMPLEURS_SEP.some(x => x.v === o.sigmAmp)) o.sigmAmp = 'a50';
    h += sigmSelect('sigm-amp', 'Ampleur', SIGM_AMPLEURS_SEP.map(x => ({ v: x.v, l: x.l })), o.sigmAmp, "state.options.sigmAmp=this.value;" + on);
    if (o.sigmSol == null) o.sigmSol = 15;
    h += sigmNombre('sigm-sol', 'Distance du sol au bas du tissu (po)', o.sigmSol, "state.options.sigmSol=parseFloat(this.value)||0;" + on, 'Le bas du rideau commence à cette hauteur du plancher : elle est retirée de la hauteur.');
    if (o.sigmFilet == null) o.sigmFilet = '18';
    h += sigmSelect('sigm-filet', 'Filet en haut (liste p. 11, couleur naturelle)', SIGM_FILETS.map(f => ({ v: f.v, l: f.l + (f.pdsfM ? ' — ' + f.pdsfM + ' $/m' : '') })), o.sigmFilet, "state.options.sigmFilet=this.value;" + on);
    if (o.sigmFilet) h += sigmSelect('sigm-trous', 'Trous du filet', SIGM_FILET_TROUS.map(x => ({ v: x, l: x })), o.sigmTrous || SIGM_FILET_TROUS[0], "state.options.sigmTrous=this.value;" + on);
    h += sigmSelect('sigm-oe', 'Œillets (en haut, 1 par chariot)', SIGM_OEILLETS.map(x => ({ v: x, l: x })), o.sigmOe || SIGM_OEILLETS[0], "state.options.sigmOe=this.value;" + on);
    h += sigmSelect('sigm-oe-coul', 'Couleur des œillets', SIGM_OEILLET_COUL.map(x => ({ v: x, l: x })), o.sigmOeCoul || SIGM_OEILLET_COUL[0], "state.options.sigmOeCoul=this.value;" + on);
    h += sigRailHtml(o, { defaut: 'medi', on });
  } else {
    if (!SIGM_AMPLEURS_DECO.includes(o.sigmFin)) o.sigmFin = 'rf100';
    h += sigmSelect('sigm-fin', 'Confection', SIGM_AMPLEURS_DECO.map(v => NORM_FINITIONS.find(f => f.val === v)).map(f => ({ v: f.val, l: f.label })), o.sigmFin, "state.options.sigmFin=this.value;" + on);
    h += sigmSelect('sigm-div', 'Panneaux', SIG_DIVISIONS, o.sigmDiv || 'demi', "state.options.sigmDiv=this.value;" + on);
    const D = sigmTissus(true).sort((x, y) => x.nom.localeCompare(y.nom, 'fr'));
    h += sigmSelect('sigm-doub', 'Doublure (liste p. 11)', [{ v: '', l: 'Aucune doublure' }, ...D.map(d => ({ v: d.nom, l: sigmNomPropre(d.nom) + ' (' + d.largeur + '")' }))], o.sigmDoub || '', "state.options.sigmDoub=this.value;" + on);
    h += sigRailHtml(o, { defaut: 'AKS', on });
  }
  h += '<div style="padding:6px 20px 12px;display:flex;align-items:center;gap:8px;font-size:12px;"><input type="number" min="1" step="1" id="sigm-qte" value="' + (o.sigmQte || 1) + '" oninput="state.options.sigmQte=Math.max(1,parseInt(this.value)||1);' + on + '" style="width:60px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:5px;"> <label for="sigm-qte">Quantité (rideaux identiques)</label></div>';
  document.getElementById('options-container').innerHTML = h;
}

// ── RAILS SIGNATURE — bloc commun à tous les types (Sam 2026-10-09) ────────────
const SIG_RAILS_CHOIX = [
  { v: 'aucun', l: 'Aucun rail (rail existant)' },
  { v: 'ads-liste', l: 'Rail ADS de la liste (inclus dans la grille : chariots, capuchons, supports)', grille: true },
  { v: 'AKS', l: 'AKS aluminium — trousse assemblée (plafond ou mur)' },
  { v: 'ADS', l: 'ADS aluminium — trousse assemblée (plafond ou mur)' },
  { v: 'CRS', l: 'CRS 28 mm décoratif — trousse assemblée (plafond, jusqu\'à 16 pi)' },
  { v: 'arch', l: 'Architex — chariots à billes (plafond ou mur)' },
  { v: 'medi', l: 'Meditrack — rail médical (plafond, mur ou suspendu)' },
];
const SIG_RAILS_PIED = ['SIG_AKS', 'SIG_ADS', 'SIG_AKS_ENC', 'SIG_CRS', 'SIG_ARCH', 'SIG_MEDI'];
function sigRailHtml(o, ctx) {
  const on = ctx.on, opts = SIG_RAILS_CHOIX.filter(c => !c.grille || ctx.grille)
    .concat(SIG_RAILS_PIED.filter(k => NORM_RAILS[k]).map(k => ({ v: 'pied:' + k, l: 'Au pied, pièces au choix : ' + NORM_RAILS[k].label.replace(/^Signature — /, '') })));
  if (!opts.some(x => x.v === o.sigmRail)) o.sigmRail = ctx.defaut;
  const r = o.sigmRail, set = (k, recon) => "state.options." + k + "=this.value;" + (recon ? "state._sigmOptCle=null;state._sigOptCle=null;" + (ctx.rebuild || '') : '') + on;
  let h = sigmSelect('sigm-rail', 'Rail', opts, r, set('sigmRail', true));
  if (r === 'AKS' || r === 'ADS' || r === 'arch') {
    if (!['plafond', 'mur'].includes(o.sigmPose)) o.sigmPose = 'plafond';
    h += sigmSelect('sigm-pose', 'Installation du rail', [{ v: 'plafond', l: 'Au plafond (supports de plafond)' }, { v: 'mur', l: r === 'arch' ? 'Au mur (supports ajustables 2" à 4½")' : 'Au mur (supports Smart Klick 3" à 4½")' }], o.sigmPose, set('sigmPose'));
  }
  if (r === 'medi') {
    if (!['plafond', 'mur', 'susp'].includes(o.sigmPose)) o.sigmPose = 'plafond';
    h += sigmSelect('sigm-pose', 'Installation du rail', [{ v: 'plafond', l: 'Directement au plafond (supports de plafond)' }, { v: 'mur', l: 'Plafond + supports de mur aux 2 bouts' },
      { v: 'susp', l: 'Suspendu (poteaux / tubes de suspension)' }], o.sigmPose, set('sigmPose', true));
    if (o.sigmPose === 'susp') {
      if (o.sigmDescente == null) o.sigmDescente = 24;
      h += sigmNombre('sigm-descente', 'Descente sous le plafond (po)', o.sigmDescente, "state.options.sigmDescente=parseFloat(this.value)||0;" + on, 'Jusqu\'à 24" : poteau de suspension fixe. Plus de 24" : tube de suspension au pied + support de plafond + adaptateur.');
    }
  }
  if (r === 'AKS' || r === 'ADS' || r === 'CRS') {
    const couls = NORM_RAILS.SIG_K_RF.couleurs || ['Blanc'];
    if (!couls.includes(o.sigmRailCoul)) o.sigmRailCoul = couls[0];
    h += sigmSelect('sigm-rail-coul', 'Couleur du rail', couls.map(c => ({ v: c, l: c })), o.sigmRailCoul, set('sigmRailCoul'));
  }
  if (/^pied:/.test(r)) {
    const R = NORM_RAILS[r.slice(5)], couls = R.prixParCouleur ? Object.keys(R.prixParCouleur) : (R.couleurs || ['Blanc']);
    if (!couls.includes(o.sigmRailCoul)) o.sigmRailCoul = couls[0];
    h += sigmSelect('sigm-rail-coul', 'Couleur du rail', couls.map(c => ({ v: c, l: c })), o.sigmRailCoul, set('sigmRailCoul'));
    (R.accessoires || []).forEach((acc, i) => {
      h += '<div style="padding:3px 20px;display:flex;align-items:center;gap:8px;font-size:12px;"><input type="number" min="0" step="1" id="sigm-acc-' + i + '" value="' + ((o.sigmAcc || {})[acc.id] || 0)
        + '" data-acc="' + sigmEsc(acc.id) + '" oninput="state.options.sigmAcc=state.options.sigmAcc||{};state.options.sigmAcc[this.dataset.acc]=Math.max(0,parseInt(this.value)||0);' + on + '" '
        + 'style="width:60px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:5px;"> <label for="sigm-acc-' + i + '">' + sigmEsc(acc.label) + '</label></div>';
    });
  }
  if (r !== 'aucun') h += sigmNombre('sigm-courbes', r === 'medi' ? 'Courbes 90° (24" × 24")' : 'Courbes du rail (supplément par courbe)', o.sigmCourbes || 0, "state.options.sigmCourbes=Math.max(0,parseInt(this.value)||0);" + on);
  return h;
}
// ctx : { fin: 'rf60'…'rf120' (ampleur pour compter les chariots), nbChariots (Meditrack), grille: g (rail ADS de la liste) }
function sigRailCalcul(o, larg, ctx) {
  const r = o.sigmRail || 'aucun', L = [], courbes = o.sigmCourbes || 0;
  if (r === 'aucun') return { lignes: L, txt: 'Aucun rail' };
  const add = (label, v) => { if (v > 0) L.push({ label, pdsf: Math.round(v * 100) / 100 }); };
  const kitCh = () => { const T = sigmTrousse(larg, ctx.fin || 'rf100', { rail: 'AKS', pose: 'plafond', plis: ctx.plis }); return T.err ? Math.ceil(larg / 2) : T.k.ch; };
  const sorte = ctx.plis ? 'plis français' : 'Ripple Fold', chTxt = ctx.plis ? 'chariots' : 'chariots détachables';
  if (r === 'ads-liste') {
    const g = ctx.grille, RL = g && (g.railL || g.L), L2 = RL && nextDim(RL, larg), v = L2 ? g.rail[RL.indexOf(L2)] : null;
    if (v) { add(`Rail ADS ${L2}" (chariots, capuchons, supports inclus)`, v); if (courbes) add(`Courbe(s) × ${courbes}`, courbes * 20); return { lignes: L, txt: `Rail ADS (liste) ${L2}"` }; }
    const T = sigmTrousse(larg, ctx.fin || 'rf100', { rail: 'ADS', pose: 'plafond', plis: ctx.plis });
    if (T.err) return { err: T.err };
    add(`Trousse ${sorte} ${T.variante} — ${T.k.pi} pi : ${T.k.sup} supports, ${T.k.ch} ${chTxt}${T.extra}`, T.k.prix);
    return { lignes: L, txt: `Trousse ADS ${T.k.pi} pi` };
  }
  if (r === 'AKS' || r === 'ADS' || r === 'CRS') {
    const T = sigmTrousse(larg, ctx.fin || 'rf100', { rail: r, pose: o.sigmPose, plis: ctx.plis });
    if (T.err) return { err: T.err };
    const coul = o.sigmRailCoul || 'Blanc';
    add(`Trousse ${sorte} ${T.variante} — ${T.k.pi} pi : ${T.k.sup} supports, ${T.k.ch} ${chTxt}, crans d'arrêt (${coul})${T.extra}`, T.k.prix);
    if (courbes) add(`Courbe(s) du rail × ${courbes}`, courbes * 20);
    return { lignes: L, txt: `Trousse ${sorte} ${T.variante} ${T.k.pi} pi (${T.k.sup} supports, ${T.k.ch} ${chTxt}) — ${coul}` };
  }
  if (r === 'arch') {
    const R = NORM_RAILS.SIG_ARCH, pi = Math.ceil(larg / 12), sup = Math.max(3, Math.ceil(pi / 2)), ch = kitCh(), a = id => sigmAcc('SIG_ARCH', id).prix.blanc;
    add(`Rail Architex blanc — ${pi} pi`, pi * R.prixBlanc);
    if (o.sigmPose === 'mur') add(`Support ajustable 2" à 4½" × ${sup}`, sup * a('sig-arch-sup-aj'));
    else add(`Support de plafond × ${sup}`, sup * a('sig-arch-sup-plaf'));
    if (ctx.plis) add(`Chariot à billes (plis) × ${ch}`, ch * a('sig-arch-billes'));
    else add(`Chariot à billes détachable (Ripple Fold) × ${ch}`, ch * a('sig-arch-billes-det'));
    add('Capuchon / cran d\'arrêt × 2', 2 * a('sig-arch-capuchon'));
    if (courbes) add(`Rail courbé 90° 2 pi × 2 pi × ${courbes}`, courbes * a('sig-arch-courbe'));
    return { lignes: L, txt: `Architex ${pi} pi — ${o.sigmPose === 'mur' ? 'au mur' : 'au plafond'}, ${sup} supports, ${ch} chariots à billes${ctx.plis ? '' : ' détachables'}${courbes ? ', ' + courbes + ' courbe(s)' : ''}` };
  }
  if (r === 'medi') {
    const nb = ctx.nbChariots || (Math.ceil(larg * ((NORM_FINITIONS.find(f => f.val === ctx.fin) || { multi: 2.5 }).multi) / 6) + 1);
    const M = sigmMeditrack(larg, nb, o);
    return { lignes: M.lignes, txt: M.txt };
  }
  if (/^pied:/.test(r)) {
    const R = NORM_RAILS[r.slice(5)], coul = o.sigmRailCoul || (R.couleurs || ['Blanc'])[0], blanc = /blanc/i.test(coul), pi = Math.ceil(larg / 12);
    add(`${R.label.replace(/^Signature — /, '')} — ${pi} pi (${coul})`, pi * normPrixRailC(R, coul, blanc));
    (R.accessoires || []).forEach(acc => { const q = (o.sigmAcc || {})[acc.id] || 0; if (q > 0) add(`${acc.label} × ${q}`, q * normPrixAccC(acc, coul, blanc)); });
    if (courbes) add(`Courbe(s) du rail × ${courbes}`, courbes * 20);
    return { lignes: L, txt: R.label.replace(/^Signature — /, '') + ' — ' + coul };
  }
  return { lignes: L, txt: 'Aucun rail' };
}

// ── Métrage (règle de Sam : prix au mètre = confection incluse ; inversé = calcul Normandie) ──
function sigmMetrage(t, l, multi, hautTissu) {
  const inverse = hautTissu <= t.largeur;
  const vg = inverse ? Math.ceil((l * multi) / 36) : Math.ceil(((l * multi) / t.largeur) * (hautTissu / 36));
  const laizes = inverse ? 0 : Math.ceil((l * multi) / t.largeur);
  return { inverse, vg, m: Math.round(vg * 0.9144 * 100) / 100, laizes };
}

// ── Rail Meditrack : toutes les pièces ──────────────────
function sigmMeditrack(larg, nbChariots, o) {
  const R = 'SIG_MEDI', pi = Math.ceil(larg / 12), courbes = o.sigmCourbes || 0;
  const pts = Math.max(2, Math.ceil(pi / SIGM_MEDI_ESPACEMENT) + 1);
  const L = [];
  const add = (id, q, txt) => { if (q > 0) { const a = sigmAcc(R, id); L.push({ label: `${txt || a.label} × ${q}`, pdsf: q * a.prix.blanc }); } };
  L.push({ label: `Rail Meditrack argent — ${pi} pi`, pdsf: pi * NORM_RAILS[R].prixBlanc });
  if (o.sigmPose === 'susp') {
    const d = o.sigmDescente || 0;
    if (d <= 24) add('sig-medi-poteau', pts, `Poteau de suspension jusqu'à 24" (descente ${sigmPoMm(d)})`);
    else {
      const piTube = Math.ceil(d / 12) * pts;
      L.push({ label: `Tube de suspension — ${pts} × ${Math.ceil(d / 12)} pi = ${piTube} pi`, pdsf: piTube * sigmAcc(R, 'sig-medi-tube').prix.blanc });
      add('sig-medi-plaf', pts, 'Support de plafond (tube de suspension)');
      add('sig-medi-adapt', pts, 'Adaptateur de rail (tube de suspension)');
    }
  } else if (o.sigmPose === 'mur') {
    add('sig-medi-mur', 2, 'Support de mur (aux 2 bouts)');
    add('sig-medi-plaf', pts - 2, `Support de plafond (aux ${SIGM_MEDI_ESPACEMENT} pi)`);
  } else add('sig-medi-plaf', pts, `Support de plafond (aux ${SIGM_MEDI_ESPACEMENT} pi)`);
  add('sig-medi-ch-crochet', nbChariots, 'Chariot avec crochet');
  add('sig-medi-cap', 1, 'Capuchon / cran d\'arrêt');
  add('sig-medi-porte', 1, 'Petite porte (insertion des chariots)');
  add('sig-medi-joint', Math.max(0, Math.ceil(pi / 19) - 1), 'Joint de rail (rail de 19 pi)');
  add('sig-medi-courbe', courbes, 'Rail courbé 90° 24" × 24"');
  return { lignes: L, txt: `Meditrack ${pi} pi — ${o.sigmPose === 'susp' ? 'suspendu' : o.sigmPose === 'mur' ? 'plafond + supports de mur' : 'au plafond'}, ${pts} points d'appui, ${nbChariots} chariots avec crochet${courbes ? ', ' + courbes + ' courbe(s) 90°' : ''}` };
}

// ── Trousse Ripple Fold (rideau décoratif) ──────────────
function sigmTrousse(larg, fin, q) {   // q = { rail: 'AKS'|'ADS'|'CRS', pose: 'plafond'|'mur', plis: bool }
  const pi = Math.ceil(larg / 12);
  if (q.plis) {   // trousse assemblée pour plis français (p. 73)
    const P = NORM_RAILS.SIG_K_PF, v = Object.keys(P.kits).find(k => k.startsWith(q.rail === 'CRS' ? 'CRS' : q.rail + ' —') && (q.rail === 'CRS' || (q.pose === 'mur' ? /muraux/.test(k) : /plafond/.test(k))));
    if (!v) return { err: 'Trousse plis français introuvable pour ce choix' };
    const L = P.kits[v]; let k = L.find(x => x.pi >= pi), extra = '';
    if (!k) { const a = L[L.length - 2], b = L[L.length - 1], dp = pi - b.pi, st = b.pi - a.pi; k = { pi, sup: b.sup + Math.ceil(dp * (b.sup - a.sup) / st), ch: b.ch + Math.ceil(dp * (b.ch - a.ch) / st), prix: Math.round((b.prix + dp * (b.prix - a.prix) / st) * 100) / 100 }; extra = ` (au-delà de ${b.pi} pi : prolongé au même taux — à confirmer avec Signature)`; }
    return { k, variante: v, extra, plis: true };
  }
  const R = NORM_RAILS.SIG_K_RF;
  const amp = { rf60: 60, rf80: 80, rf100: 100, rf120: 120 }[fin];
  let variante;
  if (q.rail === 'CRS') variante = Object.keys(R.kits).find(k => /^CRS/.test(k) && k.includes('ampleur ' + amp + ' %'));
  else {
    const a2 = amp > 100 ? 120 : 100;
    variante = Object.keys(R.kits).find(k => k.startsWith(q.rail + ' — ampleur ' + a2 + ' %') && (q.pose === 'mur' ? /murs/.test(k) : /plafond/.test(k)));
  }
  if (!variante) return { err: 'Trousse introuvable pour ce choix' };
  const liste = R.kits[variante];
  let k = liste.find(x => x.pi >= pi), extra = '';
  if (!k) {
    const a = liste[liste.length - 2], b = liste[liste.length - 1], dp = pi - b.pi, step = b.pi - a.pi;
    k = { pi, sup: b.sup + Math.ceil(dp * (b.sup - a.sup) / step), ch: b.ch + Math.ceil(dp * (b.ch - a.ch) / step), prix: Math.round((b.prix + dp * (b.prix - a.prix) / step) * 100) / 100 };
    extra = ` (au-delà de ${b.pi} pi : prolongé au même taux — à confirmer avec Signature)`;
  }
  return { k, variante, extra };
}

// ── Calcul ──────────────────────────────────────────────
function calculatePriceSigMetre() {
  const a = state.sigm || {}, t = sigmTissu(a.t);
  if (!t) { resetResult(); return; }
  const larg = (parseFloat(document.getElementById('inp-larg').value) || 0) + (parseFloat(document.getElementById('frac-larg').value) || 0);
  const haut = (parseFloat(document.getElementById('inp-haut').value) || 0) + (parseFloat(document.getElementById('frac-haut').value) || 0);
  if (!larg || !haut) { resetResult(); return; }
  show('card-options');
  const cle = [a.t, a.u, state.options.sigmRail, state.options.sigmPose, state.options.sigmFilet, state.options.sigmFin].join('|');
  if (state._sigmOptCle !== cle || !document.getElementById('sigm-qte')) { sigmOptions(); state._sigmOptCle = cle; }
  const o = state.options, sep = a.u === 'sep';
  const alertEl = document.getElementById('alert-dim'), noteEl = document.getElementById('note-dim');
  const bloquer = msg => { alertEl.textContent = '⚠ ' + msg; alertEl.classList.add('show'); noteEl.classList.remove('show'); resetResult(); state.lastResult = null; };

  // Hauteur du tissu
  const filet = sep ? (SIGM_FILETS.find(f => f.v === (o.sigmFilet || '')) || SIGM_FILETS[0]) : SIGM_FILETS[0];
  const dedRail = sep && o.sigmRail === 'medi' ? SIGM_DEDUCTION_MEDI : 0;
  const sol = sep ? (o.sigmSol || 0) : 0;
  const hautFini = haut - sol - filet.h - dedRail;
  if (hautFini < 12) return bloquer(`Hauteur de tissu trop petite (${sigmPoMm(hautFini)}) : vérifie la hauteur, l'espace au sol et le filet.`);
  const hautTissu = hautFini + SIGM_SURPLUS;

  const multi = sep ? (SIGM_AMPLEURS_SEP.find(x => x.v === o.sigmAmp) || SIGM_AMPLEURS_SEP[2]).multi : (NORM_FINITIONS.find(f => f.val === o.sigmFin) || NORM_FINITIONS[2]).multi;
  const div = sep ? 'demi' : (o.sigmDiv || 'demi');
  const largeurs = div === 'demi' ? [larg] : [larg / 2, larg / 2];
  const lignes = [];
  let pdsf = 0;
  const ajout = (label, v) => { v = Math.round(v * 100) / 100; pdsf += v; lignes.push({ label, pdsf: v }); };

  // Tissu (+ confection inversé)
  let vgTot = 0, inverse = false, nbLaizes = 0;
  largeurs.forEach((l, i) => {
    const r = sigmMetrage(t, l, multi, hautTissu);
    vgTot += r.vg; inverse = r.inverse; nbLaizes += r.laizes;
    const pan = largeurs.length > 1 ? ` — panneau ${i ? 'D' : 'G'}` : '';
    ajout(`Tissu ${t.nom}${pan} : ${r.vg} vg (≈ ${r.m} m)${r.inverse ? ' — tissu inversé' : ` — ${r.laizes} laize(s), confection incluse`}`, r.vg * t.pdsf);
  });
  if (inverse) {
    const tarif = NORM_CONF_SD.inverse[1];
    ajout(`Confection tissu inversé (calcul Draperie Normandie) — ${vgTot} vg × ${tarif} $`, vgTot * tarif);
  }
  // Doublure (décoratif)
  let doubTxt = '';
  if (!sep && o.sigmDoub) {
    const d = sigmTissu(o.sigmDoub);
    if (d) {
      let vgD = 0;
      largeurs.forEach(l => { vgD += sigmMetrage(d, l, multi, hautTissu).vg; });
      ajout(`Doublure ${sigmNomPropre(d.nom)} : ${vgD} vg (≈ ${Math.round(vgD * 0.9144 * 100) / 100} m)`, vgD * d.pdsf);
      doubTxt = sigmNomPropre(d.nom);
    }
  }
  // Séparateur : filet + œillets
  let nbChariots = 0;
  largeurs.forEach(l => { nbChariots += Math.ceil((l * multi) / 6) + 1; });   // 2 par pied de rideau, ampleur comprise (fiche Meditrack)
  const oeil = (settings.sig && settings.sig.oeillet) || 0;
  if (sep) {
    if (filet.pdsfM) {
      const mF = Math.ceil((larg * multi) / 39.37);
      ajout(`${filet.l} — ${o.sigmTrous || SIGM_FILET_TROUS[0]} : ${mF} m`, mF * filet.pdsfM);
    }
    ajout(`Œillets ${(o.sigmOe || SIGM_OEILLETS[0]).toLowerCase()} ${(o.sigmOeCoul || SIGM_OEILLET_COUL[0]).toLowerCase()} × ${nbChariots}${oeil ? ' × ' + oeil + ' $' : ' — ⚠ prix par œillet à régler dans ⚙ Paramètres'}`, nbChariots * oeil);
  }
  // Rail (bloc commun Signature)
  const RR = sigRailCalcul(o, larg, { fin: sep ? null : o.sigmFin, nbChariots: sep ? nbChariots : null });
  if (RR.err) return bloquer(RR.err);
  RR.lignes.forEach(x => ajout(x.label, x.pdsf));
  const railTxt = RR.txt;

  alertEl.classList.remove('show');
  noteEl.textContent = sep
    ? `ℹ Hauteur du tissu : ${sigmPoMm(haut)} − ${sigmPoMm(sol)} au sol${filet.h ? ' − ' + filet.h + '" de filet' : ''}${dedRail ? ' − ' + sigmPoMm(dedRail) + ' (rail + chariot, déduire rail)' : ' (déduire la hauteur du rail existant)'} = ${sigmPoMm(hautFini)} · ${inverse ? 'tissu inversé' : nbLaizes + ' laize(s)'} · liste p. 6-11`
    : `ℹ ${inverse ? 'Tissu inversé (sa largeur couvre la hauteur) : calcul Draperie Normandie' : nbLaizes + ' laize(s) de ' + t.largeur + '" : prix au mètre, confection incluse'} · liste p. 6-11`;
  noteEl.classList.add('show');

  const qte = Math.max(1, parseInt(o.sigmQte) || 1);
  const pdsfTotal = Math.round(pdsf * qte * 100) / 100;
  const pct = getPct(), mul = getMulti();
  const cout = Math.round(pdsfTotal * pct * 100) / 100;
  const vente = Math.round(cout * mul * 100) / 100;
  const marge = vente > 0 ? Math.round((vente - cout) / vente * 1000) / 10 : 0;

  const ampTxt = sep ? (SIGM_AMPLEURS_SEP.find(x => x.v === o.sigmAmp) || SIGM_AMPLEURS_SEP[2]).l : (NORM_FINITIONS.find(f => f.val === o.sigmFin) || {}).label;
  const resume = [
    'Fournisseur : Signature Textiles',
    (sep ? 'Rideau séparateur / médical' : 'Rideau décoratif') + ' sur mesure — tissu au mètre',
    'Tissu : ' + t.nom + (state.tissuCouleur ? ' — ' + state.tissuCouleur : '') + ` (${t.largeur}")`,
    'Dimensions : ' + sigmPoMm(larg) + ' × ' + sigmPoMm(haut) + (sep ? ` (hauteur plafond/rail au sol ; tissu ${sigmPoMm(hautFini)})` : ''),
    'Confection : ' + ampTxt + ` — ${vgTot} vg (≈ ${Math.round(vgTot * 0.9144 * 100) / 100} m)${inverse ? ', tissu inversé' : ''}`,
  ];
  if (!sep) resume.push('Panneaux : ' + (SIG_DIVISIONS.find(d => d.v === div) || SIG_DIVISIONS[0]).l, 'Doublure : ' + (doubTxt || 'Aucune'));
  if (sep) {
    resume.push(`Bas du tissu à ${sigmPoMm(sol)} du sol`);
    resume.push(filet.h ? `Filet ${filet.h}" en haut — ${o.sigmTrous || SIGM_FILET_TROUS[0]}` : 'Sans filet');
    resume.push(`Œillets : ${nbChariots} ${(o.sigmOe || SIGM_OEILLETS[0]).toLowerCase()}, ${(o.sigmOeCoul || SIGM_OEILLET_COUL[0]).toLowerCase()}`);
  }
  resume.push('Rail : ' + railTxt);
  if (qte > 1) resume.push('Quantité : ' + qte);
  state.sigmResume = resume;
  state.lastResult = { pdsfStore: pdsfTotal, pdsfSomfy: 0, pdsfTotal, pdsf: pdsfTotal, cout, vente, marge, desc: resume.join(' | ') };

  const fmtCAD = v => '$ ' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const bd = lignes.map(b => `<div class="breakdown-item"><span>${sigmEsc(b.label)}</span><span>${fmtCAD(b.pdsf)}</span></div>`).join('')
    + (qte > 1 ? `<div class="breakdown-item"><span>× ${qte}</span><span>${fmtCAD(pdsfTotal)}</span></div>` : '');
  document.getElementById('result-body').innerHTML = `
    <div class="result-fournisseur">Signature Textiles · ${sep ? 'rideau séparateur / médical' : 'rideau décoratif'} au mètre</div>
    <div class="result-produit">${sigmEsc(t.nom)}</div>
    <div class="result-detail">${sigmEsc(ampTxt)}<br>${sigmPoMm(larg)} × ${sigmPoMm(haut)}${state.tissuCouleur ? ' · ' + sigmEsc(state.tissuCouleur) : ''}</div>
    <div class="result-prices">
      <div class="price-row"><span class="price-label">PDSF total</span><span class="price-value pdsf">${fmtCAD(pdsfTotal)}</span></div>
      <div class="price-row"><span class="price-label">Ton coût (${Math.round(pct * 100)} %)</span><span class="price-value cout">${fmtCAD(cout)}</span></div>
      <div class="price-row" style="border-color:var(--gold-dim);background:rgba(26,183,183,0.12)"><span class="price-label" style="color:var(--gold);font-weight:500">PRIX VENDANT</span><span class="price-value vente">${fmtCAD(vente)}</span></div>
    </div>
    <div class="margin-bar-wrap"><div class="margin-label"><span>Marge brute</span><span style="color:var(--green)">${marge}%</span></div>
      <div class="margin-bar"><div class="margin-fill" style="width:${Math.min(marge, 100)}%"></div></div></div>
    <div class="breakdown"><div class="breakdown-title">Détail PDSF — liste Signature 2022 (p. 6-11, rails p. 58-77)</div>${bd}
      <div class="breakdown-item" style="color:var(--text);font-weight:500;margin-top:4px"><span>Total PDSF</span><span>${fmtCAD(pdsfTotal)}</span></div></div>`;
  show('card-result');
}

// ── Rouvrir une ligne du devis (✎ Modifier) ────────────
window.sigMetreRestore = function (saved, ctrls) {
  const a = saved.sigm || {};
  state.options = JSON.parse(JSON.stringify(saved.options || {}));
  state.tissuCouleur = saved.tissuCouleur || '';
  ['inp-larg', 'inp-haut', 'frac-larg', 'frac-haut'].forEach(id => { const el = document.getElementById(id); if (el && ctrls[id]) el.value = ctrls[id].v; });
  state._sigmOptCle = null;
  if (a.t && sigmTissu(a.t)) { sigmChoisir(a.t, { u: a.u || 'deco' }); sigmListe(''); }
};
