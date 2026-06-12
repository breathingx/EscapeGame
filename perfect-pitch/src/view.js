import { mat4 } from 'gl-matrix';
import {
  BALL_DIAMETER,
  COLOR_BACKGROUND,
  COLOR_BALL,
  COLOR_GATE,
  COLOR_GATE_DONE,
  COLOR_PLATFORM,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLATFORM_DEPTH,
  PLATFORM_HEIGHT,
  PLATFORM_WIDTH,
  PLATFORM_Z,
} from './config.js';
import { Cuboid } from './shapes/cuboid.js';
import { Gate } from './shapes/gate.js';
import { Sphere } from './shapes/sphere.js';

export class View {
  constructor(gl, program, state) {
    this.gl = gl;
    this.program = program;
    //Locate shader attributes
    this.aPosition = gl.getAttribLocation(program, 'aPosition');
    this.uMvp = gl.getUniformLocation(program, 'uMvp');
    this.uColor = gl.getUniformLocation(program, 'uColor');
    //HUD Message element
    this.message = document.getElementById('message');
    //Platform
    this.platform = new Cuboid(
      gl,
      0,
      -PLATFORM_HEIGHT,
      PLATFORM_Z,
      PLATFORM_WIDTH,
      PLATFORM_HEIGHT,
      PLATFORM_DEPTH
    );
    this.sphere = new Sphere(gl);
    //Gate mesh for every wall
    this.gates = state.gates.map((gate) => new Gate(gl, gate));

    this.gl.clearColor(...COLOR_BACKGROUND);
  }

  renderMessage(state) {
    const { gates, currentGate, gameOverTimer } = state;

    if (gameOverTimer === -1) {
      //Message per gate
      const gate = gates[currentGate];
      this.message.innerText = `🎵 ${gate.label}`;
    } else {
      //Reveals the winning text at game over
      this.message.innerText = 'Gefeliciteerd! De code is ABCDEF';
    }
  }

  render(state) {
    this.renderMessage(state);
    //Clear colour and depth buffers
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enableVertexAttribArray(this.aPosition);
    //Allocate matrices for the from
    const proj = mat4.create();
    const view = mat4.create();
    const ballModel = mat4.create();
    const ballMvp = mat4.create();
    const worldModel = mat4.create();
    const worldMvp = mat4.create();

    const ball = state.ball.position;

    mat4.perspective(proj, Math.PI / 2, GAME_WIDTH / GAME_HEIGHT, 0.1, 100);
    //Default camera position
    const eye = [-2.25, 1.5, -2];
    //On game over, zoom the camera backward dramatically
    if (state.gameOverTimer > 0) {
      eye[2] -= Math.min(
        Math.pow(state.gameOverTimer, 3),
        PLATFORM_DEPTH + PLATFORM_Z
      );
    }
    //Central looking point
    mat4.lookAt(view, eye, [-0.25, 2, 1], [0, 1, 0]);
    //Worldview stays centered on the ball by shifting the world along with it
    mat4.translate(ballModel, ballModel, [0, ball[1], 0]);

    mat4.multiply(ballMvp, proj, view);
    mat4.multiply(ballMvp, ballMvp, ballModel);

    // World moves backward by ball Z
    mat4.translate(worldModel, worldModel, [
      -PLATFORM_WIDTH / 2,
      -BALL_DIAMETER / 2,
      -ball[2],
    ]);
    mat4.multiply(worldMvp, proj, view);
    mat4.multiply(worldMvp, worldMvp, worldModel);
    this.gl.uniformMatrix4fv(this.uMvp, false, worldMvp);

    // Draw platform
    this.gl.uniform4fv(this.uColor, COLOR_PLATFORM);
    this.platform.draw(this.gl, this.aPosition);

    // Draw gates
    this.gl.uniform4fv(this.uColor, COLOR_GATE_DONE);
    for (const [i, gate] of Object.entries(this.gates)) {
      if (Number(i) === state.currentGate) {
        this.gl.uniform4fv(this.uColor, COLOR_GATE);
      }

      gate.draw(this.gl, this.aPosition);
    }

    // Draw ball
    this.gl.uniformMatrix4fv(this.uMvp, false, ballMvp);
    this.gl.uniform4fv(this.uColor, COLOR_BALL);
    this.sphere.draw(this.gl, this.aPosition);
  }
}
