import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "RewardCash - Earn Free Coins & Cashout Payouts",
  description: "Complete simple surveys, play games, download apps, and earn coins to redeem for PayPal cash, Bitcoin, and Gift Cards.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-dark-bg text-foreground font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
