# SmartHome Cairns — Customer-Focused V2

Website: https://saro8998.github.io/smarthome/customer-v2/

Independent customer website with live lighting and photographic curtain controls, coordinated scene presets, service imagery, videos and the existing validated Formspree enquiry form. Existing root, customer V1 (`redesign/`) and builders (`builders/`) websites are unchanged.

`index.html`, `assets/`, `media/` and `favicon.svg` are the ready-to-serve GitHub Pages website. Editable React/TypeScript source is in `source/`.

## Rebuild

Use Node 22.13+:

```sh
cd customer-v2/source
npm install
npm run build
```

The build updates the static files in `customer-v2/` and keeps the source and media. The configured base path is `/smarthome/customer-v2/`. No server is required. Formspree handles the existing enquiry destination; no live test enquiry was submitted.

Media origins and the imagegen curtain edit are documented in MEDIA-CREDITS.md. Demo controls do not operate real devices. Optional browser WebMCP tools are feature-detected.
