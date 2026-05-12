const API = "/api/questions";


// =========================
// ➕ AJOUT QUESTION (PENDING)
// =========================

document.getElementById("questionForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const f = e.target;

    const data = {
        question: f.question.value,
        choices: [f.a.value, f.b.value, f.c.value, f.d.value],
        answer: f.answer.value
    };

    // 🔐 vérif front simple
    if (!data.choices.includes(data.answer)) {
        alert("La bonne réponse doit être dans les choix que vous proposez");
        return;
    }

    try {
        const res = await fetch(`${API}/pending`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.message || "Erreur serveur");
            return;
        }

        f.reset();
        loadPending();

    } catch (err) {
        console.error("POST ERROR:", err);
    }
});


// =========================
// LOAD PENDING QUESTIONS
// =========================

async function loadPending() {
    try {
        const res = await fetch(`${API}/pending`);

        if (!res.ok) {
            console.error("Erreur API pending:", res.status);
            return;
        }

        const data = await res.json();

        const container = document.getElementById("pendingContainer");
        container.innerHTML = "";

        data.forEach(q => {
            container.innerHTML += `
                <div class="card p-3 mb-2 position-relative">

                    <div class="position-absolute top-0 end-0 m-2">
                        <button class="btn btn-success btn-sm" onclick="approve(${q.id})">✔</button>
                        <button class="btn btn-danger btn-sm" onclick="reject(${q.id})">✖</button>
                    </div>

                    <b>${q.question}</b>

                    <ul>
                        ${Array.isArray(q.choices)
                            ? q.choices.map(c => `<li>${c}</li>`).join("")
                            : ""}
                    </ul>

                    <small>✔ Réponse: ${q.answer}</small>
                </div>
            `;
        });

    } catch (err) {
        console.error("LOAD PENDING ERROR:", err);
    }
}


// =========================
// LOAD VALIDATED QUESTIONS
// =========================

async function loadQuestions() {
    try {
        const res = await fetch(API);

        if (!res.ok) return;

        const data = await res.json();

        const container = document.getElementById("questionsContainer");
        container.innerHTML = "";

        data.forEach(q => {
            container.innerHTML += `
                <div class="card p-2 mb-2">
                    <b>${q.question}</b>
                    <div><small>✔ ${q.answer}</small></div>
                </div>
            `;
        });

    } catch (err) {
        console.error("LOAD QUESTIONS ERROR:", err);
    }
}


// =========================
// ✔ APPROVE QUESTION
// =========================

async function approve(id) {
    const password = prompt("Mot de passe admin");

    try {
        const res = await fetch(`${API}/approve/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Erreur");
            return;
        }

        loadPending();
        loadQuestions();

    } catch (err) {
        console.error("APPROVE ERROR:", err);
    }
}


// =========================
// ✖ REJECT QUESTION
// =========================

async function reject(id) {
    const password = prompt("Mot de passe admin");

    try {
        const res = await fetch(`${API}/reject/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Erreur");
            return;
        }

        loadPending();

    } catch (err) {
        console.error("REJECT ERROR:", err);
    }
}


// =========================
// INIT
// =========================

loadPending();
loadQuestions();