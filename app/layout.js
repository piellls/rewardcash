import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvatarSelectorModal from "@/components/AvatarSelectorModal";

export const metadata = {
  title: "BlueberryCash - Earn Free Coins & Cashout Payouts",
  description: "Complete simple surveys, play games, download apps, and earn coins to redeem for PayPal cash, Bitcoin, and Gift Cards.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased overflow-x-hidden max-w-[100vw]"
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-full flex flex-col bg-dark-bg text-foreground font-sans pt-[80px] pb-16 md:pb-0 overflow-x-hidden max-w-[100vw]">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col w-full md:pl-64">
            <main className="flex-1 flex flex-col w-full">
              {children}
            </main>
            <Footer />
          </div>
          <AvatarSelectorModal />
        </AuthProvider>
      </body>
    </html>
  );
}
