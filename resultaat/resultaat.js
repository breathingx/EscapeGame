// =================================================
// DATA
// =================================================



let tijdResultaten = [];
let scoreResultaten = [];

// loading the JSON files from the data map
async function laadResultaatData() {

    const [
        tijdResponse,
        scoreResponse
    ] = await Promise.all([
        fetch("../data/tijdResultaten.json"),
        fetch("../data/scoreResultaten.json")
    ]);

    const tijdData = await tijdResponse.json();
    const scoreData = await scoreResponse.json();

    tijdResultaten = tijdData.songs;
    scoreResultaten = scoreData.instruments;
}



// =================================================
// HELPERS
// =================================================



// making a leaderboard row based on the loaded data
function maakSlotRow(data) {

    return `
        <div class="slot-left">
            ${data.left}
        </div>
        <div class="slot-divider"></div>
        <div class="slot-right">
            <div class="slot-title">
                ${data.right}
            </div>
            ${
                data.artist
                ? `
                    <div class="slot-artist">
                        ${data.artist}
                    </div>
                `
                : ""
            }
        </div>
    `;
}


// converting the time string to the total number of seconds
function secondenVanTijd(tijdString) {
    const parts = tijdString.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}


// finding the items that are closest to the team's score
function vindDichtstbijzijndeIndex(
    lijst,
    doelWaarde,
    waardeGetter
) {

    let besteIndex = 0;
    let kleinsteVerschil = Infinity;

    lijst.forEach((item, index) => {

        const verschil =
            Math.abs(
                waardeGetter(item) - doelWaarde
            );

        if (verschil < kleinsteVerschil) {
            kleinsteVerschil = verschil;
            besteIndex = index;
        }
    });

    return besteIndex;
}



// =================================================
// SHOWING RESULTS
// =================================================



// getting the right data to show up at the right place
function toonResultaten() {
    const team = localStorage.getItem("team") || "Onbekend";
    
    const eigenTeamTitel = document.getElementById("eigenTeamTitelResultaat");
    if (eigenTeamTitel) {
        eigenTeamTitel.textContent = "Eigen team: " + team.charAt(0).toUpperCase() + team.slice(1);
    }

    // getting the end result from localstorage
    const eindTijd = localStorage.getItem("eindTijd");
    const eindScore = parseInt(localStorage.getItem("eindScore"));

    document.getElementById("eindtijd").textContent = eindTijd;
    document.getElementById("eindscore").textContent = eindScore;
    document.getElementById("tijdSubtitle").textContent = "Jullie tijd is " + eindTijd + ". Dat is ongeveer even lang als de volgende liedjes en albums!";
    document.getElementById("scoreSubtitle").textContent = "Jullie team score is " + eindScore + ". Dat getal komt in de buurt van de volgende instrumenten!";

    // finding the right song to compare
    const eigenSeconden = secondenVanTijd(eindTijd);
    const tijdIndex = vindDichtstbijzijndeIndex(
        tijdResultaten,
        eigenSeconden,
        item => secondenVanTijd(item.tijd)
    );
    const huidigeTijd = tijdResultaten[tijdIndex];

    // showing the team result from the leaderboard
    document.getElementById("eindtijd").innerHTML =
        `
            <div class="slot-value-main">
                ${huidigeTijd.tijd}
            </div>

            <div class="slot-value-sub">
                Jullie tijd: ${eindTijd}
            </div>
        `;

    document.getElementById("tijdMuziek").innerHTML =
        `
            <div class="slot-title">
                ${huidigeTijd.naam}
            </div>

            <div class="slot-artist">
                ${huidigeTijd.artiest}
            </div>
        `;

    // showing the data above the team result
    const tijdBovenData =
        tijdResultaten[
            Math.min(tijdResultaten.length - 1, tijdIndex + 1)
        ];

    document.getElementById("tijdBoven").innerHTML =
        maakSlotRow({
            left: tijdBovenData.tijd,
            right: tijdBovenData.naam,
            artist: tijdBovenData.artiest
        });

    // showing the data below the team result
    const tijdOnderData =
        tijdResultaten[
            Math.max(0, tijdIndex - 1)
        ];

    document.getElementById("tijdOnder").innerHTML =
        maakSlotRow({
            left: tijdOnderData.tijd,
            right: tijdOnderData.naam,
            artist: tijdOnderData.artiest
        });

    // fiding the right instrument to compare to the team
    const scoreIndex = vindDichtstbijzijndeIndex(
        scoreResultaten,
        eindScore,
        item => item.aantal
    );

    const huidigeScore = scoreResultaten[scoreIndex];

    // showing the team result for the leaderboard
    document.getElementById("eindscore").innerHTML =
        `
            <div class="slot-value-main">
                ${huidigeScore.aantal}
            </div>

            <div class="slot-value-sub">
                Jullie score: ${eindScore}
            </div>
        `; 

    document.getElementById("scoreInstrument").innerHTML =
        `
            <div class="slot-title">
                ${huidigeScore.naam}
            </div>

            <div class="slot-artist">
                ${huidigeScore.onderdeel}
            </div>
        `;

    // showing the instrument above the team
    const scoreBovenData =
        scoreResultaten[
            Math.min(scoreResultaten.length - 1, scoreIndex + 1)
        ];

    document.getElementById("scoreBoven").innerHTML =
        maakSlotRow({
            left: scoreBovenData.aantal,
            right: scoreBovenData.naam,
            artist: scoreBovenData.onderdeel
        });

    // showing the instrument below the team
    const scoreOnderData =
        scoreResultaten[
            Math.max(0, scoreIndex - 1)
        ];

    document.getElementById("scoreOnder").innerHTML =
        maakSlotRow({
            left: scoreOnderData.aantal,
            right: scoreOnderData.naam,
            artist: scoreOnderData.onderdeel
        });
}


// waiting for the html page to load before adding the results
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await laadResultaatData();
        toonResultaten();
    }
);
// =================================================
// TEAM OVERVIEW
// =================================================

function formatTijdOverzicht(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
}

function toonTeamOverzicht() {
    const teams = ["programma", "klankbron", "aandrijving"];
    const grid = document.getElementById("teamOverviewGrid");
    
    if (!grid) return;

    let totalScore = 0;
    let gridHTML = "";

    teams.forEach(teamName => {
        const teamScore = parseInt(localStorage.getItem(`team_${teamName}_score`)) || 0;
        const teamTime = parseInt(localStorage.getItem(`team_${teamName}_time`)) || 0;

        totalScore += teamScore;

        // Hier voegen we ${teamName} toe als class aan de kaart
        gridHTML += `
            <div class="team-card ${teamName}">
                <div class="team-card-name">${teamName}</div>
                <div class="team-card-stat">Score: ${teamScore}</div>
                <div class="team-card-stat">Tijd over: ${formatTijdOverzicht(teamTime)}</div>
            </div>
        `;
    });

    grid.innerHTML = gridHTML;
    
    const gezamenlijkeScoreEl = document.getElementById("gezamenlijkeScore");
    if (gezamenlijkeScoreEl) {
        gezamenlijkeScoreEl.textContent = totalScore;
    }
}


// =================================================
// RESTART
// =================================================



// remove all saved data and restarts the game
function restartGame() {
    localStorage.clear();
    localStorage.removeItem("bonusVragen");

    window.location.href = "../index.html";
}


document.addEventListener(
    "DOMContentLoaded",
    async () => {
        toonTeamOverzicht();
        await laadResultaatData();
        toonResultaten();
    }
);