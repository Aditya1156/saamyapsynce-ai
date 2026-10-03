# Saamya Psynce AI — website

Static marketing site for **SAAMYAPSYNCE AI PRIVATE LIMITED** (CIN U62099KA2025PTC210927).

No build step, no dependencies, no framework. Plain HTML, CSS and JavaScript — upload the
contents of this folder and it runs.

---

## Files

```
index.html          Home — hero, capabilities, convergence thesis, industries, process
solutions.html      Six capabilities in depth (#ai #vision #ar #vr #agents #data)
industries.html     Six sectors (#manufacturing #healthcare #education #retail #logistics #energy)
about.html          Story, principles, leadership, corporate record
contact.html        Enquiry form and contact details
robots.txt          Search engine directives
sitemap.xml         Page index for search engines
assets/css/style.css   All styling (design tokens at the top)
assets/js/main.js      All behaviour (one module per feature)
assets/img/logo.svg    Brand mark
assets/img/favicon.svg Browser tab icon
assets/img/og-image.png  Social share card, 1200x630
assets/img/og-image.svg  Editable source for the card above
```

---

## Deploying to Hostinger

`saamyapsynce.com` is currently parked on Hostinger. To publish:

1. Sign in at **hpanel.hostinger.com**
2. Open **Files → File Manager**
3. Go into `public_html` and delete the existing parked placeholder files
4. Upload **everything inside this `site/` folder** — `index.html` must sit directly in
   `public_html`, not inside a subfolder
5. Keep the `assets/` folder structure exactly as it is

The site is live immediately. Make sure SSL is enabled under **Security → SSL**.

Any other static host works identically — Netlify, Vercel, GitHub Pages, Cloudflare Pages.

---

## Things you should change before going live

These are the only placeholders in the site.

**1. Email address.** The site uses `hello@saamyapsynce.com` throughout. Create that mailbox in
Hostinger (**Emails → Create**), or replace it everywhere with your real address:

```bash
# from inside this folder
grep -rl "hello@saamyapsynce.com" . | xargs sed -i '' 's/hello@saamyapsynce.com/YOUR@ADDRESS/g'
```

Note the MCA record shows your registered email begins with `A`, so you may already have a
mailbox you would rather use.

**2. Director biographies.** `about.html` lists both directors with a neutral, factual summary
only (name, title, appointment date). Replace the description paragraphs with real biographies,
and swap the monogram circles (`person__avatar`) for photographs when you have them.

**3. Contact form delivery.** The form currently validates and then opens the visitor's own email
client. To receive submissions properly, create a free form endpoint (Formspree, Web3Forms or a
Hostinger PHP script) and add it to the `<form>` tag in `contact.html`:

```html
<form class="form" data-contact-form data-endpoint="https://formspree.io/f/YOUR_ID" novalidate>
```

The JavaScript detects the attribute and switches to a background POST automatically.

**4. Phone number.** Not included anywhere, because none was on record. Add one to the contact
details block in `contact.html` if you want it public.

---

## Design system

The site uses a **monochrome Material glass** system. There is no chroma anywhere — hierarchy
is carried entirely by luminance, font weight and elevation.

**Two themes.** Dark and light, both monochrome. The toggle sits in the header. The choice is
saved to `localStorage`; visitors who have never chosen follow their operating system setting.
A small inline script in each `<head>` applies the theme before first paint, so there is no
flash of the wrong theme on load.

**Material foundations** in `assets/css/style.css`:

| Element | Implementation |
|---|---|
| Spacing | 8dp grid — `--sp-1` (4px) through `--sp-11` (96px) |
| Shape | `--r-xs` 4px → `--r-xl` 28px → `--r-full` pill |
| Elevation | 5 shadow levels, `--elev-1` … `--elev-5` |
| State layers | 8% hover, 12% focus, 16% pressed, on every interactive surface |
| Motion | Emphasized easing `cubic-bezier(0.2, 0, 0, 1)` |
| Ripple | Injected on press by `main.js` for buttons, tabs and the FAB |
| Text fields | Filled variant with floating labels and a growing focus indicator |
| FAB | Scroll-to-top, appears past 700px |

**Glass** is `background: var(--glass)` plus `backdrop-filter: blur(24px) saturate(150%)` and a
hairline border. Browsers without `backdrop-filter` fall back to solid surfaces automatically
via an `@supports` block — no broken transparency.

### Re-theming

Every value lives as a custom property at the top of the stylesheet, grouped per theme under
`:root[data-theme="dark"]` and `:root[data-theme="light"]`. The ones worth knowing:

```css
--bg            /* page canvas */
--surface-1..5  /* Material elevation overlays */
--glass         /* what sits over the blur */
--outline       /* hairline borders */
--on-surface    /* primary text (96% opacity) */
--accent        /* pure white in dark, near-black in light */
--canvas-ink    /* hero particle colour, as an "R, G, B" triplet */
```

If you ever want colour back, set `--accent` and `--sheen` to a brand hue — everything
downstream (buttons, focus rings, the active nav indicator, the FAB) follows automatically.
The original colour theme is kept at `assets/img/logo-color.svg` for the mark.

The logo ships white and is inverted by CSS in the light theme, so one file serves both.

**Note:** the header and footer are duplicated in each HTML file (there is no templating
engine). If you change a navigation link, change it in all five files.

## Accessibility and performance notes

- Every animation is disabled automatically under `prefers-reduced-motion`, including the hero
  canvas (which falls back to a single static frame) and the Material ripple.
- The hero canvas pauses when the browser tab is hidden.
- Full keyboard navigation, including arrow-key support on the industry tabs and a skip link.
- Text contrast meets WCAG AA in both the light and dark themes.
- Form errors are signalled by a weight change plus an "!" glyph, not colour — the palette has
  no red to signal with, so the cue works for colour-blind visitors by construction.
- Structured data (`Organization` schema) is embedded in `index.html` so search engines
  associate the correct company name, CIN and registered address.

---

## One correction worth recording

The brief described the company as public. The MCA record lists SAAMYAPSYNCE AI PRIVATE LIMITED
as an **unlisted private company limited by shares**. The site therefore describes it accurately
as a private limited company — stating otherwise in the footer of a public website would be a
misrepresentation of a registered entity. Everything else from the record (CIN, incorporation
date, registered address, both directors, RoC) is reproduced exactly.
