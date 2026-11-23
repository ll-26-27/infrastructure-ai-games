import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import { sectionVisuals } from "../../lib/visuals.mjs";
import Countdown from "./Countdown.jsx";
import "./countdown.css";

export const metadata = { title: "Your game" };

// The page the black cards point to. Until the target time it shows a countdown; the game itself comes later.
const target = "2026-11-30T12:45:00-05:00";
const visual = sectionVisuals.countdown;

export default function CountdownPage() {
  return (
    <>
      <SiteHeader current="countdown" />
      <main id="main" className="cd">
        <div className="cd-media" aria-hidden="true">
          <img src={visual.image} alt="" decoding="async" fetchPriority="high" style={{ objectPosition: visual.focus }} />
        </div>
        <p className="cd-eyebrow">SOC-STD 98to</p>
        <h1>Your game is being built.</h1>
        <Countdown target={target} />
        <p className="cd-note">You made pieces of a game. Now AI is pulling them together into several versions of the game. Come back when the clock runs out and play.</p>
      </main>
      <SiteFooter />
    </>
  );
}
