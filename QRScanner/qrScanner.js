const video =  document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const msg =  document.getElementById('msg');

navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}}) //request camera access
  .then(stream => {
    video.srcObject = stream; //connect camera stream to video
    msg.textContent = 'Richt de camera op een QR-code!'; //instruct user
    requestAnimationFrame(tick); //start continuously scanning frames
  })
  .catch(() => {
    msg.textContent = 'Toegang tot camera geweigerd.'; //access denied
  });

function tick () {
  if (video.readyState === video.HAVE_ENOUGH_DATA) { //is there enough data available
    canvas.width = video.videoWidth; //match canvas dimensions to video dimensions
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0); //draw current video frame onto canvas
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height); //extract each pixel from canvas
    const code = jsQR(data.data, data.width, data.height); //try to detect the QR-code
    
    if (code) { //detected?

      const qrData = code.data.toLowerCase(); //convert QR-content to lowercase
      const geldigeTeams = [
          "aandrijving",
          "programma",
          "klankbron"
      ];

      if (geldigeTeams.includes(qrData)) { //does QR contain valid teamname?
          localStorage.setItem("team", qrData); //store teamname in local storage
          window.location.href = "template.html"; //redirect user to next page
      }
    }

  }
  requestAnimationFrame(tick);
}