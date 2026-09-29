'use client';
import { useView } from './view-provider';

export function SkipLink() {
  const { dictionary: t } = useView();
  return <a className="skip-link" href="#main-content" onClick={event => {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }}>{t.skip}</a>;
}
