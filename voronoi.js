/* =========================================================================
 *  VORONOI.JS — Logique métier
 *  Contient uniquement les fonctions de calcul, rendu et export.
 *  L'interface utilisateur est dans script.js
 * ========================================================================= */

'use strict';

/* =========================================================================
 * CONSTANTES
 * ========================================================================= */

const TAILLE_CANEVAS       = 600;
const RAYON_SITE           = 4;
const COULEUR_SITE         = '#ffffff';
const COULEUR_BORDURE_SITE = '#000000';
const LIGNES_PAR_TRANCHE   = 20;

const PALETTE_COULEURS = [
  '#1a4a6b', '#1a6b4a', '#6b1a4a', '#4a6b1a', '#6b4a1a',
  '#1a2d6b', '#2d6b1a', '#6b1a2d', '#1a6b6b', '#6b6b1a',
  '#3d1a6b', '#1a3d6b', '#6b3d1a', '#1a6b3d', '#6b1a3d',
  '#0d3d5c', '#0d5c3d', '#5c0d3d', '#3d5c0d', '#5c3d0d',
];

/* =========================================================================
 * UTILITAIRES GÉOMÉTRIQUES
 * ========================================================================= */

/**
 * Calcule la distance euclidienne entre deux points.
 */
function calculerDistanceEntreDeuxPoints(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
 * Retourne l'index du site le plus proche d'un pixel (x, y).
 */
function trouverSiteLePlusProche(xPixel, yPixel, sites) {
  let indexPlusProche  = 0;
  let distanceMinimale = Infinity;

  for (let i = 0; i < sites.length; i++) {
    const distance = calculerDistanceEntreDeuxPoints(
      xPixel, yPixel, sites[i].x, sites[i].y
    );
    if (distance < distanceMinimale) {
      distanceMinimale = distance;
      indexPlusProche  = i;
    }
  }
  return indexPlusProche;
}

/**
 * Convertit une couleur hexadécimale '#rrggbb' en {r, g, b}.
 */
function convertirHexEnRvb(hex) {
  const resultat = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return resultat
    ? {
        r: parseInt(resultat[1], 16),
        g: parseInt(resultat[2], 16),
        b: parseInt(resultat[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Normalise un point de coordonnées réelles vers des coordonnées pixel canevas.
 */
function normaliserPointVersCanevas(
  point, xMin, yMin, largeurDonnees, hauteurDonnees, marge
) {
  const zoneDisponible = TAILLE_CANEVAS - 2 * marge;

  const xNorm = largeurDonnees === 0
    ? TAILLE_CANEVAS / 2
    : marge + ((point.x - xMin) / largeurDonnees) * zoneDisponible;

  const yNorm = hauteurDonnees === 0
    ? TAILLE_CANEVAS / 2
    : marge + (1 - (point.y - yMin) / hauteurDonnees) * zoneDisponible;

  return { x: Math.round(xNorm), y: Math.round(yNorm) };
}

/**
 * Assigne une couleur à chaque site (cycle sur la palette si dépassement).
 */
function genererCouleursDesSites(nombreDeSites) {
  return Array.from(
    { length: nombreDeSites },
    (_, i) => PALETTE_COULEURS[i % PALETTE_COULEURS.length]
  );
}

/* =========================================================================
 * LECTURE ET PARSING DE FICHIER
 * ========================================================================= */

/**
 * Analyse une ligne de texte et retourne un point ou une erreur.
 */
function analyserUneLigne(ligne, numeroLigne) {
  const ligneNettoyee = ligne.trim();

  if (!ligneNettoyee || ligneNettoyee.startsWith('#')) {
    return { point: null, erreur: null };
  }

  const separateur = ligneNettoyee.includes(',') ? ',' : /\s+/;
  const parties    = ligneNettoyee.split(separateur);

  if (parties.length !== 2) {
    return {
      point: null,
      erreur: `Ligne ${numeroLigne} : format invalide — "${ligneNettoyee}"`,
    };
  }

  const x = parseFloat(parties[0]);
  const y = parseFloat(parties[1]);

  if (isNaN(x) || isNaN(y)) {
    return {
      point: null,
      erreur: `Ligne ${numeroLigne} : coordonnées non numériques — "${ligneNettoyee}"`,
    };
  }

  return { point: { x, y }, erreur: null };
}

/**
 * Parse l'intégralité du contenu d'un fichier texte de points.
 */
function analyserContenuFichier(contenu) {
  const lignes  = contenu.split('\n');
  const points  = [];
  const erreurs = [];

  lignes.forEach((ligne, index) => {
    const { point, erreur } = analyserUneLigne(ligne, index + 1);
    if (erreur) erreurs.push(erreur);
    if (point)  points.push(point);
  });

  return { points, erreurs };
}

/**
 * Prépare les sites en coordonnées pixel pour le canevas.
 */
function preparerSitesPourCanevas(pointsOriginaux) {
  if (pointsOriginaux.length === 0) return [];

  const toutesLesX = pointsOriginaux.map(p => p.x);
  const toutesLesY = pointsOriginaux.map(p => p.y);
  const xMin = Math.min(...toutesLesX);
  const xMax = Math.max(...toutesLesX);
  const yMin = Math.min(...toutesLesY);
  const yMax = Math.max(...toutesLesY);

  return pointsOriginaux.map(p =>
    normaliserPointVersCanevas(
      p, xMin, yMin, xMax - xMin, yMax - yMin, 40
    )
  );
}

/* =========================================================================
 * RENDU DU DIAGRAMME
 * ========================================================================= */

/**
 * Lance le rendu asynchrone du diagramme de Voronoï pixel par pixel.
 */
function dessinerDiagrammeParPixels(
  canevas, sites, couleurs, surProgression, surTerminaison
) {
  const contexte   = canevas.getContext('2d');
  const imageData  = contexte.createImageData(TAILLE_CANEVAS, TAILLE_CANEVAS);
  const donnees    = imageData.data;
  const debutTemps = performance.now();

  const composantesRvb = couleurs.map(convertirHexEnRvb);

  let ligneActuelle = 0;
  let tacheCourante = null;

  function traiterProchaineLigne() {
    const finTranche = Math.min(ligneActuelle + LIGNES_PAR_TRANCHE, TAILLE_CANEVAS);

    for (let y = ligneActuelle; y < finTranche; y++) {
      for (let x = 0; x < TAILLE_CANEVAS; x++) {
        const indexSite  = trouverSiteLePlusProche(x, y, sites);
        const { r, g, b } = composantesRvb[indexSite];
        const indexPixel = (y * TAILLE_CANEVAS + x) * 4;

        donnees[indexPixel]     = r;
        donnees[indexPixel + 1] = g;
        donnees[indexPixel + 2] = b;
        donnees[indexPixel + 3] = 255;
      }
    }

    ligneActuelle = finTranche;
    surProgression(Math.round((ligneActuelle / TAILLE_CANEVAS) * 100));

    if (ligneActuelle < TAILLE_CANEVAS) {
      tacheCourante = setTimeout(traiterProchaineLigne, 0);
    } else {
      contexte.putImageData(imageData, 0, 0);
      dessinerSitesSurCanevas(contexte, sites);
      surTerminaison(Math.round(performance.now() - debutTemps));
    }
  }

  tacheCourante = setTimeout(traiterProchaineLigne, 0);
  return tacheCourante;
}

/**
 * Dessine les points sources (sites) par-dessus les zones colorées.
 */
function dessinerSitesSurCanevas(contexte, sites) {
  sites.forEach(site => {
    contexte.beginPath();
    contexte.arc(site.x, site.y, RAYON_SITE, 0, Math.PI * 2);
    contexte.fillStyle   = COULEUR_SITE;
    contexte.fill();
    contexte.strokeStyle = COULEUR_BORDURE_SITE;
    contexte.lineWidth   = 1.5;
    contexte.stroke();
  });
}

/* =========================================================================
 * EXPORT
 * ========================================================================= */

/**
 * Exporte le diagramme en SVG.
 */
function exporterEnSVG(canevas, sites, nomFichier) {
  const imageBase64 = canevas.toDataURL('image/png');

  const cerclesSites = sites
    .map(site =>
      `  <circle cx="${site.x}" cy="${site.y}" r="${RAYON_SITE}" ` +
      `fill="${COULEUR_SITE}" stroke="${COULEUR_BORDURE_SITE}" stroke-width="1.5"/>`
    )
    .join('\n');

  const contenuSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${TAILLE_CANEVAS}" height="${TAILLE_CANEVAS}"
     viewBox="0 0 ${TAILLE_CANEVAS} ${TAILLE_CANEVAS}">
  <title>Diagramme de Voronoï</title>
  <desc>Généré par Voronoï.js — ${new Date().toLocaleDateString('fr-FR')}</desc>
  <image href="${imageBase64}" x="0" y="0"
         width="${TAILLE_CANEVAS}" height="${TAILLE_CANEVAS}"/>
  <g id="sites">
${cerclesSites}
  </g>
</svg>`;

  telechargerFichierTexte(contenuSVG, `voronoi_${nomFichier}.svg`, 'image/svg+xml');
}

/**
 * Exporte le canevas en PNG.
 */
function exporterEnPNG(canevas, nomFichier) {
  canevas.toBlob(blob => {
    const url  = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href     = url;
    lien.download = `voronoi_${nomFichier}.png`;
    lien.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Déclenche le téléchargement d'un contenu texte.
 */
function telechargerFichierTexte(contenu, nomFichier, typeMime) {
  const blob = new Blob([contenu], { type: typeMime });
  const url  = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href     = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
