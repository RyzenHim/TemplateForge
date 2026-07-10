import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "TemplateForge",
  description: "The template management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>

      <Script
        src="https://widget.connect.beta.orufy.in/widget.js"
        strategy="afterInteractive"
      />

      <Script id="orufy-init" strategy="afterInteractive">
        {`
          window.orufy_connect = window.orufy_connect || {};
          window.orufy_connect._globals = {
            appId: "0410b1ORwmG2zAvteLT7rGaa4dKToV20"
          };
        `}
      </Script>
    </html>
  );
}
