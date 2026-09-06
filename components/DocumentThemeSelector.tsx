'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Theme = 'signature' | 'epure' | 'impact';

const THEME_KEY = '__document_theme';
const themes: Array<{ id: Theme; label: string; description: string }> = [
  { id: 'signature', label: 'Signature', description: 'Équilibre institutionnel et moderne' },
  { id: 'epure', label: 'Épuré', description: 'Très sobre, priorité au contenu' },
  { id: 'impact', label: 'Impact', description: 'Couverture plus visuelle et affirmée' },
];

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || '';
}

function storageKey() {
  const slug = getSlug() || window.location.pathname;
  return `lfai-document-theme:${slug}`;
}

function isTheme(value: unknown): value is Theme {
  return themes.some(theme => theme.id === value);
}

function applyTheme(root: HTMLElement, theme: Theme) {
  root.classList.remove('docTheme-signature', 'docTheme-epure', 'docTheme-impact');
  root.classList.add(`docTheme-${theme}`);
  root.dataset.documentTheme = theme;
}

async function loadWorkspaceTheme(): Promise<Theme | null> {
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
    .select('values')
    .eq('company_id', membership.company_id)
    .eq('resource_slug', slug)
    .maybeSingle();

  const values = (workspace?.values || {}) as Record<string, unknown>;
  return isTheme(values[THEME_KEY]) ? values[THEME_KEY] : null;
}

async function persistWorkspaceTheme(theme: Theme) {
  const slug = getSlug();
  if (!slug) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!membership?.company_id) return false;

  const { data: workspace } = await supabase
    .from('template_workspaces')
    .select('values')
    .eq('company_id', membership.company_id)
    .eq('resource_slug', slug)
    .maybeSingle();
  if (!workspace) return false;

  const values = (workspace.values || {}) as Record<string, unknown>;
  const { error } = await supabase
    .from('template_workspaces')
    .update({ values: { ...values, [THEME_KEY]: theme }, updated_at: new Date().toISOString() })
    .eq('company_id', membership.company_id)
    .eq('resource_slug', slug);

  return !error;
}

async function createSelector(root: HTMLElement) {
  document.querySelector('.docThemeSelector')?.remove();

  const localSaved = localStorage.getItem(storageKey());
  const cloudSaved = await loadWorkspaceTheme();
  const initial: Theme = cloudSaved || (isTheme(localSaved) ? localSaved : 'signature');
  applyTheme(root, initial);
  localStorage.setItem(storageKey(), initial);

  const panel = document.createElement('aside');
  panel.className = 'docThemeSelector templateUi';
  panel.setAttribute('aria-label', 'Style du document');
  panel.innerHTML = '<div class="docThemeSelectorHead"><strong>Style du document</strong><small>Synchronisé avec le document de votre entreprise</small></div>';

  const buttons: HTMLButtonElement[] = [];
  const status = document.createElement('small');
  status.className = 'docThemeSyncStatus';
  status.textContent = cloudSaved ? '✓ Style chargé depuis votre espace entreprise' : 'Le style sera synchronisé après le premier enregistrement du document';

  themes.forEach(theme => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = theme.id === initial ? 'active' : '';
    button.setAttribute('aria-pressed', String(theme.id === initial));
    button.innerHTML = `<span class="themeSwatch themeSwatch-${theme.id}"><i></i><i></i></span><span><b>${theme.label}</b><small>${theme.description}</small></span>`;
    button.addEventListener('click', async () => {
      applyTheme(root, theme.id);
      localStorage.setItem(storageKey(), theme.id);
      buttons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      status.textContent = 'Synchronisation…';
      const persisted = await persistWorkspaceTheme(theme.id);
      status.textContent = persisted
        ? '✓ Style enregistré pour toute l’entreprise'
        : 'Style conservé sur cet appareil jusqu’au premier enregistrement du document';
    });
    buttons.push(button);
    panel.appendChild(button);
  });

  panel.appendChild(status);
  document.body.appendChild(panel);
}

export default function DocumentThemeSelector() {
  useEffect(() => {
    let currentRoot: HTMLElement | null = null;
    let sequence = 0;

    const refresh = () => {
      const root = document.querySelector<HTMLElement>('.brandDocument');
      if (root === currentRoot && document.querySelector('.docThemeSelector')) return;
      document.querySelector('.docThemeSelector')?.remove();
      currentRoot = root;
      if (root) {
        const token = ++sequence;
        createSelector(root).then(() => {
          if (token !== sequence) document.querySelector('.docThemeSelector')?.remove();
        });
      }
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      sequence += 1;
      observer.disconnect();
      document.querySelector('.docThemeSelector')?.remove();
    };
  }, []);

  return null;
}
