import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvatarSelectorModal from "@/components/AvatarSelectorModal";
import { Rubik } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata = {
  title: "RewardCash - Free Cash, Robux, Bitcoin, Gift Cards & more!",
  description: "Earn money by completing tasks, testing apps and playing games. Cashout Gift cards, Bitcoin, Crypto, Robux and more instantly.",
  icons: {
    icon: "/offerwall/gem.jpg",
    apple: "/offerwall/gem.jpg",
  },
  openGraph: {
    images: ["/offerwall/hero.jpg"],
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
      className={`h-full antialiased overflow-x-hidden max-w-[100vw] ${rubik.className}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0c] text-foreground pt-[80px] pb-16 md:pb-0 overflow-x-hidden max-w-[100vw]">
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

