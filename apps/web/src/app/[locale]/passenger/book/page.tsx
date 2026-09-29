import {notFound} from 'next/navigation';
import {isLocale} from '@dtp/contracts';
import {BookingScreen} from '@/components/booking-screen';
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <BookingScreen/>;}
