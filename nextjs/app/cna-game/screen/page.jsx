import Screen from "./Screen.jsx";
import "../cna-game.css";

export const metadata = { title: "CNA game: class screen" };

// The class screen, for the projector. It follows the game running on the presidents' laptop in the same browser,
// and shows only what everyone may see: the map, the ranking, the bars and each year's front page.
export default function ClassScreen() {
  return (
    <main id="main" className="g-shell g-screen">
      <Screen />
    </main>
  );
}
