import { MedicalCitation } from '../types';

export const REVIEWED_MEDICAL_CITATIONS: MedicalCitation[] = [
  {
    id: 'cit_who_pcos_2023',
    sourceName: 'World Health Organization (WHO)',
    title: 'Polycystic ovary syndrome (PCOS) Factsheet',
    organization: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome',
    publicationYear: 2023,
    reviewStatus: 'Public Health Institution',
    relevantSummary: 'PCOS is a common hormonal condition that affects 8–13% of reproductive-aged women globally. Up to 70% of affected women remain undiagnosed worldwide.'
  },
  {
    id: 'cit_acog_cop_2023',
    sourceName: 'ACOG Practice Bulletin No. 194',
    title: 'Polycystic Ovary Syndrome: Clinical Assessment and Evidence-Based Management',
    organization: 'American College of Obstetricians and Gynecologists (ACOG)',
    url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2018/06/polycystic-ovary-syndrome',
    publicationYear: 2023,
    reviewStatus: 'Clinical Guideline',
    relevantSummary: 'Diagnosis is based on the Rotterdam criteria (requiring at least 2 of 3: ovulatory dysfunction, hyperandrogenism, and polycystic ovarian morphology on ultrasound), after excluding other etiologies like thyroid disease or hyperprolactinemia.'
  },
  {
    id: 'cit_international_evidence_guideline_2023',
    sourceName: 'Monash International Evidence-Based Guideline',
    title: 'Recommendations from the 2023 International Evidence-Based Guideline for the Assessment and Management of Polycystic Ovary Syndrome',
    organization: 'European Society of Human Reproduction and Embryology (ESHRE) / ASRM',
    url: 'https://www.monash.edu/medicine/mchri/pcos/guideline',
    publicationYear: 2023,
    reviewStatus: 'Peer-Reviewed',
    relevantSummary: 'Emphasizes holistic care including metabolic risk screening, psychological well-being, lifestyle intervention as first-line therapy, and individualized medical management.'
  },
  {
    id: 'cit_fogsi_india_guideline',
    sourceName: 'FOGSI Good Clinical Practice Recommendations',
    title: 'Consensus on Polycystic Ovary Syndrome in Indian Women',
    organization: 'Federation of Obstetric and Gynaecological Societies of India (FOGSI)',
    url: 'https://www.fogsi.org',
    publicationYear: 2022,
    reviewStatus: 'Clinical Guideline',
    relevantSummary: 'Highlights the heightened prevalence of insulin resistance and metabolic features in South Asian women with PCOS, even at lower Body Mass Index (BMI).'
  },
  {
    id: 'cit_nhs_pcos_overview',
    sourceName: 'NHS Health A-Z',
    title: 'Polycystic Ovary Syndrome Overview, Symptoms, and Causes',
    organization: 'National Health Service (NHS UK)',
    url: 'https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/',
    publicationYear: 2024,
    reviewStatus: 'Public Health Institution',
    relevantSummary: 'Explains that polycystic ovaries do not contain real cysts, but underdeveloped fluid-filled follicles where eggs have developed but were not released during ovulation.'
  }
];

export interface PcosPillar {
  title: string;
  description: string;
  clinicalNote: string;
}

export const ROTTERDAM_CRITERIA: PcosPillar[] = [
  {
    title: '1. Irregular or Absent Ovulation (Oligo/Anovulation)',
    description: 'Menstrual cycles spaced greater than 35 days apart (oligomenorrhea), fewer than 8 cycles per year, or complete absence of menstruation for 3+ consecutive months (amenorrhea).',
    clinicalNote: 'Caused by hormonal feedback disruption preventing normal egg maturation and follicular release.'
  },
  {
    title: '2. Clinical or Biochemical Hyperandrogenism',
    description: 'Elevated androgen (male hormone) activity, presenting as excess terminal facial/body hair (hirsutism), persistent cystic acne, or male-pattern scalp hair thinning; or confirmed via elevated free/total testosterone on blood tests.',
    clinicalNote: 'Requires careful differentiation from ethnic variants and androgen-secreting tumors.'
  },
  {
    title: '3. Polycystic Ovarian Morphology on Ultrasound',
    description: 'Pelvic ultrasound demonstrating 20 or more follicles (2–9 mm in diameter) per ovary or an increased ovarian volume (>10 mL) in at least one ovary.',
    clinicalNote: 'Not required if both irregular ovulation and hyperandrogenism are already clinically present, and should be interpreted cautiously in adolescents within 8 years of menarche.'
  }
];

export const DIFFERENTIAL_DIAGNOSES = [
  {
    condition: 'Thyroid Disorders (Hypothyroidism)',
    symptomsOverlap: 'Fatigue, weight gain, irregular cycles, hair thinning.',
    distinguishingTest: 'Serum Thyroid Stimulating Hormone (TSH) and Free T4 blood test.'
  },
  {
    condition: 'Hyperprolactinemia',
    symptomsOverlap: 'Irregular or stopped periods, breast tenderness, milky discharge.',
    distinguishingTest: 'Fasting Serum Prolactin test.'
  },
  {
    condition: 'Non-Classical Congenital Adrenal Hyperplasia (NCAH)',
    symptomsOverlap: 'Severe hirsutism, cystic acne, cycle irregularity.',
    distinguishingTest: 'Early morning follicular phase 17-hydroxyprogesterone (17-OHP).'
  },
  {
    condition: 'Functional Hypothalamic Amenorrhea (FHA)',
    symptomsOverlap: 'Absent periods, low energy, mood fluctuations.',
    distinguishingTest: 'Associated with severe caloric restriction, intense athletics, or extreme stress, accompanied by low LH/FSH.'
  }
];

export const MYTHS_AND_FACTS = [
  {
    myth: 'PCOS means you can never get pregnant.',
    fact: 'PCOS is a leading cause of ovulatory subfertility, but it does NOT mean infertility. Most women with PCOS can conceive naturally or with simple medical support (such as ovulation induction or lifestyle modifications).',
    evidence: 'Monash International PCOS Guidelines, 2023.'
  },
  {
    myth: 'You can only have PCOS if you are overweight.',
    fact: 'Up to 20–30% of women with PCOS have a normal or lean Body Mass Index ("Lean PCOS"). South Asian women often develop metabolic symptoms and insulin resistance even at lower body weights.',
    evidence: 'FOGSI & WHO Consensus 2023.'
  },
  {
    myth: 'PCOS can be permanently cured with special detox teas or supplements.',
    fact: 'PCOS is a lifelong endocrine and metabolic condition with strong genetic foundations. While it cannot be "cured", its symptoms can be effectively managed and reversed through evidence-based lifestyle changes and medical care.',
    evidence: 'ACOG Practice Bulletin No. 194.'
  },
  {
    myth: 'If your ultrasound shows normal ovaries, you definitely don\'t have PCOS.',
    fact: 'Under the Rotterdam diagnostic criteria, an ultrasound is not strictly required if a woman has both irregular periods and clinical/biochemical hyperandrogenism.',
    evidence: 'Rotterdam ESHRE/ASRM Consensus.'
  }
];

export const QUESTIONS_FOR_GYNECOLOGIST = [
  'What specific diagnostic tests (hormonal blood panel, ultrasound, glucose tolerance) do you recommend for my symptoms?',
  'Could my symptoms be related to another condition, like thyroid dysfunction or hyperprolactinemia?',
  'What are my options for regulating my menstrual cycle safely?',
  'How do my insulin levels and metabolic health factor into my treatment plan?',
  'If I am planning (or not planning) a pregnancy in the near future, how does that guide our next steps?'
];
