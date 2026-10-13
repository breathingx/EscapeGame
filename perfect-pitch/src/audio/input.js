export async function initAudioInput() {
  try {
    // alert("A: requesting microphone");

    if (!navigator.mediaDevices) {
      throw new Error("navigator.mediaDevices is not available");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    // alert("B: microphone granted");

    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("AudioContext is not supported");
    }

    const audioContext = new AudioContext();

    // alert("C: AudioContext created");

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(stream);

    const sampleRate = audioContext.sampleRate;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    const timeBuffer = new Float32Array(analyser.fftSize);
    const frequencyBuffer = new Float32Array(
      analyser.frequencyBinCount
    );

    // alert("D: audio initialized");

    return {
      sampleRate,
      timeBuffer,
      frequencyBuffer,
      analyser
    };

  } catch (error) {
    alert(
      "MIC ERROR:\n" +
      error.name +
      "\n\n" +
      error.message
    );

    throw error;
  }
}