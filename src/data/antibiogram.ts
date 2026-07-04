// ============================================================================
// Antibiogram dataset — the single source of truth for the game.
//
// Pixel-verified from references/antibiogram.jpg (aetherist/antibiogram chart).
// A human-readable copy lives in references/antibiogram-data.md; the dataset
// integrity test (src/game/scoring.test.ts) keeps the two consistent.
//
// Structure: germs are columns (grouped by category), antibiotic FAMILIES are
// rows, and each antibiotic covers a set of germs. An antibiotic's correct
// cells = { (its family row) x (each covered germ) }.
// ============================================================================

export type GermGroupId =
  | 'gram_pos_cocci'
  | 'gram_neg_bacilli'
  | 'gram_neg_cocci'
  | 'anaerobes'
  | 'atypicals'

export interface GermGroup {
  id: GermGroupId
  label: string
  /** CSS variable name (defined in styles/theme.css) for this group's header color. */
  colorVar: string
}

export interface Germ {
  id: string
  /** Short label shown in the column header. */
  label: string
  /** Optional fuller name, e.g. for future header tooltips. */
  fullName?: string
  group: GermGroupId
}

export interface Family {
  id: string
  /** Row label shown in the sidebar. */
  label: string
  /** CSS variable name for this family's cell-fill color. */
  colorVar: string
}

export interface Antibiotic {
  id: string
  /** Name shown on the draggable block and in cells (truncated when needed). */
  name: string
  familyId: string
  /** Germ ids this antibiotic is effective against. */
  germs: string[]
}

// --- Germ groups (column categories) --------------------------------------

export const GERM_GROUPS: GermGroup[] = [
  { id: 'gram_pos_cocci', label: 'Gram positive cocci', colorVar: '--group-gram-pos-cocci' },
  { id: 'gram_neg_bacilli', label: 'Gram negative bacilli', colorVar: '--group-gram-neg-bacilli' },
  { id: 'gram_neg_cocci', label: 'Gram-negative cocci', colorVar: '--group-gram-neg-cocci' },
  { id: 'anaerobes', label: 'Anaerobes', colorVar: '--group-anaerobes' },
  { id: 'atypicals', label: 'Atypicals', colorVar: '--group-atypicals' },
]

// --- Germs (columns), in chart order --------------------------------------

export const GERMS: Germ[] = [
  { id: 'mrsa', label: 'MRSA', fullName: 'Methicillin-resistant Staphylococcus aureus', group: 'gram_pos_cocci' },
  { id: 'mssa', label: 'MSSA', fullName: 'Methicillin-sensitive Staphylococcus aureus', group: 'gram_pos_cocci' },
  { id: 'strep', label: 'Streptococci', group: 'gram_pos_cocci' },
  { id: 'ecoli', label: 'E. coli', group: 'gram_neg_bacilli' },
  { id: 'pmirabilis', label: 'P. mirabilis', group: 'gram_neg_bacilli' },
  { id: 'klebsiella', label: 'Klebsiella', group: 'gram_neg_bacilli' },
  { id: 'pseudomonas', label: 'Pseudomonas', group: 'gram_neg_bacilli' },
  {
    id: 'escappm',
    label: 'ESCAPPM',
    fullName:
      'Enterobacter spp., Serratia spp., Citrobacter freundii, Aeromonas spp., Proteus spp., Providencia spp., Morganella morganii',
    group: 'gram_neg_bacilli',
  },
  { id: 'ngonorrhoeae', label: 'N. gonorrhoeae', group: 'gram_neg_cocci' },
  { id: 'nmeningitidis', label: 'N. meningitidis', group: 'gram_neg_cocci' },
  { id: 'anaerobes', label: 'Anaerobes', group: 'anaerobes' },
  { id: 'atypicals', label: 'Atypicals', fullName: 'e.g. Mycoplasma', group: 'atypicals' },
]

// --- Antibiotic families (rows), in chart order ----------------------------

export const FAMILIES: Family[] = [
  { id: 'penicillin', label: 'Penicillin', colorVar: '--fill-penicillin' },
  { id: 'antistaph_pen', label: 'Anti-staphylococcal penicillins', colorVar: '--fill-penicillin' },
  { id: 'aminopenicillin', label: 'Aminopenicillins', colorVar: '--fill-penicillin' },
  { id: 'ceph1', label: '1st-gen cephalosporin', colorVar: '--fill-ceph-early' },
  { id: 'ceph2', label: '2nd-gen cephalosporin', colorVar: '--fill-ceph-early' },
  { id: 'ceph3', label: '3rd-gen cephalosporin', colorVar: '--fill-ceph-late' },
  { id: 'ceph4', label: '4th-gen cephalosporin', colorVar: '--fill-ceph-late' },
  { id: 'aminopen_bli', label: 'Aminopenicillins + β-lactamase inhibitors', colorVar: '--fill-bli' },
  { id: 'carbapenem', label: 'Carbapenems', colorVar: '--fill-carbapenem' },
  { id: 'monobactam', label: 'Monobactams', colorVar: '--fill-monobactam' },
  { id: 'quinolone', label: 'Quinolones', colorVar: '--fill-quinolone' },
  { id: 'aminoglycoside', label: 'Aminoglycosides', colorVar: '--fill-aminoglycoside' },
  { id: 'lincosamide', label: 'Lincosamide', colorVar: '--fill-lincosamide' },
  { id: 'macrolide', label: 'Macrolides', colorVar: '--fill-macrolide' },
  { id: 'tetracycline', label: 'Tetracyclines', colorVar: '--fill-tetracycline' },
  { id: 'glycopeptide', label: 'Glycopeptides', colorVar: '--fill-glycopeptide' },
  { id: 'antimetabolite', label: 'Antimetabolite', colorVar: '--fill-antimetabolite' },
  { id: 'nitroimidazole', label: 'Nitroimidazoles', colorVar: '--fill-nitroimidazole' },
]

// --- Antibiotics → germ coverage ------------------------------------------

export const ANTIBIOTICS: Antibiotic[] = [
  { id: 'penicillin_g', name: 'Penicillin G', familyId: 'penicillin', germs: ['strep'] },
  { id: 'nafcillin', name: 'Nafcillin/Oxacillin', familyId: 'antistaph_pen', germs: ['mssa', 'strep'] },
  {
    id: 'ampicillin',
    name: 'Ampicillin/Amoxicillin',
    familyId: 'aminopenicillin',
    germs: ['strep', 'ecoli', 'pmirabilis', 'nmeningitidis'],
  },
  {
    id: 'cefazolin',
    name: 'Cefazolin, cephalexin',
    familyId: 'ceph1',
    germs: ['mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella'],
  },
  {
    id: 'cefotetan',
    name: 'Cefotetan, Cefoxitin',
    familyId: 'ceph2',
    germs: ['mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'anaerobes'],
  },
  {
    id: 'ceftriaxone',
    name: 'Ceftriaxone',
    familyId: 'ceph3',
    germs: ['mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'escappm', 'ngonorrhoeae', 'nmeningitidis'],
  },
  {
    id: 'ceftazidime',
    name: 'Ceftazidime',
    familyId: 'ceph3',
    germs: ['strep', 'ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas'],
  },
  {
    id: 'cefepime',
    name: 'Cefepime',
    familyId: 'ceph4',
    germs: [
      'mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas', 'escappm', 'ngonorrhoeae', 'nmeningitidis',
    ],
  },
  {
    id: 'augmentin',
    name: 'Amoxicillin-clavulanate (Augmentin)',
    familyId: 'aminopen_bli',
    germs: ['mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'anaerobes'],
  },
  {
    id: 'unasyn',
    name: 'Ampicillin-sulbactam (Unasyn)',
    familyId: 'aminopen_bli',
    germs: ['mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'anaerobes'],
  },
  {
    id: 'zosyn',
    name: 'Piperacillin-tazobactam (Zosyn)',
    familyId: 'aminopen_bli',
    germs: ['mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas', 'escappm', 'nmeningitidis', 'anaerobes'],
  },
  {
    id: 'ertapenem',
    name: 'Ertapenem',
    familyId: 'carbapenem',
    germs: ['mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'escappm', 'ngonorrhoeae', 'nmeningitidis', 'anaerobes'],
  },
  {
    id: 'imipenem',
    name: 'Imipenem, Meropenem',
    familyId: 'carbapenem',
    germs: [
      'mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas', 'escappm', 'ngonorrhoeae', 'nmeningitidis', 'anaerobes',
    ],
  },
  {
    id: 'aztreonam',
    name: 'Aztreonam',
    familyId: 'monobactam',
    germs: ['ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas', 'escappm', 'ngonorrhoeae', 'nmeningitidis'],
  },
  {
    id: 'ciprofloxacin',
    name: 'Ciprofloxacin',
    familyId: 'quinolone',
    germs: ['mssa', 'ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas', 'escappm', 'ngonorrhoeae', 'nmeningitidis'],
  },
  {
    id: 'levofloxacin',
    name: 'Levofloxacin',
    familyId: 'quinolone',
    germs: [
      'mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas', 'escappm', 'ngonorrhoeae', 'nmeningitidis', 'atypicals',
    ],
  },
  {
    id: 'moxifloxacin',
    name: 'Moxifloxacin',
    familyId: 'quinolone',
    germs: [
      'mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'escappm', 'ngonorrhoeae', 'nmeningitidis', 'anaerobes', 'atypicals',
    ],
  },
  {
    id: 'aminoglycoside',
    name: 'Gentamicin/Tobramycin/Amikacin',
    familyId: 'aminoglycoside',
    germs: ['ecoli', 'pmirabilis', 'klebsiella', 'pseudomonas', 'escappm'],
  },
  { id: 'clindamycin', name: 'Clindamycin', familyId: 'lincosamide', germs: ['mrsa', 'mssa', 'strep', 'anaerobes'] },
  { id: 'azithromycin', name: 'Azithromycin', familyId: 'macrolide', germs: ['mssa', 'strep', 'nmeningitidis', 'atypicals'] },
  { id: 'doxycycline', name: 'Doxycycline', familyId: 'tetracycline', germs: ['strep', 'ecoli', 'nmeningitidis', 'atypicals'] },
  { id: 'vancomycin', name: 'Vancomycin', familyId: 'glycopeptide', germs: ['mrsa', 'mssa', 'strep'] },
  {
    id: 'tmpsmx',
    name: 'TMP/SMX (Bactrim)',
    familyId: 'antimetabolite',
    germs: ['mrsa', 'mssa', 'strep', 'ecoli', 'pmirabilis', 'klebsiella', 'escappm', 'nmeningitidis'],
  },
  { id: 'metronidazole', name: 'Metronidazole', familyId: 'nitroimidazole', germs: ['anaerobes'] },
]

// --- Legend footnote (kept verbatim from the chart) ------------------------

export const LEGEND = {
  disclaimer:
    'See github.com/aetherist/antibiogram for details. For educational purposes only. Consult your local antibiogram for clinical use.',
  abbreviations: [
    'TMP/SMX = Trimethoprim-sulfamethoxazole',
    'MRSA = Methicillin-resistant Staphylococcus aureus',
    'MSSA = Methicillin-sensitive Staphylococcus aureus',
    'ESCAPPM = Enterobacter spp., Serratia spp., Citrobacter freundii, Aeromonas spp., Proteus spp., Providencia spp. and Morganella morganii.',
  ],
}

// --- Lookup helpers --------------------------------------------------------

export const GERM_BY_ID: Record<string, Germ> = Object.fromEntries(GERMS.map((g) => [g.id, g]))
export const FAMILY_BY_ID: Record<string, Family> = Object.fromEntries(FAMILIES.map((f) => [f.id, f]))
export const ANTIBIOTIC_BY_ID: Record<string, Antibiotic> = Object.fromEntries(ANTIBIOTICS.map((a) => [a.id, a]))

/** Stable "row,col" cell key used by droppable ids and placement tracking. */
export function cellKey(familyId: string, germId: string): string {
  return `${familyId}::${germId}`
}
