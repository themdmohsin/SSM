/* ═══════════════════════════════════════════════════════════════════
   SCENE 7 — THE LETTER + ★ HIGHLIGHT SYSTEM ★
   ═══════════════════════════════════════════════════════════════════

   HOW HIGHLIGHTS WORK:
   1. Every word is auto-wrapped on render:
        <span class="w" data-i="37">birthday</span>
   2. HIGHLIGHTS entries come in two flavors:

      ★ PHRASE MODE (used for the 8 hidden phrases) — each word of a
        phrase is found in a possibly-DIFFERENT paragraph, counted by
        which occurrence it is (nth: 0 = first time the word appears):
        {
          phrase: 'YOU ARE MY MOON',       // shown as tooltip on hover
          color: 'coral',                  // one color per phrase
          words: [
            { text: 'you',  para: 3, nth: 0 },   // 1st "you" in para 3
            { text: 'are',  para: 2, nth: 0 },
            { text: 'my',   para: 3, nth: 0 },
            { text: 'MOON', para: 3, nth: 0 },
          ],
        }

      ★ SIMPLE MODE — highlight every occurrence of a word:
        { text: 'CUTIEEEEE', color: 'pink' }
        { text: 'bestie', color: 'coral', para: 3 }   // optional para

   3. Colors available: lavender pink green blue mint yellow orange coral
      (add more in HL_COLORS). Matching spans become:
        <span class="w highlight" data-color="coral" data-phrase="…">
      and sweep with their color when scrolled into view.

   ★ EDIT HIGHLIGHTS HERE ★   (paragraphs are 0-based, in order)
   ═══════════════════════════════════════════════════════════════════ */
const HIGHLIGHTS = [
  {
    phrase: 'YOU ARE MY MOON', color: 'coral',
    words: [
      { text: 'you',  para: 3, nth: 0 },
      { text: 'are',  para: 2, nth: 0 },
      { text: 'my',   para: 3, nth: 0 },
      { text: 'MOON', para: 3, nth: 0 },
    ],
  },
  {
    phrase: "I'M PROUD OF YOU", color: 'pink',
    words: [
      { text: "I'm",  para: 3, nth: 0 },
      { text: 'proud', para: 2, nth: 0 },
      { text: 'of',   para: 3, nth: 0 },
      { text: 'you',  para: 1, nth: 0 },
    ],
  },
  {
    phrase: 'YOU ARE MY FAVOURITE PERSON', color: 'lavender',
    words: [
      { text: 'you',       para: 3, nth: 3 },
      { text: 'are',       para: 3, nth: 0 },
      { text: 'my',        para: 4, nth: 0 },
      { text: 'favourite', para: 3, nth: 0 },
      { text: 'person',    para: 0, nth: 0 },
    ],
  },
  {
    phrase: "I'M ALWAYS THERE FOR YOU", color: 'blue',
    words: [
      { text: "I'm",    para: 2, nth: 0 },
      { text: 'always', para: 2, nth: 0 },
      { text: 'there',  para: 4, nth: 0 },
      { text: 'for',    para: 2, nth: 2 },
      { text: 'you',    para: 1, nth: 1 },
    ],
  },
  {
    phrase: "I'M FOREVER GRATEFUL", color: 'green',
    words: [
      { text: "I'm",     para: 2, nth: 1 },
      { text: 'forever', para: 1, nth: 0 },
      { text: 'grateful', para: 4, nth: 0 },
    ],
  },
  {
    phrase: 'I BELIEVE IN YOU', color: 'yellow',
    words: [
      { text: 'I',       para: 2, nth: 0 },
      { text: 'believe', para: 2, nth: 0 },
      { text: 'in',      para: 2, nth: 0 },
      { text: 'you',     para: 5, nth: 0 },
    ],
  },
  {
    phrase: 'CHERISH YOU FOREVER', color: 'mint',
    words: [
      { text: 'cherish', para: 2, nth: 0 },
      { text: 'you',     para: 1, nth: 2 },
      { text: 'forever', para: 4, nth: 0 },
    ],
  },
  {
    phrase: 'MY PEACE AND JOY', color: 'orange',
    words: [
      { text: 'my',    para: 3, nth: 1 },
      { text: 'and',   para: 2, nth: 1 },
      { text: 'peace', para: 5, nth: 0 },
      { text: 'joy',   para: 5, nth: 0 },
    ],
  },
];

/* Map color names → CSS values (the PDF's 8 highlighter colors) */
const HL_COLORS = {
  lavender: 'rgba(217, 179, 255, .60)',
  pink:     'rgba(255, 179, 198, .62)',
  green:    'rgba(179, 240, 179, .60)',
  blue:     'rgba(168, 212, 255, .60)',
  mint:     'rgba(168, 236, 224, .62)',
  yellow:   'rgba(255, 242, 168, .68)',
  orange:   'rgba(255, 204, 153, .60)',
  coral:    'rgba(255, 153, 153, .60)',
};

/* ── The letter text (from the highlighted PDF — paragraphs preserved) ──
   Edit text freely; do NOT add HTML here except manual
   <span class="highlight" data-color="teal">…</span> if you want. */
const LETTER_PARAGRAPHS = [
`To the most amazing person I know,
HAPPPYYYYY BIRTHDAYYYYY CUTIEEEEE`,

`Itna wait kiya hai aaj ke liye omgg. Happy 20th 🥳🥳. You're no longer a teen 😉. Sab kuch aapko pata hi hai but I wish the bestttt besttt besttttt for you. Not just today, but forever. Someone like you deserves the best the world has to offer and its high time you see that too 😤.`,

`I think itna kuch dekha hai maine in these 9 months, and I'm soo soo proud of how you've handled everything. Dil se aapke liye dua nikalti hai. I pray you succeed in everythingggg you do because I really do believe good will come to you. BOHOT SAARA GOOD. I pray that you never have to see sorrow for another minute ever again. Jaanta hu it's a part of life, but aapka quota kabka khatam hogaya. I wish aap pe itne khushiya barse, itna pyaar barse ki aapko kabhi khud ke baare me kuch bura sochne ka mauka hi na mile. I admire and cherish you soooo much. I'm in awe of how much you think for others and how you are always there for others who need you.`,

`And then… hampe aate hai 👉👈. To the girl who's showered me with itnaaaa pyaar ki kabhi socha bhi nhi tha, meri dua toh hamesha hi hogi aapke saath. I don't know what magic you carry with you, but somehow jab bhi aap dikhte ho ya text karte ho my day just instantly gets better 🥹. You are honestly my favourite person, and not just because you're insanely pretty, kyunki wo toh ho hi 🤭😘. But what I like the most is the kind of friendship we have. It is suchhhh a privilege to have someone who understands me like you do. I love how we can just bak bak for hours and its never enough. Wo thoda ham naatakbaaz hai jhel lijiye 🥹, but I LOVE YOU TO THE MOON AND BACK 🥹🥹🥰🥰. KUCHHHH BHIIII hojaye, I will alwayssss be there for you. I always know who's side I'm on (your's ofc).`,

`I am sooo grateful for having a person like you in my life. Genuinely it feels like you've just been there forever 🤭. I take pride in calling you my bestie and there can never be another you. Pleaseeeeeeee apna khayal rakhiyega 🥹🥹 Jaan ho aap meri pata hi hai. Aur kabhi dil dukhaya ho toh maaf kijiye ☹️. THANK YOU SO MUCHHH FOR EVERYTHINGGGGG. Ek "Hiiiii Sheetal" se baat shuru hui thi and omg kaha aagaye hai abhiii 😂🥰.`,

`Once again, I wish you the HAPPPPPIESTTTT BIRTHDAYYYY NEMOOOOO. I hope your day goes so so well and that this year brings you so much peace and joy 🫶.`,

`I'd loveee to see you tomorrow (today only actually) but its okiii if you don't want to 🥹🫶. Wo kuch gifts hai jab milunga de dunga 🥰.`,

`ILYSMMMMMMMMM. HAPPYY BIRTHDAYYYYY CUTUUUU`,
];

/* ── Rendering ──────────────────────────────────────────────────── */

/** Split a paragraph into word spans, preserving line breaks. */
function renderWords(paragraph, paraIndex) {
  const frag = document.createDocumentFragment();
  paragraph.split('\n').forEach((line, li) => {
    if (li > 0) frag.appendChild(document.createElement('br'));

    line.split(/\s+/).filter(Boolean).forEach((word) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      span.dataset.word = word;            // used by HIGHLIGHTS matching
      span.dataset.para = paraIndex;
      frag.appendChild(span);
      frag.appendChild(document.createTextNode(' '));
    });
  });
  return frag;
}

/* — matching helpers — */
function normalizeWord(w) {
  return String(w).toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:()"“”]+$/, '');
}
/** true if a span's word equals the target ("forever 🤭." still matches "forever") */
function wordMatches(spanWord, target) {
  const s = normalizeWord(spanWord), t = normalizeWord(target);
  if (s === t) return true;
  if (t && s.startsWith(t)) {
    const rest = s.slice(t.length);
    return !/[a-z0-9]/.test(rest) && !rest.startsWith("'"); // "you're" ≠ "you"
  }
  return false;
}

/** Apply HIGHLIGHTS (phrase mode + simple mode), then watch them. */
function applyHighlights() {
  const allSpans = Array.from(document.querySelectorAll('#letterBody .w'));
  const tagSpan = (span, color, phrase) => {
    const c = HL_COLORS[color] ? color : 'yellow';
    span.classList.add('highlight');
    span.dataset.color = c;
    span.style.setProperty('--hl-color', HL_COLORS[c]);
    if (phrase) { span.dataset.phrase = phrase; span.title = phrase; }
  };

  // PHRASE MODE: nth-occurrence matching per paragraph
  HIGHLIGHTS.forEach((entry) => {
    if (!entry.words) return;
    const counters = {};   // `${para}|${word}` → occurrences seen so far
    entry.words.forEach(({ text, para, nth = 0 }) => {
      const key = `${para}|${normalizeWord(text)}`;
      allSpans.forEach((span) => {
        if (Number(span.dataset.para) !== para) return;
        if (!wordMatches(span.dataset.word, text)) return;
        const seen = counters[key] || 0;
        if (seen === nth) { tagSpan(span, entry.color, entry.phrase); }
        counters[key] = seen + 1;
      });
    });
  });

  // SIMPLE MODE: every occurrence (optionally scoped to a paragraph)
  HIGHLIGHTS.forEach((entry) => {
    if (!entry.text) return;
    allSpans.forEach((span) => {
      if (entry.para != null && Number(span.dataset.para) !== entry.para) return;
      if (wordMatches(span.dataset.word, entry.text)) tagSpan(span, entry.color, null);
    });
  });

  observeHighlights();
}

/* One shared IntersectionObserver, created lazily so it exists even if
   applyHighlights() runs again later (e.g. highlights added on the fly). */
let hlObserver = null;
function observeHighlights() {
  const targets = document.querySelectorAll('#letterBody .w.highlight:not(.lit)');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('lit'));
    return;
  }
  if (!hlObserver) {
    const panel = document.getElementById('letterPanel');
    hlObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lit');
          hlObserver.unobserve(entry.target);
        }
      });
    }, { root: panel, threshold: 0.9 });
  }
  targets.forEach((t) => hlObserver.observe(t));
}

function renderLetter() {
  const body = document.getElementById('letterBody');
  if (!body) return;
  LETTER_PARAGRAPHS.forEach((text, i) => {
    const p = document.createElement('p');
    if (i === 0) p.classList.add('heading-line');
    if (i === LETTER_PARAGRAPHS.length - 1) p.classList.add('closing');
    p.appendChild(renderWords(text, i));
    body.appendChild(p);
  });
  applyHighlights();
}

document.addEventListener('DOMContentLoaded', renderLetter);
