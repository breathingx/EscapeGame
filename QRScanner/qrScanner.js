const video =  document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const msg =  document.getElementById('msg');
let scannerActief = true;

navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}})
  .then(stream => {
    video.srcObject = stream;
    msg.textContent = 'Richt de camera op een QR-code!';
    requestAnimationFrame(tick);
  })
  .catch(() => {
    msg.textContent = 'Toegang tot camera geweigerd.';
  });

function tick () {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data.data, data.width, data.height);
    
    if (code) {

      const qrData = code.data.toLowerCase();
      const geldigeTeams = [
          "aandrijving",
          "programma",
          "klankbron"
      ];

      // if (geldigeTeams.includes(qrData)) {
      //     localStorage.setItem("team", qrData);
      //     window.location.href = "template.html";
      // }
      if (code && scannerActief) {

        scannerActief = false;

        if (window.handleQRCode) {
            window.handleQRCode(code.data);
        }

        return;
    }
    }

  }
  requestAnimationFrame(tick);
}