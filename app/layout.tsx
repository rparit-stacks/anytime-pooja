import type React from "react"
import type { Metadata } from "next"
import { Roboto_Slab } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import "./globals.css"
import { AstrologyBackground } from "@/components/astrology-background"
import { BackgroundDiagonalMarquee } from "@/components/background-diagonal-marquee"
import { PageTransition } from "@/components/page-transition"

const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-roboto-slab" })

export const metadata: Metadata = {
  title: "Anytime Pooja",
  description: "Book pooja services and essentials anytime",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${robotoSlab.variable} ${GeistMono.variable} font-serif relative`} suppressHydrationWarning={true}>
        <AstrologyBackground />
        <BackgroundDiagonalMarquee />
        <div className="relative z-10">
          <CartProvider>
            <PageTransition>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </PageTransition>
          </CartProvider>
          <Analytics />
        </div>
      </body>
    </html>
  )
}
