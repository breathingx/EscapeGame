import { BALL_MAX_Y, PITCH_MAX, PITCH_MIN } from './config.js';
//Rescale function
export function rescale(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
//Logarithmic rescale function
export function rescaleLog(value, inMin, inMax, outMin, outMax) {
  return rescale(
    Math.log(value),
    Math.log(inMin),
    Math.log(inMax),
    outMin,
    outMax
  );
}
//Pitch rescale function
export function pitchToHeight(pitch) {
  return rescaleLog(pitch, PITCH_MIN, PITCH_MAX, 0, BALL_MAX_Y);
}
