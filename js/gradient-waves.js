(() => {
  'use strict';

  const hero = document.getElementById('top');
  const canvas = document.getElementById('hero-waves');
  if (!hero || !canvas) return;

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const OGL_URL = 'https://unpkg.com/ogl@1.0.11/src/index.js';
  let generation = 0;
  let session = null;

  const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

  const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [1, 1, 1];
    return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
  };

  const detailToSteps = detail => {
    if (detail === 'low') return 40.0;
    if (detail === 'high') return 110.0;
    return 70.0;
  };

  // The shader, mesh and full uniform set match the supplied React component.
  // Colors are tuned to the supplied dark hero reference.
  const settings = {
    horizonColor: '#171820', waveColor: '#565961', crestColor: '#c4c5c6',
    speed: 0.4, amplitude: 2.5, waveScale: 0.6, waveRatio: 0.9,
    swell: 35, turbulence: 20, tilt: 1.11, zoom: 1.0, height: 5.5,
    fogDepth: 15, detail: 'medium', brightness: 1.0, opacity: 1.0,
    mouseInteraction: true, parallaxStrength: 0.5,
    grain: true, grainIntensity: 0.05
  };

  function createSession({ Renderer, Program, Mesh, Triangle }) {
    if (!canvas.getContext('webgl2')) throw new Error('WebGL2 is unavailable');
    const renderer = new Renderer({
      canvas, webgl: 2, alpha: true, premultipliedAlpha: true,
      antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    if (!renderer.isWebgl2) throw new Error('OGL could not create a WebGL2 renderer');
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex, fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: settings.speed },
        uAmplitude: { value: settings.amplitude },
        uWaveScale: { value: settings.waveScale },
        uWaveRatio: { value: settings.waveRatio },
        uSwell: { value: settings.swell },
        uTurbulence: { value: settings.turbulence },
        uTilt: { value: settings.tilt },
        uZoom: { value: settings.zoom },
        uHeight: { value: settings.height },
        uFogDepth: { value: settings.fogDepth },
        uSteps: { value: detailToSteps(settings.detail) },
        uBrightness: { value: settings.brightness },
        uOpacity: { value: settings.opacity },
        uGrain: { value: settings.grain ? 1.0 : 0.0 },
        uGrainIntensity: { value: settings.grainIntensity },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uParallax: { value: settings.parallaxStrength },
        uEnableMouse: { value: settings.mouseInteraction },
        uHorizonColor: { value: new Float32Array(hexToRgb(settings.horizonColor)) },
        uWaveColor: { value: new Float32Array(hexToRgb(settings.waveColor)) },
        uCrestColor: { value: new Float32Array(hexToRgb(settings.crestColor)) }
      }
    });
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program.program) || 'Gradient Waves shader failed to link');
    }
    const mesh = new Mesh(gl, { geometry, program });
    const currentMouse = [0.5, 0.5];
    const targetMouse = [0.5, 0.5];
    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const setSize = () => {
      const rect = hero.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };
    const onPointerMove = event => {
      const rect = hero.getBoundingClientRect();
      targetMouse[0] = (event.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (event.clientY - rect.top) / rect.height;
    };
    const onPointerLeave = () => {
      targetMouse[0] = 0.5;
      targetMouse[1] = 0.5;
    };
    const loop = time => {
      try {
        program.uniforms.iTime.value = (time - t0) * 0.001;
        const tx = settings.mouseInteraction ? targetMouse[0] : 0.5;
        const ty = settings.mouseInteraction ? targetMouse[1] : 0.5;
        currentMouse[0] += 0.05 * (tx - currentMouse[0]);
        currentMouse[1] += 0.05 * (ty - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      } catch (error) {
        console.warn('Gradient Waves rendering stopped; showing the static background.', error);
        stop();
      }
    };
    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
    };
    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };

    setSize();
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(setSize) : null;
    resizeObserver?.observe(hero);
    if (!resizeObserver) window.addEventListener('resize', setSize);
    const intersectionObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? tryStart() : tryStop();
      }, { threshold: 0 })
      : null;
    intersectionObserver?.observe(hero);
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    hero.classList.remove('hero--fallback');
    hero.classList.add('hero--waves-ready');
    tryStart();

    function dispose() {
      tryStop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', setSize);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      hero.classList.remove('hero--waves-ready');
    }
    return { stop: dispose };
  }

  function stop() {
    generation++;
    session?.stop();
    session = null;
    hero.classList.remove('hero--waves-ready');
    hero.classList.add('hero--fallback');
  }

  async function start() {
    if (motionPreference.matches) {
      hero.classList.remove('hero--waves-ready');
      hero.classList.add('hero--fallback');
      return;
    }
    if (session) return;
    hero.classList.remove('hero--fallback');
    const request = ++generation;
    try {
      // Dynamic import from a classic local script keeps double-click file:// use working.
      const ogl = await import(OGL_URL);
      if (request !== generation || motionPreference.matches) return;
      session = createSession(ogl);
    } catch (error) {
      if (request !== generation) return;
      hero.classList.remove('hero--waves-ready');
      hero.classList.add('hero--fallback');
      console.warn('Gradient Waves unavailable; showing the static background.', error);
    }
  }

  const onMotionChange = () => motionPreference.matches ? stop() : start();
  if (motionPreference.addEventListener) motionPreference.addEventListener('change', onMotionChange);
  else motionPreference.addListener(onMotionChange);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stop(); });
  canvas.addEventListener('webglcontextrestored', start);
  start();
})();

