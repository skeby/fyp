import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/misc/providers";
import Header from "@/components/ui/header";
import "./globals.css";
import { defaultMetadata } from "@/static";

export const metadata: Metadata = {
  ...defaultMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`bg-background antialiased`}>
        <Analytics />
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
