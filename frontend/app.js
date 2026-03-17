const API = "http://127.0.0.1:5000";

// =====================
// STATE
// =====================
let currentPalette = ["#FF4B5C", "#1E1E24", "#F9F9F9"];
let selectedTemplate = 1;
let manualColors = false;
let token = localStorage.getItem("affichia_token") || null;
let username = localStorage.getItem("affichia_username") || null;

// =====================
// AUTH UI
// =====================
function updateAuthUI() {
    const authBtn = document.getElementById("authBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userDisplay = document.getElementById("userDisplay");

    if (token && username) {
        authBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
        userDisplay.classList.remove("hidden");
        userDisplay.textContent = `👋 ${username}`;
    } else {
        authBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
        userDisplay.classList.add("hidden");
    }
}

document.getElementById("authBtn").addEventListener("click", () => {
    document.getElementById("authModal").classList.remove("hidden");
});

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("authModal").classList.add("hidden");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    token = null;
    username = null;
    localStorage.removeItem("affichia_token");
    localStorage.removeItem("affichia_username");
    updateAuthUI();
});

// Tabs auth
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.dataset.tab;
        document.getElementById("loginForm").classList.toggle("active", tab === "login");
        document.getElementById("loginForm").classList.toggle("hidden", tab !== "login");
        document.getElementById("registerForm").classList.toggle("active", tab === "register");
        document.getElementById("registerForm").classList.toggle("hidden", tab !== "register");
    });
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errEl = document.getElementById("loginError");

    if (!email || !password) { errEl.textContent = "Remplis tous les champs."; return; }

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { errEl.textContent = data.error || "Erreur"; return; }

        token = data.token;
        username = data.username;
        localStorage.setItem("affichia_token", token);
        localStorage.setItem("affichia_username", username);
        document.getElementById("authModal").classList.add("hidden");
        updateAuthUI();
    } catch {
        errEl.textContent = "Impossible de contacter le serveur.";
    }
});

// Register
document.getElementById("registerBtn").addEventListener("click", async () => {
    const username_input = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const errEl = document.getElementById("registerError");

    if (!username_input || !email || !password) { errEl.textContent = "Remplis tous les champs."; return; }
    if (password.length < 6) { errEl.textContent = "Mot de passe trop court (min. 6 caractères)."; return; }

    try {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username_input, email, password })
        });
        const data = await res.json();
        if (!res.ok) { errEl.textContent = data.error || "Erreur"; return; }

        token = data.token;
        username = data.username;
        localStorage.setItem("affichia_token", token);
        localStorage.setItem("affichia_username", username);
        document.getElementById("authModal").classList.add("hidden");
        updateAuthUI();
    } catch {
        errEl.textContent = "Impossible de contacter le serveur.";
    }
});

// =====================
// TEMPLATE SELECTOR
// =====================
document.querySelectorAll(".template-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".template-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedTemplate = parseInt(card.dataset.template);
        applyTemplateToPreview();
    });
});

function applyTemplateToPreview() {
    const poster = document.getElementById("poster");
    poster.className = `poster template-${selectedTemplate}`;
    applyColorsToPreview();
}

// =====================
// COLOR PICKERS
// =====================
document.getElementById("color1").addEventListener("input", () => {
    manualColors = true;
    currentPalette[0] = document.getElementById("color1").value;
    applyColorsToPreview();
});

document.getElementById("color2").addEventListener("input", () => {
    manualColors = true;
    currentPalette[1] = document.getElementById("color2").value;
    applyColorsToPreview();
});

document.getElementById("color3").addEventListener("input", () => {
    manualColors = true;
    currentPalette[2] = document.getElementById("color3").value;
    applyColorsToPreview();
});

document.getElementById("resetColors").addEventListener("click", () => {
    manualColors = false;
    applyColorsToPreview();
});

function applyColorsToPreview() {
    const poster = document.getElementById("poster");
    const palette = manualColors ? [
        document.getElementById("color1").value,
        document.getElementById("color2").value,
        document.getElementById("color3").value
    ] : currentPalette;

    if (selectedTemplate === 1) {
        poster.style.background = `linear-gradient(135deg, ${palette[1]}, ${palette[0]})`;
    } else if (selectedTemplate === 3) {
        poster.style.background = `linear-gradient(45deg, ${palette[2]}, ${palette[0]})`;
    } else {
        poster.style.background = "";
    }

    // Palette dots
    const dotsEl = document.getElementById("pPalette");
    dotsEl.innerHTML = palette.map(c =>
        `<div class="palette-dot" style="background:${c}"></div>`
    ).join("");
}

// =====================
// GÉNÉRATION
// =====================
document.getElementById("generateBtn").addEventListener("click", async () => {
    const keywords = document.getElementById("keywords").value.trim();
    const style = document.getElementById("style").value;
    const organisateur = document.getElementById("organisateur").value.trim();
    const dateEvent = document.getElementById("dateEvent").value;
    const lieu = document.getElementById("lieu").value.trim();

    if (!keywords) {
        document.getElementById("keywords").focus();
        return;
    }

    const btn = document.getElementById("generateBtn");
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");

    btn.disabled = true;
    btnText.classList.add("hidden");
    btnLoader.classList.remove("hidden");

    try {
        const res = await fetch(`${API}/generate-poster`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keywords, style, organisateur, date: dateEvent, lieu })
        });

        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();

        // Mise à jour palette
        currentPalette = data.palette || currentPalette;
        if (!manualColors) {
            document.getElementById("color1").value = currentPalette[0];
            document.getElementById("color2").value = currentPalette[1];
            document.getElementById("color3").value = currentPalette[2];
        }

        // Affichage de l'affiche
        document.getElementById("pTitle").textContent = data.title;
        document.getElementById("pSlogan").textContent = data.slogan || "";
        document.getElementById("pOrganisateur").textContent = organisateur || "";
        document.getElementById("pDate").textContent = dateEvent
            ? new Date(dateEvent).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : "";
        document.getElementById("pLieu").textContent = lieu || "";

        document.getElementById("posterEmpty").classList.add("hidden");
        document.getElementById("poster").classList.remove("hidden");
        document.getElementById("posterActions").classList.remove("hidden");

        applyTemplateToPreview();

        // Sauvegarde dans localStorage
        saveToLocalHistory(data, { keywords, style, organisateur, dateEvent, lieu });

        // Rafraîchit l'historique affiché
        loadHistory();

    } catch (error) {
        alert("Erreur lors de la génération : " + error.message);
    } finally {
        btn.disabled = false;
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");
    }
});

// =====================
// HISTORIQUE LOCAL
// =====================
function saveToLocalHistory(data, meta) {
    const history = JSON.parse(localStorage.getItem("affichia_history") || "[]");

    history.unshift({
        id: data.id || Date.now(),
        title: data.title,
        slogan: data.slogan,
        palette: data.palette,
        style: meta.style,
        keywords: meta.keywords,
        organisateur: meta.organisateur,
        date: meta.dateEvent,
        lieu: meta.lieu,
        template: selectedTemplate,
        created_at: new Date().toISOString()
    });

    // Garde max 20 affiches
    if (history.length > 20) history.pop();
    localStorage.setItem("affichia_history", JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem("affichia_history") || "[]");
    const grid = document.getElementById("historyGrid");

    if (history.length === 0) {
        grid.innerHTML = `<p class="history-empty">Aucune affiche générée pour l'instant.</p>`;
        return;
    }

    grid.innerHTML = history.map(item => {
        const palette = item.palette || ["#FF4B5C", "#1E1E24", "#F9F9F9"];
        const bgStyle = item.template === 2
            ? "background: white; color: #1a1a2e;"
            : item.template === 3
            ? `background: linear-gradient(45deg, ${palette[2]}, ${palette[0]}); color: #1a1a2e;`
            : `background: linear-gradient(135deg, ${palette[1]}, ${palette[0]}); color: white;`;

        const date = item.created_at
            ? new Date(item.created_at).toLocaleDateString("fr-FR")
            : "";

        return `
            <div class="history-card" data-id="${item.id}">
                <div class="history-card-thumb" style="${bgStyle}">
                    ${item.title}
                </div>
                <div class="history-card-body">
                    <div class="history-card-title">${item.title}</div>
                    <div class="history-card-meta">
                        <span>${item.style || ""}</span>
                        <span>${date}</span>
                    </div>
                    <button class="history-card-delete" data-id="${item.id}">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join("");

    // Clic sur une carte → recharge l'affiche dans la preview
    document.querySelectorAll(".history-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.classList.contains("history-card-delete")) return;
            const id = card.dataset.id;
            const item = history.find(h => String(h.id) === String(id));
            if (!item) return;
            restorePoster(item);
        });
    });

    // Suppression
    document.querySelectorAll(".history-card-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            deleteFromHistory(id);
        });
    });
}

function deleteFromHistory(id) {
    let history = JSON.parse(localStorage.getItem("affichia_history") || "[]");
    history = history.filter(h => String(h.id) !== String(id));
    localStorage.setItem("affichia_history", JSON.stringify(history));
    loadHistory();
}

function restorePoster(item) {
    // Remplit le formulaire
    document.getElementById("keywords").value = item.keywords || "";
    document.getElementById("style").value = item.style || "soiree";
    document.getElementById("organisateur").value = item.organisateur || "";
    document.getElementById("dateEvent").value = item.date || "";
    document.getElementById("lieu").value = item.lieu || "";

    // Restaure la palette
    currentPalette = item.palette || ["#FF4B5C", "#1E1E24", "#F9F9F9"];
    manualColors = false;
    document.getElementById("color1").value = currentPalette[0];
    document.getElementById("color2").value = currentPalette[1];
    document.getElementById("color3").value = currentPalette[2];

    // Restaure le template
    selectedTemplate = item.template || 1;
    document.querySelectorAll(".template-card").forEach(c => c.classList.remove("selected"));
    document.querySelector(`[data-template="${selectedTemplate}"]`).classList.add("selected");

    // Affiche le poster
    document.getElementById("pTitle").textContent = item.title;
    document.getElementById("pSlogan").textContent = item.slogan || "";
    document.getElementById("pOrganisateur").textContent = item.organisateur || "";
    document.getElementById("pDate").textContent = item.date
        ? new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "";
    document.getElementById("pLieu").textContent = item.lieu || "";

    document.getElementById("posterEmpty").classList.add("hidden");
    document.getElementById("poster").classList.remove("hidden");
    document.getElementById("posterActions").classList.remove("hidden");

    applyTemplateToPreview();

    // Scroll vers le générateur
    document.getElementById("generator").scrollIntoView({ behavior: "smooth" });
}

// =====================
// EXPORT PDF
// =====================
document.getElementById("downloadBtn").addEventListener("click", async () => {
    const btn = document.getElementById("downloadBtn");
    btn.disabled = true;
    btn.textContent = "⏳ Génération du PDF...";

    try {
        const poster = document.getElementById("poster");
        const canvas = await html2canvas(poster, {
            scale: 3,
            useCORS: true,
            backgroundColor: null
        });

        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL("image/png");

        // Format A4 portrait
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Centrer l'affiche sur la page
        const imgWidth = 120;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

        const title = document.getElementById("pTitle").textContent || "affiche";
        pdf.save(`affichia-${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);

    } catch (error) {
        alert("Erreur lors de la génération du PDF : " + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "⬇️ Télécharger PDF";
    }
});

// =====================
// SAUVEGARDE MANUELLE
// =====================
document.getElementById("saveBtn").addEventListener("click", () => {
    const title = document.getElementById("pTitle").textContent;
    if (!title) return;

    // Déjà sauvegardé automatiquement dans localStorage
    // Ce bouton confirme juste visuellement
    const btn = document.getElementById("saveBtn");
    btn.textContent = "✅ Sauvegardé !";
    btn.style.borderColor = "var(--success)";
    btn.style.color = "var(--success)";

    setTimeout(() => {
        btn.textContent = "💾 Sauvegarder";
        btn.style.borderColor = "";
        btn.style.color = "";
    }, 2000);
});

// =====================
// INIT
// =====================
updateAuthUI();
loadHistory();
