"use client";

import FailingNetwork from "./FailingNetwork.jsx";
import ParticleInfrastructure from "./ParticleInfrastructure.jsx";

// The live backgrounds by name, so a server component can ask for one: <LiveBackground name="FailingNetwork" />.
const BACKGROUNDS = { FailingNetwork, ParticleInfrastructure };

export default function LiveBackground({ name, ...props }) {
  const Background = BACKGROUNDS[name];
  return Background ? <Background {...props} /> : null;
}
