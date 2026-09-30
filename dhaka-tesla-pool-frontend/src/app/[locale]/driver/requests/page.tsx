import {notFound} from 'next/navigation';import {isLocale} from '@/lib/contracts';import {DriverRequestsScreen} from '@/components/driver-requests-screen';
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <DriverRequestsScreen/>;}
