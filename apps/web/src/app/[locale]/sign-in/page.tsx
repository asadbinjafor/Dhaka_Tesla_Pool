import { notFound } from 'next/navigation';
import { isLocale } from '@dtp/contracts';
import { AuthScreen } from '@/components/auth-screen';

export default async function SignIn({ params }: { params: Promise<{ locale: string }> }) {
  if (!isLocale((await params).locale)) notFound();
  return <AuthScreen/>;
}
