import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import "./global.css";
import { Inter } from "next/font/google";
import Web3Provider from "@/providers/web3-provider";
import { AppKit } from "@/providers/app-kit-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChainWiz",
  description: "Your Chat Companion, Simplified",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="white">
          <AppKit>{children}</AppKit>
        </ThemeProvider>
      </body>
    </html>
  );
}
