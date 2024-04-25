import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "llm-ui nextjs examples",
  description: "llm-ui nextjs examples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
