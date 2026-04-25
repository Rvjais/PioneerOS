import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/client/providers/Providers";
import { ErrorBoundary } from "@/client/components/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PioneerOS | Branding Pioneers",
  description: "Unified Workspace for Employee & Client Lifecycle Management",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PioneerOS",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "PioneerOS | Branding Pioneers",
    description: "Unified Workspace for Employee & Client Lifecycle Management",
    type: "website",
    siteName: "PioneerOS",
  },
  twitter: {
    card: "summary",
    title: "PioneerOS | Branding Pioneers",
    description: "Unified Workspace for Employee & Client Lifecycle Management",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900`}>
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
