import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloud Calculator | Next.js + Python Microservices",
  description: "High-performance full-stack calculator with Next.js frontend and Python FastAPI calculation backend in Docker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        {children}
      </body>
    </html>
  );
}
