import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "PayOTP - OTP, Premium Accounts, Game Top-up",
  description: "ถูกที่สุด ส่งทันที 24 ชม. | Cheapest & Instant Delivery 24/7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="min-h-screen">
        <AppProvider>
          <Navbar />
          <main className="min-h-[80vh]">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
