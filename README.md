# Eastland Concrete V2

Working redesign and lead-generation prototype for Eastland Concrete.

## Current build

The repo now contains a hosting-agnostic static site that can be served by GitHub Pages for review.

Implemented:

- Responsive homepage
- Mobile navigation and fixed mobile Call / Text / Estimate actions
- Service architecture with dedicated pages for:
  - Foundations & footings
  - Driveways
  - Patios & outdoor concrete
  - Slabs & garage floors
  - Sidewalks & flatwork
  - Light commercial concrete
- Project-gallery structure
- About page
- Service-area strategy page
- Existing Eastland testimonial carried into the new design
- Interactive five-step estimate wizard
- Browser draft-saving for the wizard
- Test-mode email handoff to `info@eastlandconcretekc.com`
- LocalBusiness/HomeAndConstructionBusiness structured-data starter
- Social metadata starter
- GitHub Pages deployment workflow
- Development `noindex` protection and `robots.txt` block
- Custom 404 page

## Quote wizard

The test build collects:

1. Project type
2. City / ZIP / optional project address
3. New-vs-replacement, timing, approximate size and project details
4. Optional photo selection
5. Name, phone, email and permission to text

Because GitHub Pages is static, the temporary test submission opens a pre-filled email to Eastland. Browsers cannot automatically attach the selected project photos to a `mailto:` message.

For production, replace the email handoff with a secure server-side endpoint that:

- validates and rate-limits submissions
- stores/uploads project photos
- emails a formatted lead directly to Eastland
- optionally sends an SMS notification
- logs conversion events for analytics

## Project photos

The SVG project visuals in `assets/` are **development placeholders**, not claimed Eastland work. Replace them with real Eastland job photos before launch.

## Search / SEO status

The GitHub Pages build is intentionally blocked from indexing while it is a test site:

- all public pages include `noindex,nofollow`
- `robots.txt` disallows crawling

Remove those protections only when the production domain and final content are ready.

Service-area pages should only be created for cities Eastland confirms it actually serves. Do not generate duplicate city doorway pages.

## GitHub Pages

Deployment workflow:

`.github/workflows/pages.yml`

One-time repository setting required:

1. Repository **Settings**
2. **Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**

After that, pushes to `main` deploy automatically.

GitHub Pages works with public repos on GitHub Free; private-repository Pages requires an eligible GitHub plan. If this repo's plan does not support Pages while private, make the test repo public or use another temporary host.

Expected project-site URL after Pages is enabled:

`https://nextplay-dev001.github.io/eastland-concrete-v2/`

## Owner information still needed before production launch

- Exact service area
- Complete service list
- Services Eastland most wants to grow
- Foundation / excavation / tear-out / rebar / grading scope
- Years of experience / company history
- Licensing and insurance wording
- Warranty details, if any
- Builder / GC relationships
- Real completed-project photos and locations
- Additional customer reviews
- Final destination email for leads
- Whether the business number accepts text messages
- Permanent hosting choice
