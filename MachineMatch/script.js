const images = [
    { src: "img/apple.png", pair: 1 },
    { src: "img/apple2.png", pair: 1 },

    { src: "img/car.png", pair: 2 },
    { src: "img/car2.png", pair: 2 },

    { src: "img/dog.png", pair: 3 },
    { src: "img/dog2.png", pair: 3 },

    { src: "img/music.png", pair: 4 },
    { src: "img/music2.png", pair: 4 },
];

// Shuffle
images.sort(() => 0.5 - Math.random());

const grid = document.getElementById("gameGrid");
const message = document.getElementById("message");

let selected = [];

images.forEach((imgData) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.dataset.pair = imgData.pair;

    const img = document.createElement("img");
    img.src = imgData.src;

    div.appendChild(img);

    div.addEventListener("click", () => handleClick(div));

    grid.appendChild(div);
});

function handleClick(card) {
    // if click same image then return
    if(selected.includes(card)) return;
    if (selected.length === 2 || card.classList.contains("matched")) return;

    selected.push(card);
    card.classList.add("selected");

    if (selected.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [first, second] = selected;

    if (first.dataset.pair === second.dataset.pair) {
        message.textContent = "Good job!";
        first.classList.add("matched");
        second.classList.add("matched");
    } else {
        message.textContent = "Try again!";
        setTimeout(() => {
            first.classList.remove("selected");
            second.classList.remove("selected");
        }, 500);
    }

    setTimeout(() => {
        selected = [];
    }, 500);
}