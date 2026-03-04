from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "AffichIA API"}), 200

@app.route("/generate-poster", methods=["POST"])
def generate_poster():
    data = request.get_json() or {}
    keywords = data.get("keywords", "")
    style = data.get("style", "soiree")

    # MOCK : appel à l'API d'IA plus tard
    response = {
        "title": f"Soirée {keywords.capitalize()}" if keywords else "Soirée AffichIA",
        "slogan": f"Une ambiance {style} à ne pas manquer",
        "palette": ["#FF4B5C", "#1E1E24", "#F9F9F9"],
        "layout": "template_1"
    }
    return jsonify(response), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
