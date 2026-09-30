# Eastland Concrete lead-capture behavior

## Goal

Do not lose a useful inquiry just because a visitor gets interrupted before finishing the estimate wizard.

## Lead states

- `draft`: browser-only draft before usable contact information exists
- `partial`: first name plus a valid phone number or email is available, but the wizard is not complete
- `complete`: visitor completed the estimate request

## Frontend behavior

1. Ask for project type.
2. Ask for contact information early.
3. Clearly disclose that Eastland may follow up if contact information is entered but the request is not completed.
4. After usable contact information exists, debounce background draft updates instead of sending on every keystroke.
5. Reuse one lead ID for the same wizard session.
6. Final completion updates the same lead ID rather than creating a duplicate.

The static GitHub Pages build does not send partial leads. It exposes a future hook through `window.EASTLAND_PARTIAL_LEAD_ENDPOINT`.

## Backend behavior

Recommended endpoint: `POST /api/leads/draft`

Example payload:

```json
{
  "leadId": "lead_abc123",
  "status": "partial",
  "source": "eastland-website",
  "capturedAt": "2026-09-30T21:30:00.000Z",
  "fields": {
    "projectType": "Driveway",
    "firstName": "John",
    "phone": "(913) 555-1234",
    "email": "john@example.com",
    "city": "Olathe"
  }
}
```

The backend should upsert by `leadId`, record the last activity time, and schedule one incomplete-lead notification after a short inactivity window such as 10–15 minutes.

## Partial email

Suggested subject:

`[PARTIAL LEAD] Eastland Website - Driveway - Olathe`

Suggested body sections:

- Status: Partial / customer did not finish
- Contact information
- Project type
- Location information captured
- Project details captured
- Missing information
- Lead ID
- Last activity time

The partial notification should be sent once per abandoned session, not once per draft update.

## Completion after a partial email

If the visitor later finishes:

1. update the same lead to `complete`
2. cancel any pending partial notification
3. send the normal `[NEW LEAD]` email
4. include the same lead ID so Tommy can tell it is the same person

## Privacy / UX

Do not silently capture contact information. The form should tell visitors that Eastland may follow up if they enter contact information and do not finish the request.

SMS follow-up should only be used when the visitor explicitly leaves the texting option enabled.

## Abuse protection for production

- server-side validation
- rate limiting
- bot protection / honeypot
- duplicate suppression
- size/type limits for uploads
- short-lived signed upload URLs
- audit logging for notification status
