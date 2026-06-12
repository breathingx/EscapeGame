// =================================================
// DATA
// =================================================



let uitlegData = {};


async function laadUitlegData() {
    const response = await fetch("../data/uitleg.json");
    uitlegData = await response.json();
}



// =================================================
// GETTING PARAMETERS
// =================================================



// reading URL parameters to determine which explanation to show
const params = new URLSearchParams(window.location.search);
const type = params.get("type");
const team = params.get("team");


// adding text to the page depending on team and page
if ((type === "team" || type === "einde") && team) {
    document.body.classList.add(`team-${team}`);
}


const titel = document.getElementById("uitlegTitel");
const tekst = document.getElementById("uitlegTekst");
const buttonContainer = document.getElementById("buttonContainer");



// =================================================
// SHOWING THE TEXT
// =================================================



// showing the correct explanation based on type
function toonUitleg() {

    // the first general text
    if (type === "algemeen") {

        titel.textContent =
            uitlegData.algemeen.titel;

        tekst.innerHTML =
            uitlegData.algemeen.tekst
                .map(item => `<p>${item}</p>`)
                .join("");

        buttonContainer.innerHTML = `
            <button onclick="window.location.href='../QRScanner/qrScanner.html'">
                QR Kies je Team
            </button>

            <button onclick="window.location.href='../home.html'">
                Knop Kies je Team
            </button>
        `;
    }

    // text based on which team was choosen
    if (type === "team") {

        titel.textContent =
            "Team: " +
            team.charAt(0).toUpperCase() +
            team.slice(1);

        tekst.innerHTML =
            uitlegData.teams[team].tekst
                .map(item => `<p>${item}</p>`)
                .join("");

        buttonContainer.innerHTML = `
            <button onclick="window.location.href='../template.html'">
                START
            </button>
        `;
    }

    // end text
    if (type === "einde") {

        titel.textContent =
            uitlegData.einde.titel;

        tekst.innerHTML =
            uitlegData.einde.tekst
                .map(item => `<p>${item}</p>`)
                .join("");

        buttonContainer.innerHTML = `
            <button onclick="window.location.href='../codes.html'">
                Kraak de code
            </button>
        `;
    }
}



// =================================================
// PAGE LOAD
// =================================================



// waiting for JSON before rendering the content
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await laadUitlegData();
        toonUitleg();
    }
);