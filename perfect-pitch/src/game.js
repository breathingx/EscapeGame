import { detectPitchYin } from './audio/detectPitchYin.js';
import {
  drawSpectrum,
  drawWaveform,
  initCanvasSpectrum,
  initCanvasWaveform,
} from './audio/graphs.js';
import { initAudioInput } from './audio/input.js';
import { NOTES, SOLFEGE } from './audio/notes.js';
import { MAX_DT, SHOW_AUDIO_GRAPHS } from './config.js';
import { INITIAL_STATE } from './state.js';
import { update } from './update.js';
import { View } from './view.js';
import { initCanvasWebgl } from './webgl.js';

export async function initGameLoop() {
  console.log('Notes to sing:');
  for (const [i, note] of Object.entries(NOTES)) {
    console.log(`${SOLFEGE[i]} (${note} Hz)`);
  }

  const state = INITIAL_STATE;

  const contextWaveform = initCanvasWaveform();
  const contextSpectrum = initCanvasSpectrum();
  const { gl, program } = initCanvasWebgl();
  const view = new View(gl, program, state);

  //Becomes visible after everything is initialized
  document.getElementById('container').style.visibility = 'visible';
  //Request for microphone access
  const { sampleRate, analyser, timeBuffer, frequencyBuffer } =
    await initAudioInput();

  //Computes delta time
  let previousTime = performance.now();
  
  function loop(currentTime) {
    //Computes the delta time in seconds. It is capped to prevent weird behaviour after pausing
    const dt = Math.min((currentTime - previousTime) / 1000, MAX_DT);
    previousTime = currentTime;

    //Pull latest audio samples into the buffer
    analyser.getFloatTimeDomainData(timeBuffer);
    //Pulls the frequency when the audio graphs are visible
    if (SHOW_AUDIO_GRAPHS) {
      analyser.getFloatFrequencyData(frequencyBuffer);
    }
    //Detect the pitch using Yin
    const pitch = detectPitchYin(timeBuffer, sampleRate);
    console.log(pitch);

    //Updates the game state based on the pitch and time. Also renders it.
    update(state, pitch, dt);
    view.render(state);

    //Visualize the waveform and spectrum-frequency graphs
    if (SHOW_AUDIO_GRAPHS) {
      drawWaveform(contextWaveform, timeBuffer);
      drawSpectrum(
        contextSpectrum,
        frequencyBuffer,
        analyser.minDecibels,
        analyser.maxDecibels
      );
    }
    //Next frame
    requestAnimationFrame(loop);
  }
  //Starts the loop
  requestAnimationFrame(loop);
}
