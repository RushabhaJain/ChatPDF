import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'simplebar-react/dist/simplebar.min.css';
import { cn, constructMetadata } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import PlausibleProvider from 'next-plausible'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="chat-pdf-jm1h.vercel.app" enabled={true} trackLocalhost={true} />
      </head>
      <Providers>
        <body className={cn("bg-zinc-50", inter.className)}>
          <Toaster />
          <Navbar user={user} />
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </body>
      </Providers>
    </html>
  );
}
