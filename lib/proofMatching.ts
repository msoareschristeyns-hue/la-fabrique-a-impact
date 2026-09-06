export type ProofActionCandidate = {
  id: string;
  title: string;
  pillar: string;
  expected_proof: string;
  status?: string;
};

export type ProofActionMatch = {
  action: ProofActionCandidate;
  score: number;
  reasons: string[];
};

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function words(value: string) {
  return normalize(value).split(/[^a-z0-9]+/).filter(word => word.length >= 4);
}

function overlapScore(left: string, right: string) {
  const a = new Set(words(left));
  const b = new Set(words(right));
  if (!a.size || !b.size) return 0;
  let common = 0;
  a.forEach(word => { if (b.has(word)) common += 1; });
  return common / Math.max(a.size, b.size);
}

export function matchProofToActions(
  actions: ProofActionCandidate[],
  proof: { title: string; pillar: string; proofType?: string; note?: string },
): ProofActionMatch[] {
  const proofText = `${proof.title} ${proof.proofType || ''} ${proof.note || ''}`;
  return actions.map(action => {
    let score = 0;
    const reasons: string[] = [];

    if (proof.pillar && action.pillar === proof.pillar) {
      score += 45;
      reasons.push('même thématique RSE');
    }

    const expectedOverlap = overlapScore(proofText, action.expected_proof || '');
    if (expectedOverlap > 0) {
      score += Math.round(expectedOverlap * 45);
      if (expectedOverlap >= 0.25) reasons.push('libellé proche de la preuve attendue');
    }

    const titleOverlap = overlapScore(proofText, action.title || '');
    if (titleOverlap > 0) {
      score += Math.round(titleOverlap * 20);
      if (titleOverlap >= 0.25 && reasons.length < 3) reasons.push('contenu proche de l’action');
    }

    if (action.status !== 'done') score += 5;

    return { action, score, reasons };
  }).filter(match => match.score > 0).sort((a, b) => b.score - a.score || a.action.title.localeCompare(b.action.title, 'fr'));
}

export function highConfidenceProofMatch(matches: ProofActionMatch[]) {
  const first = matches[0];
  const second = matches[1];
  if (!first || first.score < 62) return null;
  if (second && first.score - second.score < 12) return null;
  return first;
}
