import type { Metadata } from "next";
import Providers from "@/components/misc/providers";
import "./globals.css";
import Header from "@/components/ui/header";

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
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
