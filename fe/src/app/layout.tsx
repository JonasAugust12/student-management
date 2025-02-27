import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý sinh viên",
  description: "Hệ thống quản lý sinh viên",
  icons: "/favicon.png",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full min-h-screen flex">
            <SidebarTrigger />
            <div className="w-[90%] h-[90%] bg-white bg-opacity-90 rounded-2xl shadow-lg p-6 self-center mx-auto">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
