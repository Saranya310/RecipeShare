import type { Metadata } from "next";
import { Zilla_Slab } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla-slab",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
        className={`${zillaSlab.variable} font-serif antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
