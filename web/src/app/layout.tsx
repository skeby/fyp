// import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/ui/header"

// export const metadata: Metadata = {
//   title: "AdaptLearn",
//   description: "Adaptive Learning Using Item Response Theory",
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  )
}
