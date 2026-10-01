# Builders focused website

This separate SmartHome Cairns website is for home builders. Its purpose is to introduce smart-home technology as a buyer option and invite builders to discuss a project or partnership.

Live: https://saro8998.github.io/smarthome/builders/

The **customer focused** website remains at https://saro8998.github.io/smarthome/redesign/. The root site and original feature-selection page remain separate.

## Design and behaviour

- Architectural hero photography, navy and soft lime palette, short builder-oriented copy.
- Buyer benefits, four eight-second concept demos and a captioned 32-second tour.
- Three illustrative upgrade scopes; selecting one sets the enquiry’s interest field.
- A planning-to-handover process, a display-home invitation and builder FAQs.
- Independent, responsive HTML/CSS/JavaScript with accessible navigation and a native video dialog.
- Videos only load and play after a visitor requests them. Playback pauses when another video starts, when the page becomes hidden or when a demo leaves the viewport.
- Enquiries use the existing Formspree endpoint `https://formspree.io/f/xjgqbbdq`, with a builder-specific subject and source field. No personal data is stored in the browser.

`preview.html` is a noindex responsive review page, separate from the public website.

The upgrade levels are proposed scopes, not fixed-price products. Responsibilities, compatible devices, costs and ongoing support are agreed per project. The site makes no claim of existing builder partnerships, sales results or completed projects.

Media sources: [MEDIA-CREDITS.md](MEDIA-CREDITS.md).

## Validation

Verified on 1 October 2026:

- JavaScript syntax and all local media, SVG references, anchors, image alternatives and form labels pass checks.
- Live desktop page reviewed at 1348px; tablet and mobile previews reviewed at 805px and 375px. No horizontal overflow.
- All eight images load. All four demos and the 32-second tour play, one video at a time. The tour pauses on close and returns focus to its trigger.
- Mobile navigation opens and closes. The phone-sized tour dialog fits the viewport. Builder FAQ disclosures expand.
- Selecting Whole-home Vision on desktop and Connected Comfort on mobile carries the option into the enquiry. Required name, company and email fields retain native validation.
- The homeowner link opens the separate customer focused website.

No test enquiry was submitted. Delivery through the existing Formspree account has not been tested in this update.
