import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BankSync - Connect Your Bank to Google Sheets",
  description: "Automatically sync your bank transactions to Google Sheets using Plaid, GoCardless, or TrueLayer",
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
