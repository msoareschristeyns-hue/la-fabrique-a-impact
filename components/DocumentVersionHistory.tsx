'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

type VersionSnapshot = {
  id: string;
  version: string;
  status: string;
  author: string;
  createdAt: string;
  createdBy: string;
  values: Record<string, unknown>;
};

const HISTORY_KEY = '__document_history';
const MAX_VERSIONS = 10;

function getSlug() {
  return new URLSearchParams(window.location.search).get('slug') || '';
}

async function getContext() {
  const slug = getSlug();
  if (!slug) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!membership?.company_id) return null;

  const { data: workspace } = await supabase
    .from('template_workspaces')
    .select('values,status')
    .eq('company_id', membership.company_id)
    .eq('resource_slug', slug)
    .maybeSingle();

  return { user, companyId: membership.company_id, slug, workspace };
}

function getHistory(values: Record<string, unknown>): VersionSnapshot[] {
  const raw = values[HISTORY_KEY];
  if (!Array.isArray(raw)) return [];
  return raw.filter(item => item && typeof item === 'object') as VersionSnapshot[];
}

function safeSnapshot(values: Record<string, unknown>) {
  const copy = { ...values };
  delete copy[HISTORY_KEY];
  return copy;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

function currentVersion(values: Record<string, unknown>, history: VersionSnapshot[]) {
  const explicit = String(values.__document_version || values.Version || '').trim();
  if (explicit) return explicit;
  return `V${history.length + 1}`;
}

async function saveSnapshot() {
  const context = await getContext();
  if (!context?.workspace) return { ok: false, history: [] as VersionSnapshot[] };

  const values = (context.workspace.values || {}) as Record<string, unknown>;
  const history = getHistory(values);
  const now = new Date().toISOString();
  const snapshot: VersionSnapshot = {
    id: crypto.randomUUID(),
    version: currentVersion(values, history),
    status: String(values.__document_status || context.workspace.status || 'Brouillon'),
    author: String(values.__document_author || ''),
    createdAt: now,
    createdBy: context.user.id,
    values: safeSnapshot(values),
  };

  const nextHistory = [snapshot, ...history].slice(0, MAX_VERSIONS);
  const { error } = await supabase
    .from('template_workspaces')
    .update({ values: { ...values, [HISTORY_KEY]: nextHistory }, updated_at: now })
    .eq('company_id', context.companyId)
    .eq('resource_slug', context.slug);

  return { ok: !error, history: nextHistory };
}

async function restoreSnapshot(snapshot: VersionSnapshot, history: VersionSnapshot[]) {
  const context = await getContext();
  if (!context?.workspace) return false;

  const restored = {
    ...snapshot.values,
    [HISTORY_KEY]: history,
    __document_version: snapshot.version,
    __document_status: 'Brouillon',
  };

  const { error } = await supabase
    .from('template_workspaces')
    .update({ values: restored, status: 'draft', completed_at: null, updated_at: new Date().toISOString() })
    .eq('company_id', context.companyId)
    .eq('resource_slug', context.slug);

  return !error;
}

function renderHistory(panel: HTMLElement, history: VersionSnapshot[]) {
  const list = panel.querySelector<HTMLElement>('.docVersionList');
  if (!list) return;
  if (!history.length) {
    list.innerHTML = '<p>Aucune version figée pour le moment.</p>';
    return;
  }

  list.innerHTML = '';
  history.forEach(snapshot => {
    const item = document.createElement('article');
    item.className = 'docVersionItem';
    const author = snapshot.author || 'Auteur non renseigné';
    item.innerHTML = `<div><b>${snapshot.version}</b><span>${snapshot.status}</span></div><small>${formatDate(snapshot.createdAt)} · ${author}</small><button type="button">Restaurer</button>`;
    item.querySelector('button')?.addEventListener('click', async () => {
      const confirmed = window.confirm(`Restaurer ${snapshot.version} ? Le contenu actuel sera remplacé, mais l’historique sera conservé.`);
      if (!confirmed) return;
      const ok = await restoreSnapshot(snapshot, history);
      if (ok) window.location.reload();
    });
    list.appendChild(item);
  });
}

async function createPanel() {
  document.querySelector('.docVersionPanel')?.remove();
  const context = await getContext();
  if (!context?.workspace) return;

  const values = (context.workspace.values || {}) as Record<string, unknown>;
  let history = getHistory(values);

  const panel = document.createElement('aside');
  panel.className = 'docVersionPanel templateUi';
  panel.setAttribute('aria-label', 'Historique des versions');
  panel.innerHTML = `
    <div class="docVersionHead"><strong>Versions</strong><small>Figez un état avant une modification importante</small></div>
    <button type="button" class="docVersionCreate">Créer une version</button>
    <small class="docVersionStatus"></small>
    <div class="docVersionList"></div>`;

  renderHistory(panel, history);
  const status = panel.querySelector<HTMLElement>('.docVersionStatus');
  panel.querySelector('.docVersionCreate')?.addEventListener('click', async () => {
    if (status) status.textContent = 'Création de la version…';
    const result = await saveSnapshot();
    history = result.history;
    if (status) status.textContent = result.ok ? '✓ Version enregistrée' : 'Impossible de créer la version';
    if (result.ok) renderHistory(panel, history);
  });

  document.body.appendChild(panel);
}

export default function DocumentVersionHistory() {
  useEffect(() => {
    let active = false;
    let sequence = 0;

    const refresh = () => {
      const hasDocument = !!document.querySelector('.brandDocument');
      if (!hasDocument) {
        active = false;
        document.querySelector('.docVersionPanel')?.remove();
        return;
      }
      if (active && document.querySelector('.docVersionPanel')) return;
      active = true;
      const token = ++sequence;
      createPanel().then(() => {
        if (token !== sequence) document.querySelector('.docVersionPanel')?.remove();
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      sequence += 1;
      observer.disconnect();
      document.querySelector('.docVersionPanel')?.remove();
    };
  }, []);

  return null;
}
