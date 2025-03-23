import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Real Things Sightings",
  description: "Track and report cryptid sightings",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}



import './globals.css'