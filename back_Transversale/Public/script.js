const API = "http://localhost:3000/api/questions";

// 📥 POST question
document.getElementById("questionForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const f = e.target;

    const data = {
        question: f.question.value,
        choices: [f.a.value, f.b.value, f.c.value, f.d.value],
        answer: f.answer.value
    };

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    f.reset();
    loadQuestions();
});

// 📤 GET questions
async function loadQuestions() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        console.log("API DATA:", data);

        const container = document.getElementById("questionsContainer");
        container.innerHTML = "";

        // 🔥 sécurité anti crash 500
        if (!Array.isArray(data)) {
            console.error("API error:", data);
            return;
        }

        data.forEach(q => {
            const div = document.createElement("div");

            div.className = "card p-3 mb-2";

            div.innerHTML = `
                <h5>${q.question}</h5>
                <ul>
                    ${q.choices.map(c => `<li>${c}</li>`).join("")}
                </ul>
                <strong>✔ ${q.answer}</strong>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("LOAD ERROR:", err);
    }
}

loadQuestions();