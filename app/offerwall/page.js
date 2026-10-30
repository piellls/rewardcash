import { redirect } from 'next/navigation';

// The old offerwall page showed made-up offers, members and totals. Real tasks live on /earn.
export default function OfferwallPage() {
  redirect('/earn');
}
