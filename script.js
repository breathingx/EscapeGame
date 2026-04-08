
// =================================================
// TIMER 
// =================================================

if (
    // window.location.pathname.includes("game.html") ||
    // window.location.pathname.includes("codes.html") ||
    // window.location.pathname.includes("template.html")
    document.getElementById("timer")
) {

    const timerElement = document.getElementById("timer");

    // Als er nog geen timer bestaat, start op 60 min
    if (!localStorage.getItem("totalSeconds")) {
        localStorage.setItem("totalSeconds", 60 * 60);
    }

    function updateTimer() {

        let totalSeconds = parseInt(localStorage.getItem("totalSeconds"));

        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        if (seconds < 10) seconds = "0" + seconds;

        timerElement.textContent = minutes + ":" + seconds;

        if (totalSeconds > 0) {
            totalSeconds--;
            localStorage.setItem("totalSeconds", totalSeconds);
        } else {
            clearInterval(countdown);
            alert("Tijd is op!");
            localStorage.removeItem("totalSeconds");
            window.location.href = "home.html";
        }
    }

    const countdown = setInterval(updateTimer, 1000);
    updateTimer();
}


// =================================================
// GAME STATE
// =================================================

let team;
let huidigeOpdracht = 0;
let correcteAntwoorden = 0;
let score = 0;
let foutPogingen = 0;
let antwoordIsCorrect = false;

let hintGebruiktPerVraag = 0;
let laatsteHintTijd = 0;
let gebruikteHints = [];
const maxHints = 3;
const hintCooldown = 180;
let hintInterval = null;


// =================================================
// DATA
// =================================================

const uitlegData = {
    aandrijving: [
        "Koppel mechaniek interactives aan dagelijkse dingen.",
        "Bekijk het object met een blacklight.",
        "Shuif de ballans om het draaipunt te vinden.",
        "Beantwoord de vragen correct.",
        "Draai aan de tandwielen om de code te kraaken.",
        "Draai aan de hendel voor de muziek."
    ],
    programma: [
        "Maak de QR-puzzel, en scan de QR-code.",
        "Programeer met de blokken de juiste route.",
        "Draai met de schijf en vind de code.",
        "Draai de decoder om de juiste letters te vinden.",
        "Leg het orgelboek over de plaat en vind de letters.",
        "Gebruik de 1 en 0 om een woord te schrijven."
    ],
    klankbron: [
        "Druk de juiste knoppen in om het liedje te spelen.",
        "Zing de juiste toon.",
        "Luister naar de muziek en vind het instrument.",
        "Welk liedje woord hier gecombineerd.",
        "Hoe zien de geluidsgolven van dit liedje er uit?",
        "Beantwoord de vragen correct."        
    ]
};


const hintData = {
    aandrijving: [
        [
            "Denk aan beweging en kracht.",
            "Het heeft te maken met mechaniek koppelen.",
            "AAN111"
        ],
        [
            "Gebruik licht om iets te zien dat normaal verborgen blijft.",
            "Blacklight maakt het zichtbaar.",
            "AAN222"
        ],
        [
            "Het draait om balans en evenwicht.",
            "Zoek het punt waar alles in balans komt.",
            "AAN333"
        ],
        [
            "Lees goed en denk logisch na.",
            "De antwoorden wijzen je de weg.",
            "AAN444"
        ],
        [
            "Tandwielen werken samen om iets te onthullen.",
            "Draai tot alles precies in elkaar past.",
            "AAN555"
        ],
        [
            "Beweging zorgt voor geluid.",
            "De hendel activeert de muziek.",
            "AAN666"
        ]
    ],
    programma: [
        [
            "Je moet iets scannen om verder te komen.",
            "De QR-code onthult de volgende stap.",
            "PRO111"
        ],
        [
            "Denk in stappen en volgorde.",
            "De blokken vormen samen de juiste route.",
            "PRO222"
        ],
        [
            "De schijf draait en onthult een code.",
            "Let op de juiste positie.",
            "PRO333"
        ],
        [
            "Zoek de juiste letters door te draaien.",
            "De decoder geeft het antwoord prijs.",
            "PRO444"
        ],
        [
            "Het orgelboek bevat verborgen informatie.",
            "Leg het precies op de plaat om letters te vinden.",
            "PRO555"
        ],
        [
            "Denk binair: 1 en 0 vormen samen een woord.",
            "Gebruik de juiste volgorde van bits.",
            "PRO666"
        ]
    ],
    klankbron: [
        [
            "Luister goed naar het patroon.",
            "De juiste knoppen spelen het liedje.",
            "KLA111"
        ],
        [
            "Gebruik je stem.",
            "De toon moet precies kloppen.",
            "KLA222"
        ],
        [
            "Herken het geluid.",
            "Het instrument verklapt het antwoord.",
            "KLA333"
        ],
        [
            "Twee liedjes worden gecombineerd.",
            "Denk aan bekende melodieën.",
            "KLA444"
        ],
        [
            "Geluidsgolven hebben een herkenbare vorm.",
            "Kijk naar het ritme in de golf.",
            "KLA555"
        ],
        [
            "Lees goed en denk logisch.",
            "De vragen leiden naar het antwoord.",
            "KLA666"
        ]
    ]
};



const antwoordData = {
    aandrijving: [
        "AAN111",
        "AAN222",
        "AAN333",
        "AAN444",
        "AAN555",
        "AAN666"
    ],
    programma: [
        "PRO111",
        "PRO222",
        "PRO333",
        "PRO444",
        "PRO555",
        "PRO666"
    ],
    klankbron: [
        "KLA111",
        "KLA222",
        "KLA333",
        "KLA444",
        "KLA555",
        "KLA666"
    ]
};

// =================================================
// NAVIGATIE
// =================================================

function gaNaarHome() {
    window.location.href = "home.html";
}

function restartGame() {
    localStorage.clear();
    window.location.href = "index.html";
}

// =================================================
// GAME INITIALISATIE
// =================================================

function startGame(gekozenTeam) {

    // Reset game state
    localStorage.setItem("team", gekozenTeam);
    localStorage.setItem("opdracht", 0);
    localStorage.setItem("correct", 0);
    localStorage.setItem("score", 0);
    localStorage.setItem("totalSeconds", 60 * 60);

    // Fade animatie
    document.body.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = "template.html";
    }, 300);
}

// const uitlegTekst = document.getElementById("uitlegTekst");
// if (uitlegTekst && team) {
//     uitlegTekst.textContent = uitlegData[team][huidigeOpdracht];
// }


if (window.location.pathname.includes("template.html")) {

    team = localStorage.getItem("team");
    huidigeOpdracht = parseInt(localStorage.getItem("opdracht")) || 0;
    correcteAntwoorden = parseInt(localStorage.getItem("correct")) || 0;
    score = parseInt(localStorage.getItem("score")) || 0;

    const progressBar = document.getElementById("progressBar");
    if (team && progressBar) {
        progressBar.classList.add(team);
    }

    if (!team || !uitlegData[team]) {
        window.location.href = "home.html";
    } else {
        laadOpdracht();
    }

    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            verwerkActie();
        }
    });
}


// =================================================
// GAME LOGICA
// =================================================


function initHeader() {
    const team = localStorage.getItem("team");
    const opdracht = parseInt(localStorage.getItem("opdracht")) || 0;
    const score = localStorage.getItem("score") || 0;

    const teamTitel = document.getElementById("teamTitel");
    const opdrachtNummer = document.getElementById("opdrachtNummer");
    const scoreDisplay = document.getElementById("scoreDisplay");

    if (teamTitel) {
        teamTitel.textContent = "Team: " + team;
    }

    if (opdrachtNummer) {
        opdrachtNummer.textContent = "Opdracht " + (opdracht + 1) + " van 6";
    }

    if (scoreDisplay) {
        scoreDisplay.textContent = "Score: " + score;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    initHeader();
});


function laadOpdracht() {

    antwoordIsCorrect = false;
    hintGebruiktPerVraag = 0;
    laatsteHintTijd = 0;
    gebruikteHints = [];

    const actieBtn = document.getElementById("actieBtn");
    actieBtn.textContent = "Controleer";
    actieBtn.classList.remove("correct-state");
    actieBtn.classList.remove("aandrijving", "programma", "klankbron");

    // document.getElementById("antwoordInput").disabled = false;
    const antwoordInput = document.getElementById("antwoordInput");
    if (antwoordInput) {
        antwoordInput.disabled = false;
    }

    const inputs = document.querySelectorAll(".codeInput");
    inputs.forEach(input => {
        input.value = "";
        input.disabled = false;
    });

    document.getElementById("uitlegTekst").textContent =
        uitlegData[team][huidigeOpdracht];

    document.getElementById("teamTitel").textContent = "Team: " + team.charAt(0).toUpperCase() + team.slice(1);
    document.getElementById("opdrachtNummer").textContent =
        "Opdracht " + (huidigeOpdracht + 1) + " van 6";

    // document.getElementById("vraag").textContent =
    //     opdrachten[team][huidigeOpdracht].vraag;

    document.getElementById("feedback").textContent = "";
    // document.getElementById("antwoordInput").value = "";
    document.getElementById("scoreDisplay").textContent = "Score: " + score;

    foutPogingen = 0;
    opgeslagenHint = "";
    hintGebruiktPerVraag = 0;
    document.getElementById("hintText").textContent = "";

    updateHintBlocks();
    updateProgressBar();
}


function verwerkActie() {

    if (antwoordIsCorrect) {
        volgendeOpdracht();
        return;
    }

    const inputs = document.querySelectorAll(".codeInput");

    let invoer = "";
    inputs.forEach(input => {
        invoer += input.value;
    });

    invoer = invoer.toUpperCase().trim();

    let juistAntwoord = antwoordData[team][huidigeOpdracht];

    if (invoer === juistAntwoord) {

        document.getElementById("feedback").textContent = "Goed gedaan!";

        let punten = 10 - foutPogingen;
        if (punten < 0) punten = 0;

        score += punten;
        localStorage.setItem("score", score);
        document.getElementById("scoreDisplay").textContent = "Score: " + score;

        correcteAntwoorden++;
        localStorage.setItem("correct", correcteAntwoorden);
        updateProgressBar();

        antwoordIsCorrect = true;

        const actieBtn = document.getElementById("actieBtn");

        if (huidigeOpdracht === 5) {
            actieBtn.textContent = "Kraak de code";
        } else {
            actieBtn.textContent = "Volgende opdracht";
        }

        actieBtn.classList.add("correct-state");
        actieBtn.classList.add(team);

        // inputs locken
        inputs.forEach(input => input.disabled = true);

    } else {
        document.getElementById("feedback").textContent = "Onjuist, probeer opnieuw.";
        foutPogingen++;
    }
}


function volgendeOpdracht() {

    huidigeOpdracht++;

    if (huidigeOpdracht < 6) {
        localStorage.setItem("opdracht", huidigeOpdracht);
        laadOpdracht();
    } else {
        window.location.href = "codes.html";
    }
}


// =================================================
// PROGRESS BAR
// =================================================

function updateProgressBar() {
    const percentage = (correcteAntwoorden / 6) * 100;
    document.getElementById("progressBar").style.width = percentage + "%";
}


// =================================================
// HINT SYSTEEM
// =================================================

function geefHint() {

    const overlay = document.getElementById("hintOverlay");
    const modalText = document.getElementById("hintModalText");
    const hintTitle = document.getElementById("hintTitle");
    const actions = document.getElementById("hintActions");

    hintTitle.style.display = "block";
    hintTitle.textContent = "Hint";

    const huidigeTijd = Math.floor(Date.now() / 1000);

    if (laatsteHintTijd !== 0) {
    let verschil = huidigeTijd - laatsteHintTijd;

    if (verschil < hintCooldown) {

        overlay.style.display = "flex";
        actions.style.display = "none";
        modalText.innerHTML = "";

        if (hintInterval) clearInterval(hintInterval);

        hintInterval = setInterval(() => {

            let nu = Math.floor(Date.now() / 1000);
            let resterend = hintCooldown - (nu - laatsteHintTijd);

            let minuten = Math.floor(resterend / 60);
            let seconden = resterend % 60;
            if (seconden < 10) seconden = "0" + seconden;

            let vorigeHintsHTML = "";

            if (gebruikteHints.length > 0) {
                vorigeHintsHTML = "<br><br><strong>Vorige hints:</strong><ul>";
                gebruikteHints.forEach((hint) => {
                    vorigeHintsHTML += `<li>${hint}</li>`;
                });
                vorigeHintsHTML += "</ul>";
            }

            if (resterend <= 0) {
                modalText.innerHTML = "Je kunt nu weer een hint gebruiken." + vorigeHintsHTML;
                clearInterval(hintInterval);
                return;
            }

            modalText.innerHTML =
                `Wacht nog <strong>${minuten}:${seconden}</strong> voor een nieuwe hint.` +
                vorigeHintsHTML;

        }, 1000);

        return;
    }
}

    if (hintGebruiktPerVraag >= maxHints) {
        modalText.textContent = "Je hebt alle hints gebruikt.";
        overlay.style.display = "flex";
        return;
    }

    modalText.textContent = "Weet je zeker dat je een hint wilt gebruiken?";
    actions.style.display = "flex";
    overlay.style.display = "flex";

    document.getElementById("confirmHint").onclick = () => {
        actions.style.display = "none";
        gebruikHint();
    };

    document.getElementById("cancelHint").onclick = () => {
        actions.style.display = "none";
        overlay.style.display = "none";
    };
}

function updateHintBlocks() {
    const blocks = document.querySelectorAll("#hintBlocks .hintBlock");

    blocks.forEach((block, index) => {
        if (index < hintGebruiktPerVraag) {
            block.classList.add("used");
        } else {
            block.classList.remove("used");
        }
    });
}

function gebruikHint() {

    const overlay = document.getElementById("hintOverlay");
    const modalText = document.getElementById("hintModalText");

    const huidigeTijd = Math.floor(Date.now() / 1000);

    hintGebruiktPerVraag++;
    laatsteHintTijd = huidigeTijd;

    const hints = hintData[team][huidigeOpdracht];

    let tekst = "";

    if (hintGebruiktPerVraag === 1) {
        tekst = hints[0];
    } else if (hintGebruiktPerVraag === 2) {
        tekst = hints[1];
    } else if (hintGebruiktPerVraag === 3) {
        tekst = "Code: " + hints[2];
    }

    gebruikteHints.push(tekst);

    modalText.innerHTML = `<ul><li>${tekst}</li></ul>`;

    foutPogingen += 5;

    updateHintBlocks();
}

document.addEventListener("DOMContentLoaded", function() {

    const closeBtn = document.getElementById("closeHint");
    const overlay = document.getElementById("hintOverlay");

    if (closeBtn && overlay) {
        closeBtn.addEventListener("click", function() {
            overlay.style.display = "none";
        });

        // Extra: klik buiten de modal sluit ook
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) {
                overlay.style.display = "none";
            }
        });
    }
});


// =================================================
// TEAM CODES
// =================================================

const teamCodes = {
    aandrijving: "AA00",
    programma: "PR00",
    klankbron: "KL00"
};


if (window.location.pathname.includes("codes.html")) {

    const team = localStorage.getItem("team");

    const alleTeams = ["aandrijving", "programma", "klankbron"];

    const andereTeams = alleTeams.filter(t => t !== team);

    document.getElementById("scoreDisplay").textContent =
    "Score: " + localStorage.getItem("score");

    document.getElementById("eigenTeamBlok").classList.add(team);
    document.getElementById("team2Blok").classList.add(andereTeams[0]);
    document.getElementById("team3Blok").classList.add(andereTeams[1]);

    document.getElementById("eigenTeamTitel").textContent = "Team: " + team;
    document.getElementById("eigenCode").textContent =
        "Jullie code: " + teamCodes[team];

    document.getElementById("team2Naam").textContent =
        "Team: " + andereTeams[0];

    document.getElementById("team3Naam").textContent =
        "Team: " + andereTeams[1];
}

function controleerCodes() {

    const team = localStorage.getItem("team");

    const alleTeams = ["aandrijving", "programma", "klankbron"];
    const andereTeams = alleTeams.filter(t => t !== team);

    const input1 = document.getElementById("team2Input").value.trim();
    const input2 = document.getElementById("team3Input").value.trim();

    const juiste1 = teamCodes[andereTeams[0]];
    const juiste2 = teamCodes[andereTeams[1]];

    if (input1 === juiste1 && input2 === juiste2) {

        // haal score correct uit localStorage
        const eindScore = localStorage.getItem("score");
        const eindTijd = localStorage.getItem("totalSeconds");

        // tijd omrekenen naar weergave
        let totalSeconds = parseInt(eindTijd);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        if (seconds < 10) seconds = "0" + seconds;

        localStorage.setItem("eindScore", eindScore);
        localStorage.setItem("eindTijd", minutes + ":" + seconds);

        window.location.href = "resultaat.html";

    } else {
        document.getElementById("codeFeedback").textContent =
            "Nog niet alle codes zijn correct.";
    }
}

// =================================================
// RESULTAAT
// =================================================

if (window.location.pathname.includes("resultaat.html")) {

    const eindTijd = localStorage.getItem("eindTijd");
    const eindScore = localStorage.getItem("eindScore");

    document.getElementById("eindtijd").textContent = eindTijd;
    document.getElementById("eindscore").textContent = eindScore;

}



// =================================================
// TEMPLATE
// =================================================
// AUTOMATISCH DOORSPRINGEN

window.addEventListener("DOMContentLoaded", () => {

    const inputs = document.querySelectorAll(".codeInput");

    inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            let value = e.target.value.toUpperCase();

            // Zorg dat er maar 1 karakter blijft
            if (value.length > 1) {
                value = value.charAt(0);
            }

            e.target.value = value;

            // Ga door als er iets ingevuld is
            if (value !== "" && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    const firstInput = document.querySelector(".codeInput");
    if (firstInput) firstInput.focus();
});
