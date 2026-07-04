# Antibiogram dataset (reference copy)

Pixel-verified extraction from `references/antibiogram.jpg` (the aetherist/antibiogram chart).
This is the human-readable reference; the machine source of truth is
[`src/data/antibiogram.ts`](../src/data/antibiogram.ts). A Vitest integrity test keeps them
consistent (24 antibiotics, valid family/germ ids).

Structure: **germs = columns** (grouped by category), **antibiotic families = rows**. An
antibiotic's correct cells = { its family row × each covered germ }.

## Germ columns (12), grouped

| Group | Header color | Germs |
|---|---|---|
| Gram-positive cocci | `#3a5eba` (blue) | MRSA, MSSA, Streptococci |
| Gram-negative bacilli | `#b00000` (red) | E. coli, P. mirabilis, Klebsiella, Pseudomonas, ESCAPPM |
| Gram-negative cocci | `#7a4380` (purple) | N. gonorrhoeae, N. meningitidis |
| Anaerobes | `#6b5410` (olive) | Anaerobes |
| Atypicals | `#6e6e6e` (gray) | Atypicals (e.g. Mycoplasma) |

## Antibiotic families (rows) → antibiotics → germ coverage

| # | Family (row) | Antibiotic | Covers |
|---|---|---|---|
| 1 | Penicillin | Penicillin G | Strep |
| 2 | Anti-staphylococcal penicillins | Nafcillin/Oxacillin | MSSA, Strep |
| 3 | Aminopenicillins | Ampicillin/Amoxicillin | Strep, E.coli, P.mirabilis, N.meningitidis |
| 4 | 1st-gen cephalosporin | Cefazolin, cephalexin | MSSA, Strep, E.coli, P.mirabilis, Klebsiella |
| 5 | 2nd-gen cephalosporin | Cefotetan, Cefoxitin | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, Anaerobes |
| 6 | 3rd-gen cephalosporin | Ceftriaxone | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, ESCAPPM, N.gonorrhoeae, N.meningitidis |
| 6 | 3rd-gen cephalosporin | Ceftazidime | Strep, E.coli, P.mirabilis, Klebsiella, Pseudomonas |
| 7 | 4th-gen cephalosporin | Cefepime | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, Pseudomonas, ESCAPPM, N.gonorrhoeae, N.meningitidis |
| 8 | Aminopenicillins + β-lactamase inhibitors | Amoxicillin-clavulanate (Augmentin) | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, Anaerobes |
| 8 | Aminopenicillins + β-lactamase inhibitors | Ampicillin-sulbactam (Unasyn) | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, Anaerobes |
| 8 | Aminopenicillins + β-lactamase inhibitors | Piperacillin-tazobactam (Zosyn) | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, Pseudomonas, ESCAPPM, N.meningitidis, Anaerobes |
| 9 | Carbapenems | Ertapenem | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, ESCAPPM, N.gonorrhoeae, N.meningitidis, Anaerobes |
| 9 | Carbapenems | Imipenem, Meropenem | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, Pseudomonas, ESCAPPM, N.gonorrhoeae, N.meningitidis, Anaerobes |
| 10 | Monobactams | Aztreonam | E.coli, P.mirabilis, Klebsiella, Pseudomonas, ESCAPPM, N.gonorrhoeae, N.meningitidis |
| 11 | Quinolones | Ciprofloxacin | MSSA, E.coli, P.mirabilis, Klebsiella, Pseudomonas, ESCAPPM, N.gonorrhoeae, N.meningitidis |
| 11 | Quinolones | Levofloxacin | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, Pseudomonas, ESCAPPM, N.gonorrhoeae, N.meningitidis, Atypicals |
| 11 | Quinolones | Moxifloxacin | MSSA, Strep, E.coli, P.mirabilis, Klebsiella, ESCAPPM, N.gonorrhoeae, N.meningitidis, Anaerobes, Atypicals |
| 12 | Aminoglycosides | Gentamicin/Tobramycin/Amikacin | E.coli, P.mirabilis, Klebsiella, Pseudomonas, ESCAPPM |
| 13 | Lincosamide | Clindamycin | MRSA, MSSA, Strep, Anaerobes |
| 14 | Macrolides | Azithromycin | MSSA, Strep, N.meningitidis, Atypicals |
| 15 | Tetracyclines | Doxycycline | Strep, E.coli, N.meningitidis, Atypicals |
| 16 | Glycopeptides | Vancomycin | MRSA, MSSA, Strep |
| 17 | Antimetabolite | TMP/SMX (Bactrim) | MRSA, MSSA, Strep, E.coli, P.mirabilis, Klebsiella, ESCAPPM, N.meningitidis |
| 18 | Nitroimidazoles | Metronidazole | Anaerobes |

**24 antibiotics total.** Teaching contrasts preserved exactly: Ertapenem misses Pseudomonas
(other carbapenems don't); Ceftriaxone / Moxifloxacin / TMP-SMX miss Pseudomonas; Aztreonam is
gram-negative only; Vancomycin is gram-positive only; Metronidazole is anaerobe only.

## Cell fill colors (per antibiotic class)

| Family | Fill hex |
|---|---|
| Penicillin / Anti-staph pen. / Aminopenicillins | `#c9c9c9` |
| 1st- & 2nd-gen cephalosporin | `#e3e3e3` |
| 3rd- & 4th-gen cephalosporin | `#efefef` |
| Aminopenicillins + β-lactamase inhibitors | `#cfd9ed` |
| Carbapenems | `#f6ddcd` |
| Monobactams | `#fddf84` |
| Quinolones | `#dcebd1` |
| Aminoglycosides | `#fdc37f` |
| Lincosamide | `#b7fef7` |
| Macrolides | `#fdefbd` |
| Tetracyclines | `#fab4c5` |
| Glycopeptides | `#a5b8e2` |
| Antimetabolite | `#bcdaa4` |
| Nitroimidazoles | `#caa753` |

## Legend footnote (verbatim from chart)

> See github.com/aetherist/antibiogram for details. For educational purposes only. Consult your
> local antibiogram for clinical use.
>
> TMP/SMX = Trimethoprim-sulfamethoxazole, MRSA = Methicillin-resistant Staphylococcus aureus,
> MSSA = Methicillin-sensitive Staphylococcus aureus, ESCAPPM = Enterobacter spp., Serratia spp.,
> Citrobacter freundii, Aeromonas spp., Proteus spp., Providencia spp. and Morganella morganii.
