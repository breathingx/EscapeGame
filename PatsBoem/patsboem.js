window.bpCounts = { boem: 0, pats: 0, rust: 0 };

const boem = new Audio("PatsBoem/audio/BOEM.mp3");
const pats = new Audio("PatsBoem/audio/PATS.mp3");

window.incrementPatsBoem = function(type) {
    window.bpCounts[type]++;
    document.getElementById(`btn-${type}`).textContent = window.bpCounts[type];
    if (type === 'boem') {
        boem.currentTime = 0;
        boem.play().catch(e => console.log("Audio play blocked by browser:", e));
    } else if (type === 'pats') {
        pats.currentTime = 0;
        pats.play().catch(e => console.log("Audio play blocked by browser:", e));
    }
    updateHiddenInput();
};

window.resetPatsBoem = function() {
    window.bpCounts = { boem: 0, pats: 0, rust: 0 };
    document.getElementById('btn-boem').textContent = 0;
    document.getElementById('btn-pats').textContent = 0;
    document.getElementById('btn-rust').textContent = 0;
    updateHiddenInput();
};


function updateHiddenInput() {
    const val = `${window.bpCounts.boem}-${window.bpCounts.pats}-${window.bpCounts.rust}`;
    
    // Inject the formatted answer into the main game's text box
    const input = document.getElementById("antwoordInput1");
    if (input) {
        input.value = val;
    }
}

// Ensure it starts at 0-0-0 when the script loads
window.resetPatsBoem();