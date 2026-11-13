# Continuous playback / scroll verification

Build: `a4860a790e8cfe7ed0da1c17c6ea9516a510318b`.

Verified in the live raw.githack build using Chrome and a same-origin phone viewport harness. This is not a physical iPhone/Safari test.

Observed checks:

- Opening the page advances from episode 1 to episode 2 without pressing Start.
- Native wheel scrolling forward selects another episode and playback continues.
- Scrolling back to a completed episode restarts it in the forward direction and it continues automatically.
- Explicit Pause stops the active clock. Moving to the oxygen episode while paused retains Pause and time 0.
- Resume advances all three oxygen states and automatically enters episode 6 without another tap.
- At 320 × 640 the persistent top Pause control stays visible even when the lower controls lie below the viewport.
- Selecting Nerve fibres from the chapter menu enters episode 7 and resumes playback automatically.
- The phone viewport then advances through episodes 8 and 9 without further interaction and ends at 20 seconds with playback `complete` and the button `Завершено`.
- `node --check review/cinematic-story/story.js` passes.
- No application-origin JavaScript errors were observed. Browser extension metadata errors were excluded.

The approved oxygen artwork, animation and medical copy are preserved. The modification concerns playback intent, native scrolling, chapter navigation and pause access. Main and prior review builds remain unchanged.

Screenshot: `qa-scroll-mobile.jpg`. Main was verified at `8be58b9948ddf31f01fe6483e9f100d18d8dce03` after this change.
