// =================================================
// GAME STATE 
// =================================================



// global variables
let team;
let gameData = {};

// tracking progress in the main game
let huidigeOpdracht = 0;
let correcteAntwoorden = 0;
let score = 0;
let totaal_opdrachten = 0;
let zitOpTussenPagina = false;
let correcteCodes = [false, false];

let foutPogingen = 0;
let antwoordIsCorrect = false;

// scores for minigames
let simon_punten = 0; //simon says is not used at the moment, but is planned on being used
// const ENABLE_SIMON_SAYS = false;
let blockly_punten = 0;

let truthLieProgress = 0;
const truthLieMaxVragen = 6;

// tracking hints usage
let hintGebruiktPerVraag = 0;
let laatsteHintTijd = 0;
let gebruikteHints = [];
const maxHints = 3;
const hintCooldown = 180;
let hintInterval = null;

// bonus questions
let verzameldeBonusVragen = JSON.parse(localStorage.getItem("bonusVragen")) || [];
let pendingBonusVragen = [];



// =================================================
// TIMER 
// =================================================


//  timer in the game, counts down to give a sence of urgency
if (
    document.getElementById("timer")
) {

    const timerElement = document.getElementById("timer");

    if (!localStorage.getItem("totalSeconds")) {
        localStorage.setItem("totalSeconds", 60 * 60);
    }

    // counting down as time moves on
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
// DATA 
// =================================================


// loading in data form the specific team data files
async function laadGameData(team) {
    const response = await fetch(`data/${team}.json`);
    gameData = {};
    gameData[team] = await response.json();
}


// The codes for each team to match at the end of the game
const teamCodes = {
    aandrijving: "AA00",
    programma: "PR00",
    klankbron: "KL00"
};

// the truth or lie questions
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

// the truth or lie answers
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
// NAVIGATION
// =================================================

// function to go to the home page
function gaNaarHome() {
    window.location.href = "home.html";
}

// =================================================
// INDEX: VIDEO
// =================================================

// button for the first video is only shown after a certain amount of time
if (document.getElementById("buttons")) {

    setTimeout(() => {
        document.getElementById("buttons").classList.add("show");
        document.getElementById("buttons").classList.remove("hidden");
    }, 3000);// 60000

}

// =================================================
// GAME INITIALISATION 
// =================================================


// starts a new game by resetting all the saved progress,
// storing the selected team and redirecting to the intro video
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

// initializes the game when the main template page is loaded
// loads saved progress, game data and determines which screen should be shown next
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

// ensures the correct styling to the page based on the team
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
// GAME LOGIC 
// =================================================


// updates the header information: team name, current exersise and score
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

// initializes header information once the page has loaded
window.addEventListener("DOMContentLoaded", () => {
    initHeader();
});


// =================================================
// BASIC EXERCISE LOGIC
// =================================================


// loads the current exercise and resets all temporary game state
// also initializes any team-specific minigames linked to the exercise
function laadOpdracht() {

    const extraContent = document.getElementById("extraContent");

    // clear previous exercise content and reset temporary values
    extraContent.innerHTML = "";
    antwoordIsCorrect = false;
    hintGebruiktPerVraag = 0;
    laatsteHintTijd = 0;
    simon_punten = 0;
    blockly_punten = 0;
    gebruikteHints = [];

    // restore the default template layout
    document.getElementById("uitlegBlok").style.display = "block";
    document.getElementById("codeInputContainer").style.display = "flex";
    document.getElementById("actieBtn").style.display = "block";
    document.getElementById("hintBtn").style.display = "block";
    document.getElementById("hintBlocks").style.display = "flex";
    document.getElementById("hintContainer").style.display = "flex";

    // reset action button state
    const actieBtn = document.getElementById("actieBtn");
    actieBtn.textContent = "Controleer";
    actieBtn.classList.remove("correct-state");
    actieBtn.classList.remove("aandrijving", "programma", "klankbron");

    // reset answer input field
    const antwoordInput = document.getElementById("antwoordInput");
    if (antwoordInput) {
        antwoordInput.value = "";
        antwoordInput.disabled = false;
    }

    // get teamspecific exercise content
    if (team == "aandrijving") {
        laadOpdrachtAandrijving();
    } else if (team == "programma") {
        laadOpdrachtProgramma();
    } else {
        laadopdrachtKlankbron();
    }

    // update header
    toonOpdrachtTitel();

    document.getElementById("teamTitel").textContent = 
        "Team: " + team.charAt(0).toUpperCase() + team.slice(1);
    document.getElementById("opdrachtNummer").textContent =
        "Opdracht " + (huidigeOpdracht + 1) + " van " + (totaal_opdrachten);


    // =================================================
    // MINIGAME PAGES
    // =================================================

    // loading mini-game content from pitch perfect
    if (team === "klankbron" && huidigeOpdracht === 1) {

        fetch("perfect-pitch/toonladder.html")
            .then(res => res.text())
            .then(html => {
                extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;

                // loading css
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "perfect-pitch/toonladder.css";
                document.head.appendChild(link);

                // loding js code
                const script = document.createElement("script");
                script.type = "module";
                script.src = "perfect-pitch/toonladder.js";
                document.body.appendChild(script);
})
    }

    // update and reset hints and content
    document.getElementById("feedback").textContent = "";
    document.getElementById("scoreDisplay").textContent = "Score: " + score;

    foutPogingen = 0;
    opgeslagenHint = "";
    hintGebruiktPerVraag = 0;
    document.getElementById("hintText").textContent = "";

    updateHintBlocks();
    updateProgressBar();
}

// updates exercise title
function toonOpdrachtTitel() {
    const opdracht = gameData[team].opdrachten[huidigeOpdracht];

    const titelElement = document.getElementById("opdrachtTitel");

    if (titelElement && opdracht.naam) {
        titelElement.textContent = opdracht.naam;
    }
}

// handles the main action button. Depending on the current state this checks answers,
// continues after an exercise or exits a transition screen
function verwerkActie() {

    // check if in a page between exercises
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

    // if the exercise is already completed move to the next stage of the game
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

    // compare input with the correct answer
    let invoer = document.getElementById("antwoordInput").value
        .toUpperCase()
        .trim();

    let juistAntwoord = gameData[team].opdrachten[huidigeOpdracht].antwoord.toUpperCase();

    // when the answer is correct
    if (invoer === juistAntwoord) {

        document.getElementById("feedback").textContent = "Goed gedaan!";

        // calculate score for this exercise
        let punten = 10 - foutPogingen;
        if (team === "programma" && huidigeOpdracht === 5) {
            punten = window.simon_punten
        } else if (team === "programma" && huidigeOpdracht === 4) {
            punten = window.blockly_punten || 0;
        }
        if (punten < 0) punten = 0;

        // store updated score and progress
        score += punten;
        localStorage.setItem("score", score);
        document.getElementById("scoreDisplay").textContent = "Score: " + score;

        correcteAntwoorden++;
        localStorage.setItem("correct", correcteAntwoorden);
        updateProgressBar();

        antwoordIsCorrect = true;

        // update button state for continuing
        const actieBtn = document.getElementById("actieBtn");

        if (huidigeOpdracht === totaal_opdrachten - 1) {
            actieBtn.textContent = "Ga verder";
        } else {
            actieBtn.textContent = "Naar volgende opdracht";
        }

        actieBtn.classList.add("correct-state");
        actieBtn.classList.add(team);

        document.getElementById("antwoordInput").disabled = true;

    } else { // when the answer is wrong, show feedback and increase penalty
        document.getElementById("feedback").textContent = "Onjuist, probeer opnieuw.";
        foutPogingen++;
    }
}

// moves the game to the next exercise
// when all exercises are completed, it moves to the end
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

// shows the transition page between exercises with text and the bonus questions, 
// depending on team and exercise
function toonTussenPagina() {

    const data = gameData[team].opdrachten[huidigeOpdracht].tussenPagina;
    document.getElementById("opdrachtTitel").textContent = "Voor de volgende opdracht";

    // skip transition page if none exists
    if (!data) {
        volgendeOpdracht();
        return;
    }

    // store transition state and pending bonus questions
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

    // adjust interface for transition screen
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



// =================================================
// TEAM SPECIFIC LOGIC
// =================================================
// -----------------AANDRIJVING---------------------
// =================================================


// loads the correct minigame depending for this team
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


// =========== AANDRIJVING MINI-GAMES ============== \\

// loads the lever minigame and injects its HTML, CSS and JavaScript into the page
function hefboomGame() {

    document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;

    const extraContent = document.getElementById("extraContent");

    // get the minigame
    fetch("HefboomCompleet/hefboom.html")
        .then(res => res.text())
        .then(html => {

            extraContent.innerHTML =
                `<div class="fullscreen-content">${html}</div>`;

            // get the css
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "HefboomCompleet/hefboom.css";
            document.head.appendChild(link);

            // get the script
            const script = document.createElement("script");
            script.src = "HefboomCompleet/hefboom.js";
            document.body.appendChild(script);
        });
}

// loads the blockly programming minigame
// the blockly libraries and custom game script are loaded in sequence.
function blockly() {

    // hide defult controls while the minigame is active
    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("actieBtn").style.display = "none";

    document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;

    // get blockly
    fetch("blockly/blockly.html")
        .then(res => res.text())
        .then(html => {
            extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;
            // get blockly styling
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "blockly/blockly.css";
            document.head.appendChild(link);

            // get blockly core library
            const blocklyScript = document.createElement("script");
            blocklyScript.src = "blockly/blockly.min.js";

            blocklyScript.onload = () => {

                // load blockly JavaScript generator
                const jsScript = document.createElement("script");
                jsScript.src = "blockly/javascript_compressed.js";

                jsScript.onload = () => {

                    // load custom game logic
                    const gameScript = document.createElement("script");
                    gameScript.src = "blockly/blockscript.js";

                    // start blockly after everything is loaded
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

// loads the SimonSays minigame and hides the standard exercise interface.
function simon_says() {

    // hide the standard interface
    document.getElementById("uitlegBlok").style.display = "none";
    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("actieBtn").style.display = "none";
    document.getElementById("hintBtn").style.display = "none";
    document.getElementById("hintBlocks").style.display = "none";

    // get SimonSays
    fetch("simon-says/simon.html")
            .then(res => res.text())
            .then(html => {
                extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;

                // get the minigame css
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "simon-says/simon.css";
                document.head.appendChild(link);

                // get the minigame script
                const script = document.createElement("script");
                script.src = "simon-says/simon.js";
                document.body.appendChild(script);
            });
}



// =================================================
// -------------------PROGRAMMA---------------------
// =================================================


// loads the correct minigame for this team, simonsays is currently not used 
// but will be used in the future
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

        // case 5:
        //     simon_says();
        //     break;

        default:
            document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;
    }
}


// ============ PROGRAMMA MINI-GAMES ============== \\

// shows the qr-scanner exercise button to start scanning.
function qrScannerOpdracht() {
    const origineleInnerHTML =
        Object.getOwnPropertyDescriptor(
            Element.prototype,
            "innerHTML"
        );

    document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;

    const extraContent = document.getElementById("extraContent");

    extraContent.innerHTML = `
        <button id="startQRScanBtn">
            Scan QR-code
        </button>
    `;

    document.getElementById("startQRScanBtn")
        .addEventListener("click", startQRScanner);
}

// // loads the qr-scanner interface and required resources.
function startQRScanner() {

    const extraContent = document.getElementById("extraContent");

    // get qr-scanner
    fetch("QRScanner/qrScanner.html")
        .then(res => res.text())
        .then(html => {

            extraContent.innerHTML =
                `<div class="fullscreen-content">${html}</div>`;

            // get the css
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "QRScanner/qrScanner.css";
            document.head.appendChild(link);

            // get the script
            const script = document.createElement("script");
            script.src = "QRScanner/qrScanner.js";
            document.body.appendChild(script);
        });
}

// handles scanned qr-odes and checks if the scanned value is correct.
window.handleQRCode = function(qrData) {

    const juisteCode =
        gameData[team].opdrachten[huidigeOpdracht].antwoord
            .toLowerCase()
            .trim();

    // if the correct code is scanned
    if (qrData === juisteCode) {

        document.getElementById("feedback").textContent =
            "QR-code correct gescand!";

        // adds points
        score += 10;
        localStorage.setItem("score", score);

        correcteAntwoorden++;
        localStorage.setItem("correct", correcteAntwoorden);

        antwoordIsCorrect = true;

        // button to move on
        const actieBtn =document.getElementById("actieBtn");
        actieBtn.textContent = "Naar volgende opdracht";
        actieBtn.classList.add("correct-state");
        actieBtn.classList.add(team);

    } else {
        // when the qr-code is wrong
        document.getElementById("feedback").textContent =
            "Verkeerde QR-code.";
    }
};



// =================================================
// -------------------KLANKBRON---------------------
// =================================================


// loads the correct minigame for this team
function laadopdrachtKlankbron() {
    switch (huidigeOpdracht) {
        default:
            document.getElementById("uitlegTekst").textContent = gameData[team].opdrachten[huidigeOpdracht].uitleg;
    }
}


// ============ KLANKBRON MINI-GAMES ============== \\


// Loads the elements necessary for the Truth Lie minigame. Elements from the standard template will be hidden.
function inladenTruthLieElementen() {
    document.getElementById("uitlegTekst").textContent = truthLieVragen[team][truthLieProgress];
    document.getElementById("codeInputContainer").style.display = "none";
    document.getElementById("actieBtn").style.display = "none";
    document.getElementById("hintContainer").style.display = "none";
    document.getElementById("truth-lie-div").hidden = false;
    document.getElementById("truth-lie-ja").hidden = false;
    document.getElementById("truth-lie-nee").hidden = false;
}


// Determines if the user correctly answered the truth lie question.
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


// Updates progress within the truth lie minigame.
// If the end of the game is reached: 
// - The user's score is updated, 
// - Truth lie elements are hidden, 
// - Template elements are reloaded
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



// =================================================
// UI SYSTEMS
// =================================================
// ----------------PROGRESS BAR---------------------
// =================================================



// updates the progresbar based on the exercise
function updateProgressBar() {
    const percentage = (correcteAntwoorden / totaal_opdrachten) * 100;
    document.getElementById("progressBar").style.width = percentage + "%";
}


// =================================================
// ----------------HINTS SYSTEM---------------------
// =================================================

// opens the hint popup and handles hint availability, cooldowns 
// and confirmation before using a hint
function geefHint() {

    const overlay = document.getElementById("hintOverlay");
    const modalText = document.getElementById("hintModalText");
    const hintTitle = document.getElementById("hintTitle");
    const actions = document.getElementById("hintActions");

    hintTitle.style.display = "block";
    hintTitle.textContent = "Hint";

    const huidigeTijd = Math.floor(Date.now() / 1000);

    // check whether the player is still in the cooldown period
    if (laatsteHintTijd !== 0) {
    let verschil = huidigeTijd - laatsteHintTijd;

    if (verschil < hintCooldown) {

        overlay.style.display = "flex";
        actions.style.display = "none";
        modalText.innerHTML = "";

        // prevent multiple countdown timers from running
        if (hintInterval) clearInterval(hintInterval);

        // update the remaining cooldown time every second
        hintInterval = setInterval(() => {

            let nu = Math.floor(Date.now() / 1000);
            let resterend = hintCooldown - (nu - laatsteHintTijd);

            let minuten = Math.floor(resterend / 60);
            let seconden = resterend % 60;
            if (seconden < 10) seconden = "0" + seconden;

            let vorigeHintsHTML = "";

            // show previously used hints while waiting
            if (gebruikteHints.length > 0) {
                vorigeHintsHTML = "<br><br><strong>Vorige hints:</strong><ul>";
                gebruikteHints.forEach((hint) => {
                    vorigeHintsHTML += `<li>${hint}</li>`;
                });
                vorigeHintsHTML += "</ul>";
            }

            // stop the countdown when the cooldown has expired
            if (resterend <= 0) {
                modalText.innerHTML = "Je kunt nu weer een hint gebruiken." + vorigeHintsHTML;
                clearInterval(hintInterval);
                return;
            }

            // how long to wait for a new hint
            modalText.innerHTML =
                `Wacht nog <strong>${minuten}:${seconden}</strong> voor een nieuwe hint.` +
                vorigeHintsHTML;

        }, 1000);

        return;
    }
}

    // prevent using more than the maximum number of hint
    if (hintGebruiktPerVraag >= maxHints) {
        modalText.textContent = "Je hebt alle hints gebruikt.";
        overlay.style.display = "flex";
        return;
    }

    // confirm hint usage
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

// updates the UI hint indicators to show how many hints have been used
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

// uses a hint, retrieves the correct hint text,
// updates cooldown data and applies the score penalty
function gebruikHint() {

    const overlay = document.getElementById("hintOverlay");
    const modalText = document.getElementById("hintModalText");

    const huidigeTijd = Math.floor(Date.now() / 1000);

    // register the hint usage and start the cooldown timer
    hintGebruiktPerVraag++;
    laatsteHintTijd = huidigeTijd;

    const opdracht = gameData[team].opdrachten[huidigeOpdracht];

    // select the right hint
    if (hintGebruiktPerVraag === 1) {
        tekst = opdracht.hints[0];
    }
    else if (hintGebruiktPerVraag === 2) {
        tekst = opdracht.hints[1];
    }
    else if (hintGebruiktPerVraag === 3) {
        tekst = "Code: " + opdracht.antwoord;
    }

    // store the hint to show later and reduce total achievable points
    gebruikteHints.push(tekst);

    modalText.innerHTML = `<ul><li>${tekst}</li></ul>`;

    foutPogingen += 5;

    updateHintBlocks();
}

// the functionality for closing the hint popup
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
// ------------BONUS QUESTION SYSTEM----------------
// =================================================

// opens the bonus question popup and displays all unlocked bonus questions
function toonBonusPopup() {

    const overlay = document.getElementById("bonusOverlay");
    const lijst = document.getElementById("bonusLijst");

    lijst.innerHTML = "";

    // show an explanation when no bonus questions have been unlocked yet
    if (verzameldeBonusVragen.length === 0) {
        lijst.innerHTML = `
            <div class="bonusLeeg">
                <p>Hier vind je na iedere opdracht één nieuwe bonusvraag.</p>
            </div>
        `;

        overlay.style.display = "flex";
        return;
    }

    // generate a block for each collected bonus question
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

// Checks whether the answer to a bonus question is correct
// and awards bonus points when successful
function controleerBonus(index) {

    const bonus = verzameldeBonusVragen[index];

    if (bonus.gehaald) return;

    const input = document.getElementById(`bonusInput${index}`);

    const invoer = input.value
        .trim()
        .toUpperCase();

    // mark the question as completed and award points
    if (invoer === bonus.antwoord.trim().toUpperCase()) {

        bonus.gehaald = true;
        score += 3;
        localStorage.setItem("score", score);

        document.getElementById("scoreDisplay").textContent =
            "Score: " + score;


        const bonusBlok = input.parentElement;
        const knop = bonusBlok.querySelector("button");

        // replace the input field with the correct answer display
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
        // when the answer is wrong
        document.getElementById(`bonusFeedback${index}`).textContent =
            "Onjuist";
    }
}

// the functionality for closing the bonus question popup
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


// initializes the team code page and displays the player's own code and the other team slots
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

// checks whether a submitted team code is correct
// when both codes are found, the game is completed
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

    // if both team codes are known save the final score and remaining time
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


// performs page-specific setup when the DOM has loaded
window.addEventListener("DOMContentLoaded", () => {
    
    // show the continue button when a saved game exists
    const continueBtn = document.getElementById("continueBtn");
    if (continueBtn && localStorage.getItem("team") && localStorage.getItem("totalSeconds") && localStorage.getItem("score") > 0) {
        continueBtn.style.display = "block";
        document.getElementById("continueText").style.display = "block";
        
        continueBtn.addEventListener("click", () => {
            window.location.href = "template.html";
        });
    }

    // automatically focus and capitalize answer input
    const antwoordInput = document.getElementById("antwoordInput");
    if (antwoordInput) {
        antwoordInput.focus();

        antwoordInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // use team-specific styling on the game page
    const path = window.location.pathname;

    if (
        path.includes("template.html")
    ) {
        applyTeamTheme();
    }

});