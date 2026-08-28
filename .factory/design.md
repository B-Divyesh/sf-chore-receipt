# Chore Receipt visual thesis

## Direction: paper-cut diorama

Chore Receipt should feel like a small shared household board made from useful
paper objects, not a productivity dashboard. The interface layers cut-paper
shadows, clipped receipt edges, and calm domestic colors so a completed chore
reads as a neutral record. The work is foregrounded; people are not scored.

## Tokens

| Role | Token | Value |
| --- | --- | --- |
| Background | `--paper` | `#F7F1E5` |
| Raised paper | `--surface` | `#FFFDF8` |
| Ink | `--ink` | `#24302B` |
| Muted ink | `--muted` | `#5A645D` |
| Moss accent | `--moss` | `#236B52` |
| Moss light | `--moss-pale` | `#DDEDE1` |
| Clay accent | `--clay` | `#C75038` |
| Sun paper | `--sun` | `#EBC65B` |
| Error | `--danger` | `#A42E25` |

The page is deliberately single-mode: warm paper is part of its receipt-board
world. Every text pairing meets a 4.5:1 contrast target.

## Type, spacing, and shape

The display face is a local system serif (`Georgia`) for the human record; the
body is the system sans stack (`Inter` where installed, then Arial). This keeps
the app fast and readable without remote fonts. The 8px spacing scale uses
large 24–48px gutters and compact 8–16px receipt details. Cards have subtly
irregular clipped corners and layered, offset paper shadows. Buttons are solid
ink or moss paper pieces, with 44px minimum targets.

## Motion

Completing a chore presses its paper slip down for 180ms, then places a dated
receipt above the history list. This shows continuity instead of celebration.
When reduced motion is requested, the receipt appears instantly with an opacity
change only. No looping motion is used.

## Art plan and provenance

Hero art is one original paper-cut household diorama: a sink, cloth, plants,
and a clipped completion receipt, made with layered card stock. It sits beside
the landing copy and becomes an explanatory scene, never text. Prompt sheet:

- Subject/world: shared kitchen cleaning moment represented by objects only
- Materials: cut matte card stock, torn receipt paper, soft paper grain
- Light/lens: soft overhead studio light, shallow orthographic tabletop scene
- Palette words: warm cream, moss green, terracotta, muted mustard, charcoal
- Negative: no people, no text, no watermark, no logos, no brands, no UI

Asset provenance: generated with the Factory Azure image model on 2026-08-28.
Its provenance is recorded here; the product does not make an untestable
visitor-facing originality claim.
