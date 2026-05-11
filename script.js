
// =================================================
// TIMER 
// =================================================

if (
    document.getElementById("timer")
) {

    const timerElement = document.getElementById("timer");

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

let verzameldeBonusVragen = JSON.parse(localStorage.getItem("bonusVragen")) || [];
let pendingBonusVragen = [];
let zitOpTussenPagina = false;

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
        "Welk instrument wordt er in Azië getoond in het filmpje?",
        "Welk instrument wordt er in Noord-Amerika getoond in het filmpje?",
        "Welk instrument wordt er in Noord-Afrika getoond in het filmpje?",
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
            "Kijk naar het filmpje en let op de details.",
            "Azië is te vinden aan de rechterkant van de kaart.",
            "KLA333"
        ],
        [
            "Kijk naar het filmpje en let op de details.",
            "Noord Afrika is te vinden in het midden van de kaart.",
            "KLA444"
        ],
        [
            "Kijk naar het filmpje en let op de details.",
            "Het instrument heeft een unieke vorm en geluid.",
            "KLA555"
        ],
        [
            "Herken het geluid.",
            "Het instrument verklapt het antwoord.",
            "KLA666"
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

const tussenPaginaData = {

    aandrijving: [

        {
            tekst: "De volgende opdracht bevindt zich bij de zwarte machine achterin.",
            bonus: [
                { vraag: "Hoeveel tandwielen zie je?", antwoord: "4" },
                { vraag: "Welke kleur heeft de hendel?", antwoord: "ROOD" },
                { vraag: "Welk materiaal ligt bovenop?", antwoord: "HOUT" }
            ]
        },

        {
            tekst: "Zoek nu naar het object met UV-licht.",
            bonus: [
                { vraag: "Welke kleur licht op?", antwoord: "GROEN" },
                { vraag: "Hoeveel lampen hangen hier?", antwoord: "2" },
                { vraag: "Welke vorm zie je?", antwoord: "CIRKEL" }
            ]
        },

        {
            tekst: "Ga naar de balans-opdracht.",
            bonus: [
                { vraag: "Hoeveel gewichten liggen er?", antwoord: "3" },
                { vraag: "Welke vorm heeft de balans?", antwoord: "DRIEHOEK" },
                { vraag: "Welke kleur heeft het plateau?", antwoord: "ZWART" }
            ]
        },

        {
            tekst: "Loop naar de tandwielen.",
            bonus: [
                { vraag: "Hoeveel tandwielen draaien?", antwoord: "5" },
                { vraag: "Welke draait het snelst?", antwoord: "KLEINE" },
                { vraag: "Welke kleur heeft de hendel?", antwoord: "GEEL" }
            ]
        },

        {
            tekst: "Ga naar de muziek-hendel.",
            bonus: [
                { vraag: "Welk instrument hoor je?", antwoord: "PIANO" },
                { vraag: "Hoeveel hendels zijn zichtbaar?", antwoord: "2" },
                { vraag: "Welke kleur heeft de machine?", antwoord: "GRIJS" }
            ]
        }
    ],

    programma: [

        {
            tekst: "Ga naar het programmeerstation.",
            bonus: [
                { vraag: "Welke kleur heeft de kabel?", antwoord: "BLAUW" },
                { vraag: "Hoeveel blokken liggen er?", antwoord: "6" },
                { vraag: "Welke letter zie je links?", antwoord: "P" }
            ]
        },

        {
            tekst: "Zoek de route-opdracht.",
            bonus: [
                { vraag: "Hoeveel pijlen zie je?", antwoord: "4" },
                { vraag: "Welke richting wijst omhoog?", antwoord: "NOORD" },
                { vraag: "Welke kleur heeft het bord?", antwoord: "WIT" }
            ]
        },

        {
            tekst: "Ga naar de decoder.",
            bonus: [
                { vraag: "Welke letter staat centraal?", antwoord: "E" },
                { vraag: "Hoeveel ringen heeft de decoder?", antwoord: "3" },
                { vraag: "Welke kleur heeft de schijf?", antwoord: "ZWART" }
            ]
        },

        {
            tekst: "Zoek het orgelboek.",
            bonus: [
                { vraag: "Hoeveel pagina’s heeft het boek?", antwoord: "8" },
                { vraag: "Welke kleur heeft de omslag?", antwoord: "BRUIN" },
                { vraag: "Welke letter zie je rechts?", antwoord: "M" }
            ]
        },

        {
            tekst: "Ga naar de binaire opdracht.",
            bonus: [
                { vraag: "Hoeveel nullen zie je?", antwoord: "5" },
                { vraag: "Welke code staat bovenaan?", antwoord: "1010" },
                { vraag: "Welke kleur heeft het scherm?", antwoord: "GROEN" }
            ]
        }
    ],

    klankbron: [

        {
            tekst: "Loop naar het instrument aan de rechterzijde.",
            bonus: [
                { vraag: "Hoeveel snaren heeft het?", antwoord: "4" },
                { vraag: "Welke kleur heeft het hout?", antwoord: "BRUIN" },
                { vraag: "Welke vorm heeft het?", antwoord: "OVAAL" }
            ]
        },

        {
            tekst: "Ga naar de toonhoogte-opdracht.",
            bonus: [
                { vraag: "Welke noot hoor je?", antwoord: "C" },
                { vraag: "Hoeveel toetsen zie je?", antwoord: "12" },
                { vraag: "Welke kleur heeft het instrument?", antwoord: "ZWART" }
            ]
        },

        {
            tekst: "Bekijk het filmpje.",
            bonus: [
                { vraag: "Welk continent zie je?", antwoord: "AZIE" },
                { vraag: "Hoeveel instrumenten zie je?", antwoord: "3" },
                { vraag: "Welke kleur overheerst?", antwoord: "ROOD" }
            ]
        },

        {
            tekst: "Luister naar de combinatie.",
            bonus: [
                { vraag: "Hoeveel liedjes hoor je?", antwoord: "2" },
                { vraag: "Welk tempo hoor je?", antwoord: "SNEL" },
                { vraag: "Welk instrument hoor je eerst?", antwoord: "DRUM" }
            ]
        },

        {
            tekst: "Bekijk de geluidsgolven.",
            bonus: [
                { vraag: "Welke vorm heeft de golf?", antwoord: "ROND" },
                { vraag: "Hoeveel pieken zie je?", antwoord: "6" },
                { vraag: "Welke kleur heeft de achtergrond?", antwoord: "ZWART" }
            ]
        }
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
    localStorage.removeItem("bonusVragen");
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

    localStorage.removeItem("bonusVragen");

    // Fade animatie
    document.body.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = "template.html";
    }, 300);
}


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

    document.getElementById("hintContainer").style.display = "flex";
    document.getElementById("codeInputContainer").style.display = "flex";

    const actieBtn = document.getElementById("actieBtn");
    actieBtn.textContent = "Controleer";
    actieBtn.classList.remove("correct-state");
    actieBtn.classList.remove("aandrijving", "programma", "klankbron");

    const antwoordInput = document.getElementById("antwoordInput");
    if (antwoordInput) {
        antwoordInput.value = "";
        antwoordInput.disabled = false;
    }


    document.getElementById("uitlegTekst").textContent =
        uitlegData[team][huidigeOpdracht];

    document.getElementById("teamTitel").textContent = "Team: " + team.charAt(0).toUpperCase() + team.slice(1);
    document.getElementById("opdrachtNummer").textContent =
        "Opdracht " + (huidigeOpdracht + 1) + " van 6";


    // =================================================
    // MINI_GAME PAGINA'S
    // =================================================

    const extraContent = document.getElementById("extraContent");

    extraContent.innerHTML = "";

    if (team === "klankbron" && huidigeOpdracht === 1) {

        fetch("perfect-pitch/toonladder.html")
            .then(res => res.text())
            .then(html => {
                extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;

                // CSS laden
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "perfect-pitch/toonladder.css";
                document.head.appendChild(link);

                // script laden
                const script = document.createElement("script");
                script.type = "module";
                script.src = "perfect-pitch/toonladder.js";
                document.body.appendChild(script);
})
    }

    if (team === "programma" && huidigeOpdracht === 1) {

        fetch("blockly/blockly.html")
            .then(res => res.text())
            .then(html => {
                extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;

                // CSS
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "blockly/blockly.css";
                document.head.appendChild(link);

                // scripts in juiste volgorde!
                const blocklyScript = document.createElement("script");
                blocklyScript.src = "blockly/blockly.min.js";

                blocklyScript.onload = () => {

                    const jsScript = document.createElement("script");
                    jsScript.src = "blockly/javascript_compressed.js";

                    jsScript.onload = () => {

                        const gameScript = document.createElement("script");
                        gameScript.src = "blockly/blockscript.js";

                        gameScript.onload = () => {
                            // 🔥 HIER gebeurt de magie
                            if (typeof initBlockly === "function") {
                                initBlockly();
                            }
                        };

                        document.body.appendChild(gameScript);
                    };

                    document.body.appendChild(jsScript);
                };

                document.body.appendChild(blocklyScript);
            });
    }

    document.getElementById("feedback").textContent = "";
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

        if (zitOpTussenPagina) {

            pendingBonusVragen.forEach(vraag => {
                verzameldeBonusVragen.push({
                    vraag: vraag.vraag,
                    antwoord: vraag.antwoord,
                    gehaald: false
                });
            });

            localStorage.setItem(
                "bonusVragen",
                JSON.stringify(verzameldeBonusVragen)
            );

            zitOpTussenPagina = false;
            volgendeOpdracht();

            return;
        }

        if (huidigeOpdracht < 5) {
            toonTussenPagina();
        } else {
            volgendeOpdracht();
        }

        return;
    }   

    let invoer = document.getElementById("antwoordInput").value
        .toUpperCase()
        .trim();

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
            actieBtn.textContent = "Naar volgende opdracht";
        }

        actieBtn.classList.add("correct-state");
        actieBtn.classList.add(team);

        document.getElementById("antwoordInput").disabled = true;

    } else {
        document.getElementById("feedback").textContent = "Onjuist, probeer opnieuw.";
        foutPogingen++;
    }
}


function toonTussenPagina() {

    const data = tussenPaginaData[team][huidigeOpdracht];

    if (!data) {
        volgendeOpdracht();
        return;
    }

    zitOpTussenPagina = true;
    pendingBonusVragen = data.bonus;

    document.getElementById("uitlegTekst").textContent = data.tekst;

    document.getElementById("extraContent").innerHTML = `
    <div class="tussenBonusBlok">
        <h3 class="bonusTitel">Bonus vragen</h3>
        ${data.bonus.map(vraag => `
            <div class="bonusPreview">
                <p>${vraag.vraag}</p>
            </div>
        `).join("")}

    </div>
`;

    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("feedback").textContent = "";
    document.getElementById("actieBtn").textContent = "Volgende opdracht";
    document.getElementById("hintContainer").style.display = "none";
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

        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) {
                overlay.style.display = "none";
            }
        });
    }
});

// =================================================
// BONUS POPUP
// =================================================

function toonBonusPopup() {

    const overlay = document.getElementById("bonusOverlay");
    const lijst = document.getElementById("bonusLijst");

    lijst.innerHTML = "";

    if (verzameldeBonusVragen.length === 0) {
        lijst.innerHTML = `
            <div class="bonusLeeg">
                <p>Hier vind je na iedere opdracht 3 nieuwe bonusvragen.</p>
            </div>
        `;

        overlay.style.display = "flex";
        return;
    }

    verzameldeBonusVragen.forEach((bonus, index) => {

        lijst.innerHTML += `
            <div class="bonusVraagBlok">

                <p>${bonus.vraag}</p>

                ${
                    bonus.gehaald
                    ? `
                        <div class="bonusCorrectRow bonus-correct ${team}">
                            <span class="bonusAntwoord">
                                ${bonus.antwoord}
                            </span>

                            <span class="bonusPunten">
                                +3
                            </span>
                        </div>
                    `
                    : `
                        <input
                            type="text"
                            id="bonusInput${index}"
                        >

                        <button onclick="controleerBonus(${index})">
                            Controleer
                        </button>

                        <p id="bonusFeedback${index}"></p>
                    `
                }

            </div>
        `;
    });

    overlay.style.display = "flex";
}

function controleerBonus(index) {

    const bonus = verzameldeBonusVragen[index];

    if (bonus.gehaald) return;

    const input = document.getElementById(`bonusInput${index}`);

    const invoer = input.value
        .trim()
        .toUpperCase();

    if (invoer === bonus.antwoord) {

        bonus.gehaald = true;
        score += 3;
        localStorage.setItem("score", score);

        document.getElementById("scoreDisplay").textContent =
            "Score: " + score;


        const bonusBlok = input.parentElement;
        const knop = bonusBlok.querySelector("button");

        bonusBlok.innerHTML = `
            <p>${bonus.vraag}</p>

            <div class="bonusCorrectRow bonus-correct ${team}">
                <span class="bonusAntwoord">
                    ${bonus.antwoord}
                </span>

                <span class="bonusPunten">
                    +3
                </span>
            </div>
        `;


        localStorage.setItem(
            "bonusVragen",
            JSON.stringify(verzameldeBonusVragen)
        );

    } else {

        document.getElementById(`bonusFeedback${index}`).textContent =
            "Onjuist";
    }
}

document.addEventListener("DOMContentLoaded", function() {

    const closeBonus = document.getElementById("closeBonus");
    const bonusOverlay = document.getElementById("bonusOverlay");

    if (closeBonus && bonusOverlay) {

        closeBonus.addEventListener("click", () => {
            bonusOverlay.style.display = "none";
        });

        bonusOverlay.addEventListener("click", (e) => {
            if (e.target === bonusOverlay) {
                bonusOverlay.style.display = "none";
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

    document.getElementById("team2Input").addEventListener("input", (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    document.getElementById("team3Input").addEventListener("input", (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
}

let correcteCodes = [false, false];

function controleerCode(index) {

    const team = localStorage.getItem("team");

    const alleTeams = ["aandrijving", "programma", "klankbron"];
    const andereTeams = alleTeams.filter(t => t !== team);

    const inputId = index === 0 ? "team2Input" : "team3Input";
    const feedbackId = index === 0 ? "team2Feedback" : "team3Feedback";
    const blokId = index === 0 ? "team2Blok" : "team3Blok";

    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    const blok = document.getElementById(blokId);

    const invoer = input.value.trim().toUpperCase();

    const juisteCode = teamCodes[andereTeams[index]];

    if (invoer === juisteCode) {

        correcteCodes[index] = true;

        const knop = blok.querySelector("button");

        blok.innerHTML = `
            <h2>
                Team: ${andereTeams[index]}
            </h2>


            <div class="codeCorrect">
                ${juisteCode}
            </div>

        `;

        if (correcteCodes[0] && correcteCodes[1]) {

            const eindScore = localStorage.getItem("score");
            const eindTijd = localStorage.getItem("totalSeconds");

            let totalSeconds = parseInt(eindTijd);

            let minutes = Math.floor(totalSeconds / 60);
            let seconds = totalSeconds % 60;

            if (seconds < 10) seconds = "0" + seconds;

            localStorage.setItem("eindScore", eindScore);

            localStorage.setItem(
                "eindTijd",
                minutes + ":" + seconds
            );

            window.location.href = "resultaat.html";
        }

    } else {

        feedback.textContent = "Onjuist";
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


window.addEventListener("DOMContentLoaded", () => {
    const antwoordInput = document.getElementById("antwoordInput");

    if (antwoordInput) {
        antwoordInput.focus();

        antwoordInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
});
