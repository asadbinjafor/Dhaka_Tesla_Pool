'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Preferences } from './preferences';
import { useView } from './view-provider';

export function AuthScreen({ register = false }: { register?: boolean }) {
  const { dictionary: t, locale, state, setAuthDraft } = useView();
  const [showPassword, setShowPassword] = useState(false);
  const draft = state.authDraft;
  const field = (key: keyof typeof draft, value: string) => setAuthDraft({ ...draft, [key]: value });
  return <main id="main-content" tabIndex={-1} className="auth-layout min-h-dvh outline-none">
    <section className="auth-visual relative flex flex-col overflow-hidden text-[#eff6f4]">
      <Link href={`/${locale}/sign-in`} className="relative z-10 flex w-fit items-center gap-3" aria-label={t.brand}>
        <span className="brand-mark" aria-hidden="true">↝</span>
        <span className="font-bold leading-tight">{t.brand}<small className="mt-2 block text-xs font-normal tracking-[.14em] text-[#a5b6b6]">{t.brandTagline}</small></span>
      </Link>
      <div className="story-copy relative z-10">
        <p className="eyebrow text-[#b2d3aa]">{t.storyEyebrow}</p>
        <h1 className="mt-5 text-[clamp(1.9rem,3.3vw,3.25rem)] font-bold tracking-[-.04em]">
          {t.storyTitle}<br/><span className="text-[#aff369]">{t.storyAccent}</span>
        </h1>
        <p className="story-description mt-5 max-w-80 text-sm leading-relaxed text-[#b8cac2]">{t.storyDescription}</p>
      </div>
      <div className="bullet-art"><Image src="/images/bullet-hero.webp" alt={t.bulletAlt} fill sizes="(max-width: 767px) 60vw, 53vw" priority unoptimized className="object-cover"/></div>
      <div className="story-footer relative z-10 mt-auto">
        <div className="flex flex-wrap gap-2">{[t.threeSeats, t.compatibleZones, t.individualFares].map(text => <span key={text} className="rounded-md border border-[#35503a] bg-[#182d20] px-3 py-2 text-xs text-[#c4d7c5]">{text}</span>)}</div>
        <p className="mt-5 text-xs leading-relaxed text-[#a5b6b6]">{t.unaffiliated}</p>
      </div>
    </section>
    <section className="auth-content relative flex flex-col">
      <div className="preferences-position"><Preferences/></div>
      <div className="auth-form mx-auto w-full max-w-96">
        <p className="eyebrow">{register ? t.signupEyebrow : t.welcomeEyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">{register ? t.signupTitle : t.welcome}</h2>
        <p className="mt-3 mb-7 text-sm leading-relaxed text-muted">{register ? t.signupDescription : t.signinDescription}</p>
        <form noValidate onSubmit={event => event.preventDefault()} className="space-y-5">
          {register && <div><label htmlFor="name" className="field-label">{t.name}</label><input id="name" autoComplete="name" maxLength={100} placeholder={t.namePlaceholder} value={draft.name} onChange={e => field('name', e.target.value)}/></div>}
          <div><label htmlFor="email" className="field-label">{t.email}</label><input id="email" type="email" autoComplete="email" maxLength={254} placeholder={t.emailPlaceholder} value={draft.email} onChange={e => field('email', e.target.value)}/></div>
          <div><label htmlFor="password" className="field-label">{t.password}</label><div className="relative">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} maxLength={128} placeholder={t.passwordPlaceholder} className="pr-14" value={draft.password} onChange={e => field('password', e.target.value)}/>
            <button className="absolute inset-y-0 right-1 min-w-11 rounded-md text-muted" type="button" aria-label={showPassword ? t.hidePassword : t.showPassword} aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}><span aria-hidden="true">◉</span></button>
          </div></div>
          {register && <div><label htmlFor="confirm" className="field-label">{t.confirmPassword}</label><input id="confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" maxLength={128} placeholder={t.confirmPlaceholder} value={draft.confirm} onChange={e => field('confirm', e.target.value)}/></div>}
          <button type="submit" disabled aria-describedby="auth-service-state" className="primary-action w-full">{register ? t.createAccount : t.signIn} <span aria-hidden="true">→</span></button>
        </form>
        <p id="auth-service-state" role="status" className="mt-5 rounded-xl border border-line bg-panel p-4 text-sm leading-relaxed text-muted">{t.serviceUnavailable}</p>
        <p className="mt-6 text-center text-sm leading-relaxed text-muted">{register ? t.alreadyMember : t.newHere}{' '}<Link className="font-semibold text-accent underline-offset-4 hover:underline" href={`/${locale}/${register ? 'sign-in' : 'sign-up'}`}>{register ? t.signIn : t.createAccount}</Link></p>
        <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-muted">{t.accountPrivacy}</p>
      </div>
    </section>
  </main>;
}
