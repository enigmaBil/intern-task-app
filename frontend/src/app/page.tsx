import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirection automatique vers le login
  redirect('/login');
}
