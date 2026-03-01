console.log("Début des tests ");

// ------------------cette partie c'est pour la logique mathématique ---------------------------------------------------------

// Test 1 : Distance entre 2 points 
//Arrange
let ax = 10, ay = 10; // point A
let bx = 10, by = 20; // point B
//Act
let distance_1 = calculer_distance_entre_deux_points(ax, ay, bx, by); // on appelle la fonction
//Assert
if (distance_1 === 10) {
    console.log("Test 1 : Succès -> Résultat : 10");
} else {
    console.error("Test 1 : Échec -> Attendu : 10, Reçu : " + distance_1);
}

// Test 2 : Distance entre le même point 
//Arrange
let cx = 5, cy = 5; // même point des deux côtés
//Act
let distance_2 = calculer_distance_entre_deux_points(cx, cy, cx, cy); // distance avec lui-même
//Assert
if (distance_2 === 0) {
    console.log("Test 2 : Succès -> Résultat : 0");
} else {
    console.error("Test 2 : Échec -> Attendu : 0, Reçu : " + distance_2);
}

// cette partie c'est pour la partie représentative de canevas ---------------------------------------------------------

// Test 3 : Deux appels doivent donner deux couleurs différentes
//Arrange
let couleur_1 = genererCouleurAleatoire(); // premiere couleur
let couleur_2 = genererCouleurAleatoire(); // deuxieme couleur
//Act + Assert
if (couleur_1 !== couleur_2) {
    console.log("Test 3 : Succès -> Les deux couleurs sont différentes");
} else {
    console.error("Test 3 : Échec -> Les deux couleurs sont identiques (rare mais possible)");
}

// Test 4 : pas de couleur dans la liste 
//Arrange
listeDesPoints = []; // on part d'une liste vide
//Act
let res = couleurDejaUtilisee("rgb(100,100,100)"); // couleur qui n'est pas dans la liste
//Assert
if (res === false) {
    console.log("Test 4 : Succès -> Couleur absente détectée correctement");
} else {
    console.error("Test 4 : Échec -> Attendu : false, Reçu : " + res);
}

// Test 5 : Couleur présente dans la liste 
//Arrange
listeDesPoints = [{ posX: 10, posY: 10, couleur: "rgb(200,100,50)" }]; // on met un point dans la liste
//Act
let resultat = couleurDejaUtilisee("rgb(200,100,50)"); // on cherche cette même couleur
//Assert
if (resultat === true) {
    console.log("Test 5 : Succès -> Couleur existante détectée correctement");
} else {
    console.error("Test 5 : Échec -> Attendu : true, Reçu : " + resultat);
}


