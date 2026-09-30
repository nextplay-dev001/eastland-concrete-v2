# Eastland Concrete V2 — UI Concept

Static, hosting-agnostic UI prototype for a redesigned Eastland Concrete website.

## Included
- Responsive homepage redesign
- Real Eastland project imagery from the supplied current-site material
- Service, project, review, service-area and lead-generation sections
- Mobile call/text/estimate action bar
- **Interactive 5-step quote wizard**:
  1. Project type
  2. Project location
  3. Scope, size and desired timeframe
  4. Mobile-friendly photo upload
  5. Contact information + request summary

The wizard is a frontend prototype only. It intentionally does **not** choose a hosting/email vendor yet. In production, the final submit action should POST to a secure server-side handler that sends a structured lead email to Eastland and handles photo attachments/links. That implementation can be selected after the current Buzzfish/domain/email/hosting setup is confirmed.

## Run locally
Open `index.html` directly, or serve this folder with any local static server.

## Current status
Concept / design prototype. Copy, service-area claims, service scope, reviews, contact destination and production integrations still require owner confirmation.
