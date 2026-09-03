'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError('Email ou mot de passe incorrect.'); return; }
    router.push('/dashboard/');
  }

  return <main className="auth-page"><section className="auth-card">
    <Link href="/" className="auth-brand">La Fabrique à Impact</Link>
    <p className="eyebrow">Votre espace RSE</p><h1>Se connecter</h1>
    <p>Retrouvez vos priorités, vos actions et vos preuves.</p>
    <form onSubmit={submit} className="auth-form">
      <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" /></label>
      <label>Mot de passe<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" /></label>
      {error && <p className="auth-error">{error}</p>}
      <button className="btn primary" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
    </form>
    <p className="auth-switch">Pas encore de compte ? <Link href="/inscription/">Créer mon compte</Link></p>
  </section></main>;
}
