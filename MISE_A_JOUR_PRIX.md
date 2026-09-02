# Mise à jour annuelle des prix — Price Board (rideaux Normandie)

Guide pour refaire les prix des 3 collections de tissus rideaux chaque année.
**Ne JAMAIS toucher la logique de calcul** (ripple fold, plis, laizes, motorisation,
`calculatePriceNorm`) — on remplace **seulement** les entrées de tissus dans le tableau
`NORM_CATALOG` de `index.html`.

## Les 3 collections, leurs fichiers et leur logique de prix

| Collection | Fichier fournisseur (xlsx) | Feuille | Le prix du fichier = | Formule `pdsf` |
|---|---|---|---|---|
| **Alendel** | `alendel wholesale <année>.xlsx` | **Tables 10, 11, 12** | notre **COÛT**/verge | `pdsf = coût × 2` |
| **Unique** | `Unique Fine Fabrics Wholesale Price List.xlsx` | **Table 3** | notre **COÛT**/verge | `pdsf = coût × 2` |
| **Simplicity** (Draperie Normandie + maison) | `Simplicity - Tissus Liste De Prix.xlsx` | **Table 3** | le **PDSF** (prix détail) | `pdsf = prix tel quel` (PAS de ×2 ; coût = pdsf ÷ 2) |

`pdsf` = le prix de vente stocké dans le board. `largeur` sert au calcul des laizes.

## Règles communes (toutes collections)
- **Toujours partir du xlsx (export Excel), jamais du PDF** : les PDF Alendel/Unique ont
  une police custom qui fausse la lecture texte (ex. Toronto lu 51,95 au lieu de 47,95).
- **Dédup par NOM** : un tissu présent dans plusieurs *sample books* au **même prix** = **une
  seule** entrée (la largeur est constante pour un nom donné). Si un même nom a **2 prix**
  différents = 2 produits → on ajoute la largeur au nom : `NOM (118")`.
- **Arrondi** : coût arrondi au **$ supérieur** (Alendel/Unique). Simplicity = prix détail
  tel quel (déjà en dollars ronds).
- **Nettoyage noms** : retirer le `*` final (marqueur fournisseur). Alendel = noms en
  MAJUSCULES ; Unique/Simplicity gardent leur casse d'origine.
- **Décodage garble Alendel** (export xlsx d'Alendel seulement) : le chiffre **9 s'écrit
  « G »** (34.G5 = 34,95) et **Q s'écrit « Ǫ »** → remplacer `G→9`, `Ǫ→Q`. Unique et
  Simplicity sont propres (pas de garble).
- **filsPlomb** = `true` si la composition (colonne Content) contient « Lead » ; sinon `false`.

## Colonnes par fichier
- **Alendel** (Tables 10-12) : A=Group, B=Sample Book, **C=PATTERN(nom)**, **D=prix**, **E=Width**, H=Content.
- **Unique** (Table 3) : **A=Pattern**, **B=Price/YD**, **C=Width**, D=Repeat, E=Content, F=Collection.
- **Simplicity** (Table 3) : **2 blocs côte à côte** — gauche **A=Pattern B=Largeur C=Prix Détail**, droite **D=Pattern E=Largeur F=Prix Détail**.

## Procédure
1. Recevoir les 3 xlsx à jour (exporter le PDF fournisseur en Excel via Acrobat si besoin).
2. Pour chaque collection : parser la bonne feuille → générer les lignes
   `{ nom:'…', pdsf:N, largeur:N, filsPlomb:bool, collection:'…' },` (voir la logique ci-dessus).
3. Dans `index.html` : retirer les anciennes lignes `collection: '<collection>'` et insérer les
   nouvelles juste après `const NORM_CATALOG = [`.
4. Vérifier : `node --check` sur le bloc, aucune ligne mal formée, aucune collision de nom.
5. Déployer (voir ci-dessous), puis `curl` le site live pour valider quelques tissus connus.

## Déploiement (IMPORTANT)
**Le `git push` NE marche PAS ici** (Git Credential Manager exige un login interactif).
On déploie **directement sur Netlify** :
```
cd ~/claude/priceboard
npx --yes netlify-cli@latest deploy --prod --dir=. --site=40870ad5-a013-4bcf-ab7d-7a6ed9d24a5e
```
- Site : **salesboardlbas** → https://salesboardlbas.netlify.app (embarqué dans Odoo, menu Price Board).
- Auth Netlify (une fois si expirée) : `npx netlify-cli login` → ouvre une URL
  `app.netlify.com/authorize?...ticket=…` → Sam clique **Authorize** → jeton mis en cache.
- Trop de déploiements prod rapprochés → erreur `Forbidden` (limite Netlify) : attendre
  quelques minutes et relancer. Un `deploy` sans `--prod` fait un *draft* de test.

## Historique
- **2026-09-02** : refonte complète des 3 collections depuis les listes 2025/2026.
  Alendel 641→578, Unique 629→648, Simplicity 50→62. Toronto corrigé (47,95 coûtant → pdsf 96).
