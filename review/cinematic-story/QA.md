# MEMORY / Review validation

Build: `1f330e0614bcf71e64eaae18f35fd92bb1b14203`.

- JavaScript syntax checked with `node --check`.
- All 17 source frames occur exactly once in the nine-episode mapping.
- Finite timelines total 179 seconds (including opening hold).
- Live Chromium walkthrough reached episode 9, progress 20, and stopped on its final state.
- All 12 rendered image elements (including reused and comparison plates) finished loading.
- Pause retained the same elapsed time across observations. Switching the vessel comparison returned to its initial image and held the frame.
- Chapter navigation opened the selected nerve chapter.
- Responsive composition inspected in an iframe at 390 × 844, with checks at 320 × 640 and 430 × 932. No horizontal document overflow observed at the narrow setting. Short screens use a minimum scene height so controls remain reachable by native scroll.
- Initial scroll anchoring and visible image edges on mobile were corrected.
- Myelin comparison uses a fixed camera for both comparison images; signal camera path was adjusted for narrow screens.
- No page-origin JavaScript errors observed. Browser-extension metadata warnings are unrelated to the application.

Not verified: physical iPhone Safari, device performance, VoiceOver and a full assistive-technology pass. Reduced-motion logic was implemented and source-reviewed; it was not emulated in the remote browser. Medical and anatomical approval remains with Юлия Олеговна.

`qa-mobile.jpg` is a real Chromium screenshot of the vascular episode in the phone review frame. It is not generated artwork or a physical-device capture.
