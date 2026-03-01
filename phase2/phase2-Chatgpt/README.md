# SAE 601 - Phase 2 (Chatgpt)

Ce document répertorie les travaux effectués lors de la **Phase Chatgpt** pour le projet de Générateur de Diagramme de Voronoï.

## 🚀 Prompts Utilisés

| Étape | Prompt |
| :--- | :--- |
| 1 | salut chatgpt, dans un contexte d'une SAE Universitaire, création d'une application web de diagrammes de VORONOI, agis en tant que développeur fullstack senior. Objectif : créer une application web conviviale qui lit un fichier .txt de coordonnées (format x,y par ligne), calcule le diagramme de VORONOI et l'affiche. Ne fais pas un seul fichier sépare le projet en : html, css, js pour la logique de l'algorithme et js pour la gestion du canva, dessin ... . Pour l'algo Implémente un algorithme de Voronoï robuste (par exemple l'algorithme de Fortune ou une approche par triangulation de Delaunay, ou à défaut une approche géométrique précise). le code doit etre commenté comme un humain qui explique ses choix techniques, surtt le PK ça et pas le COMMENT. Les fonctionnalités : Lecture de fichier .txt avec gestion d'erreurs (lignes vides, mauvais format etc), auto scaling : le diagramme doit s'adapter automatiquement a la taille du canvas, Boutons pour télécharger en format .png et .svg, Respecte les principe SOLID, inclus un fichier tests.js qui contient des tests unitaires pour tout valider. le code doit etre propre, lisible, et bien documenté avec JSDoc.  |
| 2 | Crée le fichier `points.txt` et ajoute les coordonnées suivantes : `2,4` ; `5.3,4.5` ; `18,29` ; `12.5,23.7`. |
| 3 | J'ai remarqué que si mon fichier points.txt contient une ligne vide à la fin ou des espaces inutiles, l'application s'arrête ou crée un point d'erreur. modifie la lecture pour qu'elle nettoie les espaces et ignore les lignes qui ne contiennent pas de coordonnées valides. |
| 4 | Les points sur le graphique sont minuscules, on les voit à peine. Tu peux agrandir leur taille (genre 3.8px) |
| 5 | okey la plateforme est fonctionnelle mais peut tu me dire quelle technologie as tu utilisé pour les tests. |
| 6 | Explique moi la logique derrière vanilla js et pourquoi as tu choisi cette technologie. |
| 7 | Je comprend mais dans un contexte universitaire je trouve que ce n'est pas pro, que proposes_tu comme d'autre technologies de test. |
| 8 | Parfait on va refaire les tests avec vitest. |
| 9 | C'est bien, mais comme on va utiliser Vitest, il me faut un vrai projet Node. Peux-tu me générer le fichier package.json avec les dépendances nécessaires et les scripts pour lancer les tests et le projet ? |
| 10 | Comment vérifier que les tests sont passées ? quelles sont les commandes à taper ? |


## 📝 Journal des Corrections

| Problème / Limite constaté | Cause | Correction apportée | Temps |
| :--- | :--- | :--- | :--- |
| **Tests peu rigoureux** | L'IA a proposé des tests manuels au début. | **Migration vers Vitest** : Refactorisation complète du fichier `tests.js`. | 15 min |
| **Dépendances manquantes** | Pas de gestionnaire de paquets initial. | Création du `package.json` et installation des dépendances nécessaires au projet. | 5 min |
| **Conflits de fins de ligne** | Différence LF (Linux) / CRLF (Windows). | Normalisation via Git pour assurer la cohérence du dépôt équipe. | 10 min |
| **Ergonomie du Parsing** | Risque de plantage sur fichiers mal formatés. | Ajout de condition de filtrage des lignes vides. | 5 min |
| **Visibilité des points** | Points trop petits sur le canvas par défaut. | Ajustement de la fonction de dessin pour un meilleur rendu visuel (rayon des points). | 5 min |


## 🧪 Tests Logiciels
L'application intègre une suite de tests automatisée et une phase de validation manuelle :

### 1. Tests Unitaires (Vitest)
* **Lieu :** `tests.js`
* **Objectif :**
    * **Parsing :** Vérifie l'extraction des points et la détection des erreurs de format (ex: `x,3`).
    * **Auto-scaling :** Valide la création de la boîte englobante (`computeBoundsFromPoints`).
    * **Géométrie :** Vérifie le calcul de la médiatrice (séparation à x=5 pour deux points distants de 10).
    * **Déduplication :** S'assure que les points identiques sont fusionnés.
* **Lancement :** `npm test`

### 2. Tests de Robustesse (Validation manuelle)
* **Protocole :** Comparaison du rendu sur deux échelles de coordonnées.
    * **Fichier A :** `2,4`, `5.3,4.5`, `18,29`, `12.5,23.7`.
    * **Fichier B :** `20,40`, `53,45`, `180,290`, `125,237`.
* **Résultat :** L'auto-scaling ajuste dynamiquement le zoom. Les points sont centrés et le diagramme reste proportionnel peu importe l'échelle.

## 📊 Comparatif : IA vs Développement Humain

| Aspect | Développement Humain (L'Équipe) | IA (ChatGPT) |
| :--- | :--- | :--- |
| **Productivité** | apprentissage de l'algorithme de VORONOI, codage pas à pas. Plusieurs heures de travail. | génération complète de la structure et de l'algorithme en moins d'une minute. |
| **Rigueur & Architecture** | Approche pragmatique : focus sur un code fonctionnel, code smell souvent pour faciliter le développement. | Approche théorique : application immédiate des principes SOLID et séparation stricte des fichiers (ESM). |
| **Tests Logiciels** | Tests visuels et unitaires manuels basés sur nos propres jeux de données de test. | Mise en place d'une suite de tests automatisée (Vitest) couvrant des cas limites (médiatrices, doublons). |
| **Débogage** | Recherche active via la documentation, les logs console et les forums. | Correction instantanée après signalement du bug ou de l'erreur de logique dans le prompt. |
| **Adaptabilité** | Le changement de technologie ou le refactoring demande une réécriture manuelle longue. | Refactoring massif "gratuit" (ex: passage de tests Vanilla JS à Vitest réalisé instantanément). |
| **Qualité UI / UX** | Design basique : l'objectif premier était la validité de l'algorithme et du tracé. | Design moderne et responsive incluant des micro-optimisations (feedback visuel, auto-scaling). |


## 🛠️ Installation et Lancement

Pour faire fonctionner cette version générée par Gemini, suivez les étapes suivantes :

1. **Accédez au dossier** :
   ```bash
   cd phase2/phase2-Chatgpt
2. **Installez les dépendances (nécessaire pour Vitest)** :
   ```bash
   npm install
3. **Lancez l'application** :
   Ouvrez le fichier index.html directement dans votre navigateur (ou via une extension type Live Server).
4. **Lancez les tests** :
    ```bash
    npm test
