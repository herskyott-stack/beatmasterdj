# Add Pricing, Web Design, and Admin Access

## What will change
- Add a mobile-friendly **Ottawa Wedding DJ Pricing Guide 2026** page at `/pricing-guide` using the supplied copy, pricing ranges, checklist, questions, and booking call-to-action.
- Add a mobile-friendly **Web Design** services page at `/web-design` with the supplied packages, add-ons, process, proof statement, phone number, and consultation call-to-action.
- Add both public pages to the site navigation.
- Show an **Admin Portal** item inside the website’s dropdown only when the signed-in account has an authorized admin role.
- Keep GitHub separate from the website dropdown. The project-wide GitHub connection will use Lovable’s general project connection flow, which can then be repeated for your other projects.

## Email capture behavior
- Validate name and email on the pricing-guide form.
- Submit the lead through the site’s existing email/form approach.
- Show: “Check your inbox — the guide is on its way.” after successful submission.
- Clearly report a failed submission so no lead appears successful when it was not delivered.

## Technical details
- Register both routes in the existing route list and reuse the current header, footer, buttons, form fields, typography, and visual tokens.
- Use the existing secure role check for Admin Portal visibility; never expose admin access based only on a visible link.
- Preserve the current black, laser-cyan, ultraviolet stage-production visual system rather than introducing the amber theme suggested in the uploaded draft.
- Verify both pages and the mobile dropdown at phone and desktop sizes.

## GitHub connection
- After the website changes, provide the direct Lovable steps for connecting this project to GitHub. GitHub connections are configured per Lovable project; there is no safe single website link that automatically connects every project at once.
