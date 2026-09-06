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
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email:email.trim().toLowerCase(), password });
    if (signInError || !data.user) {
      setLoading(false);
      setError('Email ou mot de passe incorrect, ou compte non confirmé.');
      return;
    }
    let { data:membership, error:membershipError } = await supabase.from('company_members').select('company_id').eq('user_id',data.user.id).limit(1).maybeSingle();
    if (!membership && !membershipError) {
      const { error:provisionError } = await supabase.rpc('ensure_my_company_membership');
      if (!provisionError) {
        const retry = await supabase.from('company_members').select('company_id').eq('user_id',data.user.id).limit(1).maybeSingle();
        membership = retry.data;
        membershipError = retry.error;
      } else {
        membershipError = provisionError;
      }
    }
    setLoading(false);
    if (membershipError || !membership) {
      setError('Connexion réussie, mais votre espace entreprise n’a pas pu être préparé. Vérifiez que le nom de l’entreprise est bien associé à votre compte, puis réessayez.');
      return;
    }
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
