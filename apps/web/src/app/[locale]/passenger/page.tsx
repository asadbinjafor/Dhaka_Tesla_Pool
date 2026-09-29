import {notFound} from 'next/navigation';import {isLocale} from '@dtp/contracts';import {OverviewScreen} from '@/components/overview-screen';
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <OverviewScreen/>;}
