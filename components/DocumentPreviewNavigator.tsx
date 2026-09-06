'use client';

import { useEffect } from 'react';

type PageTarget = { element: HTMLElement; label: string };

function buildTargets(documentRoot: HTMLElement): PageTarget[] {
  const header = documentRoot.querySelector<HTMLElement>('.brandDocumentHeader');
  const sections = Array.from(documentRoot.querySelectorAll<HTMLElement>('.docSection'));
  const executive = documentRoot.querySelector<HTMLElement>('.docExecutive');
  const targets: PageTarget[] = [];

  if (header) targets.push({ element: header, label: 'Couverture' });

  for (let i = 0; i < sections.length; i += 4) {
    const section = sections[i];
    const heading = section.querySelector('h2')?.textContent?.trim();
    targets.push({ element: section, label: heading || `Page ${targets.length + 1}` });
  }

  if (executive && !targets.some(target => target.element === executive)) {
    targets.push({ element: executive, label: 'Synthèse exécutive' });
  }

  return targets;
}

function createNavigator(documentRoot: HTMLElement) {
  document.querySelector('.docPreviewNavigator')?.remove();

  const targets = buildTargets(documentRoot);
  if (targets.length < 2) return;

  const nav = document.createElement('aside');
  nav.className = 'docPreviewNavigator templateUi';
  nav.setAttribute('aria-label', 'Navigation dans le document');

  const title = document.createElement('strong');
  title.textContent = 'Pages';
  nav.appendChild(title);

  const buttons: HTMLButtonElement[] = [];
  targets.forEach((target, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = index === 0 ? 'active' : '';
    button.setAttribute('aria-label', `Aller à la page ${index + 1} : ${target.label}`);
    button.innerHTML = `<span class="docThumb"><i></i><i></i><i></i></span><b>${index + 1}</b><small>${target.label}</small>`;
    button.addEventListener('click', () => target.element.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    buttons.push(button);
    nav.appendChild(button);
  });

  document.body.appendChild(nav);

  const updateActive = () => {
    const marker = window.scrollY + 190;
    let active = 0;
    targets.forEach((target, index) => {
      const top = target.element.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) active = index;
    });
    buttons.forEach((button, index) => button.classList.toggle('active', index === active));
  };

  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
  return () => window.removeEventListener('scroll', updateActive);
}

export default function DocumentPreviewNavigator() {
  useEffect(() => {
    let cleanupScroll: (() => void) | undefined;
    let currentRoot: HTMLElement | null = null;

    const refresh = () => {
      const root = document.querySelector<HTMLElement>('.brandDocument');
      if (root === currentRoot && document.querySelector('.docPreviewNavigator')) return;
      cleanupScroll?.();
      document.querySelector('.docPreviewNavigator')?.remove();
      currentRoot = root;
      if (root) cleanupScroll = createNavigator(root);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanupScroll?.();
      document.querySelector('.docPreviewNavigator')?.remove();
    };
  }, []);

  return null;
}
