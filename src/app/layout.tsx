import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConnectionStatus from "@/components/ui/ConnectionStatus";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polygo | Real-time Multilingual Chat",
  description: "Translate words, preserve meaning.",
};

import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import { auth0 } from "@/lib/auth0";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Auth0Provider user={session?.user}>
          <ConvexClientProvider>
            {/* Connection banner — shows when Convex WebSocket disconnects */}
            <ConnectionStatus />

            <ErrorBoundary>
              {children}
            </ErrorBoundary>

            {/* Toaster renders toast notifications at the bottom-right */}
            {/* Placed outside ErrorBoundary so toasts still work even when */}
            {/* the main UI has hit an error */}
            <Toaster />
          </ConvexClientProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}

