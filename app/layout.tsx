import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "KnitLens",
  description:
    "AI-assisted knitting pattern interpreter that turns messy PDFs into structured, trackable steps.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

