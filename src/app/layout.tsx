import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/client/providers/Providers";
import { Toaster } from "sonner";

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
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          {children}
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
