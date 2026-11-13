# MEMORY / Cinematic story review

Nine episodes, six chapters, all 17 original semantic frames. Built from the approved oxygen control, existing anatomical plates and the shared-clock approach in `review/mechanisms/app.js`.

## Review

- `index.html`: complete story. Original images are reused by relative URL.
- `phone-review.html`: real story in a 390 × 844 iframe, with 320 × 640 and 430 × 932 alternatives. This checks responsive composition, not physical iPhone Safari behaviour.
- `../oxygen-control/index.html`: approved standalone episode remains available.

## Interaction

Native vertical scroll, nine stops. The story starts automatically and continues to the next episode without extra taps. The opening button only skips the initial hold. A persistent pause button remains accessible above the scene on short phone screens.

Scrolling briefly suspends the clock during the gesture and momentum, then continues from the episode the user chose. A swipe does not disable autoplay. Partially watched episodes resume from their retained time. Returning to a previously finished episode starts that episode again in the forward direction. Explicit pause remains paused across navigation. Comparison controls pause intentionally for inspection; one Resume continues the whole story.

The tab's hidden state and chapter dialog suspend playback without changing the user's play/pause choice. The final state stops without looping. Reduced-motion retains static states and manual navigation. No wheel or touch preventDefault is used.

## Source frame mapping

| Episode | Original frames | Mechanism |
| --- | --- | --- |
| 1 | 1 | Familiar question |
| 2 | 2–3 | Perception and attention |
| 3 | 4–5 | Association and recall |
| 4 | 6–7 | Blood supply and scale |
| 5 | 8 | Approved oxygen sequence, three states |
| 6 | 9–11 | Arteriole comparison and surrounding fibres |
| 7 | 12–14 | Myelin structure, signal, conditional B12 context |
| 8 | 15 | Different possible causes |
| 9 | 16–17 | Experience and shared decision |

## Medical boundaries

All images are educational. No patient data, diagnosis, medication change or promise of recovery. Comparison images are explicitly separate hypothetical states, not treatment or individual disease progression. Oxygen markers and electrical signal accents are visually different. Existing image geometry is not sufficient for quantitative anatomy or a physiological simulation. Final anatomy and medical copy require review by Юлия Олеговна.

Sources are linked in the story: NIH ODS B12, NIA memory and vascular cognition. The supplemental cause categories (sleep, emotional state, medicines, illnesses) follow NIA patient information. No single diagnosis is inferred from these categories.

## Publication boundary

Only `review-oxygen-20261113` is updated. Main, the existing published story and the Pages workflow remain unchanged. All changes are review material.


## Saved comparison builds

- Approved oxygen control: commit `f21c6e708cfac954056e995ad07bc9513e25125b`, `review/oxygen-control/index.html`.
- First complete story: commit `1f330e0614bcf71e64eaae18f35fd92bb1b14203`, `review/cinematic-story/index.html`.
- Continuous scrolling fix: current branch version.

All previous commits remain available; no history rewrite or main deployment.
