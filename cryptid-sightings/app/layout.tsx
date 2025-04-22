import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/client-layout";
import Sidebar from "@/components/sidebar";
import AuthProvider from "@/components/auth-provider"; // We'll create this component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Real Things Sightings",
  description: "Track and report cryptid sightings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
