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
const btn = document.getElementById("continueBtn");
const teamTitle = document.getElementById("teamTitle");



// =================================================
// LOADING VIDEO's
// =================================================

const videos = {
  aandrijving: {
    intro: "https://www.youtube.com/embed/ltGOKQgelpc",
    outro: "https://www.youtube.com/embed/pUSnteCSEJQ"
  },
  programma: {
    intro: "https://www.youtube.com/embed/K4eu70Copwc",
    outro: "https://www.youtube.com/embed/pUSnteCSEJQ"
  },
  klankbron: {
    intro: "https://www.youtube.com/embed/tTxU31ryv2g",
    outro: "https://www.youtube.com/embed/pUSnteCSEJQ"
  }
};

// =================================================
// PAGE SETUP
// =================================================



// add team style to intro
if (type === "intro") {
    document.body.classList.add(`team-${team}`);
}


// show team name in title
if (teamTitle) {
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

  // loading the video in iframe
  frame.src = videos[team][type];

  if (type === "intro") {
    btn.textContent = "Start Spel";
  } else {
    btn.textContent = "Score";
  }

  // delay before showing button, so the video is watched first
  const delay = 3000; //60000 = 1min

  setTimeout(() => {
    console.log("Knop tonen");
    btnWrap.classList.add("show");
  }, delay);
}



// =================================================
// BUTTON NAVIGATION
// =================================================


// going to the next page
btn.addEventListener("click", () => {
  // after the intro to the explain text page after outro to the results
  if (type === "intro") {
    window.location.href = `../uitleg/uitleg.html?type=team&team=${team}`;
  } else {
    window.location.href = `../resultaat/resultaat.html?team=${team}`;
  }

});