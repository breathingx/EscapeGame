
// =================================================
// TIMER 
// =================================================

if (
    window.location.pathname.includes("/game") ||
    window.location.pathname.includes("/codes")
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
            window.location.href = "/start";
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

let hintGebruiktPerVraag = false;
let totaleHintsGebruikt = 0;
let opgeslagenHint = "";
const maxHints = 3;


// =================================================
// DATA
// =================================================

const opdrachten = {
    aandrijving: [
        { vraag: "Hoe wordt een speeldoos meestal aangedreven?", antwoord: "aa aa Door een opwindveer die langzaam ontspant en zo het mechaniek laat draaien." },
        { vraag: "Wat doet een gewichtsaandrijving in een grote muziekautomaat?", antwoord: "aa aa Het gewicht zakt naar beneden en levert zo een constante kracht aan het mechaniek." },
        { vraag: "Waarom gebruiken sommige orgels een elektromotor als aandrijving?", antwoord: "aa aa Omdat een elektromotor een stabiele en langdurige aandrijving geeft zonder handmatig werk." },
        { vraag: "Wat is het voordeel van een slingermechanisme in oude muziekklokken?", antwoord: "aa aa Het zorgt voor een gelijkmatige beweging en een stabiel tempo." },
        { vraag: "Hoe wordt een draaiorgel op straat meestal aangedreven?", antwoord: "aa aa Met een handzwengel die de interne pomp en het speelmechaniek aandrijft." },
        { vraag: "Waarom moet een opwindveer regelmatig worden opgewonden?", antwoord: "aa aa Omdat de veer langzaam ontspant en anders de kracht op het mechaniek te zwak wordt." },
        { vraag: "Wat gebeurt er als een gewicht in een muziekautomaat de grond bereikt?", antwoord: "aa aa De aandrijving stopt en het gewicht moet opnieuw omhoog worden getrokken." },
        { vraag: "Hoe zorgt een elektromotor voor constante snelheid in een muziekautomaat?", antwoord: "aa aa Door een regelmechanisme dat de motorsnelheid stabiel houdt." },
        { vraag: "Waarom is smering belangrijk bij mechanische aandrijving?", antwoord: "aa aa Om wrijving te verminderen en slijtage van tandwielen en assen te voorkomen." },
        { vraag: "Wat is een typische aandrijving voor kleine tafelorgeltjes?", antwoord: "aa aa Een handpomp of zwengel die lucht en beweging levert." }
    ],
    programma: [
        { vraag: "Wat bepaalt het programma van een speeldoos?", antwoord: "bb bb De nopjes op de metalen cilinder die de tanden van de kam aanslaan." },
        { vraag: "Hoe werkt een ponsband in een draaiorgel?", antwoord: "bb bb De gaatjes in de band bepalen welke tonen worden aangespeeld wanneer de band langs de leeskoppen loopt." },
        { vraag: "Waarom gebruiken sommige muziekautomaten een kartonnen boek?", antwoord: "bb bb Omdat de uitgesneden sleuven een duurzaam en eenvoudig te vervangen programma vormen." },
        { vraag: "Wat is het voordeel van een cilinderprogramma?", antwoord: "bb bb Het is zeer precies en kan complexe melodieën bevatten." },
        { vraag: "Hoe kan een muziekautomaat meerdere melodieën spelen?", antwoord: "bb bb Door een cilinder met meerdere posities of door verschillende programmas te wisselen, zoals boeken of banden." },
        { vraag: "Wat gebeurt er als een ponsband scheurt?", antwoord: "bb bb Het programma wordt onderbroken en de automaat kan de juiste tonen niet meer lezen." },
        { vraag: "Hoe wordt een programma in een speelklok geselecteerd?", antwoord: "bb bb Door de cilinder te verschuiven naar een andere rij nopjes die een andere melodie vormen." },
        { vraag: "Waarom zijn kartonnen muziekboeken vaak zo groot?", antwoord: "bb bb Omdat ze voldoende ruimte nodig hebben voor de sleuven die de volledige melodie bevatten." },
        { vraag: "Hoe werkt een metalen schijf in een schijfspeeldoos?", antwoord: "bb bb De gaatjes en uitstulpingen op de schijf haken in pennen die de klankkam aanslaan." },
        { vraag: "Wat is een voordeel van een schijfprogramma boven cilinders?", antwoord: "bb bb Schijven zijn goedkoper te produceren en eenvoudig te wisselen voor nieuwe muziek." }
    ],
    klankbron: [
        { vraag: "Wat is de klankbron van een speeldoos?", antwoord: "cc cc Een metalen kam waarvan de tanden trillen wanneer ze worden aangeslagen." },
        { vraag: "Hoe produceert een draaiorgel geluid?", antwoord: "cc cc Door lucht die via pijpen stroomt en zo tonen vormt, vergelijkbaar met een kerkorgel." },
        { vraag: "Waarom klinken houten orgelpijpen anders dan metalen?", antwoord: "cc cc Omdat het materiaal de resonantie en klankkleur beïnvloedt." },
        { vraag: "Wat is de klankbron in een carillon-automaat?", antwoord: "cc cc Bronzen klokken die door hamers worden aangeslagen." },
        { vraag: "Hoe ontstaat geluid in een mechanische piano-automaat?", antwoord: "cc cc Door hamers die snaren aanslaan, net als bij een gewone piano." },
        { vraag: "Waarom hebben orgelpijpen verschillende lengtes?", antwoord: "cc cc Omdat de lengte de toonhoogte bepaalt: langere pijpen geven lagere tonen." },
        { vraag: "Wat maakt de toon van een speeldoos zo herkenbaar?", antwoord: "cc cc De heldere, metaalachtige resonantie van de stalen kamtanden." },
        { vraag: "Hoe werkt een rietpijp in een orgel?", antwoord: "cc cc Een metalen riet trilt door luchtstroom en produceert zo een karakteristieke toon." },
        { vraag: "Waarom gebruiken sommige muziekautomaten trommels of bellen?", antwoord: "cc cc Om ritme en extra klankkleuren toe te voegen aan de melodie." },
        { vraag: "Wat bepaalt de luidheid van een orgelpijp?", antwoord: "cc cc De luchtdruk en de vorm van de pijpopening." }
    ]
};


// =================================================
// NAVIGATIE
// =================================================

function restartGame() {
    const maintainTeam = localStorage.getItem("team");
    localStorage.clear();
    localStorage.setItem("team", maintainTeam);
    window.location.href = "/start";
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
        window.location.href = "/game";
    }, 300);
}

if (window.location.pathname.includes("/game")) {

    team = localStorage.getItem("team");
    huidigeOpdracht = parseInt(localStorage.getItem("opdracht")) || 0;
    correcteAntwoorden = parseInt(localStorage.getItem("correct")) || 0;
    score = parseInt(localStorage.getItem("score")) || 0;

    const progressBar = document.getElementById("progressBar");
    if (team && progressBar) {
        progressBar.classList.add(team);
    }

    if (!team || !opdrachten[team]) {
        window.location.href = "/start";
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

function laadOpdracht() {

    antwoordIsCorrect = false;

    const actieBtn = document.getElementById("actieBtn");
    actieBtn.textContent = "Controleer";
    actieBtn.classList.remove("correct-state");
    actieBtn.classList.remove("aandrijving", "programma", "klankbron");

    document.getElementById("antwoordInput").disabled = false;

    document.getElementById("teamTitel").textContent = "Team: " + team.charAt(0).toUpperCase() + team.slice(1);
    document.getElementById("opdrachtNummer").textContent =
        "Opdracht " + (huidigeOpdracht + 1) + " van 10";

    document.getElementById("vraag").textContent =
        opdrachten[team][huidigeOpdracht].vraag;

    document.getElementById("feedback").textContent = "";
    document.getElementById("antwoordInput").value = "";
    document.getElementById("scoreDisplay").textContent = "Score: " + score;

    foutPogingen = 0;
    opgeslagenHint = "";
    hintGebruiktPerVraag = false;
    document.getElementById("hintText").textContent = "";

    updateHintBlocks();
    updateProgressBar();
}


function verwerkActie() {

    if (antwoordIsCorrect) {
        volgendeOpdracht();
        return;
    }

    let invoer = document.getElementById("antwoordInput").value.toLowerCase().trim();
    let juistAntwoord = opdrachten[team][huidigeOpdracht].antwoord.toLowerCase();

    if (juistAntwoord.includes(invoer) && invoer.length > 3) {

        document.getElementById("feedback").textContent = "Goed gedaan!";

        let punten = 10 - foutPogingen;
        if (punten < 0) punten = 0;

        score += punten;
        localStorage.setItem("score", score);
        document.getElementById("scoreDisplay").textContent = "Score: " + score;

        correcteAntwoorden++;
        localStorage.setItem("correct", correcteAntwoorden);
        updateProgressBar();

        // BELANGRIJK
        antwoordIsCorrect = true;

        const actieBtn = document.getElementById("actieBtn");

        // ALS DIT DE LAATSTE VRAAG IS
        if (huidigeOpdracht === 9) {
            actieBtn.textContent = "Kraak de code";
        } else {
            actieBtn.textContent = "Volgende opdracht";
        }

        actieBtn.classList.add("correct-state");
        actieBtn.classList.add(team);

        // voorkom opnieuw invoeren
        document.getElementById("antwoordInput").disabled = true;

    } else {
        document.getElementById("feedback").textContent = "Helaas, probeer opnieuw.";
        foutPogingen++;
    }
}


function volgendeOpdracht() {

    huidigeOpdracht++;

    if (huidigeOpdracht < 10) {
        localStorage.setItem("opdracht", huidigeOpdracht);
        laadOpdracht();
    } else {
        window.location.href = "/codes";
    }
}


// =================================================
// PROGRESS BAR
// =================================================

function updateProgressBar() {
    const percentage = (correcteAntwoorden / 10) * 100;
    document.getElementById("progressBar").style.width = percentage + "%";
}


// =================================================
// HINT SYSTEEM
// =================================================

function geefHint() {

    const overlay = document.getElementById("hintOverlay");
    const modalText = document.getElementById("hintModalText");
    const hintTitle = document.getElementById("hintTitle");

    hintTitle.style.display = "none";

    // ALS ER AL EEN HINT IS GEBRUIKT
    if (hintGebruiktPerVraag) {

        hintTitle.style.display = "block";
        hintTitle.textContent = "Hint:";

        modalText.innerHTML = `
            Je hebt voor deze vraag al een hint gebruikt.<br><br>
            ${opgeslagenHint}
        `;

        overlay.style.display = "flex";
        return;
    }

    // ALS ER GEEN HINTS MEER BESCHIKBAAR ZIJN
    if (totaleHintsGebruikt >= maxHints) {

        modalText.textContent = "Je hebt geen hints meer beschikbaar.";
        overlay.style.display = "flex";
        return;
    }

    // NIEUWE HINT MAKEN
    const vraagObj = opdrachten[team][huidigeOpdracht];
    opgeslagenHint = vraagObj.antwoord.split(" ").slice(0, 3).join(" ") + " ...";

    hintTitle.style.display = "block";
    hintTitle.textContent = "Hint:";

    modalText.textContent = opgeslagenHint;

    overlay.style.display = "flex";

    foutPogingen += 5;
    hintGebruiktPerVraag = true;
    totaleHintsGebruikt++;

    updateHintBlocks();
}

function updateHintBlocks() {
    const blocks = document.querySelectorAll("#hintBlocks .hintBlock");

    blocks.forEach((block, index) => {
        if (index < totaleHintsGebruikt) {
            block.classList.add("used");
        } else {
            block.classList.remove("used");
        }
    });
}

// Sluit hint modal
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


if (window.location.pathname.includes("/codes")) {

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

        window.location.href = "/resultaat";

    } else {
        document.getElementById("codeFeedback").textContent =
            "Nog niet alle codes zijn correct.";
    }
}

// =================================================
// RESULTAAT
// =================================================

if (window.location.pathname.includes("/resultaat")) {

    const eindTijd = localStorage.getItem("eindTijd");
    const eindScore = localStorage.getItem("eindScore");

    document.getElementById("eindtijd").textContent = eindTijd;
    document.getElementById("eindscore").textContent = eindScore;

}