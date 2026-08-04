# The Performance-to-Promotion Diagnostic™ — Discovery Call Edition

A static, self-contained web app (`index.html`, `styles.css`, `script.js`) built to run inside a single ~45-minute discovery call: participant info → situation → 15 rating statements (3 per dimension) → one combined results screen (score, top strength/barriers, live conversation prompts, 3 next steps) → a short client summary. No build step, no server, no external dependencies except two CDN libraries used only for the PDF export button.

## 1. Run it locally
Double-click `index.html`, or open it in any browser (File → Open). All three files must stay in the same folder — the app uses relative paths (`styles.css`, `script.js`).

## 2. Upload it to a website
Upload all three files to any static host at the same folder level:
- **Simple hosting**: drop the folder into your existing site's file manager (e.g. a subfolder like `/diagnostic/`).
- **Netlify / Vercel / GitHub Pages**: drag-and-drop the folder or push it as a repo; no build command is needed — it's plain HTML/CSS/JS.
- **Embedding**: to embed inside an existing page, host the three files somewhere and point an `<iframe src="...">` at `index.html`.

## 3. Change the questions
Open `script.js` and edit the `CONFIG.dimensions` array near the top:
- Each dimension has a `statements` array (3 rating items, kept short for time) and a `prompts` array (2 conversation prompts, shown only for your two lowest-scoring dimensions on the Results screen — visible to you when Facilitator mode is on).
- Add, remove, or reword items freely — the app auto-recalculates scoring based on however many statements exist per dimension. Adding statements back in will lengthen the call.
- `CONFIG.situationOptions` controls the Screen 3 multiple-choice list.
- `CONFIG.nextStepsBank` holds one action per dimension for the "3 Next Steps" list, plus `CONFIG.genericNextStep` as the fallback third step.

## 4. Change scoring thresholds
Still in `script.js`:
- `CONFIG.bands` controls the four interpretation bands (Strong / Inconsistent / Risk / Primary barrier). Edit the `min` values to change cutoffs.
- `recommendationTier()` controls the recommendation line on the Results screen (currently: 0 barriers below 65% + overall ≥75% → self-directed; 1–2 barriers → targeted support; 3+ barriers → full framework). Edit the thresholds inside that function, and the wording in `RECOMMENDATIONS`.

## 5. Update branding
All editable brand values are CSS variables at the top of `styles.css` under `:root`:
```
--color-primary     /* primary brand color */
--color-secondary   /* secondary brand color */
--color-accent      /* accent color */
--color-background  /* page background */
--color-text        /* body text color */
--font-heading      /* heading typeface */
--font-body         /* body typeface */
```
Logo, contact info, and links are placeholders in `index.html`:
- `#jms-logo` and `#jms-logo-summary` — set the `src` attribute to your logo file's URL.
- `#contactPlaceholder` — replace the text with your company contact info.
- `#schedulingLink`, `#privacyLink`, `#termsLink` — set the `href` attributes to your real URLs.

## 6. Connect it to a CRM or email platform later
This version stores everything in the browser's `localStorage` and does not transmit data anywhere. To connect it later:
1. Add a backend endpoint (serverless function, Zapier webhook, or your CRM's API).
2. In `script.js`, inside the `exportJson()` function (or a new function called on the Summary screen), `fetch()` the export object (`buildExportObject()`) to your endpoint.
3. Common targets: a Zapier/Make webhook that forwards to your CRM, or a direct API call to HubSpot/Salesforce/ActiveCampaign using their contact-creation endpoint.
4. Gate this behind the existing `emailConsent` checkbox so you only transmit data the participant agreed to share.

## 7. Securing participant data if a backend is added
- Serve the app over HTTPS only.
- Never expose CRM/API keys in client-side JavaScript — route submissions through a server-side function that holds the credentials.
- Validate and sanitize all fields server-side before storing them (the client-side validation in this app is a UX convenience, not a security boundary).
- If storing personally identifiable information in a database, encrypt at rest, restrict access by role, and define a retention/deletion policy consistent with your privacy statement.
- Update the in-app privacy statement (Screen 9) to accurately describe the new data flow before publishing.

GitHub Pages deployment enabled.
