"use client";

import { useEffect, useState } from "react";

const units = [["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1]];

export default function Countdown({ target }) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const when = new Date(target).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" });
  if (now !== null && now >= end) return <p className="cd-open">It's ready.</p>;
  let left = Math.max(0, Math.floor((end - (now ?? end)) / 1000));
  return (
    <>
      <div className="cd-clock" role="timer" aria-label={`Opens ${when}`}>
        {units.map(([label, size]) => {
          const value = Math.floor(left / size);
          left -= value * size;
          return (
            <div key={label} className="cd-unit">
              <span className="cd-value">{now === null ? "--" : String(value).padStart(2, "0")}</span>
              <span className="cd-label">{label}</span>
            </div>
          );
        })}
      </div>
      <p className="cd-when">Opens {when}</p>
    </>
  );
}
