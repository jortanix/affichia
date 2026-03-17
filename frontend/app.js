const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const posterPreview = document.getElementById("posterPreview");
const poster = document.getElementById("poster");
let selectedTemplate = 1;

// Sélection du template
document.querySelectorAll(".template-option").forEach(option => {
    option.addEventListener("click", () => {
        document.querySelectorAll(".template-option").forEach(o => o.classList.remove("selected"));
        option.classList.add("selected");
        selectedTemplate = parseInt(option.dataset.template);
    });
});

// Génération de l'affiche
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

        // Mise à jour du contenu de l'affiche
        document.getElementById("posterTitle").textContent = data.title;
        document.getElementById("posterSlogan").textContent = data.slogan;

        // Palette de couleurs
        const paletteDiv = document.getElementById("posterPalette");
        paletteDiv.innerHTML = data.palette
            .map(c => `<div class="poster-color" style="background:${c}"></div>`)
            .join("");

        // Application du template sélectionné
        poster.className = `poster template-${selectedTemplate}`;

        // Couleur de fond dynamique avec la palette générée
        if (selectedTemplate === 1) {
            poster.style.background = `linear-gradient(135deg, ${data.palette[1]}, ${data.palette[0]})`;
        } else if (selectedTemplate === 3) {
            poster.style.background = `linear-gradient(45deg, ${data.palette[2]}, ${data.palette[0]})`;
        }

        posterPreview.classList.remove("hidden");

    } catch (error) {
        alert("Erreur : " + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Générer une affiche";
    }
});

// Export PDF
downloadBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;

    const canvas = await html2canvas(poster, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save("affiche-affichia.pdf");
});
