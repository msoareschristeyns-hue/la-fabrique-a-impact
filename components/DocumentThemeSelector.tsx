'use client';

import { useEffect } from 'react';

type Theme = 'signature' | 'epure' | 'impact';

const themes: Array<{ id: Theme; label: string; description: string }> = [
  { id: 'signature', label: 'Signature', description: 'Équilibre institutionnel et moderne' },
  { id: 'epure', label: 'Épuré', description: 'Très sobre, priorité au contenu' },
  { id: 'impact', label: 'Impact', description: 'Couverture plus visuelle et affirmée' },
];

function storageKey() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || window.location.pathname;
  return `lfai-document-theme:${slug}`;
}

function applyTheme(root: HTMLElement, theme: Theme) {
  root.classList.remove('docTheme-signature', 'docTheme-epure', 'docTheme-impact');
  root.classList.add(`docTheme-${theme}`);
  root.dataset.documentTheme = theme;
}

function createSelector(root: HTMLElement) {
  document.querySelector('.docThemeSelector')?.remove();

  const saved = localStorage.getItem(storageKey()) as Theme | null;
  const initial: Theme = themes.some(theme => theme.id === saved) ? (saved as Theme) : 'signature';
  applyTheme(root, initial);

  const panel = document.createElement('aside');
  panel.className = 'docThemeSelector templateUi';
  panel.setAttribute('aria-label', 'Style du document');
  panel.innerHTML = '<div class="docThemeSelectorHead"><strong>Style du document</strong><small>La charte de votre entreprise est conservée</small></div>';

  const buttons: HTMLButtonElement[] = [];
  themes.forEach(theme => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = theme.id === initial ? 'active' : '';
    button.setAttribute('aria-pressed', String(theme.id === initial));
    button.innerHTML = `<span class="themeSwatch themeSwatch-${theme.id}"><i></i><i></i></span><span><b>${theme.label}</b><small>${theme.description}</small></span>`;
    button.addEventListener('click', () => {
      applyTheme(root, theme.id);
      localStorage.setItem(storageKey(), theme.id);
      buttons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    });
    buttons.push(button);
    panel.appendChild(button);
  });

  document.body.appendChild(panel);
}

export default function DocumentThemeSelector() {
  useEffect(() => {
    let currentRoot: HTMLElement | null = null;

    const refresh = () => {
      const root = document.querySelector<HTMLElement>('.brandDocument');
      if (root === currentRoot && document.querySelector('.docThemeSelector')) return;
      document.querySelector('.docThemeSelector')?.remove();
      currentRoot = root;
      if (root) createSelector(root);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelector('.docThemeSelector')?.remove();
    };
  }, []);

  return null;
}
