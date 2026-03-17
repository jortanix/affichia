# 🎨 AffichIA

> Générateur d'affiches pour événements étudiants, assisté par l'intelligence artificielle.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript)
![Licence](https://img.shields.io/badge/Licence-Lyon%202-red?style=flat-square)

---

## 🖼️ C'est quoi AffichIA ?

**AffichIA** est une application web qui permet à n'importe qui — même sans compétences en design —
de créer une affiche pour un événement étudiant en quelques secondes.

Tu entres quelques mots-clés, tu choisis un style, et l'IA génère automatiquement :
- ✅ Un **titre accrocheur**
- ✅ Un **slogan percutant**
- ✅ Une **palette de couleurs** adaptée à l'ambiance
- ✅ Une **affiche prête à télécharger** en PDF

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🤖 Génération IA | Titres et slogans générés par intelligence artificielle |
| 🎨 3 templates | Soirée, Professionnel, Dynamique |
| 🎯 Couleurs manuelles | Personnalise la palette à ta guise |
| 📅 Infos événement | Ajoute date, lieu, organisateur sur l'affiche |
| ⬇️ Export PDF | Télécharge ton affiche en haute qualité |
| 🕘 Historique | Retrouve toutes tes affiches générées |
| 👤 Compte utilisateur | Inscris-toi pour sauvegarder tes créations |

---

## 🚀 Lancer l'application

### Ce dont tu as besoin

- [Python 3.10+](https://www.python.org/downloads/) — vérifie avec `python --version`
- [Git](https://git-scm.com/) — pour cloner le projet
- Un navigateur web (Chrome, Firefox, Edge...)

---

### Étape 1 — Cloner le projet

```bash
git clone https://github.com/jortanix/affichia.git
cd affichia
```

---

### Étape 2 — Configurer le backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# L'activer
# Sur Windows :
venv\Scripts\activate
# Sur Mac/Linux :
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

---

### Étape 3 — Configurer la clé IA (optionnel)

Sans clé IA, l'application fonctionne quand même en mode **demo**
(les titres et slogans sont générés localement).

Pour activer la vraie IA :
1. Crée un compte gratuit sur [huggingface.co](https://huggingface.co)
2. Va dans **Settings → Access Tokens → New Token (Read)**
3. Copie ta clé
4. Crée un fichier `backend/.env` avec ce contenu :

```env
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET_KEY=une-cle-secrete-de-ton-choix
```

---

### Étape 4 — Lancer le backend

```bash
# Dans le dossier backend/ avec le venv activé
python app.py
```

Tu dois voir :
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

Laisse ce terminal ouvert.

---

### Étape 5 — Lancer le frontend

Ouvre un **nouveau terminal** :

```bash
cd affichia/frontend
python -m http.server 8000
```

---

### Étape 6 — Ouvrir l'application

Ouvre ton navigateur et va sur :

```
http://localhost:8000
```

🎉 **C'est tout !** Tu peux maintenant générer des affiches.

---

## 🎮 Comment utiliser AffichIA ?

1. **Entre des mots-clés** décrivant ton événement
   *(ex: soirée rétro années 80, tournoi gaming, conférence développement durable)*

2. **Choisis le type d'événement** dans le menu déroulant

3. **Ajoute les infos** optionnelles : organisateur, date, lieu

4. **Sélectionne un template** visuel (Soirée / Pro / Dynamique)

5. **Personnalise les couleurs** si tu le souhaites

6. **Clique sur "Générer l'affiche"** et attends quelques secondes

7. **Télécharge** ton affiche en PDF ou sauvegarde-la dans l'historique

---

## 🗂️ Structure du projet

```
affichia/
├── backend/
│   ├── app.py              # Serveur Flask (API)
│   ├── requirements.txt    # Dépendances Python
│   ├── .env.example        # Exemple de configuration
│   └── affichia.db         # Base de données (créée automatiquement)
├── frontend/
│   ├── index.html          # Interface utilisateur
│   ├── style.css           # Design de l'application
│   └── app.js              # Logique frontend
└── README.md
```

---

## 🛠️ Stack technique

| Côté | Technologie |
|---|---|
| Backend | Python 3 + Flask |
| Base de données | SQLite |
| Authentification | JWT (JSON Web Token) |
| IA | HuggingFace Inference API (Mistral-7B) |
| Frontend | HTML / CSS / JavaScript vanilla |
| Export PDF | html2canvas + jsPDF |

---

## 👥 Équipe

| Membre | Rôle |
|---|---|
| **Gregg Henry** | Design, templates, UI/UX, identité visuelle |
| **Laura Moret** | Développement backend, intégration IA, frontend |

Projet tuteuré — **Licence 3 Informatique / Création Numérique**
Université Lumière Lyon 2 — Année universitaire 2025-2026

---

## 📝 Licence

Projet académique — Université Lyon 2.
Tous droits réservés © 2026 Gregg Henry & Laura Moret.
