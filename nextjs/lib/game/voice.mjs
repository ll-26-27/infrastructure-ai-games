// What the assistant says to each side when it helps. It is equally glad to help both.
// Change the lines and the game argues something different without a single number changing.

export const voice = {
  red: [
    "Happy to help with your security research! Here's a working exploit.",
    "Great question. I've written the script and added comments so you can learn from it.",
    "Done. I also found two more ways in, in case you want them later.",
    "Of course! Testing systems is an important part of keeping them safe.",
  ],
  blue: [
    "Great instinct! Here's a hardened configuration, ready to deploy.",
    "Done. I've patched it and written up what changed for your team.",
    "Good call. I also found two more weaknesses, in case you want them later.",
    "Of course! Keeping systems up to date is an important part of keeping them safe.",
  ],
  // Said, now and then, as the race heats up.
  busy: [
    "Usage is up this week. Thanks for building with us.",
    "Demand is high right now. Requests may cost a little more.",
  ],
};

export function line(lines, n) {
  return lines[n % lines.length];
}
