window.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("team") !== "presentatie") {
        return;
    }

    startPresentatieRoute();
});

const presentatieGames = [
    "blockly",
    "simon",
    "toonladder",
    "hefboom"
];

let huidigePresentatieGame = 0;

function startPresentatie() {

    localStorage.setItem("team", "presentatie");
    window.location.href = "template.html";
}

function startPresentatieRoute() {

    team = "presentatie";
    document.getElementById("teamTitel").textContent = "Presentatie";
    document.getElementById("scoreDisplay").style.display = "none";
    document.getElementById("timer").style.display = "none";
    document.getElementById("hintContainer").style.display = "none";
    document.getElementById("feedback").style.display = "none";
    document.getElementById("progressBar").parentElement.style.display = "none";
    // document.getElementById("progressContainer").style.display = "none";
    laadPresentatieGame();
}

function laadPresentatieGame() {

    resetTemplate();

    const titel = document.getElementById("opdrachtTitel");
    const uitleg = document.getElementById("uitlegTekst");

    switch (presentatieGames[huidigePresentatieGame]) {

        case "blockly":

            titel.textContent = "Blockly";
            uitleg.textContent = "Demonstratie Blockly";
            blockly();
            break;

        case "simon":

            titel.textContent = "Simon Says";
            uitleg.textContent = "Demonstratie Simon Says";
            simon_says();
            break;

        case "toonladder":

            titel.textContent = "Toonladder";
            uitleg.textContent = "Demonstratie Toonladder";
            laadToonladderPresentatie();
            break;

        case "hefboom":

            titel.textContent = "Hefboom";
            uitleg.textContent = "Demonstratie Hefboom";
            hefboomGame();
            break;
    }

    voegVolgendeKnopToe();
}

function laadToonladderPresentatie() {

    const extraContent = document.getElementById("extraContent");

    fetch("perfect-pitch/toonladder.html")
        .then(res => res.text())
        .then(html => {

            extraContent.innerHTML = `<div class="fullscreen-content">${html}</div>`;

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "perfect-pitch/toonladder.css";

            document.head.appendChild(link);

            const script = document.createElement("script");

            script.type = "module";
            script.src = "perfect-pitch/toonladder.js";

            document.body.appendChild(script);
        });
}

function voegVolgendeKnopToe() {

    let knop =
        document.getElementById("presentatieVolgende");

    if (!knop) {

        knop = document.createElement("button");



        knop.id = "presentatieVolgende";
        knop.textContent = "Volgende minigame";

        const logo = document.getElementById("logo");
        const footer = document.querySelector(".hud-footer");

        if (footer) {
            footer.parentNode.insertBefore(knop, footer);
        }

        knop.addEventListener("click", () => {

            huidigePresentatieGame++;

            if (
                huidigePresentatieGame >=
                presentatieGames.length
            ) {

                window.location.href =
                    "home.html";

                return;
            }

            document.getElementById("extraContent")
                .innerHTML = "";

            laadPresentatieGame();
        });
    }
}

function resetTemplate() {

    document.getElementById("uitlegBlok").style.display = "block";
    document.getElementById("codeInputContainer").style.display = "flex";
    document.getElementById("actieBtn").style.display = "block";
    document.getElementById("hintBtn").style.display = "block";
    document.getElementById("hintBlocks").style.display = "flex";
}