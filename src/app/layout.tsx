import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'simplebar-react/dist/simplebar.min.css';
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatPDF - the SaaS",
  description: "Chat with your PDF within minutes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <html lang="en">
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
