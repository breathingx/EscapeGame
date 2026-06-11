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
let gameData = {};
let huidigeOpdracht = 0;
let correcteAntwoorden = 0;
let score = 0;
let foutPogingen = 0;
let antwoordIsCorrect = false;
let simon_punten = 0; 
let blockly_punten = 0;
let totaal_opdrachten = 0;

let hintGebruiktPerVraag = 0;
let laatsteHintTijd = 0;
let gebruikteHints = [];
const maxHints = 3;
const hintCooldown = 180;
let hintInterval = null;

let verzameldeBonusVragen = JSON.parse(localStorage.getItem("bonusVragen")) || [];
let pendingBonusVragen = [];
let zitOpTussenPagina = false;

// const ENABLE_SIMON_SAYS = false;

let truthLieProgress = 0;
const truthLieMaxVragen = 6;

// =================================================
// DATA
// =================================================


const truthLieVragen = {
    aandrijving: [
        "Een krukas wordt gebruikt om energie in op te slaan.",
        "In een muziekdoosje zit dezelfde soort veer als in een balpen.",
        "De gewichten in een klok werken door opgeslagen spierkracht.",
        "Met een hefboom ben je sterker dan jezelf.",
        "Alle orgels in Museum Speelklok werken door spierkracht.",
        "Een balg moet in beweging blijven om te werken."
    ],
    programma: [
        "De enige plek waar je code tegenkomt, is in je computer.",
        "Een boek in een orgel werkt op dezelfde manier als een papieren rol in een pianola",
        "Een MIDI stuurt geluid vanaf een computer naar een instrument.",
        "Op één cilinder kun je meerdere/verschillende melodieën zetten.",
        "Als je arrangeert, bewerk je een muziekstuk dat al bestaat.",
        "Arrangeren is een ander woord voor componeren."
    ],
    klankbron: [
        "Carillons zijn de oudste instrumenten die je in de buitenlucht kunt horen",
        "Een snaar kan alleen geluid maken als je hem aanraakt wanneer hij onder spanning staat.",
        "Een ritme bestaat uit een maatsoort, tempo en een melodie.",
        "Als je een melodie wil krijgen uit orgelpijpen, moet je ze één voor één aanblazen.",
        "Hoe korter de tand op een speelkam, hoe lager de toon.",
        "Bellen kunnen van metaal, glas en keramiek zijn."
    ]
};

const truthLieAntwoordData = {
    aandrijving: [
        false,
        false,
        true,
        true,
        false,
        true
    ],
    programma: [
        false,
        false,
        false,
        true,
        true,
        false
    ],
    klankbron: [
        true,
        true,
        false,
        false,
        false,
        true
    ]
};

// =================================================
// NAVIGATIE
// =================================================

function gaNaarHome() {
    window.location.href = "home.html";
}

// =================================================
// INDEX: VIDEO
// =================================================

if (document.getElementById("buttons")) {

    setTimeout(() => {
        document.getElementById("buttons").classList.add("show");
        document.getElementById("buttons").classList.remove("hidden");
    }, 3000);// 60000

}

// =================================================
// GAME INITIALISATIE
// =================================================

async function laadGameData(team) {
    const response = await fetch(`data/${team}.json`);
    gameData = {};
    gameData[team] = await response.json();
}

function startGame(gekozenTeam) {

    localStorage.setItem("team", gekozenTeam);
    localStorage.setItem("opdracht", 0);
    localStorage.setItem("correct", 0);
    localStorage.setItem("score", 0);
    localStorage.setItem("totalSeconds", 60 * 60);

    localStorage.removeItem("bonusVragen");
    localStorage.removeItem("simon_done"); 
    localStorage.removeItem("blockly_done");
    document.body.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = "video/video.html?team=" + gekozenTeam + "&type=intro";
    }, 300);
}


if (window.location.pathname.includes("template.html")) {

    (async () => {

        team = localStorage.getItem("team");

        await laadGameData(team);
        totaal_opdrachten = gameData[team].opdrachten.length;

        huidigeOpdracht = parseInt(localStorage.getItem("opdracht")) || 0;
        correcteAntwoorden = parseInt(localStorage.getItem("correct")) || 0;
        score = parseInt(localStorage.getItem("score")) || 0;

        const progressBar = document.getElementById("progressBar");
        if (team && progressBar) {
            progressBar.classList.add(team);
        }

        if (!team || !gameData[team]) {
            window.location.href = "home.html";
        }
        else if (huidigeOpdracht >= totaal_opdrachten) {
            window.location.href = "codes.html";
        }
        else if (correcteAntwoorden > huidigeOpdracht) {
            toonTussenPagina();
        }
        else {
            laadOpdracht();
        }
        
        document.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                verwerkActie();
            }
        });

    })();
}

function applyTeamTheme() {

    const team = localStorage.getItem("team");

    if (!team) return;

    document.body.classList.remove(
        "team-aandrijving",
        "team-programma",
        "team-klankbron"
    );

    document.body.classList.add(`team-${team}`);
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
        opdrachtNummer.textContent = "Opdracht " + (opdracht + 1) + " van " + (totaal_opdrachten);
    }

    if (scoreDisplay) {
        scoreDisplay.textContent = "Score: " + score;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    initHeader();
});


function laadOpdracht() {

    const extraContent = document.getElementById("extraContent");

    extraContent.innerHTML = "";

    antwoordIsCorrect = false;
    hintGebruiktPerVraag = 0;
    laatsteHintTijd = 0;
    simon_punten = 0;
    blockly_punten = 0;
    gebruikteHints = [];

    // document.getElementById("hintContainer").style.display = "flex";
    // document.getElementById("codeInputContainer").style.display = "flex";

    document.getElementById("uitlegBlok").style.display = "block";
    document.getElementById("codeInputContainer").style.display = "flex";
    document.getElementById("actieBtn").style.display = "block";
    document.getElementById("hintBtn").style.display = "block";
    document.getElementById("hintBlocks").style.display = "flex";
    document.getElementById("hintContainer").style.display = "flex";

    const actieBtn = document.getElementById("actieBtn");
    actieBtn.textContent = "Controleer";
    actieBtn.classList.remove("correct-state");
    actieBtn.classList.remove("aandrijving", "programma", "klankbron");

    const antwoordInput = document.getElementById("antwoordInput");
    if (antwoordInput) {
        antwoordInput.value = "";
        antwoordInput.disabled = false;
    }


    if (team == "aandrijving") {
        laadOpdrachtAandrijving();
    } else if (team == "programma") {
        laadOpdrachtProgramma();
    } else {
        laadopdrachtKlankbron();
    }

    toonOpdrachtTitel();

    document.getElementById("teamTitel").textContent = "Team: " + team.charAt(0).toUpperCase() + team.slice(1);
    document.getElementById("opdrachtNummer").textContent =
        "Opdracht " + (huidigeOpdracht + 1) + " van " + (totaal_opdrachten);


    // =================================================
    // MINI_GAME PAGINA'S
    // =================================================

    // const extraContent = document.getElementById("extraContent");

    // extraContent.innerHTML = "";

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

    document.getElementById("feedback").textContent = "";
    document.getElementById("scoreDisplay").textContent = "Score: " + score;

    foutPogingen = 0;
    opgeslagenHint = "";
    hintGebruiktPerVraag = 0;
    document.getElementById("hintText").textContent = "";

    updateHintBlocks();
    updateProgressBar();
}

/**
 * Loads the elements necessary for the Truth Lie minigame. Elements from the standard template will be hidden.
 */
function inladenTruthLieElementen() {
    document.getElementById("uitlegTekst").textContent = truthLieVragen[team][truthLieProgress];
    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("actieBtn").style.display = "none";
    document.getElementById("hintContainer").style.display = "none";
    document.getElementById("truth-lie-div").hidden = false;
    document.getElementById("truth-lie-ja").hidden = false;
    document.getElementById("truth-lie-nee").hidden = false;
}

/**
 * Used to select the next game for the path "Aandrijving"
 */
function laadOpdrachtAandrijving() {
    switch (huidigeOpdracht) {
        case 1:
            inladenTruthLieElementen();
            break;
        case 4:
            hefboomGame();
            break;
        default:
            document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;
    }
}


function hefboomGame() {

    document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;

    const extraContent = document.getElementById("extraContent");

    fetch("HefboomCompleet/hefboom.html")
        .then(res => res.text())
        .then(html => {

            extraContent.innerHTML =
                `<div class="fullscreen-content">${html}</div>`;

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "HefboomCompleet/hefboom.css";
            document.head.appendChild(link);

            const script = document.createElement("script");
            script.src = "HefboomCompleet/hefboom.js";
            document.body.appendChild(script);
        });
}


function simon_says() {
    document.getElementById("uitlegBlok").style.display = "none";
    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("actieBtn").style.display = "none";
    document.getElementById("hintBtn").style.display = "none";
    document.getElementById("hintBlocks").style.display = "none";

    fetch("simon-says/simon.html")
            .then(res => res.text())
            .then(html => {
                extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;

                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "simon-says/simon.css";
                document.head.appendChild(link);

                const script = document.createElement("script");
                //script.type = "module";
                script.src = "simon-says/simon.js";
                document.body.appendChild(script);
            });
}

function blockly() {
    // document.getElementById("uitlegBlok").style.display = "none";
    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("actieBtn").style.display = "none";
    // document.getElementById("hintBtn").style.display = "none";
    // document.getElementById("hintBlocks").style.display = "none";

    document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;

    fetch("blockly/blockly.html")
        .then(res => res.text())
        .then(html => {
            extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "blockly/blockly.css";
            document.head.appendChild(link);

            const blocklyScript = document.createElement("script");
            blocklyScript.src = "blockly/blockly.min.js";

            blocklyScript.onload = () => {

                const jsScript = document.createElement("script");
                jsScript.src = "blockly/javascript_compressed.js";

                jsScript.onload = () => {

                    const gameScript = document.createElement("script");
                    gameScript.src = "blockly/blockscript.js";

                    gameScript.onload = () => {
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

/**
 * Used to select the next game for the path "Programma"
 */
function laadOpdrachtProgramma() {
    switch (huidigeOpdracht) {

        case 0:
            qrScannerOpdracht();
            break;

        case 2:
            blockly();
            break;

        case 4:
            inladenTruthLieElementen();
            break;

        //TODO TIM zet dit er weer in?
        // case 5:
        //     simon_says();
        //     break;

        default:
            document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;
    }
}

function qrScannerOpdracht() {
    const origineleInnerHTML =
        Object.getOwnPropertyDescriptor(
            Element.prototype,
            "innerHTML"
        );

    Object.defineProperty(Element.prototype, "innerHTML", {
        set(value) {

            if (this.id === "extraContent") {
                console.trace(
                    "extraContent gewijzigd:",
                    value
                );
            }

            return origineleInnerHTML.set.call(
                this,
                value
            );
        },
        get() {
            return origineleInnerHTML.get.call(this);
        }
    });

    console.log("qrScannerOpdracht uitgevoerd");

    document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;

    // document.getElementById("codeInputContainer").style.display = "none";
    // document.getElementById("actieBtn").style.display = "none";

    const extraContent = document.getElementById("extraContent");

    extraContent.innerHTML = `
        <button id="startQRScanBtn">
            Scan QR-code
        </button>
    `;
    
    console.log("na plaatsen:", extraContent.innerHTML);
    setTimeout(() => {
        console.log("1 sec later:", extraContent.innerHTML);
    }, 1000);
    setTimeout(() => {
        console.log("3 sec later:", extraContent.innerHTML);
    }, 3000);

    document.getElementById("startQRScanBtn")
        .addEventListener("click", startQRScanner);
}

function startQRScanner() {

    const extraContent = document.getElementById("extraContent");

    fetch("QRScanner/qrScanner.html")
        .then(res => res.text())
        .then(html => {

            extraContent.innerHTML =
                `<div class="fullscreen-content">${html}</div>`;

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "QRScanner/qrScanner.css";
            document.head.appendChild(link);

            const script = document.createElement("script");
            script.src = "QRScanner/qrScanner.js";
            document.body.appendChild(script);
        });
}

window.handleQRCode = function(qrData) {

    const juisteCode =
        gameData[team].opdrachten[huidigeOpdracht].antwoord
            .toLowerCase()
            .trim();

    if (qrData === juisteCode) {

        document.getElementById("feedback").textContent =
            "QR-code correct gescand!";

        score += 10;
        localStorage.setItem("score", score);

        correcteAntwoorden++;
        localStorage.setItem("correct", correcteAntwoorden);

        antwoordIsCorrect = true;

        const actieBtn =
            document.getElementById("actieBtn");

        actieBtn.textContent =
            "Naar volgende opdracht";

        actieBtn.classList.add("correct-state");
        actieBtn.classList.add(team);

    } else {

        document.getElementById("feedback").textContent =
            "Verkeerde QR-code.";
    }
};

/**
 * Used to select the next game for the path "Klankbron"
 */
function laadopdrachtKlankbron() {
    switch (huidigeOpdracht) {
        default:
            document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;
    }
}

/**
 * Determines if the user correctly answered the truth lie question.
 */
function verwerkTruthLie(isCorrect) {
    if (isCorrect == truthLieAntwoordData[team][truthLieProgress]) {
        document.getElementById("feedback").textContent = "Goed gedaan!";
    } else {
        document.getElementById("feedback").textContent = "Dat is onjuist...";
        foutPogingen += 1;
    }

    document.getElementById("truth-lie-ja").disabled = true;
    document.getElementById("truth-lie-nee").disabled = true;

    document.getElementById("VolgendeTruthLie").hidden = false;
}

/**
 * Updates progress within the truth lie minigame. 
 * 
 * If the end of the game is reached:
 * - The user's score is updated
 * - Truth lie elements are hidden
 * - Template elements are reloaded
 */
function updateTruthLie() {
    truthLieProgress++;
    document.getElementById("uitlegTekst").textContent = truthLieVragen[team][truthLieProgress];
    document.getElementById("feedback").textContent = "";
    document.getElementById("VolgendeTruthLie").hidden = true;
    document.getElementById("truth-lie-ja").disabled = false;
    document.getElementById("truth-lie-nee").disabled = false;

    if (truthLieProgress == truthLieMaxVragen) {
        //restore original template
        document.getElementById("codeInputContainer").style.display = "";
        document.getElementById("hintContainer").style.display = "";
        document.getElementById("actieBtn").style.display = "block";
        document.getElementById("truth-lie-div").style.display = "none";

        //aantal fouten {0, 1, 2, 3, 4, 5, 6} geeft zoveel punten: {10, 9, 8, 6, 4, 2, 0}
        let punten = 10;
        if (foutPogingen == 0 || foutPogingen == 1) {
            punten = punten - foutPogingen;
        } else {
            punten = punten - (foutPogingen-1) * 2;
        }

        if (punten < 0) {
            punten = 0;
        }
        score += punten;

        antwoordIsCorrect = true;
        verwerkActie();
    }
}

function verwerkActie() {

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

    let juistAntwoord = gameData[team].opdrachten[huidigeOpdracht].antwoord.toUpperCase();

    if (invoer === juistAntwoord) {

        document.getElementById("feedback").textContent = "Goed gedaan!";

        let punten = 10 - foutPogingen;
        if (team === "programma" && huidigeOpdracht === 5) {
            punten = window.simon_punten
        } else if (team === "programma" && huidigeOpdracht === 4) {
            punten = window.blockly_punten || 0;
        }
        if (punten < 0) punten = 0;

        score += punten;
        localStorage.setItem("score", score);
        document.getElementById("scoreDisplay").textContent = "Score: " + score;

        correcteAntwoorden++;
        localStorage.setItem("correct", correcteAntwoorden);
        updateProgressBar();

        antwoordIsCorrect = true;

        const actieBtn = document.getElementById("actieBtn");

        if (huidigeOpdracht === totaal_opdrachten - 1) {
            actieBtn.textContent = "Ga verder";
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

    const data = gameData[team].opdrachten[huidigeOpdracht].tussenPagina;
    document.getElementById("opdrachtTitel").textContent = "Voor de volgende opdracht";

    if (!data) {
        volgendeOpdracht();
        return;
    }

    zitOpTussenPagina = true;
    pendingBonusVragen = data.bonus;

    document.getElementById("uitlegTekst").textContent = data.tekst;

    document.getElementById("extraContent").innerHTML = `
    <div class="tussenBonusBlok">
        <h3 class="bonusTitel">Bonus vraag</h3>
        ${data.bonus.map(vraag => `
            <div class="bonusPreview">
                <p>${vraag.vraag}</p>
            </div>
        `).join("")}

    </div>
`;

    const actieBtn = document.getElementById("actieBtn");
    actieBtn.classList.remove(
        "aandrijving",
        "programma",
        "klankbron"
    );
    actieBtn.classList.add("correct-state");

    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("feedback").textContent = "";
    document.getElementById("actieBtn").style.display = "block";
    document.getElementById("actieBtn").textContent = "Volgende opdracht";
    document.getElementById("hintContainer").style.display = "none";
}


function volgendeOpdracht() {

    huidigeOpdracht++;

    localStorage.setItem("opdracht", huidigeOpdracht);

    if (huidigeOpdracht < totaal_opdrachten) {
        laadOpdracht();
    } else {
        window.location.href =
            "uitleg/uitleg.html?type=einde&team=" + team;
    }
}


// =================================================
// PROGRESS BAR
// =================================================

function updateProgressBar() {
    const percentage = (correcteAntwoorden / totaal_opdrachten) * 100;
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

    //TODO TIM
    // const hints = hintData[team][huidigeOpdracht];

    // let tekst = "";

    // if (hintGebruiktPerVraag === 1) {
    //     tekst = hints[0];
    // } else if (hintGebruiktPerVraag === 2) {
    //     tekst = hints[1];
    // } else if (hintGebruiktPerVraag === 3) {
    //     tekst = "Code: " + hints[2];
    // }
    const opdracht = gameData[team].opdrachten[huidigeOpdracht];

    if (hintGebruiktPerVraag === 1) {
        tekst = opdracht.hints[0];
    }
    else if (hintGebruiktPerVraag === 2) {
        tekst = opdracht.hints[1];
    }
    else if (hintGebruiktPerVraag === 3) {
        tekst = "Code: " + opdracht.antwoord;
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
                <p>Hier vind je na iedere opdracht één nieuwe bonusvraag.</p>
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

    if (invoer === bonus.antwoord.trim().toUpperCase()) {

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

            window.location.href = "video/video.html?team=" + team + "&type=outro";
        }

    } else {

        feedback.textContent = "Onjuist";
    }
}


// =================================================
// TEMPLATE
// =================================================

function toonOpdrachtTitel() {
    const opdracht = gameData[team].opdrachten[huidigeOpdracht];

    const titelElement = document.getElementById("opdrachtTitel");

    if (titelElement && opdracht.naam) {
        titelElement.textContent = opdracht.naam;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    
    const continueBtn = document.getElementById("continueBtn");
    if (continueBtn && localStorage.getItem("team") && localStorage.getItem("totalSeconds") && localStorage.getItem("score") > 0) {
        continueBtn.style.display = "block";
        document.getElementById("continueText").style.display = "block";
        
        continueBtn.addEventListener("click", () => {
            window.location.href = "template.html";
        });
    }
    const antwoordInput = document.getElementById("antwoordInput");
    if (antwoordInput) {
        antwoordInput.focus();

        antwoordInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    const path = window.location.pathname;

    if (
        path.includes("template.html")
    ) {
        applyTeamTheme();
    }

});