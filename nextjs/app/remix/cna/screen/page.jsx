import Screen from "./Screen.jsx";
import "../remix-cna.css";

export const metadata = { title: "CNA game, combined: class screen" };

// The class screen, for the projector. It follows the game running on the presidents' laptop in the same browser,
// and shows only what everyone may see: the map and the AI, the ranking, the bars and bags, the votes and each
// year's front page.
export default function ClassScreen() {
  return (
    <main id="main" className="cx-shell cx-screen">
      <Screen />
    </main>
  );
}
