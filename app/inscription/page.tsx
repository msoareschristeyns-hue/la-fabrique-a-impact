'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function InscriptionPage() {
  const router = useRouter();
  const [form,setForm]=useState({firstName:'',lastName:'',company:'',email:'',password:''});
  const [error,setError]=useState(''); const [loading,setLoading]=useState(false); const [message,setMessage]=useState('');
  const field=(key:string)=>(e:any)=>setForm({...form,[key]:e.target.value});

  async function submit(e:FormEvent){
    e.preventDefault(); setLoading(true); setError(''); setMessage('');
    const redirectTo = `${window.location.origin}/connexion/`;
    const { data, error: signError } = await supabase.auth.signUp({
      email:form.email,
      password:form.password,
      options:{
        emailRedirectTo:redirectTo,
        data:{first_name:form.firstName,last_name:form.lastName,company_name:form.company}
      }
    });
    setLoading(false);
    if(signError || !data.user){ setError(signError?.message || "Impossible de créer le compte."); return; }
    if(!data.session){ setMessage('Compte créé. Consultez le nouvel email reçu pour confirmer votre adresse, puis connectez-vous.'); return; }
    router.push('/diagnostic/');
  }

  return <main className="auth-page"><section className="auth-card auth-card-wide">
    <Link href="/" className="auth-brand">La Fabrique à Impact</Link><p className="eyebrow">Commencer simplement</p><h1>Créer mon espace entreprise</h1>
    <p>Quelques informations suffisent. Vous pourrez ensuite lancer votre premier diagnostic RSE.</p>
    <form onSubmit={submit} className="auth-form">
      <div className="auth-grid"><label>Prénom<input required value={form.firstName} onChange={field('firstName')} /></label><label>Nom<input required value={form.lastName} onChange={field('lastName')} /></label></div>
      <label>Entreprise<input required value={form.company} onChange={field('company')} /></label>
      <label>Email professionnel<input type="email" required value={form.email} onChange={field('email')} autoComplete="email" /></label>
      <label>Mot de passe<input type="password" minLength={8} required value={form.password} onChange={field('password')} autoComplete="new-password" /></label>
      {error && <p className="auth-error">{error}</p>}{message && <p className="auth-success">{message}</p>}
      <button className="btn primary" disabled={loading}>{loading?'Création…':'Créer mon espace'}</button>
    </form>
    <p className="auth-switch">Déjà un compte ? <Link href="/connexion/">Se connecter</Link></p>
  </section></main>;
}
