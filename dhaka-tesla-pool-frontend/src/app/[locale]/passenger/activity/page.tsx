import {notFound} from 'next/navigation';import {isLocale} from '@/lib/contracts';import {StatisticsScreen} from '@/components/statistics-screen';
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <StatisticsScreen/>;}
