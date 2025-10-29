import type { Metadata } from "next";
import { Zilla_Slab } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import MobileNavigation from "@/components/mobile-navigation";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import ServiceWorkerRegistration from "@/components/service-worker-registration";

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla-slab",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RecipeShare - Share Your Favorite Recipes",
  description: "Discover amazing recipes from home cooks around the world. Upload your own creations and inspire others with your culinary skills.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RecipeShare',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RecipeShare" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${zillaSlab.variable} font-serif antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen pb-16 sm:pb-0">
            {children}
          </div>
          <MobileNavigation />
          <PWAInstallPrompt />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}
