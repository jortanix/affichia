const generateBtn = document.getElementById("generateBtn");
const resultDiv = document.getElementById("result");

generateBtn.addEventListener("click", async () => {
    const keywords = document.getElementById("keywords").value;
    const style = document.getElementById("style").value;

    if (!keywords.trim()) {
        alert("Veuillez entrer au moins un mot-clé");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Génération en cours...";

    try {
        const res = await fetch("http://127.0.0.1:5000/generate-poster", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keywords, style }),
        });

        if (!res.ok) throw new Error("Erreur serveur");

        const data = await res.json();

        resultDiv.innerHTML = `
            <h2>${data.title}</h2>
            <p><strong>Slogan :</strong> ${data.slogan}</p>
            <div class="palette">
                ${data.palette.map(color => `<div class="color-box" style="background: ${color};"></div>`).join("")}
            </div>
            <p><small>Layout: ${data.layout}</small></p>
        `;
        resultDiv.classList.add("show");

    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">❌ Erreur : ${error.message}</p>`;
        resultDiv.classList.add("show");
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Générer une affiche";
    }
});
