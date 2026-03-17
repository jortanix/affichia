from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from dotenv import load_dotenv
import requests, os, json
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Config ---
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///affichia.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

HF_API_KEY = os.getenv("HF_API_KEY")
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

# =====================
# MODÈLES BDD
# =====================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posters = db.relationship("Poster", backref="user", lazy=True)

class Poster(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slogan = db.Column(db.String(300))
    keywords = db.Column(db.String(200))
    style = db.Column(db.String(50))
    date_event = db.Column(db.String(50))
    lieu = db.Column(db.String(100))
    organisateur = db.Column(db.String(100))
    palette = db.Column(db.String(200))
    template = db.Column(db.String(20), default="template_1")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

with app.app_context():
    db.create_all()

# =====================
# ROUTES AUTH
# =====================

@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "Tous les champs sont requis"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email déjà utilisé"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Nom d'utilisateur déjà pris"}), 409

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password=hashed)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "username": user.username}), 201

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "")
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Identifiants incorrects"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "username": user.username}), 200

@app.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    return jsonify({"id": user.id, "username": user.username, "email": user.email}), 200

# =====================
# ROUTES AFFICHES
# =====================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "AffichIA API"}), 200

@app.route("/generate-poster", methods=["POST"])
def generate_poster():
    data = request.get_json() or {}
    keywords  = data.get("keywords", "")
    style     = data.get("style", "soiree")
    date_event    = data.get("date", "")
    lieu      = data.get("lieu", "")
    organisateur = data.get("organisateur", "")

    # Appel HuggingFace
    try:
        prompt = f"""<s>[INST]
Tu es un créatif spécialisé en communication événementielle.
Génère pour un événement de type "{style}" avec les mots-clés "{keywords}" :
- 1 titre accrocheur (max 6 mots)
- 1 slogan percutant (max 12 mots)
- 3 couleurs HEX adaptées à l'ambiance

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{{"title": "...", "slogan": "...", "palette": ["#XXXXXX", "#XXXXXX", "#XXXXXX"]}}
[/INST]"""

        headers = {"Authorization": f"Bearer {HF_API_KEY}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.8,
                "return_full_text": False
            }
        }
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        raw = response.json()[0]["generated_text"].strip()

        # Extraire le JSON de la réponse
        start = raw.find("{")
        end = raw.rfind("}") + 1
        result = json.loads(raw[start:end])

    except Exception as e:
        # Fallback mock si HuggingFace échoue
        result = {
            "title": f"Soirée {keywords.capitalize()}",
            "slogan": f"Une ambiance {style} à ne pas manquer",
            "palette": ["#FF4B5C", "#1E1E24", "#F9F9F9"]
        }

    result["layout"] = "template_1"
    result["date"] = date_event
    result["lieu"] = lieu
    result["organisateur"] = organisateur

    # Sauvegarde en BDD (sans auth requise pour l'instant)
    poster = Poster(
        title=result["title"],
        slogan=result.get("slogan", ""),
        keywords=keywords,
        style=style,
        date_event=date_event,
        lieu=lieu,
        organisateur=organisateur,
        palette=json.dumps(result["palette"])
    )
    db.session.add(poster)
    db.session.commit()
    result["id"] = poster.id

    return jsonify(result), 200

@app.route("/posters", methods=["GET"])
def get_posters():
    posters = Poster.query.order_by(Poster.created_at.desc()).limit(20).all()
    return jsonify([{
        "id": p.id,
        "title": p.title,
        "slogan": p.slogan,
        "keywords": p.keywords,
        "style": p.style,
        "date": p.date_event,
        "lieu": p.lieu,
        "organisateur": p.organisateur,
        "palette": json.loads(p.palette) if p.palette else [],
        "created_at": p.created_at.isoformat()
    } for p in posters]), 200

@app.route("/posters/<int:poster_id>", methods=["DELETE"])
@jwt_required()
def delete_poster(poster_id):
    poster = Poster.query.get_or_404(poster_id)
    db.session.delete(poster)
    db.session.commit()
    return jsonify({"message": "Affiche supprimée"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
