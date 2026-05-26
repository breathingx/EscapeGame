const params = new URLSearchParams(window.location.search);

const team = params.get("team");
const type = params.get("type");

const frame = document.getElementById("videoFrame");
const btnWrap = document.getElementById("continueBtnWrap");
const btn = document.getElementById("continueBtn");
const teamTitle = document.getElementById("teamTitle");

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

console.log("team:", team);
console.log("type:", type);

if (teamTitle) {
  teamTitle.textContent =
    "Team: " + team.charAt(0).toUpperCase() + team.slice(1);
}

if (!videos[team] || !videos[team][type]) {
  console.error("Geen video gevonden");
} else {

  frame.src = videos[team][type];

  if (type === "intro") {
    btn.textContent = "Start Spel";
  } else {
    btn.textContent = "Score";
  }

  const delay = 3000; //60000 = 1min

  setTimeout(() => {
    console.log("Knop tonen");
    btnWrap.classList.add("show");
  }, delay);
}

btn.addEventListener("click", () => {

  if (type === "intro") {

    window.location.href = "../template.html";

  } else {

    window.location.href = `../resultaat/resultaat.html?team=${team}`;

  }

});