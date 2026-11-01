import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Privacy Policy – BlueberryCash',
  description: 'What BlueberryCash collects, why, who it is shared with, and the choices you have.',
};

const sections = [
  {
    heading: 'Who we are',
    paragraphs: [
      'BlueberryCash ("we", "us") runs the rewards website at blueberrycash.com. You earn coins by completing offers from advertisers and cash them out. This policy explains what personal information we handle when you use the site.',
    ],
  },
  {
    heading: 'What we collect',
    items: [
      'Account details: your email address, username and password. If you sign in with Google we receive your email address, name and profile picture from Google. We never see your Google password.',
      'Activity: offers you start or complete, coins earned, spins, referrals, withdrawals and their status.',
      'Payout details you give us when you cash out, such as a PayPal email or a crypto wallet address.',
      'Technical data: your IP address, approximate country, browser and device information, and a device identifier we use to stop multiple accounts and fraud.',
      'Messages you send to support.',
    ],
  },
  {
    heading: 'How we use it',
    items: [
      'To run your account, show the offers available for your country and device, and credit the coins you earn.',
      'To process and review withdrawals.',
      'To prevent fraud and abuse, including multiple accounts, VPNs and proxies, and fake completions.',
      'To answer support requests and keep the site secure and working.',
      'To meet legal obligations.',
    ],
  },
  {
    heading: 'Who we share it with',
    paragraphs: [
      'We do not sell your personal information. We share it only as needed to run the service:',
    ],
    items: [
      'Offer networks and advertisers (currently AdBluMedia and OGAds): when you open an offer they receive your IP address, browser information and your member ID, so they can show offers that work for your location and tell us when you finish one. They handle that data under their own policies, and the advertiser behind an offer may ask for more details on its own page.',
      'Service providers: Supabase (database and sign-in), Vercel (hosting), Google (Sign in with Google) and ip-api.com (checks whether an IP address belongs to a VPN, proxy or data center).',
      'Payment providers, to send your payout.',
      'Authorities or other parties when the law requires it, or to protect the site and its users from fraud.',
    ],
  },
  {
    heading: 'Cookies and browser storage',
    paragraphs: [
      'We use cookies and browser storage to keep you signed in and to remember settings such as sound effects. When you open an offer, the offer network or advertiser may set its own cookies on its pages; we do not control those.',
    ],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'We keep account and payout records for as long as your account is open and for a reasonable time afterwards, so we can handle disputes, chargebacks and legal requirements. Fraud-prevention records may be kept longer.',
    ],
  },
  {
    heading: 'Security',
    paragraphs: [
      'Passwords are handled by our sign-in provider and are not stored in plain text, and the site is served over HTTPS. No system is completely secure, so please use a strong, unique password.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can ask us to give you a copy of your data, correct it, or delete your account by contacting support. We may keep what we must keep for legal or fraud-prevention reasons. You can also sign out and clear cookies and site data in your browser at any time.',
    ],
  },
  {
    heading: 'Who can use BlueberryCash',
    paragraphs: [
      'BlueberryCash is for people aged 18 or over. We do not knowingly collect information from anyone younger. If you believe a child has created an account, contact support and we will remove it.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. The date at the top shows when it last changed. If a change is significant we will say so on the site.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 November 2026"
      intro="This policy explains what BlueberryCash collects about you, why, who sees it, and the choices you have. By using the site you agree to it."
      sections={sections}
    />
  );
}
