import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/misc/providers";
import Header from "@/components/ui/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdaptLearn | Adaptive Learning for Programming Courses",
  description: "Adaptive Learning Using Item Response Theory",
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
