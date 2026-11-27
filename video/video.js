(() => {
    // =================================================
    // URL PARAMETERS
    // =================================================

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const team = params.get("team");

    // =================================================
    // UI ELEMENTEN
    // =================================================

    const frame = document.getElementById("videoFrame");
    const btnWrap = document.getElementById("continueBtnWrap");
    const btn = document.getElementById("videoContinueBtn");
    const teamTitle = document.getElementById("teamTitle");

    // =================================================
    // LOADING VIDEO'S
    // =================================================

    const OUTRO_VIDEO = "https://player.vimeo.com/video/1191272422?h=0af3466c60&controls=0&autopause=0";

    const videos = {
        aandrijving: {
            intro: "https://player.vimeo.com/video/1191272420?h=e9b0adee22&controls=0&autopause=0",
            outro: OUTRO_VIDEO
        },
        programma: {
            intro: "https://player.vimeo.com/video/1191313663?h=b651b25e75&controls=0&autopause=0",
            outro: OUTRO_VIDEO
        },
        klankbron: {
            intro: "https://player.vimeo.com/video/1191272423?h=edcb7c350f&controls=0&autopause=0",
            outro: OUTRO_VIDEO
        }
    };

    // =================================================
    // PAGE SETUP
    // =================================================

    // add team style to intro
    if (type === "intro" && team) {
        document.body.classList.add(`team-${team}`);
    }

    // show team name in title
    if (teamTitle && team) {
        teamTitle.textContent =
            "Team: " + team.charAt(0).toUpperCase() + team.slice(1);
    }

    // =================================================
    // VIDEO LOGIC
    // =================================================

    // checking if the video exists
    if (!videos[team] || !videos[team][type]) {
        console.error("Geen video gevonden");
    } else {
        // loading the video in iframe and binding initVimeoPlayers() from script.js
        frame.src = videos[team][type];
        if (typeof initVimeoPlayers === "function") {
            initVimeoPlayers();
        }

        if (type === "intro") {
            btn.textContent = "Start Spel";
        } else {
            btn.textContent = "Score";
        }

        // delay before showing button, so the video is watched first
        const delay = 30000; // 60000 = 1min

        setTimeout(() => {
            btnWrap.classList.add("show");
        }, delay);
    }

    // =================================================
    // BUTTON NAVIGATION
    // =================================================

    // going to the next page
    btn.addEventListener("click", () => {
        // after the intro to the explain text page, after outro to the results
        if (type === "intro") {
            window.location.href = `../uitleg/uitleg.html?type=team&team=${team}`;
        } else {
            window.location.href = `../resultaat/resultaat.html?team=${team}`;
        }
    });
})();