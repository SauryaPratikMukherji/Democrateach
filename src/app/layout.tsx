import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DEMOCRATEACH | Indian Election AI Agent",
  description: "Your intelligent guide to the Indian election process, candidate info, and secure voting practices.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={session} />
        <main style={{ paddingTop: '4.5rem', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
