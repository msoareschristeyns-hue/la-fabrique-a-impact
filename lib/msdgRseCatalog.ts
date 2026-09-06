export type MsdgCatalogTemplate={
  id:string;
  title:string;
  category:string;
  type:string;
  priority:string;
  frameworks:string[];
  frequency:string;
  description:string;
  layout:'POLICY'|'REPORT'|'ACTION_PLAN'|'REGISTER'|'ASSESSMENT'|'PROOF';
  sourcePath:string;
  markdown:string;
};

export const msdgCatalogVersion='2026-09-06';
export const msdgCatalogSourceCount=342;

export const msdgRseTemplates:MsdgCatalogTemplate[]=[
{
 id:'02-001',title:'Politique RSE',category:'Gouvernance et stratégie RSE',type:'Politique',priority:'P1',frameworks:['EcoVadis','B Corp V2','LUCIE 26000','Engagé RSE','ISO 26000'],frequency:'Annuelle',layout:'POLICY',sourcePath:'templates/02_Gouvernance_et_strategie_RSE/02-001_politique-rse.md',description:'Formaliser les engagements, principes, responsabilités et objectifs RSE de l’entreprise.',markdown:`# Politique RSE

**Entreprise :** {{nom_entreprise}}  
**Version :** {{version}}  
**Date d’approbation :** {{date_approbation}}  
**Approuvé par :** {{approbateur}}  
**Périmètre :** {{perimetre}}

## 1. Objet
Décrire la finalité du document et le résultat recherché.

## 2. Contexte et enjeux
- Enjeux prioritaires : {{enjeux}}
- Risques / impacts concernés : {{risques_impacts}}
- Parties prenantes concernées : {{parties_prenantes}}

## 3. Principes et engagements
1. {{engagement_1}}
2. {{engagement_2}}
3. {{engagement_3}}
4. {{engagement_4}}

## 4. Objectifs
| Objectif | Indicateur | Valeur de départ | Cible | Échéance | Responsable |
|---|---|---:|---:|---|---|
| {{objectif}} | {{kpi}} | {{baseline}} | {{cible}} | {{echeance}} | {{responsable}} |

## 5. Rôles et responsabilités
- Direction : {{role_direction}}
- Référent / pilote : {{role_pilote}}
- Managers : {{role_managers}}
- Collaborateurs / autres parties : {{role_autres}}

## 6. Déploiement
{{deploiement}}

## 7. Suivi et indicateurs
- KPI 1 : {{kpi_1}}
- KPI 2 : {{kpi_2}}
- KPI 3 : {{kpi_3}}

## 8. Preuves attendues
- {{preuve_1}}
- {{preuve_2}}
- {{preuve_3}}

## 9. Révision
Le document est revu {{frequence_revue}} ou lors de tout changement majeur de périmètre, réglementation ou risque.`
},
{
 id:'02-002',title:'Charte RSE',category:'Gouvernance et stratégie RSE',type:'Charte',priority:'P1',frameworks:['EcoVadis','B Corp V2','LUCIE 26000','Engagé RSE','ISO 26000'],frequency:'Tous les 2 ans',layout:'POLICY',sourcePath:'templates/02_Gouvernance_et_strategie_RSE/02-002_charte-rse.md',description:'Créer une charte synthétique d’engagement et de règles de conduite RSE.',markdown:`# Charte RSE

**Entreprise :** {{nom_entreprise}}  
**Version :** {{version}}  
**Date d’approbation :** {{date_approbation}}  
**Approuvé par :** {{approbateur}}  
**Périmètre :** {{perimetre}}

## 1. Objet
{{objet}}

## 2. Contexte et enjeux
- Enjeux prioritaires : {{enjeux}}
- Risques / impacts concernés : {{risques_impacts}}
- Parties prenantes concernées : {{parties_prenantes}}

## 3. Principes et engagements
1. {{engagement_1}}
2. {{engagement_2}}
3. {{engagement_3}}
4. {{engagement_4}}

## 4. Objectifs
| Objectif | Indicateur | Valeur de départ | Cible | Échéance | Responsable |
|---|---|---:|---:|---|---|
| {{objectif}} | {{kpi}} | {{baseline}} | {{cible}} | {{echeance}} | {{responsable}} |

## 5. Rôles et responsabilités
- Direction : {{role_direction}}
- Référent / pilote : {{role_pilote}}
- Managers : {{role_managers}}
- Collaborateurs / autres parties : {{role_autres}}

## 6. Déploiement
{{deploiement}}

## 7. Suivi et indicateurs
- KPI 1 : {{kpi_1}}
- KPI 2 : {{kpi_2}}
- KPI 3 : {{kpi_3}}

## 8. Preuves attendues
- {{preuve_1}}
- {{preuve_2}}
- {{preuve_3}}

## 9. Révision
Le document est revu {{frequence_revue}} ou lors de tout changement majeur de périmètre, réglementation ou risque.`
},
{
 id:'02-004',title:'Note de cadrage RSE',category:'Gouvernance et stratégie RSE',type:'Fiche',priority:'P1',frameworks:['LUCIE 26000','Engagé RSE','ISO 26000'],frequency:'À chaque lancement de démarche',layout:'REPORT',sourcePath:'templates/02_Gouvernance_et_strategie_RSE/02-004_note-de-cadrage-rse.md',description:'Documenter le périmètre, les décisions, les responsabilités et les preuves du lancement de la démarche RSE.',markdown:`# Note de cadrage RSE

**Entreprise :** {{nom_entreprise}}  
**Date :** {{date}}  
**Version / référence :** {{version}}  
**Responsable :** {{responsable}}

## Objet
{{objet}}

## Contenu
{{contenu_principal}}

## Périmètre / personnes concernées
{{perimetre}}

## Engagements / décisions / conditions
- {{point_1}}
- {{point_2}}
- {{point_3}}

## Preuves / références associées
- {{preuve_1}}
- {{preuve_2}}

## Validation
Nom / fonction : {{validateur}}  
Date : {{date_validation}}`
},
{
 id:'02-005',title:'Feuille de route RSE',category:'Gouvernance et stratégie RSE',type:'Plan',priority:'P1',frameworks:['EcoVadis','B Corp V2','LUCIE 26000','Engagé RSE','ISO 26000'],frequency:'Annuelle',layout:'ACTION_PLAN',sourcePath:'templates/02_Gouvernance_et_strategie_RSE/02-005_feuille-de-route-rse.md',description:'Définir objectifs, actions, responsables, échéances, moyens, indicateurs et preuves.',markdown:`# Feuille de route RSE

**Période :** {{periode}}  
**Pilote :** {{pilote}}  
**Version :** {{version}}

## 1. Objectif et résultat attendu
{{objectif_global}}

## 2. Situation de départ
{{diagnostic_initial}}

## 3. Plan d’actions
| ID | Action | Priorité | Responsable | Début | Échéance | Budget | KPI | Cible | Statut | Preuve |
|---|---|---|---|---|---|---:|---|---:|---|---|
| A01 | {{action}} | Haute | {{responsable}} | {{debut}} | {{echeance}} | {{budget}} | {{kpi}} | {{cible}} | À lancer | {{preuve}} |

## 4. Risques et dépendances
{{risques_dependances}}

## 5. Gouvernance de suivi
- Fréquence de revue : {{frequence}}
- Instance : {{instance}}
- Escalade : {{regle_escalade}}

## 6. Bilan
{{bilan}}`
},
{
 id:'02-006',title:'Plan d’action RSE',category:'Gouvernance et stratégie RSE',type:'Plan',priority:'P1',frameworks:['EcoVadis','B Corp V2','LUCIE 26000','Engagé RSE','ISO 26000'],frequency:'Trimestrielle',layout:'ACTION_PLAN',sourcePath:'templates/02_Gouvernance_et_strategie_RSE/02-006_plan-daction-rse.md',description:'Transformer les priorités RSE en actions pilotées et documentées.',markdown:`# Plan d’action RSE

**Période :** {{periode}}  
**Pilote :** {{pilote}}  
**Version :** {{version}}

## 1. Objectif et résultat attendu
{{objectif_global}}

## 2. Situation de départ
{{diagnostic_initial}}

## 3. Plan d’actions
| ID | Action | Priorité | Responsable | Début | Échéance | Budget | KPI | Cible | Statut | Preuve |
|---|---|---|---|---|---|---:|---|---:|---|---|
| A01 | {{action}} | Haute | {{responsable}} | {{debut}} | {{echeance}} | {{budget}} | {{kpi}} | {{cible}} | À lancer | {{preuve}} |

## 4. Risques et dépendances
{{risques_dependances}}

## 5. Gouvernance de suivi
- Fréquence de revue : {{frequence}}
- Instance : {{instance}}
- Escalade : {{regle_escalade}}

## 6. Bilan
{{bilan}}`
},
{
 id:'05-011',title:'Politique achats responsables',category:'Droits humains et achats responsables',type:'Politique',priority:'P1',frameworks:['EcoVadis','ISO 26000','LUCIE 26000','Engagé RSE','B Corp V2'],frequency:'Annuelle',layout:'POLICY',sourcePath:'templates/05_Droits_humains_et_achats_responsables/05-011_politique-achats-responsables.md',description:'Politique complète et personnalisable : une première page de synthèse, puis le document achats responsables détaillé, exploitable par la direction, les acheteurs, les prescripteurs et les fournisseurs.',markdown:`# Politique achats responsables

**Entreprise :** {{nom_entreprise}}  
**Version :** {{version}}  
**Date d’approbation :** {{date_approbation}}  
**Approuvé par :** {{approbateur}}  
**Responsable de la politique :** {{responsable}}  
**Périmètre :** {{perimetre}}

## Synthèse exécutive

### Notre ambition achats
{{ambition_achats}}

### Pourquoi cette politique maintenant
{{enjeux}}

### Nos engagements prioritaires
1. {{engagement_1}}
2. {{engagement_2}}
3. {{engagement_3}}
4. {{engagement_4}}
5. {{engagement_5}}

### Nos objectifs clés
| Objectif | Indicateur | Situation de départ | Cible | Échéance |
|---|---|---|---|---|
| {{objectif_1}} | {{kpi_1}} | {{baseline_1}} | {{cible_1}} | {{echeance_1}} |
| {{objectif_2}} | {{kpi_2}} | {{baseline_2}} | {{cible_2}} | {{echeance_2}} |
| {{objectif_3}} | {{kpi_3}} | {{baseline_3}} | {{cible_3}} | {{echeance_3}} |

### Gouvernance en un coup d’œil
- Sponsor direction : {{sponsor_direction}}
- Pilote achats responsables : {{pilote_achats}}
- Fréquence de revue : {{frequence_revue}}
- Date de prochaine revue : {{date_prochaine_revue}}

## 1. Objet et finalité de la politique
La présente politique définit la manière dont {{nom_entreprise}} intègre les enjeux économiques, environnementaux, sociaux, éthiques et territoriaux dans ses décisions d’achat. Elle vise à sécuriser les approvisionnements, améliorer le coût global, réduire les impacts négatifs, développer des relations fournisseurs responsables et rendre les engagements de l’entreprise démontrables.

{{objet}}

## 2. Périmètre d’application
Cette politique s’applique aux achats de biens, prestations, sous-traitance, investissements et autres engagements fournisseurs entrant dans le périmètre défini ci-dessous. Les modalités peuvent être proportionnées selon le montant, la criticité, le niveau de risque et la nature de la relation fournisseur.

{{perimetre}}

### Catégories ou familles prioritaires
{{familles_achats_prioritaires}}

### Entités, sites et personnes concernées
{{entites_concernees}}

## 3. Contexte et enjeux achats de l’entreprise
Les achats peuvent concentrer une part importante des coûts, des dépendances opérationnelles et des impacts RSE de l’entreprise. La démarche d’achats responsables doit donc rester directement reliée aux enjeux métiers et à la stratégie de l’entreprise.

### Enjeux prioritaires
{{enjeux}}

### Risques et impacts associés
{{risques_impacts}}

### Attentes des parties prenantes
{{parties_prenantes}}

### Dépendances et vulnérabilités fournisseurs
{{dependances_fournisseurs}}

## 4. Principes directeurs
{{nom_entreprise}} retient les principes suivants dans ses décisions d’achat : besoin juste, concurrence loyale, transparence, proportionnalité des exigences, coût global, maîtrise des risques, dialogue fournisseur, traçabilité des décisions et amélioration continue.

### Principes complémentaires propres à l’entreprise
{{principes_complementaires}}

## 5. Engagement économique et performance globale
Les décisions d’achat ne reposent pas uniquement sur le prix facial. Lorsque cela est pertinent, l’entreprise prend en compte le coût complet ou coût total de possession, la qualité, la continuité d’activité, les délais, les risques, la durée de vie, la maintenance, les consommations, la fin de vie et les coûts de non-qualité.

### Règles de décision économique
{{regles_tco}}

### Objectifs de performance achats
{{performance_achats}}

## 6. Engagement environnemental
Les achats contribuent à la réduction des impacts environnementaux en privilégiant, lorsque cela est pertinent et disponible, des solutions sobres en ressources, durables, réparables, réemployables, recyclables ou présentant une meilleure performance environnementale sur leur cycle de vie.

### Critères environnementaux prioritaires
{{criteres_environnementaux}}

### Exigences liées au climat, à l’énergie et aux ressources
{{exigences_climat_ressources}}

### Emballages, déchets et économie circulaire
{{exigences_circularite}}

## 7. Engagement social, droits humains et conditions de travail
L’entreprise attend de ses fournisseurs le respect des droits fondamentaux, des conditions de travail dignes, de la santé et sécurité, de la non-discrimination et, lorsque le contexte le justifie, la mise en place de mesures de prévention portant notamment sur le travail forcé et le travail des enfants.

### Exigences sociales et droits humains
{{criteres_sociaux}}

### Situations nécessitant une vigilance renforcée
{{vigilance_droits_humains}}

## 8. Éthique des affaires et intégrité
Les décisions d’achat doivent être prises dans l’intérêt de l’entreprise et dans des conditions de concurrence loyale. Les conflits d’intérêts, avantages indus, pratiques anticoncurrentielles, fraude, corruption et atteintes à la confidentialité doivent être prévenus et signalés selon les règles applicables dans l’entreprise.

### Règles éthiques spécifiques aux achats
{{regles_ethiques_achats}}

### Cadeaux, invitations et conflits d’intérêts
{{regles_cadeaux_conflits}}

## 9. Achats locaux, inclusifs et contribution au territoire
Lorsque cela est compatible avec les besoins, les exigences techniques, la concurrence et le coût global, l’entreprise peut favoriser la connaissance de son tissu économique local, l’accès des PME aux consultations et le recours à des structures contribuant à l’inclusion ou à l’économie sociale et solidaire.

### Ambition achats locaux
{{ambition_achats_locaux}}

### Ambition achats inclusifs / ESS / handicap
{{ambition_achats_inclusifs}}

## 10. Sélection et référencement des fournisseurs
Le niveau d’évaluation doit être proportionné au risque et à la criticité. Les critères RSE sont intégrés aux consultations et décisions lorsque leur pertinence est démontrée pour le marché concerné.

### Critères de sélection fournisseurs
{{criteres_selection}}

### Pondération indicative des critères
| Domaine | Pondération ou règle |
|---|---|
| Performance économique / coût global | {{ponderation_economique}} |
| Qualité / service / continuité | {{ponderation_qualite}} |
| Environnement | {{ponderation_environnement}} |
| Social / droits humains | {{ponderation_social}} |
| Éthique / conformité | {{ponderation_ethique}} |

### Niveau minimal ou critères éliminatoires
{{criteres_eliminatoires}}

## 11. Segmentation et évaluation des risques fournisseurs
L’entreprise adapte son niveau de diligence au niveau de risque : criticité de la fourniture, dépendance économique, pays, secteur, données disponibles, enjeux sociaux ou environnementaux, antécédents et importance stratégique du fournisseur.

### Méthode de segmentation
{{methode_segmentation}}

### Fournisseurs à évaluer en priorité
{{fournisseurs_prioritaires}}

### Fréquence d’évaluation
{{frequence_evaluation}}

## 12. Consultation, contractualisation et exigences fournisseurs
Les exigences d’achats responsables doivent être formulées de façon compréhensible, proportionnée et traçable. Selon le niveau de risque, elles peuvent être intégrées aux cahiers des charges, questionnaires, grilles d’évaluation, contrats, clauses ou chartes fournisseurs.

### Exigences minimales dans les consultations
{{exigences_consultations}}

### Clauses ou engagements contractuels
{{clauses_contractuelles}}

### Documents demandés aux fournisseurs
{{documents_fournisseurs}}

## 13. Relation fournisseurs et délais de paiement
L’entreprise recherche une relation équilibrée avec ses fournisseurs, fondée sur la clarté des besoins, le respect des engagements, la maîtrise des changements, la communication des écarts et des conditions de paiement conformes aux engagements contractuels et au cadre applicable.

### Principes de relation fournisseurs
{{principes_relation_fournisseurs}}

### Engagement sur les délais de paiement
{{engagement_delais_paiement}}

## 14. Gestion des écarts et plans d’actions correctives
Un écart RSE n’entraîne pas nécessairement une rupture immédiate de la relation. L’entreprise privilégie, lorsque cela est possible et compatible avec le niveau de risque, un plan d’action correctif assorti d’échéances, de preuves et d’un suivi. Les écarts critiques peuvent conduire à une suspension ou à un arrêt de la relation.

### Processus de traitement des écarts
{{processus_ecarts}}

### Critères d’escalade ou de suspension
{{criteres_escalade}}

## 15. Rôles et responsabilités
- Direction : {{role_direction}}
- Direction / fonction achats : {{role_achats}}
- Prescripteurs : {{role_prescripteurs}}
- RSE / QHSE / fonctions support : {{role_support}}
- Fournisseurs : {{role_fournisseurs}}

## 16. Déploiement opérationnel
La politique est déployée progressivement, en commençant par les familles et fournisseurs présentant les enjeux les plus significatifs.

### Plan de déploiement
{{deploiement}}

### Sensibilisation et formation des équipes
{{formation_acheteurs}}

### Outils et documents associés
{{outils_associes}}

## 17. Indicateurs de pilotage
| Indicateur | Définition | Valeur actuelle | Cible | Fréquence | Responsable |
|---|---|---|---|---|---|
| Part des achats couverts par des critères RSE | {{definition_kpi_achats_rse}} | {{valeur_kpi_achats_rse}} | {{cible_kpi_achats_rse}} | {{frequence_kpi_achats_rse}} | {{responsable_kpi_achats_rse}} |
| Part des fournisseurs évalués RSE | {{definition_kpi_fournisseurs}} | {{valeur_kpi_fournisseurs}} | {{cible_kpi_fournisseurs}} | {{frequence_kpi_fournisseurs}} | {{responsable_kpi_fournisseurs}} |
| Part des achats locaux | {{definition_kpi_local}} | {{valeur_kpi_local}} | {{cible_kpi_local}} | {{frequence_kpi_local}} | {{responsable_kpi_local}} |
| Délai moyen de paiement | {{definition_kpi_paiement}} | {{valeur_kpi_paiement}} | {{cible_kpi_paiement}} | {{frequence_kpi_paiement}} | {{responsable_kpi_paiement}} |

## 18. Preuves et traçabilité
La mise en œuvre doit pouvoir être démontrée par des éléments proportionnés au niveau de risque et aux exigences des clients, partenaires ou référentiels suivis.

### Preuves prioritaires à conserver
- {{preuve_1}}
- {{preuve_2}}
- {{preuve_3}}
- {{preuve_4}}
- {{preuve_5}}

## 19. Communication et accessibilité
{{communication_politique}}

## 20. Révision et amélioration continue
La politique est revue {{frequence_revue}} et à chaque évolution significative de l’activité, du périmètre fournisseurs, des risques, des attentes clients ou du cadre réglementaire applicable. La revue porte sur les résultats, les écarts, les retours fournisseurs, la qualité des preuves et les objectifs du cycle suivant.

### Modalités de revue
{{modalites_revue}}

### Prochaine priorité d’amélioration
{{prochaine_amelioration}}

## Validation
- Approuvé par : {{approbateur}}
- Fonction : {{fonction_approbateur}}
- Date : {{date_approbation}}
- Prochaine revue : {{date_prochaine_revue}}
- Commentaires / décisions : {{commentaires_validation}}

Cette politique constitue le cadre interne de référence de {{nom_entreprise}} pour le pilotage des achats responsables. Elle doit être adaptée au contexte réel de l’entreprise et complétée par les procédures, grilles, clauses, preuves et plans d’action nécessaires à son application.`
}
];

export function msdgTemplateById(id:string){return msdgRseTemplates.find(t=>t.id===id)}
export function extractTemplateFields(markdown:string){return Array.from(new Set(Array.from(markdown.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)).map(m=>m[1])))}
export function humanizeTemplateField(key:string){return key.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()).replace('Rse','RSE').replace('Kpi','KPI')}
