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
    const { data, error: signError } = await supabase.auth.signUp({email:form.email,password:form.password,options:{data:{first_name:form.firstName,last_name:form.lastName}}});
    if(signError || !data.user){ setLoading(false); setError(signError?.message || "Impossible de créer le compte."); return; }
    if(!data.session){ setLoading(false); setMessage('Compte créé. Consultez votre email pour confirmer votre inscription, puis connectez-vous.'); return; }
    const { data:company,error:companyError }=await supabase.from('companies').insert({name:form.company,created_by:data.user.id}).select('id').single();
    if(companyError || !company){ setLoading(false); setError("Compte créé, mais l’entreprise n’a pas pu être initialisée. Connectez-vous puis réessayez."); return; }
    const { error:memberError }=await supabase.from('company_members').insert({company_id:company.id,user_id:data.user.id,role:'owner'});
    setLoading(false);
    if(memberError){ setError("Entreprise créée, mais votre accès propriétaire n’a pas pu être finalisé."); return; }
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
