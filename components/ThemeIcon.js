const icons = {
  Earn: 'earniconlanding.png',
  'Daily Spin': 'dailywheelspins.png',
  Cashout: 'withdrawiconlanding.png',
  Leaderboard: 'exclusivetournaments.png',
  Referrals: 'affiliateicon.png',
};
export default function ThemeIcon({ name, fallback: Icon, className = '' }) {
  return icons[name] ? <img className={`theme-nav-icon ${className}`} src={`/home-reference/${icons[name]}`} width="28" height="28" alt="" /> : <Icon className={className} aria-hidden="true" />;
}
