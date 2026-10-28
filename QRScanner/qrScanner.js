
function startQRScanner(mode = "team") {

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const msg = document.getElementById("msg");
    let messageTimeout;

    if (!video || !canvas || !msg) {
        console.error("QR-scanner elementen niet gevonden.");
        return;
    }

    const ctx = canvas.getContext("2d", {willReadFrequently: true});

    // Vraag toegang tot de camera
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: { ideal: 1280 },
            height: { ideal: 1280 },
            frameRate: { ideal: 60 },
            facingMode: "environment"
        }
    })
    .then(stream => {

        video.srcObject = stream;
        video.play();

        msg.textContent = "Richt de camera op een QR-code!";

        requestAnimationFrame(tick);

  })
    .catch(() => {

        msg.textContent = "Toegang tot camera geweigerd.";

    });


    // =================================================
    // SCANNEN
    // =================================================

    let lastScanTime = 0;
    const scanInterval = 0;
    const maxScanDimension = 640;

    function tick(timestamp) {

        if (
            video.readyState === video.HAVE_ENOUGH_DATA &&
            timestamp - lastScanTime >= scanInterval
        ) {

            lastScanTime = timestamp;

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            if (videoWidth > 0 && videoHeight > 0) {

                const scale = Math.min(1, maxScanDimension / Math.max(videoWidth, videoHeight));
                const scanWidth = Math.round(videoWidth * scale);
                const scanHeight = Math.round(videoHeight * scale);

                if (
                    canvas.width !== scanWidth ||
                    canvas.height !== scanHeight
                ) {
                    canvas.width = scanWidth;
                    canvas.height = scanHeight;
                }

                ctx.drawImage(video, 0, 0, scanWidth, scanHeight);

                const data = ctx.getImageData(0, 0, scanWidth, scanHeight);
                const code = jsQR(data.data, data.width, data.height);

                if (code && code.data && code.data.trim() !== "") {

                    const qrData = code.data.toLowerCase().trim();

                    if (mode === "team") {

                        const geldigeTeams = [
                            "aandrijving",
                            "programma",
                            "klankbron"
                        ];

                        if (geldigeTeams.includes(qrData)) {

                            localStorage.setItem("team", qrData);

                            stopCamera();

                            window.location.href = "../uitleg/uitleg.html?type=team&team=" + qrData;

                            return;
                        }
                    }

                    else if (mode === "opdracht") {

                        if (typeof window.handleQRCode === "function") {

                            const correct = window.handleQRCode(qrData);

                            if (correct === true) {

                                clearTimeout(messageTimeout);
                                stopCamera();

                                return;

                            } else {

                                msg.textContent = "QR-code niet herkend. Controleer of je de juiste QR-code scant.";

                                clearTimeout(messageTimeout);

                                messageTimeout = setTimeout(() => {
                                    msg.textContent = "Richt de camera op een QR-code!";
                                }, 3000);
                            }
                        }
                    }
                }
            }
        }

        requestAnimationFrame(tick);
    }


    // =================================================
    // CAMERA STOPPEN
    // =================================================

    function stopCamera() {

        if (video.srcObject) {

            video.srcObject
                .getTracks()
                .forEach(track => track.stop());

            video.srcObject = null;
        }
    }
}