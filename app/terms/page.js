import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Terms of Service – BlueberryCash',
  description: 'The rules for using BlueberryCash: accounts, rewards, withdrawals, referrals and what is not allowed.',
};

const sections = [
  {
    heading: 'Using BlueberryCash',
    paragraphs: [
      'BlueberryCash is a rewards site: you complete offers from advertisers, earn coins, and cash them out. By creating an account or using the site you agree to these terms.',
    ],
  },
  {
    heading: 'Who can have an account',
    items: [
      'You must be 18 or older and able to enter into a binding agreement.',
      'One account per person, and one per household and device. Give accurate information and keep your sign-in details to yourself.',
      'Some offers and payout methods are only available in certain countries.',
    ],
  },
  {
    heading: 'Coins and rewards',
    items: [
      'Coins are credited only after the advertiser confirms that you completed the offer. Skipping a step, finishing too fast, or giving false details usually means no credit.',
      '1,000 coins = $1.00 of cashout value. The coins shown on an offer card are what you receive.',
      'Advertisers can reverse a completion, for example when a sign-up is cancelled or turns out to be invalid. If that happens, the coins from it can be removed.',
      'Offers change during the day and are not guaranteed to be available.',
      'Some offers ask for a phone number or a PIN sent by SMS, and some of those start a paid subscription. Read the terms on the offer page before you confirm. Subscriptions are between you and the advertiser.',
      'Coins have no value outside BlueberryCash and cannot be transferred or sold.',
    ],
  },
  {
    heading: 'Withdrawals',
    paragraphs: [
      'Every withdrawal is checked by hand before it is paid. We may ask you to confirm your identity or how you earned your coins. A withdrawal can be delayed or rejected, and coins can be removed, if we find or suspect fraud or a breach of these terms. Check the payout details carefully: we cannot recover a payout sent to the wrong address.',
    ],
  },
  {
    heading: 'Referrals',
    paragraphs: [
      'You can earn a commission on what friends you refer earn from offers. The rate depends on the total your friends earn each month, as shown on the Referrals page, and it can change. Referring yourself, using fake or duplicate accounts, or any other abuse of the program means no commission and may lead to a ban.',
    ],
  },
  {
    heading: 'What is not allowed',
    items: [
      'Using a VPN, proxy, virtual machine or data-center connection to complete offers.',
      'Creating more than one account, or using temporary emails.',
      'Bots, scripts, auto-clickers or any other automation.',
      'Giving false information to advertisers or to us.',
      'Trying to break, overload or get around the site or its security.',
      'Anything illegal, or anything that harms other users or our partners.',
    ],
  },
  {
    heading: 'Suspension and ending your account',
    paragraphs: [
      'If you break these terms we can warn you, remove coins, reject withdrawals, or suspend or close your account, with or without notice. You can stop using the site and ask us to close your account at any time.',
    ],
  },
  {
    heading: 'No guarantees',
    paragraphs: [
      'The site and the offers on it are provided "as is". We do not promise that the site will always be available or error-free, or that you will earn any particular amount. To the extent the law allows, we are not liable for indirect or lost earnings, or for what advertisers and other third parties do.',
    ],
  },
  {
    heading: 'Changes',
    paragraphs: [
      'We may change these terms from time to time. The date at the top shows the latest version. Using the site after a change means you accept it.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="1 November 2026"
      intro="These are the rules for using BlueberryCash. Please read them before you start earning."
      sections={sections}
    />
  );
}
