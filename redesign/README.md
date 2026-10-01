# SmartHome Cairns redesign

Live review: https://saro8998.github.io/smarthome/redesign/

A responsive, dependency-free static website. The original homepage remains at the repository root. The redesign is marked `noindex` until it becomes the main homepage.

## Visual experience

- A 32-second home tour opens from the hero, combining four existing demonstrations with short on-screen captions. It is intentionally silent and downloads only when played.
- All four eight-second demos appear in a visible two-column gallery, stacking on smaller screens. Each has a poster, native playback controls, a direct link, an error fallback and an add-to-plan button.
- Six photo-led service cards use short benefit captions. Four offer direct playback links to their matching demonstrations.
- Ten illustrated feature choices feed one shared wish list, alongside the service cards and videos. The wish list persists between visits and carries into the enquiry form.
- Five additional photos are stored locally. Their authors, source pages and licence are documented in [MEDIA-CREDITS.md](MEDIA-CREDITS.md). Existing large PNGs have web-optimised copies for the redesign.
- Images below the hero load lazily. Videos do not autoplay or preload on page load. Playing a clip pauses any other clip; gallery clips pause when scrolled out of view. Closing the tour or hiding the page pauses playback.

The media illustrates possible setups; it is not represented as a portfolio of completed installations or a guarantee of device compatibility.

## Files

- `index.html`: page content, picture tiles, videos, native tour dialog and enquiry form.
- `styles.css`: base design, responsive layout and accessibility styles.
- `visual.css`: image-led cards, video gallery and tour dialog.
- `app.js`: scene controls, playback, menu, shared wish list and enquiry handling.
- `assets/`: local images, original demo posters and the captioned home tour.
- `scripts/build-tour.py`: reproducible tour build from the existing root clips (requires ffmpeg).
- `preview.html`: separate mobile, tablet and desktop review frame.

## Wish list and enquiries

Motion lighting, smart switches, smart door lock, doorbell camera, AC control, garage control, good night routine, robot vacuum, laundry notification and movie mode are preserved from the earlier feature-selection page. AC control uses the existing `Climate control` key, and repeated choices share one selection set.

The form uses the existing Formspree endpoint `https://formspree.io/f/xjgqbbdq`. The complete wish list and package use the `selected_features` and `selected_package` fields. Only non-personal selections are saved locally; contact details are not. Submission errors preserve entered details. The form also supports standard HTML POST without JavaScript. No live enquiry has been sent during testing, so inbox delivery is unverified.

## Local review and publishing

From the repository root, run `python -m http.server 8080` and open `http://localhost:8080/redesign/`. GitHub Pages publishes the redesign folder alongside the original homepage. No new hosting service or build step is needed. To adopt it as the main homepage later, update asset paths and remove `noindex`.

## Verification

Static checks confirm unique IDs, valid internal links and local media paths, ten detailed choices and valid JavaScript. The prior builder integration was browser-checked for selection, removal, clearing, saved package restoration and layout at mobile and tablet widths. The visual update receives its own browser check before handover.
