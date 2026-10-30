import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { PlanningStoreProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SEM / LSA Planning MVP",
  description: "Productized LSA planning and onboarding workflow"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <PlanningStoreProvider>{children}</PlanningStoreProvider>
      </body>
    </html>
  );
}
