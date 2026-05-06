const message = document.getElementById("message");
const topGrid = document.getElementById("topGrid");
const bottomGrid = document.getElementById("bottomGrid");

let selectedTop = null;
let selectedBottom = null;

// 🔊 Audio control
let currentAudio = null;
let currentCard = null;

code = "ABCDEF";
let current_solution = "";
index = 0;

// Top row (with sound)
const topImages = [
    { src: "img/play1.png", pair: 1, sound: "sounds/piano.mp3" },
    { src: "img/play2.png", pair: 2, sound: "sounds/drums.mp3" },
    { src: "img/play3.png", pair: 3, sound: "sounds/guitar.mp3" },
    { src: "img/play4.png", pair: 4, sound: "sounds/flute.mp3" },
];

// Bottom row (answers)
const bottomImages = [
    { src: "img/piano.png", pair: 1 },
    { src: "img/drums.png", pair: 2 },
    { src: "img/guitar.png", pair: 3 },
    { src: "img/flute.png", pair: 4 },
];

// Shuffle bottom row
bottomImages.sort(() => 0.5 - Math.random());

/* ----------- CREATE TOP ROW ----------- */
topImages.forEach((imgData) => {
    const div = document.createElement("div");
    div.classList.add("card", "top-card");
    div.dataset.pair = imgData.pair;

    const img = document.createElement("img");
    img.src = imgData.src;

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.innerHTML = "▶";

    div.appendChild(img);
    div.appendChild(overlay);

    div.addEventListener("click", () => {
        if (div.classList.contains("matched")) return;

        // 👉 Click same card = stop
        if (currentCard === div) {
            currentAudio.pause();
            currentAudio.currentTime = 0;

            div.classList.remove("active");
            currentAudio = null;
            currentCard = null;

            return;
        }

        // 👉 Stop any currently playing sound
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;

            if (currentCard) {
                currentCard.classList.remove("active");
            }
        }

        // 👉 Play new sound
        const audio = new Audio(imgData.sound);
        audio.play();

        currentAudio = audio;
        currentCard = div;

        // When sound ends → reset UI
        audio.addEventListener("ended", () => {
            div.classList.remove("active");
            currentAudio = null;
            currentCard = null;
        });

        // Highlight selection
        document.querySelectorAll(".top-card").forEach(c => c.classList.remove("active"));
        div.classList.add("active");

        selectedTop = div;
        checkMatch();
    });

    topGrid.appendChild(div);
});

/* ----------- CREATE BOTTOM ROW ----------- */
bottomImages.forEach((imgData) => {
    const div = document.createElement("div");
    div.classList.add("card", "bottom-card");
    div.dataset.pair = imgData.pair;

    const img = document.createElement("img");
    img.src = imgData.src;

    div.appendChild(img);

    div.addEventListener("click", () => {
        if (div.classList.contains("matched")) return;

        document.querySelectorAll(".bottom-card").forEach(c => c.classList.remove("selected"));
        div.classList.add("selected");

        selectedBottom = div;
        checkMatch();
    });

    bottomGrid.appendChild(div);
});

/* ----------- MATCH LOGIC ----------- */
function checkMatch() {
    if (!selectedTop || !selectedBottom) return;

    if (selectedTop.dataset.pair === selectedBottom.dataset.pair) {
        // message.textContent = "Good job!";
        // one letter gets added per correct match
        current_solution += code[index];
        index++;
        message.textContent = `Good job! Current solution: ${current_solution}`;

        selectedTop.classList.add("matched");
        selectedBottom.classList.add("matched");

        // Stop sound if matched
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
            currentCard = null;
        }
    } else {
        message.textContent = "Try again!";
    }

    setTimeout(() => {
        selectedTop?.classList.remove("active");
        selectedBottom?.classList.remove("selected");

        selectedTop = null;
        selectedBottom = null;
    }, 700);
}