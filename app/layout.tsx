import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeShare - Share Your Favorite Recipes",
  description: "Discover amazing recipes from home cooks around the world. Upload your own creations and inspire others with your culinary skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* Tailwind test badge: remove after verifying styles */}
          <div className="fixed bottom-3 right-3 z-50 rounded-md bg-orange-600 px-2 py-1 text-xs font-medium text-white shadow-md">
            Tailwind active
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
