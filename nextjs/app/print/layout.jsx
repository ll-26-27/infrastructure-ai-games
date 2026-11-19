// Print pages: black ink on white, no chrome, tuned for Letter paper.
export const metadata = { title: { default: "Print · Infrastructure, AI, and Games", template: "%s · Print · Infrastructure, AI, and Games" } };

export default function PrintLayout({ children }) {
  return <div className="print-root">{children}</div>;
}
