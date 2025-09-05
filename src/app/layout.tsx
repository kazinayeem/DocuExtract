import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuExtract - Cash Memo Data Extraction",
  description:
    "Extract cash memo data from images and export to PDF, Excel, Word, or JSON formats.",
  authors: [
    { name: "Mohammad Ali Nayeem", url: "https://github.com/kazinayeem" },
  ],
  keywords: [
    "Cash Memo",
    "OCR",
    "PDF Export",
    "Excel Export",
    "Next.js",
    "React",
  ],
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Main content */}
        <main className="flex-grow">{children}</main>
        <Analytics />

        {/* Footer */}
        <footer className="bg-gray-100 text-gray-700 text-center py-4 mt-4">
          <p>© {new Date().getFullYear()} Mohammad Ali Nayeem</p>
          <p>
            GitHub:{" "}
            <a
              href="https://github.com/kazinayeem"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              kazinayeem
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
