import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@dtp/contracts';

export default async function Entry({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}/sign-in`);
}
