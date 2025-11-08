import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mental Health Logbook",
  description: "Personal mental health journaling and tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
