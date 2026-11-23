// The combined games: each keeps one group's game at its core and brings in ideas from the other two. Its tentative
// plan is the PLAN.md in app/remix/<name>/, shown at /student-games/plans/<name>. Set `ready: true` once the game
// itself is here.
export const remixes = [
  { name: "cna", href: "/remix/cna", title: "CNA game, combined", copy: "The CNA game at the core, with ideas from The Race and from Break the datacentre.", ready: false },
  { name: "bmfafm", href: "/remix/bmfafm", title: "The Race, combined", copy: "The Race at the core, with ideas from the CNA game: world tension, covert operations, political systems, wildcards and a secret treaty vote. Ideas from Break the datacentre come in once that game is here.", ready: true },
  { name: "break-the-datacentre", href: "/remix/break-the-datacentre", title: "Break the datacentre, combined", copy: "A first version: a data centre and the people trying to break it, with ideas from the CNA game and The Race. It will be rebuilt around the break-the-datacentre game when that game is here.", ready: true },
];
