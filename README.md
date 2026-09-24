# 🐠 Happy Birthday Sheetal — "Nemo" Birthday Site

A single-page, mobile-first birthday surprise website built with **vanilla HTML/CSS/JS** and CDN libraries (GSAP, Matter.js, canvas-confetti, Swiper). No build step — it runs by simply opening `index.html` or deploying the folder as static files.

## Run locally
Just open `SSM/index.html` in any browser, or serve it:

```bash
cd SSM
npx serve .
# or
python3 -m http.server 8000
```

> Tip: some browsers restrict Google Fonts on `file://` — serving locally or deploying avoids that.

## The 8 scenes
1. **Landing** — flowers fly in; PIN lock asks *"Kitne cupcakes the?"* — accepts `2`, `02`, or `0002`
2. **Gift box** — tap/unwrap → burst animation
3. **Bow & arrow** — the bow auto-aims at the heart; pull back anywhere and release to fire (Matter.js physics) → heart explodes → *"Happy Birthday Sheetal"*
4. **Growing tree** — heart-shaped leaves sprout into a full canopy + birthday wish text
5. **Cake** — pink tiers with drip frosting stack up, candle drops in with a glowing flame; tap to dim the room and blow it out
6. **Memory Lane** — Swiper carousel of your photos
7. **The Letter** — full letter, scrollable, with **8 hidden phrases**: words of each phrase are scattered across the letter but share one color (e.g. coral = YOU ARE MY MOON). Hover a highlighted word to see its phrase.
8. **Finale** — *"Happy Birthday Sheetal"*, confetti + fireworks + Replay

## ✏️ Customize

### Photos / captions (Scene 6)
Your photos are in `SSM/images/` as `memory1.jpg` … `memory13.jpg`. Edit the `PHOTOS` array at the top of `js/carousel.js`:
```js
{ src: 'images/memory1.jpg', caption: 'The day we met 🥹' },
```
Reorder = reorder the array. Add a photo = drop it in `images/` + add a line.

### Letter highlights (Scene 7)
Every word of the letter is auto-wrapped in `<span class="w">`. Highlights live in the `HIGHLIGHTS` array in `js/letter.js` (already configured with the 8 hidden phrases from the PDF):

**Phrase mode** — each word can sit in a different paragraph; `nth` picks which occurrence of the word to use (0 = first):
```js
{
  phrase: 'YOU ARE MY MOON', color: 'coral',
  words: [
    { text: 'you',  para: 3, nth: 0 },   // 1st "you" in paragraph 3 (0-based)
    { text: 'are',  para: 2, nth: 0 },
    { text: 'my',   para: 3, nth: 0 },
    { text: 'MOON', para: 3, nth: 0 },
  ],
},
```
**Simple mode** — highlight every occurrence of a word:
```js
{ text: 'CUTIEEEEE', color: 'pink' },
{ text: 'bestie', color: 'coral', para: 3 },   // optional paragraph scope
```
Colors: `lavender pink green blue mint yellow orange coral`. Highlights sweep with their color when scrolled into view. You can also wrap words manually in `LETTER_PARAGRAPHS` with `<span class="highlight" data-color="teal">…</span>`.

### Any text
Question, hints, tree text, and finale text are plain strings in `index.html` / `js/scenes.js`.

## 🚀 Deploy to Vercel

**Option A — dashboard (recommended):**
1. Push this repo to GitHub (or drag-and-drop the `SSM` folder directly at [vercel.com/new](https://vercel.com/new)).
2. When importing, expand **Build & Output Settings** and set **Root Directory** to `SSM`.
3. Framework preset: **Other**. Leave build command and output dir empty.
4. Deploy — done.

**Option B — CLI:**
```bash
npm i -g vercel
cd SSM
vercel --prod
```
(When prompted: no framework, no build command, `SSM` is the deployable root.)

## Structure
```
SSM/
  index.html      # markup for all 8 scenes + CDN tags
  css/style.css   # Nemo palette + layouts (mobile-first)
  js/main.js      # scene manager, transitions, finale, replay
  js/scenes.js    # scenes 1, 2, 4, 5
  js/bow.js       # scene 3 (Matter.js)
  js/carousel.js  # scene 6 (Swiper) — PHOTOS array
  js/letter.js    # scene 7 — LETTER_PARAGRAPHS + HIGHLIGHTS
  images/         # memory1.jpg … memory13.jpg
```
