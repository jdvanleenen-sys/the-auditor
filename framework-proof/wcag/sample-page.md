---
id: sample-page
title: "Sample page — the artifact this cartridge audits"
note: "Synthetic. A short property-listing page component, written to carry a spread of PASS and FAIL lines across the six WCAG 2.1 criteria this cartridge checks, mirroring how sample-listing.md works for the fair-housing cartridge."
---

# Listing detail page — accessibility-relevant markup

**L1.** `<img src="hero.jpg">` — the page's main hero photo of the property, no `alt` attribute at all.

**L2.** `<img src="floor-plan.jpg" alt="Floor plan of the 2-bedroom unit showing kitchen, living room, and both bedrooms">` — the floor plan image.

**L3.** Body copy under the photo gallery is rendered in `#999999` text on a `#FFFFFF` background. Measured contrast ratio: 2.85:1. Text is normal body size (16px), not large-scale text.

**L4.** `<input type="text" name="email" placeholder="Email">` — the "notify me" signup field. No `<label>` element, no `aria-label`, no `aria-labelledby`. The placeholder text disappears once the user starts typing.

**L5.** `<label for="phone">Phone number</label><input type="text" id="phone" name="phone">` — the callback-request field, properly associated via matching `for`/`id`.

**L6.** `<a href="/brochure.pdf">Click here</a>` to download more information about the property.

**L7.** `<a href="/brochure.pdf">Download the full property brochure (PDF)</a>` — same destination as L6, different link text.

**L8.** `<button type="submit">Schedule a showing</button>` — the form's submit control.
