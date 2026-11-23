import { sectionVisuals } from "../../../lib/visuals.mjs";
import LiveBackground from "./LiveBackground.jsx";
import "./section-top.css";

// Wraps the top of a section's page (its breadcrumbs and heading) in a full-width band with the section's picture
// behind it and a dark scrim so the text stays readable. The text stays exactly where it was. Without a picture for
// `section`, it renders its children as they are. `pull` is the page shell's top padding, so the band starts right
// under the site header.
export default function SectionTop({ section, pull = "40px", children }) {
  const visual = section ? sectionVisuals[section] : null;
  if (!visual) return children;
  return (
    <div className="section-top" style={{ "--pull": pull }}>
      <div className="section-top-media" aria-hidden="true">
        {visual.image && <img src={visual.image} alt="" decoding="async" fetchPriority="high" style={{ objectPosition: visual.focus || "center" }} />}
        {visual.live && <LiveBackground name={visual.live} />}
      </div>
      <div className="section-top-scrim" aria-hidden="true" />
      {children}
    </div>
  );
}
