// =================================================
// DATA
// =================================================


const tijdResultaten = [
    {
        naam: "Her Majesty",
        artiest: "The Beatles",
        tijd: "0:23"
    },
    {
        naam: "United State of Pop 2009",
        artiest: "DJ Earworm",
        tijd: "1:00"
    },
    {
        naam: "Song 2",
        artiest: "Blur",
        tijd: "2:01"
    },
    {
        naam: "Basket Case",
        artiest: "Green Day",
        tijd: "3:01"
    },
    {
        naam: "Africa",
        artiest: "Toto",
        tijd: "4:55"
    },
    {
        naam: "Bohemian Rhapsody",
        artiest: "Queen",
        tijd: "5:55"
    },
    {
        naam: "Hotel California",
        artiest: "Eagles",
        tijd: "6:30"
    },
    {
        naam: "Hey Jude",
        artiest: "The Beatles",
        tijd: "7:11"
    },
    {
        naam: "Stairway to Heaven",
        artiest: "Led Zeppelin",
        tijd: "8:02"
    },
    {
        naam: "Shine On You Crazy Diamond (Parts I–V)",
        artiest: "Pink Floyd",
        tijd: "9:08"
    },
    {
        naam: "All Too Well (10 Minute Version)",
        artiest: "Taylor Swift",
        tijd: "10:13"
    },
    {
        naam: "The End",
        artiest: "The Doors",
        tijd: "11:43"
    },
    {
        naam: "Free Bird",
        artiest: "Lynyrd Skynyrd",
        tijd: "12:09"
    },
    {
        naam: "Sing About Me, I'm Dying of Thirst",
        artiest: "Kendrick Lamar",
        tijd: "13:12"
    },
    {
        naam: "Dogs",
        artiest: "Pink Floyd",
        tijd: "14:04"
    },
    {
        naam: "Autobahn",
        artiest: "Kraftwerk",
        tijd: "15:00"
    },
    {
        naam: "Supper's Ready",
        artiest: "Genesis",
        tijd: "16:22"
    },
    {
        naam: "Echoes",
        artiest: "Pink Floyd",
        tijd: "17:31"
    },
    {
        naam: "2112",
        artiest: "Rush",
        tijd: "18:34"
    },
    {
        naam: "Mountain Jam",
        artiest: "The Allman Brothers Band",
        tijd: "19:16"
    },
    {
        naam: "In-A-Gadda-Da-Vida",
        artiest: "Iron Butterfly",
        tijd: "20:05"
    },
    {
        naam: "Thick as a Brick",
        artiest: "Jethro Tull",
        tijd: "21:44"
    },
    {
        naam: "Atom Heart Mother",
        artiest: "Pink Floyd",
        tijd: "22:31"
    },
    {
        naam: "Meddle",
        artiest: "Pink Floyd",
        tijd: "23:47"
    },
    {
        naam: "The Revealing Science of God",
        artiest: "Yes",
        tijd: "24:21"
    },
    {
        naam: "Phaedra",
        artiest: "Tangerine Dream",
        tijd: "25:15"
    },
    {
        naam: "Tubular Bells (Part One)",
        artiest: "Mike Oldfield",
        tijd: "26:01"
    },
    {
        naam: "A Plague of Lighthouse Keepers",
        artiest: "Van der Graaf Generator",
        tijd: "27:06"
    },
    {
        naam: "The Whirlwind",
        artiest: "Transatlantic",
        tijd: "28:38"
    },
    {
        naam: "Six Degrees of Inner Turbulence",
        artiest: "Dream Theater",
        tijd: "29:48"
    }
];


const scoreResultaten = [
    { naam: "Piano", onderdeel: "Toetsen", aantal: 40 },
    { naam: "Orgel", onderdeel: "Pijpen", aantal: 45 },
    { naam: "Harp", onderdeel: "Snaren", aantal: 50 },
    { naam: "Gitaar", onderdeel: "Snaren", aantal: 55 },
    { naam: "Fluit", onderdeel: "Gaten", aantal: 60 },
    { naam: "Klarinet", onderdeel: "Kleppen", aantal: 65 },
    { naam: "Saxofoon", onderdeel: "Kleppen", aantal: 70 },
    { naam: "Accordeon", onderdeel: "Knoppen", aantal: 75 },
    { naam: "Xylofoon", onderdeel: "Staven", aantal: 80 },
    { naam: "Drumkit", onderdeel: "Onderdelen", aantal: 85 },
    { naam: "Synthesizer", onderdeel: "Toetsen", aantal: 90 },
    { naam: "Carillon", onderdeel: "Klokken", aantal: 95 },

    { naam: "Piano", onderdeel: "Snaren", aantal: 100 },
    { naam: "Orgel", onderdeel: "Registers", aantal: 105 },
    { naam: "Harp", onderdeel: "Snaren", aantal: 110 },
    { naam: "Gitaar", onderdeel: "Snaren", aantal: 115 },
    { naam: "Fluit", onderdeel: "Gaten", aantal: 120 },
    { naam: "Klarinet", onderdeel: "Kleppen", aantal: 125 },
    { naam: "Saxofoon", onderdeel: "Kleppen", aantal: 130 },
    { naam: "Accordeon", onderdeel: "Knoppen", aantal: 135 },
    { naam: "Xylofoon", onderdeel: "Staven", aantal: 140 },
    { naam: "Drumkit", onderdeel: "Bevestigingen", aantal: 145 },
    { naam: "Synthesizer", onderdeel: "Toetsen", aantal: 150 },
    { naam: "Carillon", onderdeel: "Klokken", aantal: 155 },

    { naam: "Piano", onderdeel: "Toetsen", aantal: 160 },
    { naam: "Orgel", onderdeel: "Pijpen", aantal: 165 },
    { naam: "Harp", onderdeel: "Snaren", aantal: 170 },
    { naam: "Gitaar", onderdeel: "Snaren", aantal: 175 },
    { naam: "Fluit", onderdeel: "Gaten", aantal: 180 },
    { naam: "Klarinet", onderdeel: "Kleppen", aantal: 185 },
    { naam: "Saxofoon", onderdeel: "Kleppen", aantal: 190 },
    { naam: "Accordeon", onderdeel: "Knoppen", aantal: 195 },
    { naam: "Xylofoon", onderdeel: "Staven", aantal: 200 }
];


// =================================================
// RESULTAAT
// =================================================



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


function secondenVanTijd(tijdString) {

    const parts = tijdString.split(":");

    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// if (window.location.pathname.includes("resultaat/resultaat.html")) {

const eindTijd = localStorage.getItem("eindTijd");
const eindScore = parseInt(localStorage.getItem("eindScore"));

document.getElementById("eindtijd").textContent =
    eindTijd;
document.getElementById("eindscore").textContent =
    eindScore;
document.getElementById("tijdSubtitle").textContent =
    "Tijd: " + eindTijd;

document.getElementById("scoreSubtitle").textContent =
    "Score: " + eindScore;


const eigenSeconden = secondenVanTijd(eindTijd);

let tijdIndex = 0;
let kleinsteVerschil = Infinity;

tijdResultaten.forEach((item, index) => {

    const verschil =
        Math.abs(
            secondenVanTijd(item.tijd) - eigenSeconden
        );

    if (verschil < kleinsteVerschil) {
        kleinsteVerschil = verschil;
        tijdIndex = index;
    }
});

const huidigeTijd =
    tijdResultaten[tijdIndex];

document.getElementById("eindtijd").innerHTML =
    `
        <div class="slot-value-main">
            ${eindTijd}
        </div>

        <div class="slot-value-sub">
            ${huidigeTijd.tijd}
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

let scoreIndex = 0;
let scoreVerschil = Infinity;

scoreResultaten.forEach((item, index) => {

    const verschil =
        Math.abs(item.aantal - eindScore);

    if (verschil < scoreVerschil) {
        scoreVerschil = verschil;
        scoreIndex = index;
    }
});

const huidigeScore =
    scoreResultaten[scoreIndex];

document.getElementById("eindscore").innerHTML =
    `
        <div class="slot-value-main">
            ${eindScore}
        </div>

        <div class="slot-value-sub">
            ${huidigeScore.aantal}
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
// }








function restartGame() {
    localStorage.clear();
    localStorage.removeItem("bonusVragen");

    window.location.href = "../index.html";
}