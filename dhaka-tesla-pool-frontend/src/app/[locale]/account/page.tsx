import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/contracts';
import { AccountScreen } from '@/components/account-screen';
export default async function Page({params}:{params:Promise<{locale:string}>}) {if(!isLocale((await params).locale))notFound();return <AccountScreen/>;}
