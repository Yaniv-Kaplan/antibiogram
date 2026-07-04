# Future work

Ideas parked for later (not built yet).

## Integrating the legend/footnote into gameplay

The footnote currently just defines abbreviations (ESCAPPM members, MRSA/MSSA, TMP/SMX). It's kept
verbatim in `Legend.tsx` for now. Ways to weave it into the experience:

1. **Header tooltips** — hover/tap a column header to reveal its meaning: `ESCAPPM` → *Enterobacter,
   Serratia, Citrobacter freundii, Aeromonas, Proteus, Providencia, Morganella*; `MRSA`/`MSSA` → full
   names; `Atypicals` → e.g. Mycoplasma. The data already carries `Germ.fullName`.
2. **Micro-quiz interstitials** — occasionally ask "Which organisms make up ESCAPPM?" as a bonus round,
   scored separately, using the footnote as the answer key.
3. **Progressive disclosure** — start with names expanded, then collapse to acronyms as the player
   improves, turning the legend into a spaced-repetition aid.

## Memory aids (from _iteration.md, explicitly deferred)

- Mnemonics per family/coverage pattern, surfaced contextually (e.g. after a repeated miss on a
  given antibiotic, offer its mnemonic).
- Pattern hints in the mistake log ("you keep missing that Pseudomonas is only covered by …").
