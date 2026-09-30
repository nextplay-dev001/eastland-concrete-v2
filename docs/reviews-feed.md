# Eastland Concrete review feed

## Current state

The homepage Reviews section (`#reviews` in `index.html`) shows one static customer testimonial carried over from Eastland's current website. It is labeled **Customer testimonial**, not "Google review", and it is **not** live-synced with anything.

## Future behavior

Once Eastland's Google Business Profile is connected on the backend:

- new Google reviews are picked up automatically
- only 4-star and 5-star reviews are displayed
- if a review's rating changes, it is updated or removed on the next sync

The filtering and syncing belong on the server. The frontend also filters by rating as a safety net.

## Frontend hook

`script.js` checks for a global before loading reviews:

```html
<script>window.EASTLAND_REVIEWS_ENDPOINT = '/api/reviews';</script>
<script src="script.js" defer></script>
```

When the endpoint is set, the script fetches it and replaces the static card with the returned reviews. If the request fails, or nothing passes the rating filter, the static testimonial stays in place.

The minimum rating comes from `data-min-rating="4"` on `#reviewTrack`.

### Expected response

Either an array or `{ "reviews": [...] }`:

```json
[
  {
    "author": "Reviewer display name",
    "rating": 5,
    "text": "Review text",
    "relativeTime": "2 weeks ago",
    "avatar": "https://… (optional)",
    "url": "https://… link to the review (optional)",
    "source": "google"
  }
]
```

- `source: "google"` shows the Google "G" mark and a "Google review" label. Only send it for reviews that really came from Google.
- Review text is inserted with `textContent` (never as HTML).

### Carousel

- With one card, the prev/next controls stay hidden.
- With two or more, the track becomes a horizontal scroll-snap carousel with prev/next buttons, a `01 / 04` counter, and arrow-key support when the track is focused.

## Backend notes

- Cache reviews server-side. Don't call Google on every page view.
- Keep a record of each review's ID and rating so a rating change can remove a review that drops below 4 stars.
- Follow Google's attribution and display terms for Business Profile reviews.
- Keep the static testimonial as the no-JS fallback so there is always crawlable review text on the page.
