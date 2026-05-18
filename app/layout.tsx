import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fetch Care Companion",
  description: "A calmer way to manage vet visits, cover, and claims."
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
