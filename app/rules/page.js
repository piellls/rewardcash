import Link from 'next/link';
import { Globe, Users, RotateCcw, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Rules – BlueberryCash',
  description: 'The rules every BlueberryCash member follows: no VPN, one account, each offer once a day, and what can get an account banned.',
};

// The three rules that get accounts banned most often. They are repeated, in short, on the Earn page.
const MAIN = [
  {
    icon: Globe,
    title: 'No VPN or proxy',
    text: 'Turn off any VPN, proxy or data-center connection before you use the site. We check your connection when you open BlueberryCash, and these connections are blocked.',
  },
  {
    icon: Users,
    title: 'One account only',
    text: 'One account per person and one per device. A second account is not allowed, even with a different email address.',
  },
  {
    icon: RotateCcw,
    title: 'Each offer once a day',
    text: 'Complete the same offer no more than once in 24 hours. Do not repeat it hoping for a second reward.',
  },
];

const MORE = [
  {
    heading: 'Offers',
    items: [
      'Follow every step and use your own real details. Skipping a step, finishing too fast or giving false information usually means no coins.',
      'No bots, scripts, auto-clickers, emulators or virtual machines.',
      'Found a bug, or a way to get coins that looks wrong? Tell support. Using it to earn is not allowed.',
    ],
  },
  {
    heading: 'Your account',
    items: [
      'You must be 18 or older.',
      'Keep your sign-in details private. Do not share, sell or buy accounts.',
      'Cash out only to payout details that belong to you.',
    ],
  },
  {
    heading: 'Referrals',
    items: [
      'Do not refer yourself, or your own extra accounts.',
      'Share your link honestly: no spam, and no promises about earnings that we do not make.',
    ],
  },
  {
    heading: 'Support and the community',
    items: [
      'Be respectful to the team and to other members.',
      'One ticket per problem is enough. Include the offer name and what happened.',
    ],
  },
];

const danger = 'border border-[#f17685]/40 bg-[#f17685]/10 text-[#f17685]';

export default function RulesPage() {
  return (
    <div className="mx-auto w-full max-w-[64rem] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <p className="g-eyebrow">Rules</p>
      <h1 className="g-title mt-3 text-4xl font-extrabold sm:text-5xl">Play fair, get paid</h1>
      <p className="mt-3 text-sm text-[var(--bb-muted)]">Last updated: 1 November 2026</p>
      <p className="mt-6 max-w-[44rem] text-base leading-relaxed text-zinc-300">
        BlueberryCash pays real rewards, so we keep it fair for everyone. These rules take two minutes to read. Breaking them can get your account banned.
      </p>

      <div className={`mt-8 flex items-start gap-3 rounded-xl p-4 ${danger}`} role="note">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="text-base font-semibold">Breaking any of the three rules below can get your account banned.</p>
      </div>

      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {MAIN.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="g-card flex flex-col gap-3 p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${danger}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold text-white">{i + 1}. {title}</h2>
            <p className="text-base leading-relaxed text-zinc-300">{text}</p>
          </li>
        ))}
      </ol>

      <h2 className="g-title mt-14 text-2xl sm:text-3xl">More rules</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {MORE.map((group) => (
          <section key={group.heading} className="g-card p-5">
            <h3 className="text-lg font-bold text-white">{group.heading}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-300">
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">What happens if a rule is broken</h2>
        <p className="mt-3 max-w-[44rem] text-base leading-relaxed text-zinc-300">
          We review accounts by hand. If we find a broken rule we can remove the coins it gave you, reject withdrawals and ban the account. If you think a ban was a mistake, contact support.
        </p>
        <p className="mt-3 max-w-[44rem] text-base leading-relaxed text-zinc-300">
          An offer you opened five times without finishing it locks for 24 hours. That happens automatically and is not a ban. Try another task or come back tomorrow.
        </p>
      </section>

      <p className="mt-12 text-sm text-[var(--bb-muted)]">
        See also our{' '}
        <Link href="/terms" className="text-[var(--bb-berry-300)] underline underline-offset-4">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-[var(--bb-berry-300)] underline underline-offset-4">Privacy Policy</Link>.
      </p>
    </div>
  );
}
