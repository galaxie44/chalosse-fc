import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ClubShell } from "@/components/Chrome";
import { HelpAssistant } from "@/components/HelpAssistant";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FC Chalosse",
  description: "Espace club — effectif, calendrier, statistiques et notes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${sans.className} ${sans.variable} antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <ClubShell>{children}</ClubShell>
            <HelpAssistant />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
