import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Wire Pulse // 24/7 Global Breaking News & Intelligence",
  description: "Real-time verified global breaking dispatches, geopolitical intelligence, defense movements, AI tech breakthroughs, and market alerts.",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0a0c10] text-[#edf2f4] min-h-screen flex flex-col selection:bg-[#ef233c] selection:text-white">
        {children}
      </body>
    </html>
  );
}
