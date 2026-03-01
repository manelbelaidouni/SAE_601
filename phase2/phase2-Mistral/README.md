# SAE 601 - Phase 2 (Mistral)

Ce document répertorie les travaux effectués lors de la **Phase Mistral** pour le projet de Générateur de Diagramme de Voronoï.

## Prompts Utilisés

| Étape | Prompt |
| :--- | :--- |
| **1** | Génère une application web COMPLETE "Voronoï" en HTML/CSS/JavaScript ES6, sans librairie, en 3 fichiers : index.html, style.css, script.js. Exigences : Canvas 600x600, Import d'un fichier .txt : une ligne = "X,Y" (floats possibles, lignes vides ignorées, erreurs gérées), Stockage : tableau d'objets { x, y }, algorithme : pour chaque pixel du canvas, trouver le point le plus proche (distance euclidienne) et colorier la zone (couleur unique par point), affiche les points sources par-dessus, je veux l' UI en français avec boutons : Importer, Générer, Exporter SVG, Exporter PNG (optionnel), niveau qualite de code : je veux un code clair et bien structuré, avec des fonctions explicites|
| **2** | Le diagramme est mal centré on ne peut rien lire et les points sont mal positionnés |
| **3** | Améliore le rendu esthétique, les boutons sont placer en bas c' est pas tres intuitif|
| **4** | je veux maintenant que tu me mette en place des tests logiciel|
| **5** | Les tests unitaires ne peuvent pas accéder aux fonctions car tout est encapsulé dans un DOMContentLoaded|
| **6** | Lorsque je lance les tests E2E avec playwright j'ai une erreur liée à l'importation du fichier .txt|
| **7** | L'export PNG est bien mais l' image est de mauvaise qualité|

## Journal des Corrections

| Problème Rencontré | Cause | Correction Apportée |
| :--- | :--- | :--- |
| **Diagramme mal centré, points mal positionnés** | Coordonnées des points non adaptées aux dimensions du canvas. | Ajustement du système de coordonnées pour centrer et mettre à l'échelle les points dans le canvas 600x600. |
| **Rendu esthétique pauvre, boutons mal placés** | Design minimal généré par défaut, les boutons sont mal placés, ils etaient en bas de page. | Amélioration du CSS : repositionnement des boutons, meilleure mise en page. |
| **Encapsulation DOMContentLoaded** | Toutes les fonctions sont encapsulées dans un listener `DOMContentLoaded`, impossibles à tester directement. | Extraction de la logique pure (distance, parsing, getColor) pour les tests unitaires en recréant les fonctions dans le fichier de test. |
| **Erreur import fichier E2E** | Playwright ne pouvait pas importer le fichier `.txt` avec le sélecteur de fichier standard. | Utilisation de la méthode `setInputFiles` de Playwright (Best Practice) pour simuler l'import. |
| **Export PNG de mauvaise qualité** | Résolution par défaut du canvas trop faible pour un export en PNG. | Augmentation de la résolution du canvas pour l'export en PNG. |

## Tests Logiciels

Les test générer par l'IA sont les suivants :

### 1. Tests Unitaires (`Vitest`)
- **Lieu** : `tests/unit.test.js`
- **Objectif** : Vérifie la logique pure du code : calcul de distance euclidienne, attribution cyclique des couleurs, parsing des fichiers `.txt` (coordonnées valides, lignes vides, erreurs...).
- **Lancement** : avec la commande `npm test`

### 2. Tests de Bout en Bout (`Playwright`)
- **Lieu** : `tests/e2e.test.js`
- **Objectif** : Simule un utilisateur réel : chargement de la page, import d'un fichier, génération du diagramme, effacement du canvas.
- **Lancement** : avec la commande `npm run test:e2e`

## Comparatif : IA vs Développement Humain

| Aspect | IA (Mistral) | Développement Humain |
| :--- | :--- | :--- |
| **Productivité** | Application complète générée en quelques échanges de prompts. | Plusieurs heures de développement et de configuration, les bugs simples on pris pas mal de temps a etre trouver et corrigé. |
| **Rigueur** | Des le premier prompt le code etait fonctionnel mais il a fallu plusieurs echanges pour corriger les differents bugs. | Approche itérative plus contrôlée, moins de surprises, car on essaye de bien planifier avant de coder. |
| **Tests** | Un prompt a suffit pour mettre en place les tests unitaires et e2e, il a couvert tout les cas de figure auxquels on a pas pensé tout de suite. | On a du essayer de trouver le plus de cas de figure possible pour les tests unitaires et e2e. |
| **Débogage** | Corrections rapides après signalement des problèmes dans les prompts. | Recherche manuelle (documentation, StackOverflow, les forums mais aussi les logs). |
| **Qualité UI** | Premier design tres basique, amélioré après un prompt. | Tout comme l' ia le but premier n'etait pas de creer une belle application mais de faire en sorte que ca marchee. |
| **Adaptabilité** | Le Refactoring et les améliorations ont ete tres rapide a mettre en place. | Travail de réécriture manuel plus long. |

## Installation et Lancement

1. Accédez au dossier : `cd phase2/phase2-Mistral`
2. Installez les dépendances : `npm install`
3. Lancez l'application : Ouvrez `index.html` dans votre navigateur.
4. Lancez les tests : `npm test`
5. Lancez les tests E2E : `npm run test:e2e`
