// Cette partie du code sert à créer des "outils" que je vais utiliser partout ---------------------------------------------------------------
const monCanevas = document.getElementById("canevasVoronoi");
const pinceau = monCanevas.getContext("2d");

const selecteurFichier = document.getElementById("selecteurFichier");
const boutonExporter = document.getElementById("boutonExporter");

let listeDesPoints = [];

const texteEtat = document.getElementById("etatCalcul");

function effacerCanevas() {
    pinceau.clearRect(0, 0, monCanevas.width, monCanevas.height); // Pour que ce soit tout blanc 
};

// Cette partie du code sert à lire le fichier -----------------------------------------------------------------------------  

selecteurFichier.addEventListener("change", function (evenement) {
    const fichier = evenement.target.files[0];

    if (fichier) {
        const lecteur = new FileReader();
        lecteur.onload = function (e) {
            const contenuTexte = e.target.result; // dedans il y a le contenu du fichier sous forme de texte
            analyserLeTexte(contenuTexte);
        };
        lecteur.readAsText(fichier);
    }
});

function analyserLeTexte(texteBrut) {
    texteEtat.innerText = "Calcul en cours...";  // On affiche le message d'attente immédiatement
    texteEtat.style.color = "orange";


    setTimeout(function () { // ajout de "setTimeout" pour que la pause fonctionne vraiment
        listeDesPoints = [];
        const lignes = texteBrut.split("\n"); // Pour découper le texte à chaque retour à la ligne

        for (let i = 0; i < lignes.length; i++) {
            const ligneCourante = lignes[i].trim(); // pour enlever les espaces inutiles

            if (ligneCourante !== "") {
                const coordonnees = ligneCourante.split(",");
                const x = parseFloat(coordonnees[0]) * 20; // Agrandissement x20 pour la visibilité
                const y = parseFloat(coordonnees[1]) * 20;

                if (x >= 0 && x <= 600 && y >= 0 && y <= 600) {
                    let couleurChoisie = genererCouleurAleatoire();
                    while (couleurDejaUtilisee(couleurChoisie)) {
                        couleurChoisie = genererCouleurAleatoire();
                    }
                    const nouveauPoint =
                    {
                        posX: x,
                        posY: y,
                        couleur: couleurChoisie
                    };
                    listeDesPoints.push(nouveauPoint);
                }
            }
        }

        dessinerLesZones(); // On lance le dessin des couleurs

        texteEtat.innerText = "Voici le résultat";
        texteEtat.style.color = "green";

    }, 100);
}

// Cette partie du code c'est les calculs -----------------------------------------------------

function calculer_distance_entre_deux_points(x1, y1, x2, y2) {
    const differenceX = x2 - x1;
    const differenceY = y2 - y1;
    return Math.sqrt(differenceX * differenceX + differenceY * differenceY);
}

function dessinerLesZones() {
    for (let x = 0; x < 600; x++) // parcourt chaque colonne
    {
        for (let y = 0; y < 600; y++) // parcourt chaque ligne
        {
            let distanceMinimale = 1000;
            let pointLePlusProche = null;

            for (let i = 0; i < listeDesPoints.length; i++) {
                const p = listeDesPoints[i];
                const d = calculer_distance_entre_deux_points(x, y, p.posX, p.posY);

                if (d < distanceMinimale) {
                    pointLePlusProche = p;
                    distanceMinimale = d;
                }
            }

            if (pointLePlusProche != null) {
                pinceau.fillStyle = pointLePlusProche.couleur;
                pinceau.fillRect(x, y, 1, 1);
            }
        }
    }
    redessinerPointsNoirs(); // On remet les points noirs par-dessus à la fin
}
// cette partie du code c'est pour la representation du diagramme-----------------------------------------------------
function genererCouleurAleatoire() {
    const r = Math.floor(Math.random() * 206 + 50);
    const g = Math.floor(Math.random() * 206 + 50);
    const b = Math.floor(Math.random() * 206 + 50);
    return "rgb(" + r + "," + g + "," + b + ")";
}

function couleurDejaUtilisee(nouvelleCouleur) {
    for (let i = 0; i < listeDesPoints.length; i++) {
        if (listeDesPoints[i].couleur === nouvelleCouleur) {
            return true;
        }
    }
    return false;
}

function redessinerPointsNoirs() {
    for (let i = 0; i < listeDesPoints.length; i++) {
        const p = listeDesPoints[i];
        pinceau.beginPath();
        pinceau.arc(p.posX, p.posY, 5, 0, Math.PI * 2);
        pinceau.fillStyle = "black";
        pinceau.fill();
        pinceau.closePath();
    }
}

// Cette partie du code sert à l'exportation en IMAGE ------------------------------------------------------
boutonExporter.addEventListener("click", function () {
    const imagePNG = monCanevas.toDataURL("image/png"); // pour transformer le canevas en une URL d'image 
    const lien = document.createElement('a'); // crée un lien de téléchargement invisible
    lien.href = imagePNG;
    lien.download = "mon_voronoi.png"; // Le nom du fichier que l'utilisateur recevra
    lien.click();
});

