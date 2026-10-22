// Dessins des produits (Groupe Tekstil) — partagé : lecture de plan, page 📐 du devis, DA en PDF, price board.
// Référence interne seulement : jamais sur le devis client.
window.LbasDessin = (function () {
'use strict';
// ───────────── outils SVG ─────────────
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, texte) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (texte != null) e.textContent = texte;
  if (parent) parent.appendChild(e);
  return e;
}
// cotes en pouces et huitièmes, comme sur le terrain : 23 3/8"
const fr = n => { const h = Math.round((+n || 0) * 8) / 8, e = Math.floor(h), f = Math.round((h - e) * 8);
  return e + (f ? ' ' + ({ 1: '1/8', 2: '1/4', 3: '3/8', 4: '1/2', 5: '5/8', 6: '3/4', 7: '7/8' })[f] : '') + '"'; };
const NOIR = '#1b2a2e', BLEU = '#1d6fa3', GRIS = '#8a9a9c', ROUGE = '#c0392b', TEAL = '#138f8f';

// Cote horizontale (flèches + texte)
function coteH(g, x1, x2, y, texte, dy) {
  dy = dy || 0;
  el('line', { x1, y1: y, x2, y2: y, stroke: BLEU, 'stroke-width': 1, 'marker-start': 'url(#fl)', 'marker-end': 'url(#fl)' }, g);
  el('line', { x1, y1: y - 6, x2: x1, y2: y + 6, stroke: BLEU, 'stroke-width': 0.8 }, g);
  el('line', { x1: x2, y1: y - 6, x2, y2: y + 6, stroke: BLEU, 'stroke-width': 0.8 }, g);
  const t = el('text', { x: (x1 + x2) / 2, y: y - 5 + dy, 'text-anchor': 'middle', 'font-size': 11, fill: BLEU, 'font-family': 'DM Mono, monospace' }, g, texte);
  return t;
}
function coteV(g, x, y1, y2, texte) {
  el('line', { x1: x, y1, x2: x, y2, stroke: BLEU, 'stroke-width': 1, 'marker-start': 'url(#fl)', 'marker-end': 'url(#fl)' }, g);
  el('line', { x1: x - 6, y1, x2: x + 6, y2: y1, stroke: BLEU, 'stroke-width': 0.8 }, g);
  el('line', { x1: x - 6, y1: y2, x2: x + 6, y2, stroke: BLEU, 'stroke-width': 0.8 }, g);
  el('text', { x: x - 6, y: (y1 + y2) / 2, 'text-anchor': 'middle', 'font-size': 11, fill: BLEU, 'font-family': 'DM Mono, monospace',
    transform: `rotate(-90 ${x - 6} ${(y1 + y2) / 2})` }, g, texte);
}
function texte(g, x, y, t, o) {
  o = o || {};
  return el('text', { x, y, 'font-size': o.size || 10, fill: o.fill || NOIR, 'text-anchor': o.anchor || 'start',
    'font-weight': o.bold ? 700 : 400, 'font-family': o.mono ? 'DM Mono, monospace' : 'DM Sans, Arial, sans-serif' }, g, t);
}

// Feuille DA : zone de dessin + notes + cartouche
let NOTES_EXTRA = [];   // notes du relevé (mesure finale, division, cadrage…) ajoutées à chaque dessin
let DETAILS = [];       // tout ce qui a été choisi au price board (« Entête : Cassette carrée », « Base : … »)
const CALC = '\u200b'; // marque une note calculée par le dessin (panneaux, empilement…) : gardée en plus des choix du board
// Descriptif du board ou de la ligne → une note par choix
function detailsDe(txt) {
  if (!txt) return [];
  return String(txt).split(/\s*\|\s*|\n|,\s*(?=[A-ZÉÈÀÔ][^,:]{1,40}\s:)/).map(x => x.trim()).filter(x => x && !/^(Largeur|Hauteur|Dimensions?|Mesures?|Prix|PDSF|Grille|Qt[ée])\b/i.test(x));
}
function feuille(svg, W, H, info, notes) {
  if (DETAILS.length) notes = DETAILS.concat(notes.filter(n => n && (n[0] === CALC || n[0] === '⚠')));
  notes = notes.concat(NOTES_EXTRA || []).filter(Boolean).map(n => String(n).replace(CALC, ''));
  const defs = el('defs', {}, svg);
  const m = el('marker', { id: 'fl', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0,2 L5,5 L0,8', fill: 'none', stroke: BLEU, 'stroke-width': 1.4 }, m);
  const hach = el('pattern', { id: 'hach', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#c9d3d4', 'stroke-width': 1 }, hach);
  const filet = el('pattern', { id: 'filet', width: 7, height: 7, patternUnits: 'userSpaceOnUse' }, defs);
  el('path', { d: 'M0,0 L7,7 M7,0 L0,7', stroke: '#9aa9ab', 'stroke-width': 0.7 }, filet);

  el('rect', { x: 4, y: 4, width: W - 8, height: H - 8, fill: '#fff', stroke: NOIR, 'stroke-width': 1.2 }, svg);
  if (info && info.qte) {   // une page par type : la quantité en gros, les repères du plan dessous
    el('rect', { x: 14, y: 14, width: 104, height: 34, rx: 5, fill: TEAL }, svg);
    texte(svg, 66, 37, 'QTÉ ' + info.qte, { anchor: 'middle', size: 17, bold: true, fill: '#fff' });
    if (info.reperes) String(info.reperes).split('\n').slice(0, 3).forEach((l, i) => texte(svg, 16, 62 + i * 12, l.length > 70 ? l.slice(0, 69) + '…' : l, { size: 9, fill: GRIS, mono: true }));
  }
  // Cartouche (bas)
  const cy = H - 74;
  el('line', { x1: 4, y1: cy, x2: W - 4, y2: cy, stroke: NOIR, 'stroke-width': 1 }, svg);
  const cols = [0, 0.38, 0.62, 0.82, 1].map(f => 4 + f * (W - 8));
  cols.slice(1, -1).forEach(x => el('line', { x1: x, y1: cy, x2: x, y2: H - 4, stroke: NOIR, 'stroke-width': 0.8 }, svg));
  texte(svg, cols[0] + 10, cy + 20, 'GROUPE TEKSTIL INC.', { bold: true, size: 12 });
  texte(svg, cols[0] + 10, cy + 36, '2, boul. du Curé-Labelle, bureau 300, Sainte-Thérèse', { size: 9, fill: GRIS });
  texte(svg, cols[0] + 10, cy + 50, 'Dessin d\'atelier (DA) — non à l\'échelle', { size: 9, fill: GRIS });
  [[1, 'PROJET', info.projet], [2, 'PRODUIT', info.produit], [3, 'N° / RÉV.', info.no]].forEach(([i, l, v]) => {
    texte(svg, cols[i] + 8, cy + 16, l, { size: 8, fill: GRIS });
    const max = Math.max(10, Math.floor((cols[i + 1] - cols[i] - 14) / 6.2));   // le texte reste dans sa case
    const lignes = [];
    String(v).split('\n').forEach(l => { let r = ''; String(l).split(' ').forEach(m => { if ((r + ' ' + m).trim().length > max && r) { lignes.push(r.trim()); r = ''; } r += ' ' + m; }); lignes.push(r.trim()); });
    lignes.slice(0, 3).forEach((ligne, k) => texte(svg, cols[i] + 8, cy + 32 + k * 13, ligne.length > max ? ligne.slice(0, max - 1) + '…' : ligne, { size: 10, bold: k === 0 }));
  });
  // Notes (colonne de droite)
  const nx = W - 196;
  el('line', { x1: nx, y1: 4, x2: nx, y2: cy, stroke: NOIR, 'stroke-width': 0.8 }, svg);
  texte(svg, nx + 10, 22, 'NOTES', { bold: true, size: 10 });
  // beaucoup de choix = texte plus petit, pour que tout tienne dans la colonne
  const couper = (n, max) => { const out = []; let l = ''; String(n).split(' ').forEach(m => { if ((l + ' ' + m).trim().length > max && l) { out.push(l.trim()); l = ''; } l += ' ' + m; }); out.push(l.trim()); return out; };
  const place = cy - 44;
  const [taille, max, pas, ecart] = [[9.5, 30, 13, 6], [8.5, 34, 11, 4], [7.5, 39, 9.5, 3], [6.5, 44, 8.2, 2]]
    .find(([, mx, p, e]) => notes.reduce((t, n) => t + couper(n, mx).length * p + e, 0) <= place) || [6.5, 44, 8.2, 2];
  let y = 40;
  notes.forEach(n => {
    couper(n, max).forEach(l => { if (y < cy - 6) texte(svg, nx + 10, y, l, { size: taille, fill: n.startsWith('⚠') ? ROUGE : NOIR }); y += pas; });
    y += ecart;
  });
  return { x: 14, y: 14, w: nx - 28, h: cy - 28 };   // zone de dessin
}

// Mise à l'échelle d'un objet en pouces dans la zone de dessin
function echelle(zone, largPo, hautPo, marge) {
  marge = marge || 60;
  const s = Math.min((zone.w - marge * 2) / largPo, (zone.h - marge * 2) / hautPo);
  const w = largPo * s, h = hautPo * s;
  return { s, x0: zone.x + (zone.w - w) / 2 + 10, y0: zone.y + (zone.h - h) / 2, w, h };
}

// ───────────── 1. PERSIENNE ─────────────
function dessinPersienne(svg, p) {
  const W = 760, H = 520; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
  const nb = p.panneaux, cfg = p.config.toUpperCase().replace(/\s/g, '').split('');
  const lp = p.larg / nb;
  const notes = [
    `${p.modele} · ${p.systeme}`,
    CALC + `${nb} panneaux de ${fr(lp)} (max 30")`,
    `Configuration : ${p.config}`,
    `Pose ${p.pose} · cadrage ${p.cadrage}`,
    `Charnières ${p.charnieres}`,
    p.barre ? CALC + `Barre centrale à ${fr(p.hBarre)} du bas` : (p.haut > 60 ? '⚠ Barre centrale fortement recommandée (> 60")' : 'Sans barre centrale'),
    'Lamelles : sens d\'ouverture selon flèches.'
  ];
  const z = feuille(svg, W, H, p.info || { projet: 'Résidence Tremblay\nSalon — fenêtre 2', produit: 'Persienne bois\nPersienne Design', no: 'S01234-L3\nRév. 0' }, notes);
  const e = echelle(z, p.larg, p.haut, 54);
  const g = el('g', {}, svg);
  const c = 7;   // épaisseur du cadre (px)
  el('rect', { x: e.x0 - c, y: e.y0 - c, width: e.w + 2 * c, height: e.h + 2 * c, fill: 'url(#hach)', stroke: NOIR, 'stroke-width': 1.2 }, g);
  el('rect', { x: e.x0, y: e.y0, width: e.w, height: e.h, fill: '#fff', stroke: NOIR, 'stroke-width': 1 }, g);
  for (let i = 0; i < nb; i++) {
    const x = e.x0 + i * lp * e.s, w = lp * e.s;
    el('rect', { x: x + 1.5, y: e.y0 + 1.5, width: w - 3, height: e.h - 3, fill: '#f6f8f8', stroke: NOIR, 'stroke-width': 1 }, g);
    // lamelles
    const yb = p.barre ? e.y0 + e.h - p.hBarre * e.s : null;
    const pas = Math.max(5, p.lamelle * e.s * 0.9);
    for (let y = e.y0 + 10; y < e.y0 + e.h - 8; y += pas) {
      if (yb && Math.abs(y - yb) < 8) continue;
      el('line', { x1: x + 8, y1: y, x2: x + w - 8, y2: y, stroke: '#b6c2c3', 'stroke-width': 1 }, g);
    }
    if (p.systeme === 'Baguette') el('line', { x1: x + w / 2, y1: e.y0 + 10, x2: x + w / 2, y2: e.y0 + e.h - 10, stroke: '#7c8b8d', 'stroke-width': 2 }, g);
    if (yb) el('rect', { x: x + 4, y: yb - 4, width: w - 8, height: 8, fill: '#dfe6e7', stroke: NOIR, 'stroke-width': 0.8 }, g);
    // côté charnières + flèche d'ouverture (G = s'ouvre depuis la gauche)
    const sens = cfg[i] || 'G';
    const xc = sens === 'D' ? x + w - 4 : x + 4;
    [0.15, 0.5, 0.85].slice(0, p.haut > 60 ? 3 : 2).forEach((f, k, arr) => {
      const yy = e.y0 + e.h * (arr.length === 2 ? [0.2, 0.8][k] : f);
      el('rect', { x: xc - 2, y: yy - 6, width: 4, height: 12, fill: p.charnieres === 'noires' ? '#222' : '#c9a227' }, g);
    });
    const ym = e.y0 + e.h * 0.5, dx = sens === 'D' ? -1 : 1;
    el('path', { d: `M${xc + dx * 8},${ym - 18} Q${xc + dx * (w * 0.55)},${ym} ${xc + dx * 8},${ym + 18}`, fill: 'none', stroke: TEAL, 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, g);
    texte(g, x + w / 2, e.y0 + e.h + 18, `P${i + 1} · ${sens}`, { anchor: 'middle', size: 9, fill: GRIS, mono: true });
    coteH(g, x, x + w, e.y0 - 24, fr(lp), 0);
  }
  coteH(g, e.x0, e.x0 + e.w, e.y0 + e.h + 40, `${fr(p.larg)} (largeur ${p.pose === 'intérieure' ? 'intérieure' : 'hors tout'})`);
  coteV(g, e.x0 - 26, e.y0, e.y0 + e.h, fr(p.haut));
  if (p.barre) coteV(g, e.x0 + e.w + 26, e.y0 + e.h - p.hBarre * e.s, e.y0 + e.h, fr(p.hBarre));
}

// ───────────── 2. STORES MULTIPLES SUR UN MÊME TOP ─────────────
function dessinStores(svg, p) {
  const W = 760, H = 520; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
  const largs = p.largs.slice(0, p.nb), total = largs.reduce((a, b) => a + b, 0);
  const notes = [
    CALC + `${p.nb} toile${p.nb > 1 ? 's' : ''} / 1 ${p.top}`,
    `Tissu : ${p.tissu}`,
    `Mécanisme : ${p.meca}`,
    p.base ? `Base : ${p.base}` : '',
    `Contrôles : ${p.cotes.slice(0, p.nb).join(' · ')}`,
    p.nb > 1 ? CALC + 'Largeur de chaque toile = mesure de commande ; jeu entre toiles selon fabricant.' : '',
    p.nb > 1 ? CALC + 'Une seule cassette sur toute la largeur.' : ''
  ].filter(Boolean);
  const z = feuille(svg, W, H, p.info || { projet: 'Bureaux Desjardins\nSalle B-204', produit: 'Toile à rouleau\nVP / SOL-R', no: 'S01250-L1\nRév. 0' }, notes);
  const hTop = 5;
  const e = echelle(z, total, p.haut + hTop, 54);
  const g = el('g', {}, svg);
  el('rect', { x: e.x0, y: e.y0, width: e.w, height: hTop * e.s, fill: '#d8e1e2', stroke: NOIR, 'stroke-width': 1.2 }, g);
  texte(g, e.x0 + e.w / 2, e.y0 + hTop * e.s / 2 + 4, p.top.toUpperCase(), { anchor: 'middle', size: 9, bold: true });
  let x = e.x0;
  largs.forEach((l, i) => {
    const w = l * e.s, y = e.y0 + hTop * e.s, h = p.haut * e.s;
    el('rect', { x: x + 2, y, width: w - 4, height: h, fill: 'rgba(19,143,143,0.08)', stroke: TEAL, 'stroke-width': 1 }, g);
    el('rect', { x: x + 2, y: y + h - 6, width: w - 4, height: 6, fill: '#9fb0b2' }, g);   // barre de charge (base)
    if (p.base && i === 0) texte(g, x + w / 2, y + h - 10, 'BASE : ' + String(p.base).toUpperCase().slice(0, 34), { anchor: 'middle', size: 8, bold: true, fill: '#55656a' });
    texte(g, x + w / 2, y + h / 2, `Toile ${i + 1}`, { anchor: 'middle', size: 11, bold: true, fill: TEAL });
    // chaînette
    const cote = (p.cotes[i] || 'D');
    const xc = cote === 'G' ? x + 8 : x + w - 8;
    el('line', { x1: xc, y1: y + 4, x2: xc, y2: y + h * 0.55, stroke: NOIR, 'stroke-width': 1, 'stroke-dasharray': '1.5 2.5' }, g);
    texte(g, xc, y + h * 0.55 + 12, cote, { anchor: 'middle', size: 9, mono: true });
    coteH(g, x, x + w, e.y0 - 14, fr(l));
    x += w;
  });
  coteH(g, e.x0, e.x0 + e.w, e.y0 + e.h + 26, `${fr(total)} hors tout`);
  coteV(g, e.x0 - 26, e.y0 + hTop * e.s, e.y0 + e.h, fr(p.haut));
}

// ───────────── 3. RIDEAU DÉCORATIF (Ripple Fold) ─────────────
// Vue de dessus d'un rail de rideau courbé : n courbes de l'angle choisi ; segments en proportion si on n'a pas leurs longueurs
function vueDessusRail(svg, box, p) {
  const g = el('g', {}, svg);
  el('line', { x1: box.x, y1: box.y + 4, x2: box.x, y2: box.y + box.h - 4, stroke: GRIS, 'stroke-width': 0.6, 'stroke-dasharray': '3 3' }, g);
  texte(g, box.x + 12, box.y + 14, 'VUE DE DESSUS — RAIL', { size: 9, bold: true, fill: GRIS });
  const n = p.courbes, deg = p.angleCourbe || 90, L = p.larg || 100;
  let segs = p.segments && p.segments.length === n + 1 ? p.segments.slice() : null;
  const schema = !segs;
  if (!segs) {
    if (n === 1) segs = [L * 0.55, L * 0.45];
    else { const bout = L * 0.2, milieu = (L - 2 * bout) / (n - 1); segs = [bout].concat(Array(n - 1).fill(milieu), [bout]); }
  }
  const tour = deg * Math.PI / 180;
  let dir = -n * tour / 2, pts = [{ x: 0, y: 0 }];
  segs.forEach((l, i) => { const a = pts[pts.length - 1]; pts.push({ x: a.x + Math.cos(dir) * l, y: a.y + Math.sin(dir) * l }); dir += tour; });
  const xs = pts.map(q => q.x), ys = pts.map(q => q.y);
  const minX = Math.min(...xs), minY = Math.min(...ys), w = Math.max(...xs) - minX || 1, h = Math.max(...ys) - minY || 1;
  const k = Math.min((box.w - 70) / w, (box.h - 110) / h);
  const ox = box.x + (box.w - w * k) / 2 - minX * k, oy = box.y + 40 + (box.h - 110 - h * k) / 2 - minY * k;
  const P = pts.map(q => ({ x: ox + q.x * k, y: oy + q.y * k }));
  el('polyline', { points: P.map(q => q.x + ',' + q.y).join(' '), fill: 'none', stroke: NOIR, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
  segs.forEach((l, i) => {
    const a = P[i], b = P[i + 1], nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny) || 1;
    texte(g, (a.x + b.x) / 2 - nx / nl * 14, (a.y + b.y) / 2 - ny / nl * 14 + 4, (schema ? '≈ ' : '') + fr(l), { anchor: 'middle', size: 10, fill: BLEU, mono: true });
  });
  P.slice(1, -1).forEach(q => { el('circle', { cx: q.x, cy: q.y + 16, r: 12, fill: '#fff', stroke: TEAL, 'stroke-width': 1.4 }, g); texte(g, q.x, q.y + 20, deg + '°', { anchor: 'middle', size: 9, bold: true, fill: TEAL, mono: true }); });
  texte(g, box.x + box.w / 2, box.y + box.h - 30, 'Rail ' + fr(L) + ' · ' + n + ' courbe' + (n > 1 ? 's' : '') + ' de ' + deg + '°', { anchor: 'middle', size: 9.5, bold: true });
  if (schema) texte(g, box.x + box.w / 2, box.y + box.h - 16, 'Longueur de chaque segment : à confirmer au relevé', { anchor: 'middle', size: 8.5, fill: ROUGE });
}
function dessinRideau(svg, p) {
  const W = 760, H = 520; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
  const notes = [
    `${p.ouverture} · ${p.confection}`,
    `Tissu : ${p.tissu}`,
    `Rail : ${p.rail} · fixation ${p.fixation}`,
    CALC + `Empilement ≈ ${fr(p.larg * p.stackPct / 100)} au total`,
    p.courbes ? CALC + `Rail courbé : ${p.courbes} courbe${p.courbes > 1 ? 's' : ''} de ${p.angleCourbe}° (vue de dessus)` : '',
    `Dégagement au sol : ${fr(p.sol)}`,
    `Retours : ${fr(p.retour)} de chaque côté`
  ];
  const z = feuille(svg, W, H, p.info || { projet: 'Hôtel Saint-Sauveur\nLobby — mur est', produit: 'Rideau Ripple Fold\nNormandie', no: 'S01261-L2\nRév. 0' }, notes);
  let zr = z;
  if (p.courbes > 0) { zr = Object.assign({}, z, { w: z.w * 0.58 }); vueDessusRail(svg, { x: z.x + z.w * 0.58, y: z.y, w: z.w * 0.42, h: z.h }, p); }
  const hTot = p.haut + p.sol + 4;
  const e = echelle(zr, p.larg + 2 * p.retour, hTot, 54);
  const g = el('g', {}, svg);
  const xr = e.x0 + p.retour * e.s, wr = p.larg * e.s;
  // plafond et sol
  el('line', { x1: e.x0 - 20, y1: e.y0, x2: e.x0 + e.w + 20, y2: e.y0, stroke: NOIR, 'stroke-width': 2 }, g);
  texte(g, e.x0 - 18, e.y0 - 6, p.fixation === 'au plafond' ? 'PLAFOND' : 'MUR', { size: 8, fill: GRIS });
  const ysol = e.y0 + (hTot) * e.s;
  el('line', { x1: e.x0 - 20, y1: ysol, x2: e.x0 + e.w + 20, y2: ysol, stroke: NOIR, 'stroke-width': 2 }, g);
  texte(g, e.x0 - 18, ysol + 12, 'SOL', { size: 8, fill: GRIS });
  // rail
  el('rect', { x: xr, y: e.y0 + 4, width: wr, height: 5, fill: '#5d6b6d' }, g);
  const yT = e.y0 + 4 * e.s, hR = p.haut * e.s;
  const nbPan = p.ouverture === 'Paire' ? 2 : 1;
  const largPan = (p.larg / nbPan) * e.s;
  for (let k = 0; k < nbPan; k++) {
    const x0 = xr + k * largPan;
    // ondulations Ripple Fold
    let d = `M${x0},${yT}`;
    const onde = Math.max(10, 4 * e.s);
    for (let x = x0; x < x0 + largPan - 1; x += onde) d += ` q${onde / 4},8 ${onde / 2},0 q${onde / 4},-8 ${onde / 2},0`;
    el('path', { d, fill: 'none', stroke: '#7a5c3e', 'stroke-width': 1.2 }, g);
    el('rect', { x: x0 + 1, y: yT + 2, width: largPan - 2, height: hR - 2, fill: 'rgba(122,92,62,0.10)', stroke: '#7a5c3e', 'stroke-width': 1 }, g);
    for (let x = x0 + onde / 2; x < x0 + largPan - 2; x += onde) el('line', { x1: x, y1: yT + 6, x2: x, y2: yT + hR - 2, stroke: 'rgba(122,92,62,0.25)', 'stroke-width': 1 }, g);
    texte(g, x0 + largPan / 2, yT + hR / 2, nbPan === 2 ? (k ? 'Panneau D' : 'Panneau G') : 'Panneau unique', { anchor: 'middle', size: 11, bold: true, fill: '#7a5c3e' });
  }
  // flèches d'ouverture
  if (nbPan === 2) {
    el('path', { d: `M${xr + wr / 2 - 12},${yT + hR * 0.75} h-60`, stroke: TEAL, 'stroke-width': 1.4, 'marker-end': 'url(#fl)', fill: 'none' }, g);
    el('path', { d: `M${xr + wr / 2 + 12},${yT + hR * 0.75} h60`, stroke: TEAL, 'stroke-width': 1.4, 'marker-end': 'url(#fl)', fill: 'none' }, g);
  }
  coteH(g, xr, xr + wr, ysol + 26, `${fr(p.larg)} rail`);
  coteV(g, e.x0 - 30, yT, yT + hR, fr(p.haut));
  coteV(g, xr + wr + 30, yT + hR, ysol, fr(p.sol));
}

// ───────────── 4. RIDEAU MÉDICAL (Meditrack + filet) ─────────────
function dessinMedical(svg, p) {
  const W = 760, H = 560; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
  const dev = p.forme === 'En L' ? p.a + p.b : p.forme === 'En U' ? p.a + 2 * p.b : p.a;
  const largRideau = dev * 1.1;
  const notes = [
    `Rail Meditrack ${p.forme} : ${fr(p.a)}${p.forme !== 'Droit' ? ' × ' + fr(p.b) : ''}`,
    CALC + `Développé ≈ ${fr(dev)} · rideau ≈ ${fr(largRideau)} (+10 %)`,
    `Filet ${fr(p.filet)} en haut (exigence incendie : gicleurs)`,
    `Tissu : ${p.tissu} · ${fr(p.hTissu)}`,
    `Espace au sol : ${fr(p.sol)}`,
    CALC + `Plafond à ${fr(p.plafond)} · ${Math.ceil(dev / 6)} chariots env.`,
    p.plafond - p.filet - p.hTissu - p.sol - 2 !== 0 ? `⚠ Écart de ${fr(p.plafond - p.filet - p.hTissu - p.sol - 2)} à corriger (plafond ≠ total)` : 'Hauteurs : total = plafond ✔'
  ];
  const z = feuille(svg, W, H, p.info || { projet: 'CISSS Laurentides\nUrgence — civière 7', produit: 'Rideau médical\nSignature / Meditrack', no: 'S01270-L5\nRév. 0' }, notes);
  const g = el('g', {}, svg);
  // Vue de dessus (en haut à gauche)
  const vW = z.w * 0.42, vH = (z.h - 30) * 0.95;
  texte(g, z.x + 8, z.y + 12, 'VUE DE DESSUS — RAIL', { size: 9, bold: true, fill: GRIS });
  const sTop = Math.min((vW - 70) / Math.max(p.a, p.b), (vH - 90) / Math.max(p.a, p.b));
  const ox = z.x + 40, oy = z.y + 50;
  let d = '';
  if (p.forme === 'Droit') d = `M${ox},${oy} h${p.a * sTop}`;
  else if (p.forme === 'En L') d = `M${ox},${oy + p.b * sTop} V${oy + 10} q0,-10 10,-10 H${ox + p.a * sTop}`;
  else d = `M${ox},${oy + p.b * sTop} V${oy + 10} q0,-10 10,-10 H${ox + p.a * sTop - 10} q10,0 10,10 V${oy + p.b * sTop}`;
  el('rect', { x: ox + 12, y: oy + 14, width: p.a * sTop * 0.6, height: Math.max(20, (p.forme === 'Droit' ? 0.4 * p.a : p.b) * sTop * 0.7), fill: '#eef2f2', stroke: GRIS, 'stroke-dasharray': '3 3' }, g);
  texte(g, ox + 12 + p.a * sTop * 0.3, oy + 32, 'civière', { anchor: 'middle', size: 9, fill: GRIS });
  el('path', { d, fill: 'none', stroke: NOIR, 'stroke-width': 3 }, g);
  coteH(g, ox, ox + p.a * sTop, oy - 14, fr(p.a));
  if (p.forme !== 'Droit') coteV(g, ox - 18, oy, oy + p.b * sTop, fr(p.b));

  // Élévation (à droite)
  const ex = z.x + vW + 30, ew = z.w - vW - 40;
  texte(g, ex, z.y + 12, 'ÉLÉVATION', { size: 9, bold: true, fill: GRIS });
  const s = (z.h - 60) / p.plafond;
  const y0 = z.y + 30, ws = Math.min(ew - 60, 170);
  const x0 = ex + 40;
  el('line', { x1: x0 - 20, y1: y0, x2: x0 + ws + 20, y2: y0, stroke: NOIR, 'stroke-width': 2 }, g);
  texte(g, x0 - 20, y0 - 5, 'PLAFOND', { size: 8, fill: GRIS });
  el('rect', { x: x0, y: y0 + 1, width: ws, height: 2 * s, fill: '#5d6b6d' }, g);
  let y = y0 + 2 * s;
  el('rect', { x: x0, y, width: ws, height: p.filet * s, fill: 'url(#filet)', stroke: GRIS, 'stroke-width': 0.8 }, g);
  texte(g, x0 + ws / 2, y + p.filet * s / 2 + 3, 'FILET', { anchor: 'middle', size: 9, bold: true, fill: '#55656a' });
  coteV(g, x0 + ws + 26, y, y + p.filet * s, fr(p.filet));
  y += p.filet * s;
  el('rect', { x: x0, y, width: ws, height: p.hTissu * s, fill: 'rgba(29,111,163,0.12)', stroke: BLEU, 'stroke-width': 1 }, g);
  for (let x = x0 + 12; x < x0 + ws; x += 14) el('line', { x1: x, y1: y + 2, x2: x, y2: y + p.hTissu * s - 2, stroke: 'rgba(29,111,163,0.25)' }, g);
  texte(g, x0 + ws / 2, y + p.hTissu * s / 2, 'TISSU', { anchor: 'middle', size: 10, bold: true, fill: BLEU });
  coteV(g, x0 + ws + 26, y, y + p.hTissu * s, fr(p.hTissu));
  y += p.hTissu * s;
  const ysol = y0 + p.plafond * s;
  el('line', { x1: x0 - 20, y1: ysol, x2: x0 + ws + 20, y2: ysol, stroke: NOIR, 'stroke-width': 2 }, g);
  texte(g, x0 - 20, ysol + 12, 'SOL', { size: 8, fill: GRIS });
  coteV(g, x0 + ws + 26, y, ysol, fr(p.sol));
  coteV(g, x0 - 26, y0, ysol, fr(p.plafond));
}

// ───────────── 5. RAIL (vue de dessus, longueurs + angles) ─────────────
function dessinRail(svg, p) {
  const W = 760, H = 520; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
  const segs = p.segments.filter(s => s > 0), total = segs.reduce((a, b) => a + b, 0);
  const notes = [p.produit || 'Rail', `Longueur totale : ${fr(total)}`, `${segs.length} segment(s)` + (p.angles.length ? ' · courbes : ' + p.angles.map(a => a + '°').join(', ') : ''), 'Vue de dessus, cotes au centre du rail.'].concat(p.notes || []);
  const z = feuille(svg, W, H, p.info, notes);
  const g = el('g', {}, svg);
  // tracé : on suit les segments avec les angles relevés sur le plan (directions réelles si fournies)
  let pts = [{ x: 0, y: 0 }];
  if (p.dirs && p.dirs.length === segs.length) segs.forEach((l, i) => { const a = pts[pts.length - 1]; pts.push({ x: a.x + Math.cos(p.dirs[i]) * l, y: a.y + Math.sin(p.dirs[i]) * l }); });
  else { let dir = 0; segs.forEach((l, i) => { const a = pts[pts.length - 1]; pts.push({ x: a.x + Math.cos(dir) * l, y: a.y + Math.sin(dir) * l }); dir += Math.PI / 2; }); }
  const xs = pts.map(q => q.x), ys = pts.map(q => q.y);
  const minX = Math.min(...xs), minY = Math.min(...ys), w = Math.max(...xs) - minX || 1, h = Math.max(...ys) - minY || 1;
  const s = Math.min((z.w - 140) / w, (z.h - 140) / h, 40);
  const ox = z.x + (z.w - w * s) / 2 - minX * s, oy = z.y + (z.h - h * s) / 2 - minY * s;
  const P = pts.map(q => ({ x: ox + q.x * s, y: oy + q.y * s }));
  el('polyline', { points: P.map(q => q.x + ',' + q.y).join(' '), fill: 'none', stroke: NOIR, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
  P.forEach(q => el('circle', { cx: q.x, cy: q.y, r: 3.5, fill: '#fff', stroke: NOIR, 'stroke-width': 1.5 }, g));
  segs.forEach((l, i) => {
    const a = P[i], b = P[i + 1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny) || 1;
    texte(g, mx + nx / nl * 16, my + ny / nl * 16 + 4, fr(l), { anchor: 'middle', size: 11, fill: BLEU, mono: true });
  });
  p.angles.forEach((deg, k) => { const q = P[k + 1]; if (!q) return; el('circle', { cx: q.x + 18, cy: q.y - 16, r: 13, fill: '#fff', stroke: TEAL, 'stroke-width': 1.5 }, g); texte(g, q.x + 18, q.y - 12, deg + '°', { anchor: 'middle', size: 9.5, bold: true, fill: TEAL, mono: true }); });
}

// ───────────── 6. GÉNÉRIQUE (cadre L × H, ou compte) ─────────────
function dessinCadre(svg, p) {
  const W = 760, H = 520; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
  const z = feuille(svg, W, H, p.info, [p.produit || 'Produit'].concat(p.notes || []));
  const g = el('g', {}, svg);
  if (!(p.larg > 0 && p.haut > 0)) { texte(g, z.x + z.w / 2, z.y + z.h / 2, p.compte ? 'Article compté (pas de mesure)' : 'Mesure à venir', { anchor: 'middle', size: 13, fill: GRIS }); return; }
  const e = echelle(z, p.larg, p.haut, 54);
  el('rect', { x: e.x0, y: e.y0, width: e.w, height: e.h, fill: 'rgba(19,143,143,0.08)', stroke: TEAL, 'stroke-width': 1.4 }, g);
  coteH(g, e.x0, e.x0 + e.w, e.y0 + e.h + 26, fr(p.larg));
  coteV(g, e.x0 - 26, e.y0, e.y0 + e.h, fr(p.haut));
}

// ───────────── Du produit (config du price board ou catégorie) aux paramètres du dessin ─────────────
// Base (barre du bas) : le texte du descriptif du price board si on l'a (« Base : Base Carrée régulière »), sinon l'option
const BASES = { carree: 'carrée', ronde: 'ronde', ovale: 'ovale', 'base-reguliere': 'régulière', 'zm-tissu': 'ZM recouverte de tissu', simple: 'simple' };
function choix(o, re) {
  const d = Array.isArray(o.details) ? o.details : detailsDe(o.details);
  const x = d.find(v => re.test(v));
  return x ? x.split(/\s:\s/).slice(1).join(' : ').trim() : '';
}
function baseDe(o, op) {
  const ch = choix(o, /^Base\s*:/i);
  if (ch) return ch;
  const txt = String(o.produit || '') + ' ' + String((o.config || {}).description || '');
  const m = txt.match(/Base\s*:\s*([^,|\n]+)/i);
  if (m) return m[1].trim();
  const v = op.base || op.barre || op.solrBase || op.romainBase || op.eliteBase || '';
  return v ? (BASES[v] || lisible(v)) : '';
}
// Courbes d'un rail de rideau : « Courbes de rail » du board (90°/45° × quantité) ou accessoire « courbe » des rails Signature
function courbesDe(op, o) {
  const acc = op.normRailAcc || {};
  const n = parseInt(acc['ks-courbe'], 10) || parseInt(acc['sig-courbe'], 10) || parseInt(acc['sig-courbe-k'], 10) || parseInt(acc['sig-arch-courbe'], 10) || parseInt(acc['sig-medi-courbe'], 10) || 0;
  const deg = parseInt(acc['courbe-type'], 10) || 90;
  return n > 0 ? { courbes: n, angleCourbe: deg, segments: o.segments && o.segments.length === n + 1 ? o.segments : null } : { courbes: 0 };
}
const lisible = v => String(v || '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
function sensPanneaux(txt, nb) {
  const t = String(txt || '').toUpperCase();
  let out = [];
  t.replace(/(\d+)\s*(G|D|L|R|GAUCHE|DROITE)/g, (m, n, c) => { for (let i = 0; i < +n; i++) out.push(/^(G|L)/.test(c) ? 'G' : 'D'); });
  if (!out.length) { const m = t.replace(/[^GDLR]/g, ''); if (m.length === nb) out = m.split('').map(c => (c === 'L' || c === 'G') ? 'G' : 'D'); }
  if (out.length !== nb) { out = []; for (let i = 0; i < nb; i++) out.push(i < Math.ceil(nb / 2) ? 'G' : 'D'); }
  return out.join('');
}
function famille(o) {
  const c = o.config || {}, st = c.state || {};
  const f = c.fournisseur || st.fournisseur, ty = c.type || st.type;
  if (f === 'pd' || o.cat === 'persienne') return 'persienne';
  if (f === 'vtx' || o.cat === 'medical') return 'medical';
  if (o.cat === 'rail') return 'rail';
  if (/^(norm-rideau|sig-)/.test(ty || '') || o.cat === 'rideau') return 'rideau';
  if (o.cat === 'moteur' || o.cat === 'accessoire') return 'compte';
  if (f || o.cat === 'store') return 'store';
  return 'cadre';
}
function parametres(o) {
  const c = o.config || {}, st = c.state || {}, op = st.options || {};
  const larg = +o.larg || +st.larg || 0, haut = +o.haut || +st.haut || 0;
  const modele = c.modele || st.modele || c.tissuNom || '';
  const couleur = c.couleur || st.couleur || c.tissuCouleur || '';
  const produit = [modele, couleur].filter(Boolean).join(' · ') || o.produit || '';
  const fam = famille(o), info = o.info || { projet: '', produit: '', no: '' };
  if (fam === 'persienne') {
    const nb = Math.max(1, +st.peNb || (Math.ceil(larg / 30) + (parseInt(op.pePanneauxExtra, 10) || 0)));
    return { fam, p: { info, larg, haut, panneaux: nb, config: sensPanneaux(op.peConfig, nb), modele: modele || 'Persienne', systeme: lisible(op.systeme) || 'Vision',
      pose: op.pePose === 'exterieure' ? 'extérieure' : 'intérieure', cadrage: lisible(op.cadrage) || '—', charnieres: op.peCharniere === 'noir' || op.peCharniere === 'noires' ? 'noires' : (lisible(op.peCharniere) || 'blanches'),
      barre: op.peBarre === 'oui', hBarre: parseFloat(String(op.peBarreHauteur || '').replace(',', '.')) || haut / 2, lamelle: parseFloat(String(modele).replace('½', '.5').match(/(\d+(\.\d+)?)\s*"/) ? String(modele).replace('½', '.5').match(/(\d+(\.\d+)?)\s*"/)[1] : 2.5) || 2.5 } };
  }
  if (fam === 'rideau') {
    const fin = String(op.normFinition || ''), rf = fin.match(/^rf(\d+)/);
    return { fam, p: { info, larg, haut, ouverture: /^paire/.test(op.normDivision || '') ? 'Paire' : 'Simple', confection: rf ? `Ripple Fold ${rf[1]} %` : (lisible(fin) || 'Confection'),
      tissu: [modele, st.normCollection].filter(Boolean).join(' · ') || produit || '—', rail: lisible(op.normRailSys) || '—', fixation: op.normMoto && op.normMoto.montage === 'mur' ? 'au mur' : 'au plafond',
      sol: 0.5, retour: parseFloat(op.normRetour) || 0, stackPct: 20, ...courbesDe(op, o) } };
  }
  if (fam === 'medical') {
    const segs = (o.segments || []).filter(s => s > 0);
    const forme = segs.length >= 3 ? 'En U' : segs.length === 2 ? 'En L' : (op.vtxAngleType && op.vtxAngleType !== 'non' ? (/u/i.test(op.vtxAngleType) ? 'En U' : 'En L') : 'Droit');
    const a = segs.length >= 3 ? segs[1] : segs[0] || larg || 60, b = segs.length >= 3 ? Math.max(segs[0], segs[2]) : segs[1] || (forme === 'Droit' ? 0 : a / 2);
    const filet = op.vtxFilet === false ? 0 : 20, hTissu = haut || 72, sol = 12;
    return { fam, p: { info, forme, a, b, filet, hTissu, sol, plafond: filet + hTissu + sol + 2, tissu: lisible(op.vtxTissu) || produit || '—' } };
  }
  if (fam === 'rail') return { fam, p: { info, produit, segments: o.segments || [larg], angles: o.angles || [], dirs: o.dirs } };
  if (fam === 'store') {
    const mult = String(op.multiple || '1x1').match(/^(\d+)/);
    const nb = o.parts && o.parts.length ? o.parts.length : Math.max(1, mult ? +mult[1] : 1);   // fenêtre divisée : une toile par partie
    const cote = /gauche/i.test(op.cote || op.solrCote || '') ? 'G' : 'D';
    return { fam, p: { info, nb, largs: o.parts && o.parts.length ? o.parts.slice() : Array(nb).fill(larg / nb), haut, top: choix(o, /^Ent[êe]te\s*:/i) || lisible(op.entete || op.solrEntete || (st.type === 'norm-romain' ? 'tête romaine' : 'entête')),
      tissu: produit || '—', meca: lisible(op.mecanisme || op.solrMec || op.romainMeca) || '—', cotes: Array(nb).fill(cote), base: baseDe(o, op) } };
  }
  return { fam, p: { info, produit, larg, haut, compte: fam === 'compte', notes: o.notes } };
}
// Point d'entrée : LbasDessin.dessiner(svg, { config, cat, larg, haut, segments, angles, dirs, produit, info, notes })
function dessiner(svg, o) {
  const r = parametres(o);
  NOTES_EXTRA = r.fam === 'cadre' || r.fam === 'compte' ? [] : (o.notes || []);
  DETAILS = Array.isArray(o.details) ? detailsDe(o.details.join(' | ')) : detailsDe(o.details);
  try {
    if (r.fam === 'persienne') dessinPersienne(svg, r.p);
    else if (r.fam === 'rideau') dessinRideau(svg, r.p);
    else if (r.fam === 'medical') dessinMedical(svg, r.p);
    else if (r.fam === 'rail') dessinRail(svg, r.p);
    else if (r.fam === 'store' && r.p.haut > 0 && r.p.largs[0] > 0) dessinStores(svg, r.p);
    else dessinCadre(svg, Object.assign({ produit: o.produit }, r.p, { larg: o.larg, haut: o.haut }));
  } catch (e) { svg.innerHTML = ''; dessinCadre(svg, { info: r.p.info, produit: o.produit, larg: o.larg, haut: o.haut, notes: ['(dessin simplifié)'] }); }
  return r.fam;
}
// ── Mesures d'un tag du relevé (plan, ou finale d'Olivier si elle existe) → entrée du dessin ──
function mesurePlan(t, tag, k) { if (tag[k] != null) return tag[k]; const g = (t.groupes || []).find(x => x.id === tag.grp); return g && g[k] != null ? g[k] : null; }
function anglesPts(pts) {
  const out = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const v1x = b.x - a.x, v1y = b.y - a.y, v2x = c.x - b.x, v2y = c.y - b.y;
    const n = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y); if (!n) continue;
    let deg = Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / n))) * 180 / Math.PI;
    const std = [45, 90, 135, 180].find(x => Math.abs(deg - x) <= 5);
    deg = std != null ? std : Math.round(deg);
    if (deg >= 2) out.push(deg);
  }
  return out;
}
function entreeTag(D, t, tag, o) {
  o = o || {};
  const fin = (!o.plan && tag.fin) || {};
  const larg = fin.l != null ? fin.l : mesurePlan(t, tag, 'larg'), haut = fin.h != null ? fin.h : mesurePlan(t, tag, 'haut');
  let segments = [], dirs = [], angles = [];
  if (tag.poly && tag.poly.length > 1) {
    const e = (D.echelles || {})[tag.page] || 0, P = tag.poly;
    for (let i = 1; i < P.length; i++) { segments.push(Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y) * e); dirs.push(Math.atan2(P[i].y - P[i - 1].y, P[i].x - P[i - 1].x)); }
    angles = anglesPts(P);
    const tot = segments.reduce((a, b) => a + b, 0);
    if (fin.long && tot) segments = segments.map(x => x * fin.long / tot);   // longueur finale : mêmes proportions que le plan
  }
  const notes = [];
  if (fin.statut === 'divisee' && fin.parts && fin.parts.length) notes.push('Divisée en ' + fin.parts.length + ' : ' + fin.parts.map(fr).join(' + '));
  if (fin.cadrage) notes.push('Cadrage ' + fin.cadrage);
  if (fin.cote) notes.push('Mécanisme côté ' + fin.cote);
  if (fin.note) notes.push(fin.note);
  notes.push(fin.l != null || fin.long ? 'Mesure finale (prise sur place)' : 'Mesure du plan (à confirmer sur place)');
  return { config: t.pb_config || null, cat: t.cat, larg, haut, segments, angles, dirs, parts: fin.statut === 'divisee' ? fin.parts : null, details: t.pb_desc || t.desc || '',
           produit: t.desc || t.code, notes, info: o.info || { projet: '', produit: t.code + '\n' + libelle(t), no: tag.id || '' } };
}
// Nom court du produit d'un type : modèle et couleur du price board, sinon le descriptif
function libelle(t) { const c = t.pb_config || {}, st = c.state || {}; const m = [c.modele || st.modele || c.tissuNom, c.couleur || st.couleur].filter(Boolean).join(' · '); return (m || t.desc || '').slice(0, 60); }
return { dessiner, famille, parametres, entreeTag, mesurePlan, libelle, detailsDe };
})();
