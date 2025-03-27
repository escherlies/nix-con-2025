import * as TWGL from 'twgl.js';

import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

/**
 * Initializes and starts a WebGL-based lava animation in the background canvas.
 * The animation uses spherical coordinates to position the camera and renders
 * a full-screen quad with custom shaders.
 * 
 * @returns {Function} A cleanup function that cancels the animation frame when called
 * @throws {Error} If WebGL context cannot be obtained or shader compilation fails
 */
export function startLavaAnimation() {
  // Calculate camera position
  // based on THREE.Vector3.setFromSphericalCoords(radius, phi, theta)
  const DEG_TO_RAD = Math.PI / 180;

  const cameraRadius = 6;
  const cameraPhi = 90 * DEG_TO_RAD;
  const cameraTheta = 270 * DEG_TO_RAD;

  const sinPhiRadius = Math.sin(cameraPhi) * cameraRadius;

  const cameraPosition = [
    sinPhiRadius * Math.sin(cameraTheta), // X
    Math.cos(cameraPhi) * cameraRadius, // Y
    sinPhiRadius * Math.cos(cameraTheta), // Z
  ];

  const gl = document.getElementById('background').getContext('webgl');
  const programInfo = TWGL.createProgramInfo(gl, [vertexShader, fragmentShader]);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };

  const bufferInfo = TWGL.createBufferInfoFromArrays(gl, arrays);

  let frameId = requestAnimationFrame(render);

  function render(time) {
    try {
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      gl.canvas.width = canvasWidth;
      gl.canvas.height = canvasHeight;
      gl.viewport(0, 0, canvasWidth, canvasHeight);

      const uniforms = {
        uTime: time * 0.001,
        uResolution: [canvasWidth, canvasHeight],
        uCameraPosition: cameraPosition,
      };

      gl.useProgram(programInfo.program);
      TWGL.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      TWGL.setUniforms(programInfo, uniforms);
      TWGL.drawBufferInfo(gl, bufferInfo);
    } catch (error) {
      console.error(error);
      return cancelAnimationFrame(frameId);
    }

    frameId = requestAnimationFrame(render);
  }

  // Return cleanup function
  return () => cancelAnimationFrame(frameId);
}