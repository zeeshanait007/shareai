import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShareAI - Intelligent Market Analysis",
  description: "Advanced stock market analysis and AI-driven insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
}
