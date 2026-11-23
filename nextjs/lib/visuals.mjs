// The picture at the top of each section: a still image in public/visuals/, or a background drawn live in the browser
// (app/components/visuals/). `focus` is where the image is anchored when the band crops it.
// The photographic-looking images were made with an AI image model; none of them shows a real place.
export const sectionVisuals = {
  home: { live: "ParticleInfrastructure" },
  why: { image: "/visuals/c01-datacenter-night.webp", focus: "center 70%" },
  "reading-mechanics": { image: "/visuals/a07-contours.webp", focus: "right center" },
  mechanics: { image: "/visuals/a04-routes.webp", focus: "right center" },
  gallery: { image: "/visuals/a05-data-city.webp", focus: "right center" },
  stories: { image: "/visuals/c06-control-room-outage.webp", focus: "right center" },
  graphs: { image: "/visuals/a02-network-graph.webp", focus: "right center" },
  cards: { image: "/visuals/a03-particle-field.webp", focus: "right center" },
  game: { image: "/visuals/c05-server-aisle.webp", focus: "center" },
  timeline: { live: "FailingNetwork" },
  inspirations: { image: "/visuals/a01-data-flows.webp", focus: "right center" },
  challenges: { image: "/visuals/a06-cascade.webp", focus: "right center" },
  database: { image: "/visuals/a08-layers.webp", focus: "right center" },
  countdown: { image: "/visuals/c11-buildout.webp", focus: "center 60%" },
};
