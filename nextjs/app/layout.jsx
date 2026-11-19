import "@fontsource-variable/inter";
import "./globals.css";

export const metadata = {
  title: { default: "Infrastructure, AI, and Games", template: "%s · Infrastructure, AI, and Games" },
  description: "A workshop kit for SOC-STD 98to: a map of the course's ideas, a map of game mechanics, and a game to build where they meet. Monday, November 23, 2026.",
};

export const viewport = {
  colorScheme: "dark",
  themeColor: "#121412",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
