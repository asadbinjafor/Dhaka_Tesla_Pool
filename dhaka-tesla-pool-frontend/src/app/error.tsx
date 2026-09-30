'use client';
import {useView} from '@/components/view-provider';import {Preferences} from '@/components/preferences';
export default function ErrorPage({reset}:{reset:()=>void}){const {dictionary:t}=useView();return <main id="main-content" tabIndex={-1} className="mx-auto min-h-dvh max-w-3xl p-6 md:p-12"><Preferences/><section className="mt-12 rounded-2xl border border-line bg-panel p-6"><h1 className="text-2xl font-bold">{t.errorINTERNAL_ERROR}</h1><p className="mt-4 text-muted">{t.pageRecovery}</p><button className="primary-action mt-5" onClick={reset}>{t.retry}</button></section></main>;}
