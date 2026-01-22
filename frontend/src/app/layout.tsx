import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/presentation/components/shared";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Jira - Gestion de tâches",
  description: "Application de gestion de projet avec tableau Kanban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
