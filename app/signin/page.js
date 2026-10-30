import SignInView from './SignInView';

export const metadata = {
  title: 'Sign in – BlueberryCash',
  description: 'Sign in to your BlueberryCash account to keep earning coins.',
  robots: { index: false },
};

export default function SignInPage() {
  return <SignInView />;
}
