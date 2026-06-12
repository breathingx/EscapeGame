import {
  BALL_ACCELERATION,
  BALL_DIAMETER,
  BALL_GAME_OVER_Z,
  BALL_MAX_SPEED,
  BALL_Y_SMOOTHING_FACTOR,
  CHEATING_ENABLED,
  GATE_HOLE_SIZE,
  PITCH_MAX,
  PITCH_MIN,
} from './config.js';
import { pitchToHeight } from './rescale.js';
//Update the ball's position based on detected pitch
function updateBallY(ball, pitch) {
  const normalizedPitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, pitch));
  const newHeight = pitchToHeight(normalizedPitch);

  const factor = BALL_Y_SMOOTHING_FACTOR;

  ball.position[1] = ball.position[1] * (1 - factor) + newHeight * factor;
}
//Update ball's speed
function updateBallZ(ball, dt) {
  ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + BALL_ACCELERATION * dt);
  ball.position[2] += ball.speed * dt;
}
//Checks if the ball collides with the gate
function checkBallGateCollision(state) {
  const { ball, currentGate, gates } = state;

  const gate = gates[currentGate];
  const gateZ = gate.z - BALL_DIAMETER / 2;

  if (ball.position[2] <= gateZ) {
    return;
  }

  const y = ball.position[1];

  const doesBallFitInHole =
    y >= gate.holeY && y + BALL_DIAMETER <= gate.holeY + GATE_HOLE_SIZE;
  //If the ball fits, update the game state
  if (doesBallFitInHole || CHEATING_ENABLED) {
    state.currentGate++;
  //If no gates are left, finish the game
    if (state.currentGate >= gates.length) {
      state.gameOverTimer = 0;
    }
    //If it doesn't fit, bounce the ball back
  } else {
    ball.position[2] = gateZ;
    ball.speed *= -1;
  }
}

function handleGameOver(state, dt) {
  state.ball.position[2] = Math.min(BALL_GAME_OVER_Z, state.ball.position[2]);
  if (state.ball.position[2] === BALL_GAME_OVER_Z) {
    state.gameOverTimer += dt;
  }
}
//Updates Y and Z positions of the ball
export function update(state, detectedPitch, dt) {
  updateBallY(state.ball, detectedPitch);
  updateBallZ(state.ball, dt);
//While timer is -1 the game is running
  if (state.gameOverTimer === -1) {
    checkBallGateCollision(state);
  } else { //start the game end sequence
    handleGameOver(state, dt);
  }
}
