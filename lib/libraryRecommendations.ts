import type { Resource } from './library';

export type LibraryRecommendationContext = {
  sector: string;
  size: string;
  maturity: string;
  priorities: string[];
  expectedProofs: string[];
};

export type RecommendedResource = Resource & {
  recommendationScore: number;
  reasons: string[];
};

const foundationSlugs = new Set(['comprendre-rse', 'cadre-rse', 'gouvernance-rse', 'enjeux-rse']);

const sectorSlugs: Record<string, string[]> = {
  Industrie: ['carbone', 'logistique-responsable', 'vigilance-fournisseurs', 'economie-circulaire'],
  Commerce: ['marketing-responsable', 'vigilance-fournisseurs', 'reporting-rse', 'engager-collaborateurs'],
  Services: ['engager-collaborateurs', 'reporting-rse', 'criteres-esg', 'gouvernance-rse'],
  BTP: ['carbone', 'vigilance-fournisseurs', 'engager-collaborateurs', 'logistique-responsable'],
  'Transport & logistique': ['logistique-responsable', 'carbone', 'vigilance-fournisseurs', 'engager-collaborateurs'],
};

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function proofMatch(resource: Resource, expectedProofs: string[]) {
  const haystack = normalize(`${resource.title} ${resource.summary} ${resource.proof} ${resource.category}`);
  return expectedProofs.some(proof => {
    const words = normalize(proof).split(/[^a-z0-9]+/).filter(word => word.length >= 5);
    return words.some(word => haystack.includes(word));
  });
}

export function recommendLibrary(resources: Resource[], ctx: LibraryRecommendationContext): RecommendedResource[] {
  return resources.map(resource => {
    let score = 0;
    const reasons: string[] = [];

    const priorityIndex = resource.pillar ? ctx.priorities.indexOf(resource.pillar) : -1;
    if (priorityIndex >= 0) {
      score += [48, 34, 24][priorityIndex] || 18;
      reasons.push(`lié à votre priorité ${priorityIndex + 1} : ${resource.pillar}`);
    }

    if (ctx.maturity === 'Nous débutons' && foundationSlugs.has(resource.slug)) {
      score += 30;
      if (reasons.length < 3) reasons.push('adapté à une démarche RSE en démarrage');
    }

    if ((sectorSlugs[ctx.sector] || []).includes(resource.slug)) {
      score += 16;
      if (reasons.length < 3) reasons.push(`particulièrement pertinent pour le secteur ${ctx.sector}`);
    }

    if (proofMatch(resource, ctx.expectedProofs)) {
      score += 28;
      if (reasons.length < 3) reasons.push('peut produire une preuve attendue par une action en cours');
    }

    if ((ctx.size === '1–9' || ctx.size === '10–49') && resource.level === 'Essentiel') score += 7;
    if ((ctx.size === '50–249' || ctx.size === '250+') && ['Clients & reporting', 'Piloter sa démarche', 'Achats responsables'].includes(resource.category)) score += 6;

    if (resource.slug === 'reporting-rse' && ctx.priorities.includes('Clients & marché')) score += 12;
    if (resource.slug === 'vigilance-fournisseurs' && ctx.priorities.includes('Achats responsables')) score += 12;
    if (resource.slug === 'carbone' && ctx.priorities.includes('Environnement')) score += 12;

    return { ...resource, recommendationScore: score, reasons };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore || a.minutes - b.minutes || a.title.localeCompare(b.title, 'fr'));
}
