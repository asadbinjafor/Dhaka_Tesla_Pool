import {notFound} from 'next/navigation';import {isLocale} from '@/lib/contracts';import {GuideScreen} from '@/components/guide-screen';
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <GuideScreen/>;}
