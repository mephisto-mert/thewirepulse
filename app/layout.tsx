import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Wire Pulse — Independent Global Intelligence & Breaking News",
  description: "Curated real-time world intelligence, defense developments, AI breakthroughs, and market dispatches verified by international correspondents.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#090b10] text-[#f1f5f9] min-h-screen flex flex-col selection:bg-[#e63946] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
