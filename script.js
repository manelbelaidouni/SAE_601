/* =========================================================================
 *  SCRIPT.JS — Interface utilisateur
 *  Gestion du DOM, des événements et de l'état de l'application.
 * ========================================================================= */

'use strict';

/* =========================================================================
 * ÉTAT GLOBAL DE L'APPLICATION
 * ========================================================================= */

const etatApp = {
  pointsSources:    [],
  couleursPoints:   [],
  diagrammeCalcule: false,
  calculEnCours:    false,
  nomFichierCharge: '',
  tacheCourante:    null,
};

/* =========================================================================
 * RÉFÉRENCES DOM
 * ========================================================================= */

const elements = {
  inputFichier:         document.getElementById('inputFichier'),
  zoneDepot:            document.getElementById('zoneDepot'),
  infoFichier:          document.getElementById('infoFichier'),
  nomFichier:           document.getElementById('nomFichier'),
  resumeFichier:        document.getElementById('resumeFichier'),
  btnCalculer:          document.getElementById('btnCalculer'),
  btnReinitialiser:     document.getElementById('btnReinitialiser'),
  btnExportSVG:         document.getElementById('btnExportSVG'),
  btnExportPNG:         document.getElementById('btnExportPNG'),
  conteneurProgression: document.getElementById('conteneurProgression'),
  barreProg:            document.getElementById('barreProg'),
  texteProgression:     document.getElementById('texteProgression'),
  statPoints:           document.getElementById('statPoints'),
  statPixels:           document.getElementById('statPixels'),
  statDuree:            document.getElementById('statDuree'),
  statZones:            document.getElementById('statZones'),
  journal:              document.getElementById('journal'),
  ecranVide:            document.getElementById('ecranVide'),
  conteneurCanevas:     document.getElementById('conteneurCanevas'),
  canevas:              document.getElementById('canevas'),
  voyantStatut:         document.getElementById('voyantStatut'),
  texteStatut:          document.getElementById('texteStatut'),
  coordX:               document.getElementById('coordX'),
  coordY:               document.getElementById('coordY'),
};

/* =========================================================================
 * UTILITAIRES INTERFACE
 * ========================================================================= */

/**
 * Génère un horodatage court HH:MM:SS.
 */
function obtenirHorodatage() {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

/**
 * Ajoute une entrée dans le journal avec horodatage.
 */
function journaliser(message, type = 'info') {
  const ligne = document.createElement('div');
  ligne.className = 'ligne-journal';
  ligne.innerHTML =
    `<span class="horodatage">${obtenirHorodatage()}</span>` +
    `<span class="msg-${type}">${message}</span>`;
  elements.journal.appendChild(ligne);
  elements.journal.scrollTop = elements.journal.scrollHeight;
}

/**
 * Met à jour le voyant de statut dans l'en-tête.
 */
function mettreAJourStatut(texte, actif = false) {
  elements.texteStatut.textContent = texte;
  elements.voyantStatut.classList.toggle('actif', actif);
}

/**
 * Met à jour la barre de progression.
 */
function mettreAJourProgression(pourcentage, texte) {
  elements.barreProg.style.width        = pourcentage + '%';
  elements.texteProgression.textContent = texte;
}

/**
 * Active ou désactive un ensemble de boutons.
 */
function mettreAJourBoutons(etats) {
  Object.entries(etats).forEach(([nom, actif]) => {
    if (elements[nom]) elements[nom].disabled = !actif;
  });
}

/* =========================================================================
 * GESTION DES FICHIERS
 * ========================================================================= */

/**
 * Traite un fichier sélectionné : lecture, parsing, mise à jour de l'UI.
 */
function traiterFichierSelectionne(fichier) {
  if (!fichier) return;

  if (!fichier.name.endsWith('.txt')) {
    journaliser('Seuls les fichiers .txt sont acceptés.', 'erreur');
    return;
  }

  const lecteur = new FileReader();

  lecteur.onload = function (evenement) {
    const { points, erreurs } = analyserContenuFichier(evenement.target.result);

    erreurs.forEach(err => journaliser(err, 'avert'));

    if (points.length === 0) {
      journaliser('Aucun point valide trouvé dans le fichier.', 'erreur');
      return;
    }

    if (points.length < 3) {
      journaliser(`Seulement ${points.length} point(s) — minimum 3 requis.`, 'erreur');
      return;
    }

    etatApp.pointsSources    = points;
    etatApp.couleursPoints   = genererCouleursDesSites(points.length);
    etatApp.nomFichierCharge = fichier.name.replace('.txt', '');

    elements.nomFichier.textContent   = fichier.name;
    elements.resumeFichier.textContent =
      `${points.length} point(s) chargé(s)` +
      (erreurs.length > 0 ? ` — ${erreurs.length} ligne(s) ignorée(s)` : '');
    elements.infoFichier.classList.add('visible');
    elements.statPoints.textContent = points.length.toString();

    mettreAJourBoutons({ btnCalculer: true, btnReinitialiser: true });
    mettreAJourStatut(`${points.length} points chargés`);
    journaliser(`"${fichier.name}" chargé : ${points.length} points.`, 'succes');

    if (erreurs.length > 0) {
      journaliser(`${erreurs.length} ligne(s) ignorée(s) (format invalide).`, 'avert');
    }
  };

  lecteur.onerror = () => journaliser('Erreur de lecture du fichier.', 'erreur');
  lecteur.readAsText(fichier, 'UTF-8');
}

/* =========================================================================
 * CALCUL DU DIAGRAMME
 * ========================================================================= */

/**
 * Lance le calcul et le rendu du diagramme de Voronoï.
 */
function lancerCalculDiagramme() {
  if (etatApp.calculEnCours || etatApp.pointsSources.length === 0) return;

  etatApp.calculEnCours = true;

  const sitesPixels = preparerSitesPourCanevas(etatApp.pointsSources);

  elements.ecranVide.style.display        = 'none';
  elements.conteneurCanevas.style.display = 'block';
  elements.conteneurProgression.classList.add('visible');
  elements.statPixels.textContent =
    (TAILLE_CANEVAS * TAILLE_CANEVAS).toLocaleString('fr-FR');

  mettreAJourBoutons({
    btnCalculer: false, btnReinitialiser: false,
    btnExportSVG: false, btnExportPNG: false,
  });
  mettreAJourStatut('Calcul en cours…', true);
  journaliser(
    `Calcul démarré — ${sitesPixels.length} sites, ` +
    `${TAILLE_CANEVAS * TAILLE_CANEVAS} pixels…`, 'info'
  );

  etatApp.tacheCourante = dessinerDiagrammeParPixels(
    elements.canevas,
    sitesPixels,
    etatApp.couleursPoints,

    // Callback progression
    (pourcentage) => {
      mettreAJourProgression(pourcentage, `Calcul en cours… ${pourcentage}%`);
    },

    // Callback terminaison
    (dureeMs) => {
      etatApp.calculEnCours    = false;
      etatApp.diagrammeCalcule = true;

      elements.conteneurProgression.classList.remove('visible');
      elements.statDuree.textContent = dureeMs.toString();
      elements.statZones.textContent = etatApp.pointsSources.length.toString();

      mettreAJourBoutons({
        btnReinitialiser: true,
        btnExportSVG: true,
        btnExportPNG: true,
      });
      mettreAJourStatut('Diagramme calculé', true);
      journaliser(`Diagramme calculé en ${dureeMs} ms.`, 'succes');
    }
  );
}

/**
 * Réinitialise l'application à son état initial.
 */
function reinitialiserApplication() {
  if (etatApp.tacheCourante) {
    clearTimeout(etatApp.tacheCourante);
    etatApp.tacheCourante = null;
  }

  Object.assign(etatApp, {
    pointsSources: [], couleursPoints: [],
    diagrammeCalcule: false, calculEnCours: false, nomFichierCharge: '',
  });

  elements.inputFichier.value = '';
  elements.infoFichier.classList.remove('visible');
  elements.conteneurCanevas.style.display = 'none';
  elements.ecranVide.style.display        = 'block';
  elements.conteneurProgression.classList.remove('visible');

  const ctx = elements.canevas.getContext('2d');
  ctx.clearRect(0, 0, TAILLE_CANEVAS, TAILLE_CANEVAS);

  ['statPoints', 'statPixels', 'statDuree', 'statZones'].forEach(
    id => { elements[id].textContent = '—'; }
  );

  mettreAJourBoutons({
    btnCalculer: false, btnReinitialiser: false,
    btnExportSVG: false, btnExportPNG: false,
  });
  mettreAJourStatut("En attente d'un fichier", false);
  journaliser('Application réinitialisée.', 'info');
}

/* =========================================================================
 * ÉVÉNEMENTS
 * ========================================================================= */

// Import fichier
elements.inputFichier.addEventListener('change', e =>
  traiterFichierSelectionne(e.target.files[0])
);

// Boutons
elements.btnCalculer.addEventListener('click', lancerCalculDiagramme);

elements.btnReinitialiser.addEventListener('click', reinitialiserApplication);

elements.btnExportSVG.addEventListener('click', () => {
  if (!etatApp.diagrammeCalcule) return;
  const sitesPixels = preparerSitesPourCanevas(etatApp.pointsSources);
  exporterEnSVG(elements.canevas, sitesPixels, etatApp.nomFichierCharge);
  journaliser('Export SVG généré.', 'succes');
});

elements.btnExportPNG.addEventListener('click', () => {
  if (!etatApp.diagrammeCalcule) return;
  exporterEnPNG(elements.canevas, etatApp.nomFichierCharge);
  journaliser('Export PNG généré.', 'succes');
});

// Suivi de la souris sur le canevas
elements.canevas.addEventListener('mousemove', e => {
  const rect = elements.canevas.getBoundingClientRect();
  elements.coordX.textContent = Math.round(e.clientX - rect.left);
  elements.coordY.textContent = TAILLE_CANEVAS - Math.round(e.clientY - rect.top);
});

// Drag and drop
elements.zoneDepot.addEventListener('dragover', e => {
  e.preventDefault();
  elements.zoneDepot.classList.add('survol');
});

elements.zoneDepot.addEventListener('dragleave', () =>
  elements.zoneDepot.classList.remove('survol')
);

elements.zoneDepot.addEventListener('drop', e => {
  e.preventDefault();
  elements.zoneDepot.classList.remove('survol');
  traiterFichierSelectionne(e.dataTransfer.files[0]);
});

/* =========================================================================
 * INITIALISATION
 * ========================================================================= */

window.addEventListener('load', () => {
  journaliser("Application initialisée. En attente d'un fichier .txt.", 'info');
});
