import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "PayOTP - OTP, Premium Accounts, Game Top-up | ราคาถูกที่สุด ส่งทันที",
  description: "⚡ ครบจบที่เดียว! รับ OTP ทุกแอป • Netflix ChatGPT Claude ราคาถูก • เติมเกม ROV FreeFire • ปั๊มฟอล • ระบบออโต้ 24 ชม. ปลอดภัย 100%",
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
          <ToastProvider>
            <Navbar />
            <main className="min-h-[80vh]">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
