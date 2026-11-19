"use client";
import { Children, useLayoutEffect, useRef, useState } from "react";

// Packs the printed cards into sheets. Chrome's own multicol, printed, balances the columns of each sheet and leaves
// much of the paper blank. So the cards first render in the plain two-column flow, are measured there at their printed width, and are then laid
// out in reading order: down the left column, down the right, then a new sheet. A card taller than a column (on
// Letter, cards over about 350 words) gets a sheet of its own and runs on from its left column into its right.
// A card taller than two columns would be cut off at the sheet's foot: the count names it, and pdf.mjs says so.
// The screen then shows the sheets as they print, with their count. Without JavaScript the flow stays as it was.
export default function Sheets({ children, paperLabel, className = "cards-sheet" }) {
  const cards = Children.toArray(children);
  const flow = useRef(null);
  const [columns, setColumns] = useState(null);
  useLayoutEffect(() => {
    let live = true;
    document.fonts.ready.then(() => {
      if (!live || !flow.current) return;
      const css = getComputedStyle(flow.current);
      const inches = (v) => parseFloat(css.getPropertyValue(v)) * 96;
      const H = inches("--sheet-h") - 1; // a pixel of slack for rounding
      const heights = [...flow.current.children].map((el) => el.getBoundingClientRect().height);
      const cols = [];
      let cur = { items: [], h: 0 };
      const close = () => { if (cur.items.length) cols.push(cur); cur = { items: [], h: 0 }; };
      heights.forEach((h, i) => {
        if (h > H) {
          close();
          if (cols.length % 2) cols.push({ items: [], h: 0 }); // the long card starts a sheet
          cols.push({ items: [i], h, long: true }, { items: [], h: 0, run: true });
        } else {
          if (cur.h + h > H) close();
          cur.items.push(i);
          cur.h += h;
        }
      });
      close();
      cols.H = H;
      setColumns(cols);
    });
    return () => { live = false; };
  }, [children]);

  if (!columns) {
    return <main id="main" className={className} ref={flow}>{cards}</main>;
  }
  const sheets = [];
  for (let i = 0; i < columns.length; i += 2) sheets.push([columns[i], columns[i + 1]]);
  const H = columns.H;
  const clipped = columns.filter((c) => c.long && c.h > 2 * H).length;
  return (
    <main id="main" className="cards-sheets" data-sheets={sheets.length} data-clipped={clipped}>
      <p className="cards-sheets-count">
        {sheets.length} sheet{sheets.length === 1 ? "" : "s"} of {paperLabel}
        {clipped > 0 && ` · ${clipped} card${clipped === 1 ? " is" : "s are"} longer than two columns and will be cut off: print ${clipped === 1 ? "it" : "them"} on 11 x 17`}
      </p>
      {sheets.map(([a, b], s) => (
        a.long ? (
          <section className="cards-page is-long" key={s}>{a.items.map((i) => cards[i])}</section>
        ) : (
          <section className="cards-page" key={s}>
            <div className="cards-col">{a.items.map((i) => cards[i])}</div>
            <div className="cards-col">{b?.items.map((i) => cards[i])}</div>
          </section>
        )
      ))}
    </main>
  );
}
