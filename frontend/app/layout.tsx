import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRIAGE.AI - Smart TeleHealth Triage System",
  description: "AI-powered symptom checker and triage system for Indonesian healthcare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
