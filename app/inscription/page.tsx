'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function InscriptionPage() {
  const router = useRouter();
  const [form,setForm]=useState({firstName:'',lastName:'',company:'',email:'',password:''});
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');
  const field=(key:string)=>(e:any)=>setForm({...form,[key]:e.target.value});

  async function ensureMembership(userId:string){
    for(let attempt=0;attempt<3;attempt++){
      const {data,error}=await supabase.from('company_members').select('company_id').eq('user_id',userId).limit(1).maybeSingle();
      if(error) throw error;
      if(data?.company_id) return true;
      const {error:rpcError}=await supabase.rpc('ensure_my_company_membership');
      if(rpcError&&attempt===2) throw rpcError;
      if(attempt<2) await new Promise(resolve=>setTimeout(resolve,500));
    }
    return false;
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(loading)return;
    setLoading(true);setError('');setMessage('');
    const cleanEmail=form.email.trim().toLowerCase();
    const cleanCompany=form.company.trim();
    if(!cleanCompany){setError('Renseignez le nom de votre entreprise.');setLoading(false);return}
    try{
      const redirectTo=`${window.location.origin}/connexion/`;
      const {data,error:signError}=await supabase.auth.signUp({
        email:cleanEmail,
        password:form.password,
        options:{emailRedirectTo:redirectTo,data:{first_name:form.firstName.trim(),last_name:form.lastName.trim(),company_name:cleanCompany}}
      });
      if(signError||!data.user)throw signError||new Error('Compte non créé.');
      if(!data.session){
        setMessage('Compte créé. Confirmez votre adresse depuis l’email reçu, puis connectez-vous pour finaliser votre espace entreprise.');
        return;
      }
      const provisioned=await ensureMembership(data.user.id);
      if(provisioned){router.push('/diagnostic/');return}
      setMessage('Votre compte est créé, mais l’espace entreprise est encore en cours de préparation. Connectez-vous dans quelques instants pour poursuivre.');
    }catch(err:any){
      const msg=String(err?.message||'');
      setError(msg.toLowerCase().includes('already')||msg.toLowerCase().includes('registered')?'Un compte existe déjà avec cette adresse. Connectez-vous pour accéder à votre espace.':'Impossible de finaliser la création de votre espace. Réessayez dans quelques instants.');
    }finally{
      setLoading(false);
    }
  }

  return <main className="auth-page"><section className="auth-card auth-card-wide">
    <Link href="/" className="auth-brand">La Fabrique à Impact</Link><p className="eyebrow">Commencer simplement</p><h1>Créer mon espace entreprise</h1>
    <p>Quelques informations suffisent. Votre compte et votre espace entreprise sont préparés avant le premier diagnostic RSE.</p>
    <form onSubmit={submit} className="auth-form">
      <div className="auth-grid"><label>Prénom<input required value={form.firstName} onChange={field('firstName')} autoComplete="given-name" /></label><label>Nom<input required value={form.lastName} onChange={field('lastName')} autoComplete="family-name" /></label></div>
      <label>Entreprise<input required value={form.company} onChange={field('company')} autoComplete="organization" /></label>
      <label>Email professionnel<input type="email" required value={form.email} onChange={field('email')} autoComplete="email" /></label>
      <label>Mot de passe<input type="password" minLength={8} required value={form.password} onChange={field('password')} autoComplete="new-password" /></label>
      {error&&<p className="auth-error">{error}</p>}{message&&<p className="auth-success">{message}</p>}
      <button className="btn primary" disabled={loading}>{loading?'Création…':'Créer mon espace'}</button>
    </form>
    {message&&<p className="auth-switch"><Link href="/connexion/">Aller à la connexion</Link></p>}
    {!message&&<p className="auth-switch">Déjà un compte ? <Link href="/connexion/">Se connecter</Link></p>}
  </section></main>;
}
