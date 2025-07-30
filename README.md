# Privus

Assistant IA personnel combinant Next.js et Python.

## Développement

- `npm run dev` pour lancer l'interface Next.js
- `pytest -q` pour lancer les tests Python

## IA locale

Privus peut fonctionner sans dépendance à OpenAI en utilisant la librairie `gpt4all`.
Le modèle par défaut est téléchargé dans `~/.privus/models/` (environ 4 Go).
Prévoir au moins **8 Go de RAM** pour l'exécution.

Dans les paramètres, cliquez sur "Télécharger modèle" pour récupérer le fichier puis
sélectionnez le mode "local".
