import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DAO Treasury | Decentralized Treasury Management",
  description: "Manage your DAO treasury with secure, transparent, and decentralized governance on Stellar blockchain",
  keywords: ["DAO", "Treasury", "Stellar", "Soroban", "Blockchain", "DeFi"],
  authors: [{ name: "Your DAO" }],
  openGraph: {
    title: "DAO Treasury Management",
    description: "Decentralized treasury management on Stellar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
