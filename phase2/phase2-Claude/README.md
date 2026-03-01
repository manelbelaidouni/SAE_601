# SAE 601 - Phase 2 (Claude)

Ce document répertorie les travaux effectués lors de la **Phase Claude** pour le projet de Générateur de Diagramme de Voronoï.

## Prompts Utilisés

| Étape | Prompt |
| :--- | :--- |
|   1   | Génère une application web qui calcule le diagramme de Voronoi à partir d’un fichier .txt contenant les coordonnées d’un point (sous format x,y) par ligne.les valeurs peuvent etre des int ou des float. S’il y a des lignes vides, elles devront etre ignorées. S’il existe des coordonneés incorrectes, un message d’erreur doit etre affiché. Les espaces sont acceptés. l’application doit etre structuré sur 3 fichiers : index.html, style.css et script.js.  Il faudra uen visualisation graphique où les canvas doivent etre de 600 x 600 pixels. Des boutons devront etre inclus dans linterface pour importer, generer, exporter un svg; exporter un png. Concernant l’algorithme, il devra calculer la distance euclidienne entre un pixel et un point source. Chaque piwel doit etre associeé au point le plus proche et chaque zone doit avoir une couleur unique.affiche aussi les points sources par-dessus les zones. Pour la qualite de code, tu devras utiliser les bonnes pratiques pour un code structuré et maintenable. L’application devra inclure une serie de tests pour les cas valides et invalides |
| 2 | Relie le fichier html au fichier css |
| 3 | separe les tests de l'application en les mettant dans un fichier tests.js. ils ne doivent plus apparaitre dans l'interface et les executer separement |
| 4 | exécute les tests avec vitest dans un environnement Node. Adapte la structure du projet pour rendre les fonctions testables hors navigateur et indique les dépendances nécessaires |
| 5 | lorsque j’exécute npm run test avec Vitest, j’obtiens l’erreur suivante :Error: Expected ',', got '!' dans le fichier core.test.js.Analyse le fichier et corrige l’erreur de syntaxe en expliquant la cause. |

## Journal des Corrections

| Problème Rencontré | Cause | Correction Apportée |
| :--- | :--- | :--- |
| CSS non appliqué | Le fichier style.css n’était pas correctement relié à index.html. La balise <link> était mal écrite ou mal placée. | Ajout du lien correct vers style.css dans le <head> et vérification dans le navigateur. |
| Tests visibles dans l’interface | Les tests étaient écrits dans le même fichier que l’application et s’exécutaient dans la page. L’interface et les tests n’étaient pas séparés. | Création d’un fichier tests.js séparé et suppression de l’exécution des tests côté interface. |
| Fonctions difficiles à tester | Une partie du code de calcul dépendait directement du canvas et du navigateur. | Séparation des fonctions de calcul (parsing, distance, Voronoï) dans un fichier distinct pour pouvoir les tester avec Vitest. |
| Tests non exécutés | Le projet n’était pas configuré pour exécuter des tests avec Node. Il n’y avait pas de package.json ni de dépendances installées. | Initialisation du projet avec npm, installation de Vitest et ajout d’un script npm test. |
| Erreur Vitest | Une erreur de syntaxe dans core.test.js empêchait le lancement des tests. | Correction de la ligne incorrecte puis relance de npm test jusqu’à validation complète. |

## Tests Logiciels

Les tests mis en place sont les suivants : 

### Tests unitaires (Vitest)

**Lieu :** `src/core.test.js`  
**Objectif :** Vérification de la logique interne du programme, notamment le parsing des coordonnées (entiers, flottants, formats invalides), le calcul de la distance euclidienne et l’assignation correcte des pixels au point le plus proche.  
**Lancement :** Exécution via la commande `npm test`

### Vérification manuelle

**Lieu :** Application exécutée dans le navigateur.  
**Objectif :** Vérification du rendu graphique à partir de différents jeux de données (un seul point, plusieurs points répartis, fichier vide, coordonnées proches des bords du canvas) afin de s’assurer que le diagramme est correctement généré et qu’aucune erreur ne survient lors de l’import ou de la génération.  
**Lancement :** Ouverture du fichier `index.html` dans le navigateur et import manuel des fichiers de test.

### Tests complémentaires

**Lieu :** `src/core.test.js`  
**Objectif :** Vérification de cas limites : points alignés, grand nombre de points et doublons.  
**Lancement :** `npm test`

## Comparatif : IA vs Développement Humain

| Aspect | IA (Claude) | Développement Humain |
| :--- | :--- | :--- |
| Productivité | Génération très rapide d’une application complète. | Développement plus lent, compréhension progressive de l’algorithme. |
| Rigueur | Code structuré mais nécessite plusieurs ajustements après exécution des tests. | Construction plus contrôlée, moins d’erreurs structurelles dès le départ. |
| Débogage | Correction rapide si l’erreur est bien décrite dans le prompt. | Recherche manuelle via la console, les logs et les tests successifs. |
| Tests | Mise en place rapide de tests avec Vitest. | Sélection des cas de test basée sur l’analyse et la compréhension du code. |
| Architecture | Tendance à mélanger l'UI et la logique au début avant de refactoriser. | Séparation plus naturelle entre logique métier et interface. |
| Adaptabilité | Refactorisation rapide (par exemple la migration vers Vitest). | Changements plus longs car chaque modification est faite manuellement. |

## Installation et lancement 

1. Accédez au dossier : `cd phase2/phase2-Mistral`
2. Installez les dépendances : `npm install`
3. Lancez l'application : Ouvrez `index.html` dans votre navigateur.
4. Lancez les tests : `npm test`
5. Lancez les tests E2E : `npm run test:e2e`
