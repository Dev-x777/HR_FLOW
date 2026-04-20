import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Flow",
  description: "A streamlined hiring operations dashboard for modern recruiting teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
