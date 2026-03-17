from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()
app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "AffichIA API"}), 200

@app.route("/generate-poster", methods=["POST"])
def generate_poster():
    data = request.get_json() or {}
    keywords = data.get("keywords", "")
    style = data.get("style", "soiree")

    try:
        prompt = f"""
        Tu es un créatif spécialisé en communication événementielle.
        Génère pour un événement de type "{style}" avec les mots-clés "{keywords}" :
        - 1 titre accrocheur (max 6 mots)
        - 1 slogan percutant (max 12 mots)
        - 3 couleurs HEX adaptées à l'ambiance

        Réponds UNIQUEMENT en JSON avec ce format :
        {{
            "title": "...",
            "slogan": "...",
            "palette": ["#XXXXXX", "#XXXXXX", "#XXXXXX"]
        }}
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )

        import json
        content = response.choices[0].message.content
        result = json.loads(content)
        result["layout"] = "template_1"
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
