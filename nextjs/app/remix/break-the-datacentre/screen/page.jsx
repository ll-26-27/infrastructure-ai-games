import Screen from "./Screen.jsx";
import "../btd.css";

export const metadata = {
  title: "Break the data centre · class screen",
  description: "The class screen for Break the data centre, combined: put it on the projector while the laptop goes around the table.",
};

export default function ScreenPage() {
  return (
    <main id="main" className="btd-shell btd-screen">
      <Screen />
    </main>
  );
}
