# SAE 601 - Phase 2 (Gemini)

Ce document répertorie les travaux effectués lors de la **Phase Gemini** pour le projet de Générateur de Diagramme de Voronoï.

## 🚀 Prompts Utilisés

| Étape | Prompt |
| :--- | :--- |
| **1** | je veux pouvoir faire une application web en HTML,CSS et JavaScript qui permet d'importer un fichier .txt où il y a des coordonnées comme sa : 2,4 / 5.3,4.5 / 18,29 / 12.5,23.7 et par la suite sa genère un diagramme de Voronoï à partir de ses points, pour permettre à la fin, l'export du résultat au format svg ou png. Le plus important à comprendre est que c'est une application qui permettra de visualiser le diagramme obtenu et exporter le résultat sous forme de fichiers svg ou png |
| **2** | je veux que tu rende l'application plus ergonomique, car quand je genère je ne vois pas tout le diagramme de veronoï je suis obliger de scroll en sachant que tu dois respecter le plus haut niveau de bonnes pratiques de programmation |
| **3** | je veux maintenant que tu mette en place la série de tests logiciels |
| **4** | où je dois exécuter les tests et comment je m'y prend pour les faire fonctionner et surtout explique moi la logique derrière prend toujours en compte que quand tu fais quelque chose tu dois me dire commennt et pourquoi tu le fait pour que je te pilote au mieux |
| **5** | j'ai une erreur corrige l'erreur du test, je pense que Vitest essaye de lire le fichier de Playwright et sa crée un conflit |
| **6** | il y a nouveau problème qui est lorsque je veux choisir un fichier pour pour générer un diagramme de veronoï le fichier ne s'importe pas alors qu'avant cette manipulation fonctionnait et après l'intégration des tests sa ne fonctionne plus |
| **7** | ok maintenant sa fonctionne au niveau de l'importation du fichier mais lorsque je retest les tests sa mais une erreur au niveau du d3 qui n'est pas défini |
| **8** | il y a un autre problème dans les tests de TypeError |
| **9** | Lorsque je teste maintenant le test de bout en bout j'ai une erreur  |
| **10** | Sur la page web qui m'affiche les erreurs suite au lancement du test de bout en bout j'ai une erreur lié à l'importation du fichier  |
| **11** | je veux lors de l'export en png que le diagramme soit avec la taille idéal pour bien visulaiser avec le format png car c'est trop petit |

## 📝 Journal des Corrections

| Problème Rencontré | Cause | Correction Apportée |
| :--- | :--- | :--- |
| **Scroll excessif** | Dimensions fixes du SVG (800px). | Passage à un layout Flexbox responsive avec `viewBox` dynamique. |
| **Conflit de Test** | Vitest tentait de lire les tests Playwright. | Ajout de `exclude: ['tests/e2e.test.js']` dans `vitest.config.js`. |
| **Bug Import (`file://`)** | Les navigateurs bloquent les modules ESM en local. | Retour à des scripts standards et utilisation d'une approche hybride pour les tests. |
| **Erreur d3 (Tests)** | Script exécuté avant le chargement de d3. | Injection manuelle de `d3` dans le global de Vitest et chargement asynchrone du script. |
| **Interception Clic (E2E)** | L'input caché couvrait le label du bouton. | Passage à la méthode `setInputFiles` (Best Practice Playwright). |
| **Qualité Export** | Taille variable ou trop petite. | Utilisation d'un Canvas 2000x2000 pour un export PNG HD ultra-net. |

## 🧪 Tests Logiciels

L'application intègre une suite de tests robuste pour garantir la qualité logicielle :

### 1. Tests Unitaires (`Vitest`)
- **Lieu** : `tests/unit.test.js`
- **Objectif** : Vérifie la logique de parsing des fichiers `.txt` et la manipulation de l'état interne.
- **Lancement** : `npm test`

### 2. Tests de Bout en Bout (`Playwright`)
- **Lieu** : `tests/e2e.test.js`
- **Objectif** : Simule un utilisateur réel important un fichier et vérifiant le rendu graphique dans Chrome.
- **Lancement** : `npm run test:e2e`

## 📊 Comparatif : IA vs Développement Humain

| Aspect | IA (Gemini) | Développement Humain |
| :--- | :--- | :--- |
| **Productivité** | Développement complet en quelques minutes. | Plusieurs heures de codage et de configuration. |
| **Rigueur** | Applique immédiatement les bonnes pratiques (POO, ESM). | Peut varier selon l'expérience du développeur. |
| **Maintenance** | Génère une documentation structurée prête à l'emploi. | La documentation est souvent la dernière tâche effectuée. |
| **Tests** | Configure les environnements de tests complexes sans friction. | Configuration manuelle souvent longue et sujette aux erreurs. |
| **Débogage** | Analyse instantanée des logs et correction ciblée des erreurs de runtime. | Recherche documentaire (StackOverflow) et cycles de debug manuels. |
| **Adaptabilité** | Refactoring massif instantané (ex: conversion ESM vers scripts standards). | Travail de réécriture manuel long et sujet aux erreurs d'inattention. |
| **Expérience Utilisateur** | Intègre immédiatement des micro-optimisations (debounce, feedback visuel). | Nécessite une phase de conception dédiée et plusieurs itérations. |

## 🛠️ Installation et Lancement

1. Accédez au dossier : `cd phase2/phase2-Gemini`
2. Installez les dépendances : `npm install`
3. Lancez l'application : Ouvrez `index.html` dans votre navigateur.
4. Lancez les tests : `npm test`
