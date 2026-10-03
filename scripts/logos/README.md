# Vendor marks

The four plates in `diagrams/integration.svg` carry the real marks of the
systems they name. **This repository does not draw them, and must not.**
Approximating a trademark from memory produces a wrong mark — which looks
amateur exactly where the drawing is trying to look real, and is the one thing
every brand guideline forbids outright.

So they are build inputs. Drop a file in here and it is picked up on the next
`npm run gen:diagrams`.

| File             | System         | Source                                                                 |
| ---------------- | -------------- | ---------------------------------------------------------------------- |
| `hubspot.svg`    | HubSpot        | `hubspot.com/hubfs/HubSpot_Logos/HSLogo_color.svg` — the full lockup   |
| `salesforce.svg` | Salesforce     | Brand Central, `brand.salesforce.com/brand/logo` — the cloud           |
| `slack.svg`      | Slack          | Media Kit, `slack.com/media-kit`, served from `a.slack-edge.com`       |
| `meta.svg`       | Meta Graph API | **Not present.** See below; that plate falls back to its name in type. |

**Meta is outstanding, and could not be fetched.** `about.meta.com`,
`meta.com` and `developers.facebook.com` all serve nothing to a non-browser
client, so that mark has to be taken from Meta's brand resource centre by hand
in a browser. Do not substitute one from an icon pack to close the gap — see
the rule above.

Take each from the vendor's own brand page, not from an icon pack — packs
redraw marks and are frequently out of date, which defeats the entire point.

**A missing file is not an error.** That plate falls back to its name set in
mono, which is what the drawing did before this existed and is still correct.
So the site builds on a clean checkout with this folder empty.

## What happens to a file

`loadMarks()` in `scripts/generate-diagrams.mjs` reads the `viewBox`, strips
every paint attribute (`fill`, `stroke`, `style`, `class`, the opacities, and
any `<style>` block) and inlines the geometry into the plate, where the drawing
tones it in a single colour. `fill-rule` and `clip-rule` survive, so a mark
with a hole in it stays holed.

Two consequences worth knowing:

- **One colour, by design.** Four brand palettes dropped into a metal line
  drawing read as four stickers. One-colour is also the usage every one of
  these vendors explicitly permits.
- **Flatten anything exotic before it goes in.** A mark that paints itself
  through a `<style>` block, a gradient or a `<use>` reference will come out
  wrong. Fix it in the file here rather than teaching the loader to parse CSS.

## Before adding one

Check the vendor's guidelines for how the mark may be used to indicate an
integration — minimum clear space, minimum size, and whether the glyph may be
used without the wordmark. See
`docs/adr/0008-third-party-marks-in-the-schematics.md`.
