(function () {
    "use strict";

    // =================================================
    // CONFIG – rename / replace with your real files
    // Paths are relative to template.html (the page that loads this game)
    // =================================================
    const INSTRUMENTEN = [
        { naam: "Draaiorgel", afbeelding: "soundmatch/images/draaiorgel.png", geluid: "soundmatch/sounds/draaiorgel.mp3" },
        { naam: "Carillon",   afbeelding: "soundmatch/images/carillon.png",   geluid: "soundmatch/sounds/carillon.mp3" },
        { naam: "Muziekdoos", afbeelding: "soundmatch/images/muziekdoos.png", geluid: "soundmatch/sounds/muziekdoos.mp3" },
        { naam: "Pianola",    afbeelding: "soundmatch/images/pianola.png",    geluid: "soundmatch/sounds/pianola.mp3" },
        { naam: "Speelklok",  afbeelding: "soundmatch/images/speelklok.png",  geluid: "soundmatch/sounds/speelklok.mp3" }
    ];

    const PUNTEN_PER_GOED = 2;
    const CONFETTI_KLEUREN = ["#00F280", "#FFD700", "#8268FF", "#FF5733", "#0091FF"];

    const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
    const ICON_CROSS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';

    // =================================================
    // AUDIO (shared, so only one sound plays at a time)
    // =================================================
    let huidigAudio = null;
    let huidigeKnop = null;

    function stopAudio() {
        if (huidigAudio) {
            huidigAudio.pause();
            huidigAudio = null;
        }
        if (huidigeKnop) {
            huidigeKnop.classList.remove("playing");
            huidigeKnop = null;
        }
    }

    function speel(src, knop) {
        stopAudio();

        const audio = new Audio(src);
        huidigAudio = audio;
        huidigeKnop = knop;
        knop.classList.add("playing");

        const klaar = () => knop.classList.remove("playing");
        audio.addEventListener("ended", klaar);
        audio.addEventListener("error", klaar);

        const p = audio.play();
        if (p && p.catch) p.catch(klaar);
    }

    // =================================================
    // HELPERS
    // =================================================
    function shuffle(lijst) {
        const kopie = lijst.slice();
        for (let i = kopie.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
        }
        return kopie;
    }

    function feestje(element) {
        if (typeof confetti !== "function") return;
        const r = element.getBoundingClientRect();
        confetti({
            particleCount: 30,
            spread: 70,
            startVelocity: 15,
            origin: {
                x: (r.left + r.width / 2) / window.innerWidth,
                y: (r.top + r.height / 2) / window.innerHeight
            },
            colors: CONFETTI_KLEUREN,
            zIndex: 100
        });
    }

    // =================================================
    // GAME – called by script.js every time the exercise is loaded
    // =================================================
    window.initSoundMatch = function () {
        stopAudio();

        const track     = document.getElementById("sm-track");
        const playBtn   = document.getElementById("sm-play");
        const actionBtn = document.getElementById("sm-action");
        const statusEl  = document.getElementById("sm-status");
        const boxesEl   = document.getElementById("sm-boxes");
        const prevBtn   = document.getElementById("sm-prev");
        const nextBtn   = document.getElementById("sm-next");

        if (!track || !playBtn || !actionBtn || !statusEl || !boxesEl) return;

        const totaal = INSTRUMENTEN.length;
        const volgorde = shuffle(INSTRUMENTEN.map((_, i) => i)); // which instrument is the answer per round

        let ronde = 0;
        let aantalGoed = 0;
        let actief = -1;            // index of the centered instrument
        let fase = "kies";          // "kies" | "volgend" | "klaar" | "bezig"

        const items = [];
        const boxes = [];

        // ---------- answer boxes ----------
        for (let i = 0; i < totaal; i++) {
            const box = document.createElement("div");
            box.className = "sm-box";
            boxesEl.appendChild(box);
            boxes.push(box);
        }

        // ---------- carousel ----------
        INSTRUMENTEN.forEach((instr, i) => {
            const item = document.createElement("div");
            item.className = "sm-item";

            const cirkel = document.createElement("div");
            cirkel.className = "sm-circle";

            const img = document.createElement("img");
            img.src = instr.afbeelding;
            img.alt = instr.naam;
            img.draggable = false;
            img.addEventListener("error", () => { img.style.display = "none"; });
            cirkel.appendChild(img);

            const naam = document.createElement("div");
            naam.className = "sm-name";
            naam.textContent = instr.naam;

            item.appendChild(cirkel);
            item.appendChild(naam);

            // tapping a side instrument brings it to the center
            item.addEventListener("click", () => {
                if (i !== actief) scrollNaar(i);
            });

            track.appendChild(item);
            items.push(item);
        });

        function scrollNaar(i, smooth = true) {
            const item = items[i];
            if (!item) return;
            track.scrollTo({
                left: item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2,
                behavior: smooth ? "smooth" : "auto"
            });
        }

        function bepaalActief() {
            const midden = track.scrollLeft + track.clientWidth / 2;
            let beste = 0;
            let besteAfstand = Infinity;

            items.forEach((item, i) => {
                const afstand = Math.abs(item.offsetLeft + item.offsetWidth / 2 - midden);
                if (afstand < besteAfstand) {
                    besteAfstand = afstand;
                    beste = i;
                }
            });

            if (beste !== actief) {
                actief = beste;
                items.forEach((item, i) => item.classList.toggle("active", i === actief));
            }
        }

        let ticking = false;
        track.addEventListener("scroll", () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                bepaalActief();
                ticking = false;
            });
        }, { passive: true });

        // arrows (only visible on devices with a mouse, swiping is the main control)
        prevBtn.addEventListener("click", () => scrollNaar(Math.max(0, actief - 1)));
        nextBtn.addEventListener("click", () => scrollNaar(Math.min(totaal - 1, actief + 1)));

        // start in the middle
        requestAnimationFrame(() => {
            scrollNaar(Math.floor(totaal / 2), false);
            bepaalActief();
        });

        // ---------- round flow ----------
        function startRonde() {
            fase = "kies";
            statusEl.textContent = `Fragment ${ronde + 1} van ${totaal}`;
            actionBtn.textContent = "Kies dit instrument";
            actionBtn.disabled = true; // unlocked after the sound has been played
            items.forEach(item => item.classList.remove("sm-juist"));
            boxes.forEach((b, i) => b.classList.toggle("current", i === ronde));
        }

        function beoordeel() {
            const doel = volgorde[ronde];
            const goed = actief === doel;
            const box = boxes[ronde];

            stopAudio();
            box.classList.remove("current");

            if (goed) {
                aantalGoed++;
                box.classList.add("correct");
                box.innerHTML = ICON_CHECK;
                feestje(box);
                statusEl.textContent = `Goed zo! +${PUNTEN_PER_GOED} punten`;
            } else {
                box.classList.add("wrong");
                box.innerHTML = ICON_CROSS;
                items[doel].classList.add("sm-juist");
                scrollNaar(doel);
                statusEl.textContent = `Helaas, dit was de ${INSTRUMENTEN[doel].naam}.`;
            }

            if (ronde < totaal - 1) {
                fase = "volgend";
                actionBtn.textContent = "Volgend fragment \u2192";
            } else {
                fase = "klaar";
                actionBtn.textContent = "Afronden";
                statusEl.textContent += ` Je hebt ${aantalGoed} van ${totaal} goed (+${aantalGoed * PUNTEN_PER_GOED} punten).`;
            }
            actionBtn.disabled = false;
        }

        function afronden() {
            fase = "bezig";
            actionBtn.disabled = true;
            stopAudio();
            if (typeof window.soundMatchKlaar === "function") {
                window.soundMatchKlaar(aantalGoed * PUNTEN_PER_GOED);
            }
        }

        // ---------- events ----------
        playBtn.addEventListener("click", () => {
            speel(INSTRUMENTEN[volgorde[ronde]].geluid, playBtn);
            if (fase === "kies") actionBtn.disabled = false;
        });

        actionBtn.addEventListener("click", () => {
            if (fase === "kies") beoordeel();
            else if (fase === "volgend") { ronde++; startRonde(); }
            else if (fase === "klaar") afronden();
        });

        startRonde();
    };
})();