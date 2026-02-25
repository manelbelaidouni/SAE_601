# SAE 601 - Phase 2 (Gemini)

Ce document répertorie les travaux effectués lors de la **Phase Gemini** pour le projet de Générateur de Diagramme de Voronoï.

## 🚀 Prompts Utilisés

| Étape | Prompt (Résumé) |
| :--- | :--- |
| **Initialisation** | Création d'une application HTML/JS/CSS pour importer des coordonnées .txt et générer un Voronoï avec export SVG/PNG. |
| **Optimisation** | Amélioration ergonomique pour éviter le scroll et voir le diagramme en plein écran. |
| **Tests** | Mise en place d'une série de tests logiciels complets (Unitaires et E2E). |
| **Correction** | Résolution des erreurs d'exécution des tests et explications de la logique. |

## 📝 Journal des Corrections

| Problème Rencontré | Cause | Correction Apportée |
| :--- | :--- | :--- |
| **Scroll excessif** | Dimensions fixes du SVG (800px). | Passage à un layout Flexbox plein écran et utilisation de `viewBox` responsive. |
| **Conflit de Test** | Vitest tentait de lire les tests Playwright. | Ajout de `exclude: ['tests/e2e.test.js']` dans `vitest.config.js`. |
| **Erreur Dépendance** | D3 non défini dans l'environnement de test JSDOM. | Injection manuelle de `d3` dans le global de Vitest pour les tests unitaires. |

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

## 🛠️ Installation et Lancement

1. Accédez au dossier : `cd phase2/phase2-Gemini`
2. Installez les dépendances : `npm install`
3. Lancez l'application : Ouvrez `index.html` dans votre navigateur.
4. Lancez les tests : `npm test`
