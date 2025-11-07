import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "929 Accountants - Expert Accounting Services in the UK",
  description: "Professional accounting, tax, and business advisory services. Specializing in bookkeeping, VAT returns, self-assessment, and company accounts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
