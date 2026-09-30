import type {Locale} from '@/lib/contracts';
export function displayNumber(locale:Locale,value:number){return new Intl.NumberFormat(locale==='bn'?'bn-BD':'en-BD').format(value);}
export function money(locale:Locale,poysha:number){return new Intl.NumberFormat(locale==='bn'?'bn-BD':'en-BD',{style:'currency',currency:'BDT',minimumFractionDigits:2,maximumFractionDigits:2}).format(poysha/100);}
export function dateTime(locale:Locale,value:string){return new Intl.DateTimeFormat(locale==='bn'?'bn-BD':'en-BD',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Dhaka'}).format(new Date(value));}
export function zoneLabel(locale:Locale,id:string){const labels:Record<string,[string,string]>={banani:['Banani','বনানী'],mohakhali:['Mohakhali','মহাখালী'],'gulshan-1':['Gulshan 1','গুলশান ১'],'gulshan-2':['Gulshan 2','গুলশান ২']};return labels[id]?.[locale==='bn'?1:0]??id;}
