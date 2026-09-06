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
  changedFields?: string[];
};

type FieldDiff = { key: string; before: string; after: string };

const HISTORY_KEY = '__document_history';
const MAX_VERSIONS = 10;
const INTERNAL_PREFIX = '__';

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

function comparableEntries(values: Record<string, unknown>) {
  return Object.entries(values).filter(([key]) => key !== HISTORY_KEY && !key.startsWith(INTERNAL_PREFIX));
}

function valueText(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  try { return JSON.stringify(value); } catch { return String(value); }
}

function diffValues(before: Record<string, unknown>, after: Record<string, unknown>): FieldDiff[] {
  const keys = new Set([...comparableEntries(before).map(([key]) => key), ...comparableEntries(after).map(([key]) => key)]);
  return [...keys]
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .map(key => ({ key, before: valueText(before[key]), after: valueText(after[key]) }))
    .filter(diff => diff.before !== diff.after);
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
  const snapshotValues = safeSnapshot(values);
  const previousValues = history[0]?.values || {};
  const changedFields = diffValues(previousValues, snapshotValues).map(diff => diff.key);
  const now = new Date().toISOString();
  const snapshot: VersionSnapshot = {
    id: crypto.randomUUID(),
    version: currentVersion(values, history),
    status: String(values.__document_status || context.workspace.status || 'Brouillon'),
    author: String(values.__document_author || ''),
    createdAt: now,
    createdBy: context.user.id,
    values: snapshotValues,
    changedFields,
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

function truncate(value: string, limit = 180) {
  if (!value) return '—';
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

function openComparison(older: VersionSnapshot, newer: VersionSnapshot) {
  document.querySelector('.docVersionCompare')?.remove();
  const diffs = diffValues(older.values || {}, newer.values || {});
  const overlay = document.createElement('div');
  overlay.className = 'docVersionCompare templateUi';
  const dialog = document.createElement('section');
  dialog.className = 'docVersionCompareDialog';

  const head = document.createElement('header');
  const titleWrap = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = `${older.version} → ${newer.version}`;
  const subtitle = document.createElement('small');
  subtitle.textContent = diffs.length ? `${diffs.length} champ${diffs.length > 1 ? 's' : ''} modifié${diffs.length > 1 ? 's' : ''}` : 'Aucune différence de contenu détectée';
  titleWrap.append(title, subtitle);
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Fermer';
  close.addEventListener('click', () => overlay.remove());
  head.append(titleWrap, close);
  dialog.appendChild(head);

  const list = document.createElement('div');
  list.className = 'docVersionDiffList';
  if (!diffs.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Le contenu de ces deux versions est identique.';
    list.appendChild(empty);
  } else {
    diffs.forEach(diff => {
      const article = document.createElement('article');
      const field = document.createElement('b');
      field.textContent = diff.key;
      const columns = document.createElement('div');
      const before = document.createElement('section');
      const beforeLabel = document.createElement('small');
      beforeLabel.textContent = older.version;
      const beforeText = document.createElement('p');
      beforeText.textContent = truncate(diff.before);
      before.append(beforeLabel, beforeText);
      const after = document.createElement('section');
      const afterLabel = document.createElement('small');
      afterLabel.textContent = newer.version;
      const afterText = document.createElement('p');
      afterText.textContent = truncate(diff.after);
      after.append(afterLabel, afterText);
      columns.append(before, after);
      article.append(field, columns);
      list.appendChild(article);
    });
  }
  dialog.appendChild(list);
  overlay.appendChild(dialog);
  overlay.addEventListener('click', event => { if (event.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function renderHistory(panel: HTMLElement, history: VersionSnapshot[]) {
  const list = panel.querySelector<HTMLElement>('.docVersionList');
  const compareButton = panel.querySelector<HTMLButtonElement>('.docVersionCompareButton');
  if (!list || !compareButton) return;
  if (!history.length) {
    list.innerHTML = '<p>Aucune version figée pour le moment.</p>';
    compareButton.disabled = true;
    return;
  }

  list.innerHTML = '';
  const selected = new Set<string>();
  const syncCompare = () => {
    compareButton.disabled = selected.size !== 2;
    compareButton.textContent = selected.size === 2 ? 'Comparer les 2 versions' : `Comparer (${selected.size}/2)`;
  };

  history.forEach(snapshot => {
    const item = document.createElement('article');
    item.className = 'docVersionItem';

    const top = document.createElement('div');
    const identity = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `Sélectionner ${snapshot.version} pour comparaison`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked && selected.size >= 2) {
        checkbox.checked = false;
        return;
      }
      if (checkbox.checked) selected.add(snapshot.id); else selected.delete(snapshot.id);
      syncCompare();
    });
    const version = document.createElement('b');
    version.textContent = snapshot.version;
    identity.append(checkbox, version);
    const badge = document.createElement('span');
    badge.textContent = snapshot.status;
    top.append(identity, badge);

    const meta = document.createElement('small');
    meta.textContent = `${formatDate(snapshot.createdAt)} · ${snapshot.author || 'Auteur non renseigné'}`;
    const journal = document.createElement('small');
    journal.className = 'docVersionJournal';
    const changes = Array.isArray(snapshot.changedFields) ? snapshot.changedFields : [];
    journal.textContent = changes.length ? `${changes.length} modification${changes.length > 1 ? 's' : ''} : ${changes.slice(0, 3).join(', ')}${changes.length > 3 ? '…' : ''}` : 'Journal non disponible pour cette ancienne version';

    const restore = document.createElement('button');
    restore.type = 'button';
    restore.textContent = 'Restaurer';
    restore.addEventListener('click', async () => {
      const confirmed = window.confirm(`Restaurer ${snapshot.version} ? Le contenu actuel sera remplacé, mais l’historique sera conservé.`);
      if (!confirmed) return;
      const ok = await restoreSnapshot(snapshot, history);
      if (ok) window.location.reload();
    });

    item.append(top, meta, journal, restore);
    list.appendChild(item);
  });

  compareButton.onclick = () => {
    const picked = history.filter(snapshot => selected.has(snapshot.id));
    if (picked.length !== 2) return;
    const ordered = [...picked].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    openComparison(ordered[0], ordered[1]);
  };
  syncCompare();
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
    <button type="button" class="docVersionCompareButton" disabled>Comparer (0/2)</button>
    <small class="docVersionStatus"></small>
    <div class="docVersionList"></div>`;

  renderHistory(panel, history);
  const status = panel.querySelector<HTMLElement>('.docVersionStatus');
  panel.querySelector('.docVersionCreate')?.addEventListener('click', async () => {
    if (status) status.textContent = 'Création de la version…';
    const result = await saveSnapshot();
    history = result.history;
    if (status) status.textContent = result.ok ? '✓ Version enregistrée avec journal des modifications' : 'Impossible de créer la version';
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
        document.querySelector('.docVersionCompare')?.remove();
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
      document.querySelector('.docVersionCompare')?.remove();
    };
  }, []);

  return null;
}
