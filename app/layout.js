import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import AvatarSelectorModal from "@/components/AvatarSelectorModal";
import { AuthPromptProvider } from "@/components/AuthPrompt";
import { SignupSpinProvider } from "@/components/SignupSpin";

export const metadata = {
  title: "BlueberryCash – Get paid for games, apps and surveys",
  description: "Earn money by completing tasks, testing apps and playing games. Cashout Gift cards, Bitcoin, Crypto, Robux and more instantly.",
  icons: {
    icon: "/offerwall/blueberry_icon.png",
    apple: "/offerwall/blueberry_icon.png",
  },
  openGraph: {
    images: ["/offerwall/hero.jpg"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111219',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased overflow-x-hidden max-w-[100vw]"
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-dark-bg text-foreground font-sans overflow-x-hidden max-w-[100vw]">
        <div aria-hidden="true" className="g-progress" />
        <AuthProvider>
          <AuthPromptProvider>
            <SignupSpinProvider>
              <AppShell>{children}</AppShell>
              <AvatarSelectorModal />
            </SignupSpinProvider>
          </AuthPromptProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

