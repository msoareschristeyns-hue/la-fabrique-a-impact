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

export const msdgCatalogVersion='2026-09-04';
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
}
];

export function msdgTemplateById(id:string){return msdgRseTemplates.find(t=>t.id===id)}
export function extractTemplateFields(markdown:string){return Array.from(new Set(Array.from(markdown.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)).map(m=>m[1])))}
export function humanizeTemplateField(key:string){return key.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()).replace('Rse','RSE').replace('Kpi','KPI')}
