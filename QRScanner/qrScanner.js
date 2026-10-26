
function startQRScanner(mode = "team") {

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const msg = document.getElementById("msg");
    let messageTimeout;

    if (!video || !canvas || !msg) {
        console.error("QR-scanner elementen niet gevonden.");
        return;
    }

    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

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

        // const cameraSettings =
        //     video.srcObject.getVideoTracks()[0].getSettings();

        // console.log("Cameraresolutie:", {
        //     width: cameraSettings.width,
        //     height: cameraSettings.height,
        //     frameRate: cameraSettings.frameRate
        // });

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

    function tick() {

        if (video.readyState === video.HAVE_ENOUGH_DATA) {

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const data = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            const code = jsQR(
                data.data,
                data.width,
                data.height
            );


            // QR-code gevonden
            if (code && code.data && code.data.trim() !== "") {

                // console.log("QR-detectie:", {
                //     data: code.data,
                //     lengte: code.data.length,
                //     locatie: code.location
                // });

                const qrData = code.data
                    .toLowerCase()
                    .trim();


                // =============================================
                // TEAM MODUS
                // =============================================

                if (mode === "team") {

                    const geldigeTeams = [
                        "aandrijving",
                        "programma",
                        "klankbron"
                    ];

                    if (geldigeTeams.includes(qrData)) {

                        localStorage.setItem(
                            "team",
                            qrData
                        );

                        stopCamera();

                        window.location.href =
                            "../uitleg/uitleg.html?type=team&team=" + qrData;
                    }
                }


                // =============================================
                // OPDRACHT MODUS
                // =============================================

                
                else if (mode === "opdracht") {

                    if (typeof window.handleQRCode === "function") {
                   
                        const correct = window.handleQRCode(qrData);

                        if (correct === true) {

                            clearTimeout(messageTimeout);

                            stopCamera();

                            return;

                        } else {

                            // Toon de foutmelding
                            msg.textContent =
                                "QR-code niet herkend. Controleer of je de juiste QR-code scant.";

                            // Annuleer een eventuele vorige timer
                            clearTimeout(messageTimeout);

                            // Zet de melding na 3 seconden terug
                            messageTimeout = setTimeout(() => {

                                msg.textContent = "Richt de camera op een QR-code!";

                            }, 3000);

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