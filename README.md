# Mohammed Aashiq — freelance developer portfolio

React + Vite + Motion + Lucide. Updated resume, project content, animated sections, and freelance enquiry form. Native cursor only.

## Orange grid redesign

White is the default theme; the header sun/moon control switches themes and remembers the selection. Both themes use the supplied orange (#FF5330), neutral surfaces, and architectural grid lines. The supplied MD logo appears in the header, loader, and browser favicon. Theme tokens are in src/style.css; the theme control is in src/main.jsx.

The source and a fresh production dist are included. Run npm ci before developing; node_modules is intentionally excluded. The existing email form requires your server-side Resend configuration; mail delivery is not enabled automatically.

## Run locally

Use Node.js 20 or newer.

```
npm ci
npm run dev
```

Vite serves the frontend only. To test the email function locally, set server variables in `.env` (see `.env.example`) and run `npx netlify-cli dev` instead. Never commit `.env` or place the API key in a `VITE_` variable.

## Deploy on Netlify with working email

1. Upload this source folder to your Git repository and connect it to Netlify.
2. Build command: `npm run build`. Publish directory: `dist`. The included `netlify.toml` configures the function.
3. In Resend, verify your sending domain and create an API key with email sending permission.
4. In Netlify project environment variables, add:
   - `RESEND_API_KEY`: your Resend API key.
   - `RESEND_FROM_EMAIL`: a verified sender, for example `Aashiq Portfolio <hello@your-verified-domain.com>`.
5. Deploy again, submit a real enquiry, and confirm receipt in `aashiqmustak5969@gmail.com`.

Every request goes to that fixed owner address. Reply-To is the client's email. The form collects name, email, optional company, service, optional budget/timeline, and project description. It includes server validation, request-size limits, an origin check, a honeypot, and Netlify function rate-limit configuration. Resend success means accepted for sending, not proof of inbox delivery. Delivery still depends on correct Resend credentials/domain verification and provider delivery status.

**A manual upload of only `dist` is frontend-only and does not deploy the email function. Deploy the full source with Netlify's build pipeline to enable the form.** Missing credentials return an honest error with a direct-email fallback. No key is included in this ZIP and live email delivery has not been tested.

## Update content

- Edit `src/data.js` for resume-derived content.
- Edit `src/EnquiryForm.jsx` for form presentation.
- Replace `public/Mohammed-Aashiq-Resume.pdf` with your next resume.
- Project visuals are conceptual illustrations, not application screenshots.
- ZARNEX-VOICE's supplied URL is retained as `unavailableLive` in content data because it returned HTTP 503 during verification. Rename to `live` when restored.

## Checks

`npm test` runs email-routing and validation tests with a mocked Resend transport; it sends no real email.
`npm run build` produces the frontend in `dist`.

`worker/` and `scripts/build-site.mjs` provide the equivalent server endpoint for the separate ChatGPT Sites deployment; the Netlify build does not need them or the Sites hosting manifest.

This is a standalone React redesign. The original Netlify source repository was not supplied, so this does not claim to preserve its original component structure.
