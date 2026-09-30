import {notFound} from 'next/navigation';import {isLocale} from '@/lib/contracts';import {PoolScreen} from '@/components/pool-screen';
export default async function Page({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;if(!isLocale(locale))notFound();return <PoolScreen id={id}/>;}
