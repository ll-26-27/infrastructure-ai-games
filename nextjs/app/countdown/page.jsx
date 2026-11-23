import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Countdown from "./Countdown.jsx";
import "./countdown.css";

export const metadata = { title: "Your game" };

// The page the black cards point to. Until the target time it shows a countdown; the game itself comes later.
const target = "2026-11-30T12:45:00-05:00";

export default function CountdownPage() {
  return (
    <>
      <SiteHeader current="countdown" />
      <main id="main" className="cd">
        <p className="cd-eyebrow">SOC-STD 98to</p>
        <h1>Your game is being built.</h1>
        <Countdown target={target} />
        <p className="cd-note">You designed the pieces. Several versions of the game are being built from them. Come back when the clock runs out and play.</p>
      </main>
      <SiteFooter />
    </>
  );
}
