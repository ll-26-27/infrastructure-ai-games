"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Runs a small three.js scene behind a section. `setup({ THREE, scene, renderer, reduced })` returns
// { camera, update(t, dt), resize(w, h), still, dispose() }. Light on the GPU by design:
// - pixel ratio capped at 1.5, about 30 frames a second, no antialiasing, a low-power context;
// - stops drawing when the section is off screen or the tab is hidden;
// - with prefers-reduced-motion, draws one still frame (at `still` seconds) and never animates.
// If WebGL isn't available (no GPU, a locked-down classroom machine, headless checks), nothing is thrown or logged:
// the host shows `poster` (a still of the background) over a dark gradient instead.
export function useScene(setup, poster) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fallback = () => {
      host.style.backgroundImage = `${poster ? `url(${poster}), ` : ""}radial-gradient(ellipse at 70% 40%, #17302c 0%, #0b0d0c 70%)`;
      host.style.backgroundSize = "cover";
      host.style.backgroundPosition = "center";
      return undefined;
    };

    // Probe for a context first: three.js logs an error before it throws when it can't get one, so never ask it to
    // unless the browser has already given us a context to hand it.
    const canvas = document.createElement("canvas");
    const options = { alpha: true, antialias: false, depth: true, powerPreference: "low-power" };
    let context = null;
    try { context = canvas.getContext("webgl2", options); } catch { context = null; }
    if (!context) return fallback();

    let renderer;
    let scene;
    let s;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, context, antialias: false, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      scene = new THREE.Scene();
      s = setup({ THREE, scene, renderer, reduced: motion.matches });
    } catch {
      renderer?.dispose?.();
      return fallback();
    }
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    host.appendChild(canvas);
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stop(); canvas.style.display = "none"; fallback(); });
    let t = s.still ?? 8;
    let raf = 0;
    let running = false;
    let visible = true;
    let lastFrame = 0;
    let lastDraw = 0;

    const draw = () => renderer.render(scene, s.camera);
    const still = () => { s.update(s.still ?? 8, 0); draw(); };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - lastDraw < 32) return; // about 30 fps
      const dt = Math.min(0.1, (now - lastFrame) / 1000);
      lastFrame = now;
      lastDraw = now;
      t += dt;
      s.update(t, dt);
      draw();
    };
    const start = () => {
      if (running || motion.matches || !visible || document.hidden) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const resize = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      s.resize?.(w, h);
      if (!running) { if (motion.matches) still(); else { s.update(t, 0); draw(); } }
    };
    const onMotion = () => { if (motion.matches) { stop(); still(); } else start(); };
    const onVisibility = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { rootMargin: "100px" });
    io.observe(host);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      s.dispose?.();
      scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      renderer.dispose();
      canvas.remove();
    };
  }, [setup, poster]);
  return ref;
}

// The host every background renders into: fills its positioned parent, sits behind the content.
export function Host({ hostRef, className, style, tint = "#0b0d0c" }) {
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: tint, pointerEvents: "none", ...style }}
    />
  );
}

// Points with a size and colour each, drawn as soft round dots and added together (so overlaps glow).
export function dotMaterial(THREE, { attenuate = false, scale = 1 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uScale: { value: scale } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uScale;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = size * uScale${attenuate ? " * (22.0 / -mv.z)" : ""};
      }`,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.32, d) * 0.35 + smoothstep(0.32, 0.08, d);
        gl_FragColor = vec4(vColor * a, 1.0);
      }`,
  });
}

// A seeded random number generator, so a background looks the same on every load.
export function seeded(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// An orthographic camera that covers a 16:9 world ([-1.78, 1.78] x [-1, 1]) at any aspect ratio, cropping the overflow.
export function coverCamera(THREE) {
  const camera = new THREE.OrthographicCamera(-1.78, 1.78, 1, -1, -10, 10);
  camera.position.z = 5;
  const resize = (w, h) => {
    const a = w / h;
    let hw = 1.78, hh = 1.78 / a;
    if (a < 1.78) { hh = 1; hw = a; }
    camera.left = -hw; camera.right = hw; camera.top = hh; camera.bottom = -hh;
    camera.updateProjectionMatrix();
  };
  return { camera, resize };
}
