"use client";

import { Host, coverCamera, dotMaterial, seeded, useScene } from "./useScene.js";

// A network of a few hundred nodes, each tied to its nearest neighbours. Every few seconds one node fails: it flares
// red, and the failure spreads hop by hop to some of its neighbours before the network cools back to blue.
function setup({ THREE, scene, renderer }) {
  const rand = seeded(23);
  const N = 220;
  const home = [];
  for (let i = 0; i < N; i++) home.push([(rand() * 2 - 1) * 1.9, (rand() * 2 - 1) * 1.08, rand() * 6.28]);

  // Edges: each node to its three nearest neighbours, without duplicates.
  const edges = [];
  const seen = new Set();
  const neighbours = Array.from({ length: N }, () => []);
  for (let i = 0; i < N; i++) {
    const near = home.map((p, j) => [j, (p[0] - home[i][0]) ** 2 + (p[1] - home[i][1]) ** 2]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 3);
    for (const [j] of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([i, j]);
      neighbours[i].push(j);
      neighbours[j].push(i);
    }
  }

  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const size = new Float32Array(N);
  const dots = new THREE.BufferGeometry();
  dots.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dots.setAttribute("color", new THREE.BufferAttribute(col, 3));
  dots.setAttribute("size", new THREE.BufferAttribute(size, 1));
  const points = new THREE.Points(dots, dotMaterial(THREE, { scale: renderer.getPixelRatio() }));
  scene.add(points);

  const lpos = new Float32Array(edges.length * 6);
  const lcol = new Float32Array(edges.length * 6);
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(lpos, 3));
  lines.setAttribute("color", new THREE.BufferAttribute(lcol, 3));
  scene.add(new THREE.LineSegments(lines, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));

  // failAt[i]: when node i failed (or -Infinity). A failure schedules its neighbours a hop later, each with a chance.
  const failAt = new Float32Array(N).fill(-Infinity);
  const pending = [];
  let nextFailure = 1.2;
  let started = false;
  const fail = (start, t) => {
    const hop = new Map([[start, 0]]);
    const queue = [start];
    while (queue.length) {
      const i = queue.shift();
      const h = hop.get(i);
      if (h >= 6) continue;
      for (const j of neighbours[i]) if (!hop.has(j) && rand() < 0.62 - h * 0.07) { hop.set(j, h + 1); queue.push(j); }
    }
    for (const [i, h] of hop) pending.push([i, t + h * 0.32]);
  };

  const cool = [0.36, 0.55, 0.72];
  const hot = [1.0, 0.33, 0.2];
  const heatOf = (i, t) => {
    const dt = t - failAt[i];
    return dt < 0 ? 0 : Math.exp(-dt / 1.6);
  };
  const { camera, resize } = coverCamera(THREE);

  return {
    camera,
    resize,
    still: 3.2,
    update(t) {
      if (!started) {
        // Open (and the reduced-motion still) with a cascade already under way, right of centre where it shows.
        started = true;
        let origin = 0, best = Infinity;
        home.forEach(([x, y], i) => { const d = (x - 0.85) ** 2 + (y - 0.12) ** 2; if (d < best) { best = d; origin = i; } });
        fail(origin, t - 0.9);
        nextFailure = t + 3.5;
      }
      if (t < nextFailure - 8) nextFailure = t + 0.5; // after a jump back in time
      if (t >= nextFailure) { fail(Math.floor(rand() * N), t); nextFailure = t + 3.2 + rand() * 2.4; }
      for (let k = pending.length - 1; k >= 0; k--) if (pending[k][1] <= t) { failAt[pending[k][0]] = pending[k][1]; pending.splice(k, 1); }
      for (let i = 0; i < N; i++) {
        const [x, y, ph] = home[i];
        pos[i * 3] = x + Math.sin(t * 0.21 + ph) * 0.018;
        pos[i * 3 + 1] = y + Math.cos(t * 0.17 + ph * 1.3) * 0.018;
        const h = heatOf(i, t);
        for (let c = 0; c < 3; c++) col[i * 3 + c] = cool[c] * (1 - h) * 0.8 + hot[c] * h;
        size[i] = 5 + h * 14;
      }
      edges.forEach(([a, b], e) => {
        const ha = heatOf(a, t), hb = heatOf(b, t);
        for (let c = 0; c < 3; c++) {
          lpos[e * 6 + c] = pos[a * 3 + c];
          lpos[e * 6 + 3 + c] = pos[b * 3 + c];
          lcol[e * 6 + c] = (cool[c] * (1 - ha) * 0.34 + hot[c] * ha);
          lcol[e * 6 + 3 + c] = (cool[c] * (1 - hb) * 0.34 + hot[c] * hb);
        }
      });
      dots.attributes.position.needsUpdate = true;
      dots.attributes.color.needsUpdate = true;
      dots.attributes.size.needsUpdate = true;
      lines.attributes.position.needsUpdate = true;
      lines.attributes.color.needsUpdate = true;
    },
  };
}

// poster: the still shown when WebGL isn't available; pass poster={null} for the gradient alone.
export default function FailingNetwork({ className, style, poster = "/visuals/live-failing-network.webp" }) {
  const ref = useScene(setup, poster);
  return <Host hostRef={ref} className={className} style={style} tint="#090c10" />;
}
