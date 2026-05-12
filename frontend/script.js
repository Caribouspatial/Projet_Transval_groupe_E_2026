const questions = [
  {
    question: "Quelle est la capitale de la Belgique ?",
    reponses: {
      A: "Paris",
      B: "Bruxelles",
      C: "Madrid",
      D: "Berlin"
    },
    bonne: "B"
  },
  {
    question: "2 + 2 = ?",
    reponses: {
      A: "3",
      B: "4",
      C: "5",
      D: "6"
    },
    bonne: "B"
  }
];

let index = 0;

let scoreJ1 = 0;
let scoreJ2 = 0;

// état du tour
let joueurAyantBuzz = null;

// blocage par question
let bloqueJ1 = false;
let bloqueJ2 = false;

// compteur de joueurs bloqués
let joueursBloques = 0;

let questionTerminee = false;
let btnJ1, btnJ2;

function afficherQuestion() {
  const q = questions[index];

  document.getElementById("question").innerText = q.question;

  const container = document.getElementById("reponses");
  container.innerHTML = "";

  for (let key in q.reponses) {
    const btn = document.createElement("button");

    btn.innerText = q.reponses[key];

    btn.onclick = function () {
      repondre(key);
    };

    container.appendChild(btn);
  }

  resetTour();

  document.getElementById("status").innerText =
    "J1: " + scoreJ1 + " | J2: " + scoreJ2;
}

function buzzer(j) {
  if (questionTerminee) return;

  // joueur bloqué ne peut pas buzzer
  if (j === 1 && bloqueJ1) return;
  if (j === 2 && bloqueJ2) return;

  if (!joueurAyantBuzz) {
    joueurAyantBuzz = j;

    document.getElementById("buzz").innerText =
      "Joueur " + j + " a buzzé";
  }
}

function repondre(rep) {
  if (!joueurAyantBuzz || questionTerminee) return;

  const q = questions[index];
  let j = joueurAyantBuzz;

  // mauvaise réponse
  if (rep !== q.bonne) {
    document.getElementById("resultat").innerText =
      "Joueur " + j + " s'est trompé";

    document.getElementById("buzz").innerText = "";

    // blocage + bouton rouge
    if (j === 1 && !bloqueJ1) {
      bloqueJ1 = true;
      joueursBloques++;
      btnJ1.style.background = "red";
    }

    if (j === 2 && !bloqueJ2) {
      bloqueJ2 = true;
      joueursBloques++;
      btnJ2.style.background = "red";
    }

    joueurAyantBuzz = null;

    // si les 2 sont bloqués → nouvelle question
    if (joueursBloques === 2) {
      document.getElementById("resultat").innerText =
        "Personne n'a trouvé la réponse";

      questionTerminee = true;
      setTimeout(nextQuestion, 1000);
    }

    return;
  }

  // ✔ bonne réponse
  if (j === 1) scoreJ1++;
  if (j === 2) scoreJ2++;

  document.getElementById("resultat").innerText =
    "Joueur " + j + " gagne le point !";

  document.getElementById("buzz").innerText = "";

  questionTerminee = true;

  checkWin();

  setTimeout(nextQuestion, 1000);
}

function nextQuestion() {
  index = (index + 1) % questions.length;
  afficherQuestion();
}

function checkWin() {
  if (scoreJ1 === 10) finPartie(1);
  if (scoreJ2 === 10) finPartie(2);
}

function finPartie(j) {
  document.getElementById("question").innerText =
    "🏆 Joueur " + j + " gagne la partie !";

  document.getElementById("reponses").innerHTML = "";
  document.getElementById("status").innerText = "Fin du jeu";
}

function resetTour() {
    joueurAyantBuzz = null;
    bloqueJ1 = false;
    bloqueJ2 = false;
    joueursBloques = 0;
    questionTerminee = false;

    document.getElementById("resultat").innerText = "";
    document.getElementById("buzz").innerText = "";
    btnJ1.style.background = "";
    btnJ2.style.background = "";
}

init();

// init au chargement
function init() {
  btnJ1 = document.getElementById("buzzer1");
  btnJ2 = document.getElementById("buzzer2");

  afficherQuestion();
}