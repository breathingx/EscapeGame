(() => {
    // =================================================
    // VARIABLES & ELEMENTS
    // =================================================
    const maxLevel = 10;
    const winCode = "PRO000"; // unused
    let playing = false;
    let sequence = [];
    let playerSequence = [];
    let level = 0;
    let retriesLeft = 2;
    let bestScore = 0;
    let randomval = 0;

    const btns = [
        document.getElementById('simon-0'),
        document.getElementById('simon-1'),
        document.getElementById('simon-2'),
        document.getElementById('simon-3')
    ];
    
    const simonGame = document.getElementById('simon-game');
    const startBtn = document.getElementById('start-simon');
    const endBtn = document.getElementById('end-simon');
    endBtn.style.display = 'none';
    const statusText = document.getElementById('simon-status');
    
    const retryText = document.createElement('p');
    retryText.id = "simon-retries";
    retryText.style.fontWeight = "bold";
    retryText.style.marginTop = "0px";
    simonGame.insertBefore(retryText, statusText.nextSibling);

    const pointerImg = document.createElement('img');
    pointerImg.src = 'simon-says/toon.png'; 
    pointerImg.classList.add('bouncing-image');
    simonGame.appendChild(pointerImg);

    startBtn.addEventListener('click', startGame);
    endBtn.addEventListener('click', nextGame);

    // =================================================
    // GAME LOGIC
    // =================================================


    // starts a new game, resets all variables and goes to the first level
    function startGame() {
        sequence = [];
        startBtn.style.display = 'none';
        nextLevel();
    }

    // calls the function to go to the next game
    function nextGame() {
        if (typeof volgendeOpdracht === "function") volgendeOpdracht();
    }

    // add event listeners to the buttons for player input
    btns.forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            if (e.cancelable) e.preventDefault();
            if (playerSequence.length < sequence.length && !playing && bestScore != 10) {
                const index = parseInt(e.target.dataset.index);
                flashButton(index);
                playerSequence.push(index);
                checkSequence();
            }
        }, { passive: false });
    });

    // turns a button white for a short time to indicate it has been pressed
    function flashButton(index) {
        btns[index].classList.add('active');
        setTimeout(() => {
            btns[index].classList.remove('active');
        }, 300);
    }

    // animates the hand image to press the button at the given index
    function animateHand(index) {
    const btn = btns[index];
    const ro = [280, 80, 260, 100][index];
    const offset = [[130, 130], [-30, 130], [130, 90], [-30, 100]][index];
    const gameRect = simonGame.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    let centerX = (btnRect.left - gameRect.left) + (btnRect.width / 2);
    let centerY = (btnRect.top - gameRect.top) + (btnRect.height / 2);

    centerX -= offset[0]; 
    centerY -= offset[1]; 

    pointerImg.style.setProperty('--start-x', `${centerX}px`);
    pointerImg.style.setProperty('--start-y', `${centerY}px`);
    pointerImg.style.setProperty('--rotation', `${ro}deg`);

    pointerImg.classList.remove('play-animation');
    void pointerImg.offsetWidth; 
    pointerImg.classList.add('play-animation');
}

    // plays the sequence of buttons with a short delay in between, also animates the hand image to press the buttons
    function playSequence() {
    playing = true
    let i = 0;
    
    const interval = setInterval(() => {
        const currentBtnIndex = sequence[i]; 
        
        animateHand(currentBtnIndex);
    
        setTimeout(() => {
            flashButton(currentBtnIndex);
        }, 250); 

        i++;
        if (i >= sequence.length) {
            playing = false
            clearInterval(interval);
        }
    }, 600); 
}

    // advances to the next level, adds a new random button to the sequence and shows it
    function nextLevel() {
        playerSequence = [];
        level++;
        if (level > maxLevel) {
            bestScore = 10;
            endGame();
            return;
        }
        
        statusText.textContent = `Ronde ${level} van ${maxLevel}`;
        randomval = Math.floor(Math.random() * 4)
        // if button occured twice before, pick a new button (to avoid too much repetition)
        if (sequence.length >= 2 && randomval == sequence[sequence.length - 1] && randomval == sequence[sequence.length-2]) {
            randomval += Math.floor(Math.random() * 3 + 1)
            randomval = randomval % 4
        } 
        sequence.push(randomval);
        setTimeout(playSequence, 300); 
    }

    // checks if the player's input is correct, handles retries and ends game if no retries left
    function checkSequence() {
        const currentMove = playerSequence.length - 1;
        
        if (playerSequence[currentMove] !== sequence[currentMove]) {
            if (retriesLeft > 0) {
                statusText.textContent = `Fout! Je mag nog ${retriesLeft} keer proberen.`;
                retriesLeft--;
                startBtn.style.display = 'block';
                startBtn.textContent = 'Opnieuw proberen';
                level = 0; 
            } else {
                endGame(); 
            }
            return;
        }
        
        if (playerSequence.length === sequence.length) {
            bestScore = Math.max(bestScore, level); 
            nextLevel();
        }
    }

    // overwrites scoring function with simon says score and ends the game
    function endGame() {
        startBtn.style.display = 'none';
        endBtn.style.display = 'block';
        if (document.getElementById('simon-retries')) {
            document.getElementById('simon-retries').style.display = 'none';
        }
        
        statusText.innerHTML = `Spel afgelopen!<br>Jouw score: ${bestScore} punten.`;
        
        window.simon_punten = bestScore;
        score += bestScore;
        localStorage.setItem("score", score);
        if (document.getElementById("scoreDisplay")) {
            document.getElementById("scoreDisplay").textContent = "Score: " + score;
        }

        correcteAntwoorden++;
        localStorage.setItem("correct", correcteAntwoorden);
        if (typeof updateProgressBar === "function") {
            updateProgressBar();
        }
    }
})();