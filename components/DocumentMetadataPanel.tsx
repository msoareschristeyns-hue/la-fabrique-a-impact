'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Metadata = {
  author: string;
  referent: string;
  version: string;
  status: string;
  validationDate: string;
  validationEnabled: boolean;
  reviewer: string;
  validator: string;
  validationComment: string;
};

const keys = {
  author: '__document_author',
  referent: '__document_referent',
  version: '__document_version',
  status: '__document_status',
  validationDate: '__document_validation_date',
  validationEnabled: '__document_validation_enabled',
  reviewer: '__document_reviewer',
  validator: '__document_validator',
  validationComment: '__document_validation_comment',
} as const;

const emptyMetadata: Metadata = {
  author: '', referent: '', version: 'V1', status: 'Brouillon', validationDate: '',
  validationEnabled: false, reviewer: '', validator: '', validationComment: '',
};

function getSlug() {
  return new URLSearchParams(window.location.search).get('slug') || '';
}

async function getWorkspace() {
  const slug = getSlug();
  if (!slug) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase.from('company_members').select('company_id').eq('user_id', user.id).limit(1).maybeSingle();
  if (!membership?.company_id) return null;
  const { data: workspace } = await supabase.from('template_workspaces').select('values').eq('company_id', membership.company_id).eq('resource_slug', slug).maybeSingle();
  return { companyId: membership.company_id, slug, workspace };
}

function metadataFromValues(values: Record<string, unknown>): Metadata {
  return {
    author: String(values[keys.author] || ''),
    referent: String(values[keys.referent] || values['Référent RSE'] || values['Référent de la démarche'] || ''),
    version: String(values[keys.version] || values['Version'] || 'V1'),
    status: String(values[keys.status] || values['Validation - statut'] || 'Brouillon'),
    validationDate: String(values[keys.validationDate] || values['Validation - date'] || ''),
    validationEnabled: values[keys.validationEnabled] === true,
    reviewer: String(values[keys.reviewer] || ''),
    validator: String(values[keys.validator] || values['Validation - nom'] || ''),
    validationComment: String(values[keys.validationComment] || values['Validation - commentaires'] || ''),
  };
}

function metadataPatch(metadata: Metadata) {
  return {
    [keys.author]: metadata.author,
    [keys.referent]: metadata.referent,
    [keys.version]: metadata.version,
    [keys.status]: metadata.status,
    [keys.validationDate]: metadata.validationDate,
    [keys.validationEnabled]: metadata.validationEnabled,
    [keys.reviewer]: metadata.reviewer,
    [keys.validator]: metadata.validator,
    [keys.validationComment]: metadata.validationComment,
  };
}

async function persistMetadata(metadata: Metadata) {
  const context = await getWorkspace();
  if (!context?.workspace) return false;
  const values = (context.workspace.values || {}) as Record<string, unknown>;
  const { error } = await supabase.from('template_workspaces').update({ values: { ...values, ...metadataPatch(metadata) }, updated_at: new Date().toISOString() }).eq('company_id', context.companyId).eq('resource_slug', context.slug);
  return !error;
}

function renderStrip(root: HTMLElement, metadata: Metadata) {
  root.querySelector('.docGovernanceStrip')?.remove();
  const body = root.querySelector('.docBody');
  if (!body) return;
  const strip = document.createElement('div');
  strip.className = 'docGovernanceStrip';
  const validation = metadata.validationEnabled
    ? `${metadata.status || 'Brouillon'}${metadata.validator ? ` · ${metadata.validator}` : ''}`
    : 'Workflow non activé';
  strip.innerHTML = `
    <div><small>Version</small><b>${metadata.version || 'V1'}</b></div>
    <div><small>Statut</small><b>${metadata.status || 'Brouillon'}</b></div>
    <div><small>Auteur</small><b>${metadata.author || 'Non renseigné'}</b></div>
    <div><small>Référent</small><b>${metadata.referent || 'Non renseigné'}</b></div>
    <div><small>Validation</small><b>${validation}</b></div>`;
  root.insertBefore(strip, body);
}

async function createPanel(root: HTMLElement) {
  document.querySelector('.docMetadataPanel')?.remove();
  const context = await getWorkspace();
  let current = context?.workspace ? metadataFromValues((context.workspace.values || {}) as Record<string, unknown>) : { ...emptyMetadata };
  renderStrip(root, current);

  const panel = document.createElement('aside');
  panel.className = 'docMetadataPanel templateUi';
  panel.setAttribute('aria-label', 'Informations du document');
  panel.innerHTML = `
    <div class="docMetadataHead"><strong>Gestion du document</strong><small>Informations partagées avec l’entreprise</small></div>
    <label>Auteur<input data-meta="author" placeholder="Nom / fonction"></label>
    <label>Référent<input data-meta="referent" placeholder="Nom / fonction"></label>
    <div class="docMetadataGrid"><label>Version<input data-meta="version" placeholder="V1"></label><label>Statut<select data-meta="status"><option>Brouillon</option><option>À valider</option><option>Validé</option><option>Validé sous réserve</option><option>Refusé</option><option>Archivé</option></select></label></div>
    <label class="docValidationToggle"><input data-meta="validationEnabled" type="checkbox"><span><b>Workflow de validation</b><small>Optionnel · à activer uniquement si nécessaire</small></span></label>
    <div class="docValidationOptional">
      <label>Relecteur<input data-meta="reviewer" placeholder="Nom / fonction"></label>
      <label>Valideur<input data-meta="validator" placeholder="Nom / fonction"></label>
      <label>Date de validation<input data-meta="validationDate" type="date"></label>
      <label>Commentaire<textarea data-meta="validationComment" rows="3" placeholder="Décision, réserve ou motif de refus"></textarea></label>
    </div>
    <button type="button" class="docMetadataSave">Enregistrer les informations</button>
    <small class="docMetadataStatus"></small>`;

  const setValue = (name: keyof Metadata, value: string | boolean) => {
    const field = panel.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-meta="${name}"]`);
    if (!field) return;
    if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = String(value || '');
  };
  setValue('author', current.author); setValue('referent', current.referent); setValue('version', current.version); setValue('status', current.status);
  setValue('validationEnabled', current.validationEnabled); setValue('reviewer', current.reviewer); setValue('validator', current.validator); setValue('validationDate', current.validationDate.match(/^\d{4}-\d{2}-\d{2}$/)?.[0] || ''); setValue('validationComment', current.validationComment);

  const optional = panel.querySelector<HTMLElement>('.docValidationOptional');
  const syncOptional = () => optional?.classList.toggle('active', current.validationEnabled);
  syncOptional();

  const readForm = () => {
    const read = (name: keyof Metadata) => panel.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-meta="${name}"]`)?.value.trim() || '';
    const validationEnabled = panel.querySelector<HTMLInputElement>('[data-meta="validationEnabled"]')?.checked || false;
    current = {
      author: read('author'), referent: read('referent'), version: read('version') || 'V1', status: read('status') || 'Brouillon',
      validationDate: read('validationDate'), validationEnabled, reviewer: read('reviewer'), validator: read('validator'), validationComment: read('validationComment'),
    };
    syncOptional();
    renderStrip(root, current);
  };

  panel.querySelectorAll('input,select,textarea').forEach(field => field.addEventListener('input', readForm));
  panel.querySelectorAll('input,select').forEach(field => field.addEventListener('change', readForm));

  const status = panel.querySelector<HTMLElement>('.docMetadataStatus');
  panel.querySelector('.docMetadataSave')?.addEventListener('click', async () => {
    readForm();
    if (status) status.textContent = 'Enregistrement…';
    const saved = await persistMetadata(current);
    if (status) status.textContent = saved ? '✓ Informations enregistrées pour l’entreprise' : 'Le document doit être enregistré une première fois avant la synchronisation';
  });

  document.body.appendChild(panel);

  const repairAfterWorkspaceSave = new MutationObserver(async mutations => {
    const savedNow = mutations.some(mutation => Array.from(mutation.addedNodes).some(node => node instanceof HTMLElement && (node.matches?.('.saveSuccess') || node.querySelector?.('.saveSuccess'))));
    if (savedNow) {
      const saved = await persistMetadata(current);
      if (saved && status) status.textContent = '✓ Métadonnées synchronisées avec le document';
    }
  });
  repairAfterWorkspaceSave.observe(document.body, { childList: true, subtree: true });
  return () => repairAfterWorkspaceSave.disconnect();
}

export default function DocumentMetadataPanel() {
  useEffect(() => {
    let currentRoot: HTMLElement | null = null;
    let cleanupPanel: (() => void) | undefined;
    let sequence = 0;
    const refresh = () => {
      const root = document.querySelector<HTMLElement>('.brandDocument');
      if (root === currentRoot && document.querySelector('.docMetadataPanel')) return;
      cleanupPanel?.(); document.querySelector('.docMetadataPanel')?.remove(); currentRoot?.querySelector('.docGovernanceStrip')?.remove(); currentRoot = root;
      if (root) {
        const token = ++sequence;
        createPanel(root).then(cleanup => { if (token !== sequence) cleanup?.(); else cleanupPanel = cleanup; });
      }
    };
    refresh();
    const observer = new MutationObserver(refresh); observer.observe(document.body, { childList: true, subtree: true });
    return () => { sequence += 1; observer.disconnect(); cleanupPanel?.(); document.querySelector('.docMetadataPanel')?.remove(); currentRoot?.querySelector('.docGovernanceStrip')?.remove(); };
  }, []);
  return null;
}
