import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dental Assistant Agent",
  description:
    "AI-powered personal assistant tailored for modern dental practices."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
