import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Agent from "@/components/Agent";
import AgentProvider from "@/components/AgentProvider";
import { ChatProvider } from "@/context/ChatContext";
import RightChatPanel from "@/components/RightChatPanel";
import PageWrapper from "@/components/PageWrapper";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Max Insurance - Corporate Admin Platform",
  description:
    "Enterprise-grade SaaS Admin Platform for Corporate Benefits Management",
  manifest: "/manifest.json",
  icons: {
    icon: "/max.png",
    shortcut: "/max.png",
    apple: "/max.png",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className="font-[Arial,sans-serif] antialiased">
        <ChatProvider>
          <PageWrapper>
            {children}
            <AgentProvider />
          </PageWrapper>
          <RightChatPanel />
        </ChatProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
