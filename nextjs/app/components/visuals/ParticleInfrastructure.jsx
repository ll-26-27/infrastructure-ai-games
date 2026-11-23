"use client";

import { Host, dotMaterial, seeded, useScene } from "./useScene.js";

// A slow flight over an infrastructure made of light: a grid of streets with particles travelling along them, towers
// of stacked points that flicker, everything fading into the distance. Nothing happens fast.
function setup({ THREE, scene, renderer }) {
  const rand = seeded(42);
  const SIZE = 40; // half-width of the ground, in grid cells
  const STEP = 1;
  const movers = [];
  const positions = [];
  const colors = [];
  const sizes = [];

  // Travellers along the grid lines: some along x, some along z.
  for (let i = 0; i < 2600; i++) {
    const alongX = rand() < 0.5;
    const lane = (Math.floor(rand() * SIZE * 2) - SIZE) * STEP;
    movers.push({ alongX, lane, s: (rand() * 2 - 1) * SIZE, v: (rand() < 0.5 ? -1 : 1) * (0.4 + rand() * 1.1), warm: rand() < 0.12 });
    positions.push(0, 0, 0);
    colors.push(0, 0, 0);
    sizes.push(0);
  }
  // Towers: columns of points at a few intersections.
  const towers = [];
  for (let i = 0; i < 190; i++) {
    const x = (Math.floor(rand() * SIZE * 1.1) - SIZE * 0.45) * STEP;
    const z = (Math.floor(rand() * SIZE * 1.1) - SIZE * 0.75) * STEP;
    const h = 3 + Math.floor(rand() ** 2.5 * 34);
    for (let k = 0; k < h; k++) {
      towers.push({ idx: positions.length / 3, phase: rand() * 6.28, warm: rand() < 0.1 });
      positions.push(x, 0.2 + k * 0.24, z);
      colors.push(0, 0, 0);
      sizes.push(0);
    }
  }
  const pos = new Float32Array(positions);
  const col = new Float32Array(colors);
  const size = new Float32Array(sizes);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  scene.add(new THREE.Points(geo, dotMaterial(THREE, { attenuate: true, scale: renderer.getPixelRatio() })));

  // The grid itself, very faint.
  const grid = new THREE.GridHelper(SIZE * 2 * STEP, SIZE * 2, 0x1d4a43, 0x163330);
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  scene.add(grid);
  scene.fog = new THREE.Fog(0x060908, 12, 40); // the grid fades out before its edge

  const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 120);
  const cool = [0.42, 0.78, 0.86];
  const warm = [1.0, 0.7, 0.32];
  const fade = (x, z) => {
    const d = Math.hypot(x - camera.position.x, z - camera.position.z);
    return Math.max(0, 1 - d / 40) ** 1.3;
  };

  return {
    camera,
    still: 10,
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    update(t) {
      const a = t * 0.025;
      camera.position.set(Math.sin(a) * 7, 4.2, 14 + Math.cos(a) * 4);
      camera.lookAt(Math.sin(a) * 7 + 3, 1.6, -8);
      movers.forEach((m, i) => {
        let s = m.s + m.v * t;
        s = ((s + SIZE) % (SIZE * 2) + SIZE * 2) % (SIZE * 2) - SIZE;
        const x = m.alongX ? s : m.lane;
        const z = m.alongX ? m.lane : s;
        pos[i * 3] = x; pos[i * 3 + 1] = 0.05; pos[i * 3 + 2] = z;
        const f = fade(x, z);
        const c = m.warm ? warm : cool;
        for (let q = 0; q < 3; q++) col[i * 3 + q] = c[q] * f * 0.9;
        size[i] = 5.5;
      });
      for (const tw of towers) {
        const i = tw.idx;
        const f = fade(pos[i * 3], pos[i * 3 + 2]);
        const flicker = 0.55 + 0.45 * Math.sin(t * 0.6 + tw.phase);
        const c = tw.warm ? warm : cool;
        for (let q = 0; q < 3; q++) col[i * 3 + q] = c[q] * f * flicker * 0.9;
        size[i] = 6;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.attributes.size.needsUpdate = true;
    },
  };
}

// poster: the still shown when WebGL isn't available; pass poster={null} for the gradient alone.
export default function ParticleInfrastructure({ className, style, poster = "/visuals/live-particle-infrastructure.webp" }) {
  const ref = useScene(setup, poster);
  return <Host hostRef={ref} className={className} style={style} tint="#060908" />;
}
