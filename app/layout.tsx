import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import "./globals.css";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                  const src = e.target.src || e.target.href;
                  if (src && src.indexOf('/_next/static/') !== -1) {
                    console.error('Critical asset failed to load:', src);
                    // Check for infinity loop
                    const lastReload = sessionStorage.getItem('chunk_reload_loop');
                    const now = Date.now();
                    if (!lastReload || now - parseInt(lastReload) > 10000) {
                      sessionStorage.setItem('chunk_reload_loop', now.toString());
                      window.location.reload();
                    }
                  }
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
}
