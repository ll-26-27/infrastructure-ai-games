// The timeline, part by part. Three kinds of entry:
//   real    happened; date, time (US Eastern) and at least one source link. Quotations are exact.
//   course  from the SOC-STD 98to syllabus.
//   parody  invented, in the narrator's voice. Never give these a source.
// `tags` on real entries feed the parody dashboard: "breakdown" (counted on the chart), "update" (an upgrade, change
// or update was blamed), "not-cyber" (someone in charge said it was not an attack). `breakdowns` counts an entry that
// reports more than one (default 1).

const src = {
  avweb: { label: "AVweb", href: "https://avweb.com/aviation-news/faa-expands-ai-assisted-traffic-management/" },
  aviationpros: { label: "AviationPros", href: "https://www.aviationpros.com/airport-business/airport-infrastructure-operations/news/55407458/faa-begins-rollout-of-ai-air-traffic-tool-to-reduce-delays" },
  bleepingStart: { label: "BleepingComputer", href: "https://bleepingcomputer.com/news/microsoft/massive-microsoft-365-outage-disrupts-outlook-teams-copilot-worldwide" },
  bleepingCause: { label: "BleepingComputer", href: "https://bleepingcomputer.com/news/microsoft/microsoft-says-months-old-bug-caused-global-microsoft-365-outage" },
  aljazeera: { label: "Al Jazeera", href: "https://aljazeera.com/news/2026/11/13/microsoft-hit-by-global-outages-what-happened-and-why" },
  fortune: { label: "Fortune", href: "https://fortune.com/2026/11/13/faa-ground-us-airports-european-airlines-bomb-threats/" },
  whitehouse: { label: "whitehouse.gov", href: "https://www.whitehouse.gov/releases/2026/11/icymi-after-nationwide-ground-stop-trump-administration-prioritizes-safety-calls-for-full-modernization-funding/" },
  foxweather: { label: "FOX Weather", href: "https://www.foxweather.com/weather-news/flights-canceled-delayed-us-ground-stop-november-2026" },
  cbs: { label: "CBS News", href: "https://cbsnews.com/news/faa-ground-stop-trump-admin-response" },
  faaAdvisory: { label: "FAA Command Center advisory", href: "https://www.fly.faa.gov/adv/adv_otherdis?adv_date=11142026&advn=5" },
  aerotime: { label: "AeroTime", href: "https://www.aerotime.aero/articles/faa-nationwide-ground-stop-atc-communications-november-2026" },
  flightqueue: { label: "FlightQueue", href: "https://flightqueue.com/faa-ground-stop-november-2026" },
  govexec: { label: "Government Executive", href: "https://www.govexec.com/technology/2026/11/legacy-tech-issue-led-faas-nationwide-ground-stop/417236/" },
  dailywire: { label: "Daily Wire", href: "https://www.dailywire.com/news/faa-rules-out-cyberattack-as-ground-stop-wreaks-havoc-nationwide" },
  ap: { label: "AP, via ABC7", href: "https://abc7news.com/story/apple-joins-parade-technology-hiccups-recent-days/20048749/" },
  kbtx: { label: "KBTX", href: "https://www.kbtx.com/2026/11/17/widespread-outage-hits-apple-services-including-apple-pay-icloud-reports-say/" },
  nyt: { label: "The New York Times", href: "https://www.nytimes.com/2026/11/18/arts/grand-theft-auto-vi-review.html" },
  pcgamer: { label: "PC Gamer", href: "https://www.pcgamer.com/games/grand-theft-auto/grand-theft-auto-6-review-roundup-rockstars-magnum-opus-a-great-love-story-and-a-new-bar-for-open-worlds/" },
  metacritic: { label: "Metacritic", href: "https://www.metacritic.com/game/grand-theft-auto-vi/" },
  yahoo: { label: "Washington Post, via Yahoo", href: "https://www.yahoo.com/entertainment/music/articles/grand-theft-auto-vi-cultural-100000808.html" },
  rockstar: { label: "Rockstar Newswire", href: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026" },
  engadget: { label: "Engadget", href: "https://www.engadget.com/gaming/grand-theft-auto-vi-is-delayed-to-november-19-2026-211848530.html" },
  saIntro: { label: "Situational Awareness, introduction", href: "https://situational-awareness.ai/" },
  saOne: { label: "Situational Awareness, part I", href: "https://situational-awareness.ai/from-gpt-4-to-agi/" },
};

export const parts = [
  {
    number: "I",
    title: "From Copper to Cloud: Counting the Outages",
    entries: [
      { kind: "parody", text: "You can see the future first in a seminar room in William James Hall. Over the past two months, the talk of the course has shifted from databases to infrastructure to accidents. Every week another reading is added to the syllabus. Before long, the seminar will wake up. Trust the trendline." },
      { kind: "course", date: "2026-09-21", title: "The course reads Star on infrastructure", text: "Readings: Star, \"The Ethnography of Infrastructure\"; Dourish, \"No SQL\"; Hasan; Manovich, \"Database as Symbolic Form\". Star: infrastructure \"becomes visible upon breakdown\"." },
      { kind: "real", date: "2026-09-21", title: "The FAA switches on an AI air-traffic advisor", text: "SMART (Strategic Management of Airspace, Routes and Trajectories), an AI tool that recommends routes and arrival order, goes live in limited mode over the Washington, D.C. region. Controllers can accept or reject its advice.", sources: [src.avweb, src.aviationpros] },
      { kind: "parody", text: "The same day. Note the date. Then stop noting it, because that is what a person who counts coincidences would do." },
      { kind: "course", date: "2026-09-28", title: "Workshop 1 at the Bok Center", text: "\"Database as Medium/Method/Artefact\". The class turns the course into a database, on index cards." },
      { kind: "real", date: "2026-11-10", title: "SMART goes nationwide", text: "An FAA statement says the AI advisory tool now covers all 22 of the country's en-route air traffic control centers.", sources: [src.avweb] },
      { kind: "real", date: "2026-11-12", time: "about 11:20 a.m.", title: "Microsoft 365 goes down around the world", tags: ["breakdown", "update", "not-cyber"], text: "Outlook, Teams, Copilot and SharePoint fail. Downdetector logs reports from 74 countries and territories within about an hour. Microsoft says the incident was \"introduced by an issue during an earlier network capacity upgrade\" and is \"not related to cyber or AI / agents\".", sources: [src.bleepingStart, src.aljazeera] },
      { kind: "real", date: "2026-11-13", time: "11:10 a.m.", title: "Microsoft declares full restoration", text: "About 24 hours after the outage began. Its preliminary report later blames \"a previously undetected software bug, increased traffic after a Microsoft Teams failover, and reduced server capacity\". Microsoft says it has no sign the FAA ground stop that afternoon is linked to its outage.", sources: [src.bleepingCause, src.fortune] },
    ],
  },
  {
    number: "II",
    title: "The Ground Stop",
    entries: [
      { kind: "real", date: "2026-11-13", time: "3:36 p.m.", title: "The FAA loses radar and communications", tags: ["breakdown", "update"], text: "Transportation Secretary Sean Duffy: \"At 3:36 p.m., we experienced instability for our radar and our communications in our centers and our TRACONs.\" The FAA stops all departures nationwide. About 3,500 planes already in the air keep flying to their destinations. Duffy later says a contractor was replacing copper wiring with fiber at a remote FAA site.", sources: [src.whitehouse, src.cbs, src.foxweather] },
      { kind: "real", date: "2026-11-13", time: "about 8:16 p.m.", title: "The ground stop is lifted", text: "The FAA Command Center cancels the nationwide ground stop after more than four hours. It is the third nationwide ground stop of its kind, after September 11, 2001 and January 11, 2023. FlightAware counts more than 9,100 cancellations that day.", sources: [src.faaAdvisory, src.aerotime, src.flightqueue, src.foxweather] },
      { kind: "real", date: "2026-11-13", time: "evening", title: "The briefing at the White House", tags: ["not-cyber"], text: "Homeland Security Secretary Markwayne Mullin: \"We have seen zero evidence that this was a cyberattack.\" Duffy: \"This is a legacy system problem.\" And: \"We have old switches, old routers. We use 1980s little copper lines.\"", sources: [src.whitehouse, src.govexec] },
      { kind: "real", date: "2026-11-14", time: "morning", title: "The FAA Administrator rules out AI", tags: ["not-cyber"], text: "Bryan Bedford: \"zero evidence of anything nefarious, and zero evidence of anything AI-related.\" Officials say the new AI tool had nothing to do with the ground stop.", sources: [src.dailywire, src.govexec] },
      { kind: "parody", text: "Three days after an AI begins advising every air traffic center in the country, the country's planes are on the ground. Officials say the two facts are unrelated, and the evidence says they are right. A lesser analyst would stop there. That doesn't require believing in sci-fi; it just requires believing in straight lines on a graph." },
    ],
  },
  {
    number: "IIIa",
    title: "Everyone Just Wanted to Update",
    entries: [
      { kind: "course", date: "2026-11-16", title: "The course reads Perrow on normal accidents", text: "\"Danger, Accident, Harm\": Perrow, \"Complexity, Coupling, and Catastrophe\" (*Normal Accidents*); Fisch, \"Ninety Seconds\", on Tokyo's commuter trains." },
      { kind: "real", date: "2026-11-16", title: "Chase's online banking fails", tags: ["breakdown", "not-cyber"], breakdowns: 2, text: "Thousands of customers can't reach their accounts, and Zelle is affected. Chase: a software bug, \"not the result of a cyberattack\". The same afternoon a United Airlines system outage delays departures for more than 90 minutes, with \"no indication\" it was cyber-related.", sources: [src.ap] },
      { kind: "real", date: "2026-11-16", title: "\"A heart attack\"", text: "President Trump, on the ground stop: \"Essentially, what you saw on Friday was very, very old equipment that had a heart attack.\"", sources: [src.cbs] },
      { kind: "real", date: "2026-11-17", time: "morning", title: "Apple's services go down", tags: ["breakdown", "update"], text: "Apple Music, the App Store and AppleCare go fully down; iCloud and Apple Pay have problems. Apple: \"Many of our systems are back up and running after an internal update caused some outages this morning.\"", sources: [src.ap, src.kbtx] },
      { kind: "parody", text: "Look closely and nobody did anything wrong. A contractor swapped copper for fiber. Microsoft upgraded its network capacity. Apple ran an internal update. The IT people just wanted to update. Perrow called these normal accidents; the seminar read him the same day the banks went down. Count the updates. Then count them again." },
    ],
  },
  {
    number: "IIIb",
    title: "Meanwhile, in Vice City",
    entries: [
      { kind: "real", date: "2026-11-18", title: "The reviews of *Grand Theft Auto VI*", text: "*The New York Times* makes it a Critic's Pick: \"This is a game about love and relationships, their joy and heartache, and the work required to make them successful\" (Yussef Cole, as quoted by PC Gamer). It scores 99 on Metacritic. The Washington Post reports time-off requests for launch day running about 20% above normal.", sources: [src.nyt, src.pcgamer, src.metacritic, src.yahoo] },
      { kind: "real", date: "2026-11-19", title: "*GTA VI*'s release date", text: "Rockstar's announced release date, on PlayStation 5 and Xbox Series X|S.", sources: [src.rockstar, src.engadget] },
      { kind: "parody", text: "While the copper lines failed, millions of people took the day off to live inside a system of rules for a hundred hours. Nobody asked them to. They wanted to. Approval: up." },
    ],
  },
  {
    number: "IV",
    title: "The Project",
    entries: [
      { kind: "course", date: "2026-11-23", time: "12:45 p.m.", title: "Workshop 2 at the Bok Center: AI and gamification", text: "\"Technology and Society\". Readings: Winner, \"Artifice and Order\" (*Autonomous Technology*); Rabinbach, \"From Mimetic Machines to Digital Organisms\". In class: \"Workshop – AI/Gamification (We will meet at the Bok Center)\"." },
      { kind: "parody", text: "By 27/28, said the essay, the endgame will be on. By 12:45 on Monday, the seminar will be. Readings automated: none. Games designed: none. For now." },
      { kind: "open", date: "2026-11-23", time: "2:45 p.m.", title: "Your entry", text: "Write the next real entry yourself, after the workshop. What broke? What got updated? Whose work kept it running, and did anyone see it?" },
    ],
  },
];

// The essay being parodied: the lines the narrator borrows, with where they come from.
export const borrowed = [
  { line: "You can see the future first in San Francisco.", source: src.saIntro },
  { line: "That doesn't require believing in sci-fi; it just requires believing in straight lines on a graph.", source: src.saOne },
  { line: "Trust the trendline.", source: src.saOne },
  { line: "by 27/28, the endgame will be on.", source: { label: "Situational Awareness, part IV", href: "https://situational-awareness.ai/the-project/" } },
];

export const workshopDate = "2026-11-23";
