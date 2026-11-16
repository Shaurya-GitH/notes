---
title: Adding project photos, videos and writing
---

How to give a Shipped project its own page with photos, demo videos and a write-up. Everything is
front matter in one Markdown file plus media files in one folder; no code changes.

## Where things go

| What                                  | Where                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------- |
| The project page                      | `content/shipped/<slug>.md` (copy `content/shipped/case-study-template.md`) |
| Its photos, videos, posters, captions | `quartz/static/shipped/<slug>/`                                             |
| The card on the Shipped page          | `content/shipped.md`, under `shipped.projects`                              |

`<slug>` is a short lowercase name with hyphens, e.g. `shopping-assistant`. It is in the page's URL
(`/shipped/shopping-assistant`) and in every media path, so use generic names: never a client's
internal project name.

Every media path in front matter is written **from `quartz/static/shipped/`**, e.g.
`shopping-assistant/hero.webp`. A full `https://` URL also works.

## Front matter

All fields are optional: only what is there renders. A page with only a title and a gallery is fine.

```yaml
---
draft: true # remove this line to publish; drafts never build
layout: case-study
title: Shopping assistant
kind: At work
period: Sep – Nov 2026
outcome: "A shopping assistant that answers from the store's own data" # the h1
lead: One sentence: who it was for, what changed for them, and how.
description: One sentence for search results and link previews.

# the card thumbnail (inside its painted frame) and the hero at the top of the page
cover:
  src: shopping-assistant/hero.webp
  alt: The assistant's answer card beside a product page

# a grid of pictures; clicking one opens it full size (arrow keys step, Esc closes)
gallery:
  - src: shopping-assistant/answer-card.webp
    alt: An answer card listing what is in the box
    caption: Box contents come from the catalogue, not the model.
  - src: shopping-assistant/voice.webp
    alt: The voice mode listening, with its live transcript
    caption: Voice mode.

# demo videos; they never autoplay, and turning motion off pauses one that is playing
video:
  - src: shopping-assistant/demo.mp4
    poster: shopping-assistant/demo.jpg
    captions: shopping-assistant/demo.vtt # optional WebVTT subtitles
    title: Asking about a product by voice
    duration: "0:48"

tldr: { part: …, team: …, when: …, stack: …, result: … }
problem: A claim naming the problem # heading over the Markdown body below
decisions:
  - { chose: …, rejected: …, because: … }
results:
  - { n: …, basis: … }
differently: …
links:
  - { text: Read the pull request, href: https://github.com/… }
---

The body is the problem section: what was broken or missing, for whom, and how we knew.
```

The written sections follow `content/shipped/case-study-template.md` and the copy rules: plain,
specific, checkable; every number with its basis; team work credited as team work.

## Linking the card to the page

In `content/shipped.md`, give the project's card `caseStudy: shipped/<slug>`. The card then shows
"Case study →" and uses the page's `cover`, but only once the page builds (no `draft: true`). While
it is a draft, the card keeps its painting and its own link.

A card without a page can still show a photo: give the card its own `cover` (same `src`/`alt` shape).
A card with neither keeps its painting. Nothing renders for a missing field, so there are never empty
boxes.

## Preparing photos

- Export screenshots or photos as **WebP** (or JPEG), about **1600 px wide**, under ~400 KB each.
  `cwebp -q 82 -resize 1600 0 in.png -o out.webp` does it.
- The page never crops a picture: the hero (16:9) and the gallery tiles (3:2) letterbox anything
  else. The card thumbnail is the exception: it fills the frame and keeps the **top** of the picture,
  so a landscape cover with the important part near the top works best.
- Write `alt` as what the picture shows; put what it proves in `caption`.
- Never use pictures from behind a login or that show customer data.

## Preparing videos

Keep each demo short, under ~10 MB. Re-encode a screen recording to 1080p H.264 (with sound) or a
silent one (`-an` drops the audio):

```sh
ffmpeg -i recording.mov -vf "scale=-2:'min(1080,ih)'" -c:v libx264 -preset slow -crf 26 \
  -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k demo.mp4
```

If the file is still over ~10 MB, raise `-crf` (28, 30) or trim it with `-ss 0:05 -to 0:50`.

Make the poster (the still shown before play) from a frame a few seconds in:

```sh
ffmpeg -ss 3 -i demo.mp4 -frames:v 1 -q:v 3 demo.jpg
```

Subtitles are an optional WebVTT file (`demo.vtt`) next to the video; they help anyone watching
with the sound off.

## Check before publishing

Remove `draft: true`, run `npx quartz build --serve --port 8123`, and open `/shipped` and the page:
the card shows the cover and "Case study →", the gallery opens and steps with the arrow keys, and
the video plays only when clicked.
