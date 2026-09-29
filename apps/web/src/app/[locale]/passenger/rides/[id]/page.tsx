import {notFound} from 'next/navigation';import {isLocale} from '@dtp/contracts';import {RideScreen} from '@/components/ride-screen';
export default async function Page({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;if(!isLocale(locale))notFound();return <RideScreen id={id}/>;}
