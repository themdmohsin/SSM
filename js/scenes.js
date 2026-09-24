/* ═══════════════════════════════════════════════════════════════════
   SCENES 1, 2, 4, 5 — flowers, gift box, growing tree, cake
   (Scene 3 → bow.js · Scene 6 → carousel.js · Scene 7 → letter.js)
   ═══════════════════════════════════════════════════════════════════ */

/* ── Scene 1: flowers fly in from off-screen toward center ─────── */
function playFlowerIntro() {
  const field = document.getElementById('flowerField');
  const lock = document.getElementById('lockCard');
  if (!field) return;
  field.innerHTML = '';

  const petals = ['🌸', '🌷', '🌺', '🌸', '💐', '🌹', '🌼', '🌸', '💐', '🌺', '🌷', '🌹'];
  const n = window.innerWidth < 560 ? 8 : 12;
  const flowers = [];

  for (let i = 0; i < n; i++) {
    const f = document.createElement('div');
    f.className = 'flower';
    f.textContent = petals[i % petals.length];
    f.style.fontSize = (26 + (i % 4) * 9) + 'px';
    f.style.left = (6 + (i / (n - 1)) * 88) + 'vw';
    field.appendChild(f);
    flowers.push(f);
  }

  flowers.forEach((f, i) => {
    gsap.fromTo(f,
      { x: 0, y: -120, rotation: gsap.utils.random(-70, 70), opacity: 0, scale: .4 },
      { x: 0, y: () => window.innerHeight * 0.46 + gsap.utils.random(-60, 40),
        rotation: gsap.utils.random(-14, 14), opacity: 1, scale: 1,
        duration: 1.5, delay: i * 0.09, ease: 'power3.out' });
  });

  gsap.fromTo(lock,
    { y: 60, opacity: 0, scale: .92 },
    { y: 0, opacity: 1, scale: 1, duration: .9, delay: 1.15, ease: 'back.out(1.6)',
      onStart: () => { lock.classList.remove('hidden'); } });
  gsap.delayedCall(1.35, () => { const inp = document.getElementById('pinInput'); if (inp) inp.focus({ preventScroll: true }); });
}

/* ── Scene 1: PIN gate ──────────────────────────────────────────── */
function initPinGate() {
  const input = document.getElementById('pinInput');
  const card = document.getElementById('lockCard');
  if (!input) return;

  const normalize = (v) => {
    let s = String(v).trim().replace(/\D/g, '');   // trim + strip non-digits
    s = s.replace(/^0+/, '');                       // strip leading zeros
    return s === '' ? '0' : s;
  };
  const isCorrect = (v) => normalize(v) === '2';    // "0002", "2", "02" all pass

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 4);
    if (input.value.length === 4) setTimeout(check, 120);
  });

  function check() {
    if (input.dataset.locked === '1') return;
    const val = input.value;
    if (val === '') return;
    if (isCorrect(val)) {
      input.dataset.locked = '1';
      input.classList.remove('shake');
      input.style.borderColor = 'var(--teal-400)';
      if (window.confetti) confetti({ particleCount: 60, spread: 60, origin: { y: .55 }, colors: ['#ff7f2a', '#35c4b5', '#ffc2d1'] });
      gsap.to(card, {
        y: -30, opacity: 0, scale: .92, duration: .55, delay: .35, ease: 'power2.in',
        onComplete: () => setTimeout(() => {
          // guard: only advance if we're still on the landing scene (replay-safe)
          if (window.SceneManager && window.SceneManager.current === 1) window.SceneManager.goTo(2);
        }, 250),
      });
    } else {
      wrong();
    }
  }

  function wrong() {
    input.classList.remove('shake');
    void input.offsetWidth;               // restart the shake animation
    input.classList.add('shake');
    gsap.delayedCall(0.5, () => { input.value = ''; });
  }
}

/* ── Scene 2: gift box ──────────────────────────────────────────── */
function initGiftBox() {
  const box = document.getElementById('gift');
  const lid = document.getElementById('giftLid');
  const glow = document.getElementById('giftGlow');
  const btn = document.getElementById('unwrapBtn');
  const hint = document.getElementById('giftHint');
  if (!box || !lid) return;

  const open = () => {
    if (box.dataset.open === '1') return;
    box.dataset.open = '1';

    gsap.to(lid, { rotation: -115, y: -70, x: 20, opacity: .2, duration: .8, ease: 'power3.out', transformOrigin: '82% 100%' });
    gsap.to('#gift .ribbon-h', { opacity: .25, duration: .5, delay: .1 });
    gsap.fromTo(glow, { scale: 0, opacity: 0 },
      { scale: 1.15, opacity: 1, duration: .6, ease: 'power2.out' });
    gsap.to(glow, { scale: 2.1, opacity: 0, duration: 1.1, delay: .55, ease: 'power1.out' });

    if (window.confetti) {
      const r = box.getBoundingClientRect();
      confetti({
        particleCount: 90, spread: 75, startVelocity: 32,
        origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
        colors: ['#ff7f2a', '#35c4b5', '#7fd0f0', '#ffc2d1'],
      });
    }

    gsap.to(hint, { opacity: 0, duration: .3 });
    gsap.fromTo(btn, { y: 0 }, { y: 14, opacity: 0, duration: .5, delay: .9, ease: 'power2.in' });
    gsap.delayedCall(1.7, () => window.SceneManager && window.SceneManager.goTo(3));
  };

  btn.addEventListener('click', open);
  document.getElementById('scene-2').addEventListener('click', (e) => {
    if (box.dataset.open === '1' || e.target.closest('#unwrapBtn')) return;
    open();
  });
}

/* ── Scene 4: growing tree with heart leaves ────────────────────── */
function initTreeScene() {
  const svg = document.getElementById('treeSvg');
  const NS = 'http://www.w3.org/2000/svg';
  const hearts = document.getElementById('treeHearts');
  const text = document.getElementById('treeText');
  if (!svg) return;

  const HEART_PATH = 'M12 21s-7.5-4.8-9.9-9.2C.3 8.6 2.2 5 5.6 5c2 0 3.4 1.1 4.4 2.6C11 6.1 12.4 5 14.4 5c3.4 0 5.3 3.6 3.5 6.8C15.5 16.2 12 21 12 21z';
  const COLORS = ['#ff5d8f', '#e63965', '#ff8fab', '#ff7f2a', '#ffc2d1'];

  const tips = [
    // branch endpoints (one leafy cluster per tip)
    { x: 372, y: 296 }, { x: 106, y: 262 }, { x: 348, y: 212 }, { x: 126, y: 180 },
    { x: 168, y: 96 },  { x: 300, y: 160 }, { x: 310, y: 248 }, { x: 172, y: 300 },
    { x: 212, y: 118 }, { x: 240, y: 330 }, { x: 236, y: 250 }, { x: 234, y: 224 },
    // canopy fill
    { x: 342, y: 262 }, { x: 300, y: 226 }, { x: 258, y: 198 }, { x: 288, y: 186 },
    { x: 320, y: 190 }, { x: 262, y: 160 }, { x: 296, y: 132 }, { x: 330, y: 168 },
    { x: 226, y: 130 }, { x: 198, y: 118 }, { x: 176, y: 132 }, { x: 152, y: 150 },
    { x: 140, y: 210 }, { x: 128, y: 234 }, { x: 156, y: 232 }, { x: 178, y: 214 },
    { x: 196, y: 242 }, { x: 150, y: 262 }, { x: 184, y: 272 }, { x: 206, y: 288 },
    { x: 240, y: 296 }, { x: 272, y: 276 }, { x: 296, y: 252 }, { x: 336, y: 238 },
    { x: 250, y: 226 }, { x: 214, y: 164 }, { x: 244, y: 108 }, { x: 196, y: 88 },
  ];

  // Prep: split overlay text into word spans for a word-by-word fade
  if (text) {
    const words = text.textContent.trim().split(/\s+/);
    text.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join(' ');
  }

  // Trunk + branches: draw-on via stroke-dashoffset
  const paths = svg.querySelectorAll('#treeTrunk path');
  paths.forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });

  // Sprout a heart leaf at (x, y) — sizes vary; even index on trunk tips gets a golden one
  function sprout(x, y, i) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'heart-leaf');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', HEART_PATH);
    path.setAttribute('fill', COLORS[i % COLORS.length]);
    path.setAttribute('transform', `translate(${x - 12}, ${y - 22}) scale(${0.42 + (i % 4) * 0.14})`);
    g.appendChild(path);
    hearts.appendChild(g);
    gsap.fromTo(g, { scale: 0, opacity: 0, transformOrigin: '50% 100%' },
      { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2.2)' });
  }

  // Full grow animation, replayable
  window.__growTree = function growTree() {
    hearts.innerHTML = '';
    text.style.opacity = 1;
    gsap.set(text.querySelectorAll('.word'), { opacity: 0, y: 14 });

    // reset branch strokes so the draw-on replays correctly
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    paths.forEach((p, i) => {
      gsap.to(p, { strokeDashoffset: 0, duration: 1.3, delay: i * 0.55, ease: 'power2.inOut' });
    });

    tips.forEach((t, i) => {
      gsap.delayedCall(0.9 + i * 0.065, () => sprout(t.x, t.y, i));
    });

    gsap.to(text.querySelectorAll('.word'), {
      opacity: 1, y: 0, duration: .45, stagger: .07, delay: 2.4, ease: 'power2.out',
    });
    gsap.delayedCall(5.6, () => {
      const btn = document.getElementById('treeContinue');
      if (btn) btn.classList.remove('hidden');
    });
  };
}

/* ── Scene 5: cake build + candle blow-out ──────────────────────── */
function initCakeScene() {
  const stage = document.getElementById('cakeStage');
  if (!stage) return;

  // Reference look: 3 pink tiers, widest at the bottom, white drip frosting
  const TIERS = [
    { w: 224, h: 56, bottom: 22, bg: 'linear-gradient(180deg,#ffa5c0,#f77fa5)' },
    { w: 182, h: 50, bottom: 80, bg: 'linear-gradient(180deg,#ffb7cd,#fa8fb2)' },
    { w: 144, h: 46, bottom: 132, bg: 'linear-gradient(180deg,#ffc9da,#fc9fbe)' },
  ];
  const SPRINKLE_COLORS = ['#ff7f2a', '#35c4b5', '#7fd0f0', '#ff5d8f', '#ffe9c9'];
  const tierEls = [];
  let candle = null;

  function buildCakeDom() {
    stage.querySelectorAll('.cake-tier, .candle-tall, .sparkle').forEach((el) => el.remove());
    tierEls.length = 0;

    TIERS.forEach((T, i) => {
      const el = document.createElement('div');
      el.className = 'cake-tier';
      el.style.width = T.w + 'px';
      el.style.bottom = T.bottom + 'px';
      el.style.marginLeft = (-T.w / 2) + 'px';

      const side = document.createElement('div');
      side.className = 'side';
      side.style.height = T.h + 'px';
      side.style.background = T.bg;
      side.innerHTML = '<div class="stripes"></div>';

      const frosting = document.createElement('div');
      frosting.className = 'frosting';

      const drips = document.createElement('div');
      drips.className = 'drips';
      const dripCount = Math.max(4, Math.round(T.w / 26));
      for (let d = 0; d < dripCount; d++) {
        const s = document.createElement('span');
        s.style.left = (4 + (d / (dripCount - 1)) * (T.w - 22)) + 'px';
        s.style.height = (10 + ((d * 37 + i * 13) % 18)) + 'px';   // varied lengths
        drips.appendChild(s);
      }

      for (let k = 0; k < 8; k++) {
        const sp = document.createElement('div');
        sp.className = 'sprinkle';
        sp.style.left = (6 + Math.random() * (T.w - 12)) + 'px';
        sp.style.top = (26 + Math.random() * (T.h - 32)) + 'px';
        sp.style.background = SPRINKLE_COLORS[(k + i) % SPRINKLE_COLORS.length];
        el.appendChild(sp);
      }

      el.appendChild(side);
      el.appendChild(frosting);
      el.appendChild(drips);
      stage.appendChild(el);
      tierEls.push(el);
    });

    // tall candle with a glowing flame
    candle = document.createElement('div');
    candle.className = 'candle-tall';
    candle.style.height = '54px';
    candle.style.bottom = (TIERS[TIERS.length - 1].bottom + TIERS[TIERS.length - 1].h - 4) + 'px';
    candle.style.marginLeft = '-5.5px';
    candle.innerHTML = '<div class="flame-glow"></div><div class="wick"></div><div class="flame"></div><div class="smoke-wisp"></div>';
    stage.appendChild(candle);

    // ambient falling sparkles (like the reference video)
    for (let i = 0; i < 16; i++) {
      const sp = document.createElement('div');
      sp.className = 'sparkle';
      const size = 3 + Math.random() * 4;
      sp.style.width = size + 'px';
      sp.style.height = size + 'px';
      sp.style.left = (Math.random() * 100) + '%';
      sp.style.animationDuration = (3.5 + Math.random() * 4) + 's';
      sp.style.animationDelay = (-Math.random() * 6) + 's';
      sp.style.opacity = 0.25 + Math.random() * 0.6;
      stage.appendChild(sp);
    }
  }

  buildCakeDom();

  const flame = () => candle.querySelector('.flame');
  const glow = () => candle.querySelector('.flame-glow');
  const wisp = () => candle.querySelector('.smoke-wisp');

  function primeCake() {
    tierEls.forEach((el) => { gsap.set(el, { y: -(H() + 60), opacity: 0 }); });
    gsap.set(candle, { y: -(H() + 100), opacity: 0 });
    gsap.set(['#cakeText', '#cakeTopline'], { opacity: 0 });
  }
  const H = () => 320;

  window.__buildCake = function buildCake() {
    primeCake();

    // headline appears first (like "First things first 🍰" in the reference)
    gsap.to('#cakeTopline', { opacity: 1, duration: .7, delay: .2 });

    tierEls.forEach((el, i) => {
      gsap.to(el, { y: 0, opacity: 1, duration: .95, delay: .5 + i * .7, ease: 'bounce.out' });
    });
    gsap.to(candle, { y: 0, opacity: 1, duration: .9, delay: .5 + TIERS.length * .7 + .3, ease: 'bounce.out' });
    gsap.to('#cakeText', { opacity: 1, duration: .8, delay: .5 + TIERS.length * .7 + 1.1 });

    // ★ Blow-out: dim → flame out with smoke puff → advance
    document.getElementById('scene-5').addEventListener('click', function handler() {
      this.removeEventListener('click', handler);
      const dimmer = document.getElementById('cakeDimmer');
      flame().style.animation = 'none';
      gsap.timeline()
        .to(dimmer, { opacity: .82, duration: .5, ease: 'power2.in' })
        .to([flame(), glow()], { opacity: 0, scale: .2, duration: .3, ease: 'power2.in' }, '-=0.15')
        .to(wisp(), { opacity: .9, scale: 3.2, y: -46, duration: 1.2, ease: 'power1.out' }, '<')
        .to(wisp(), { opacity: 0, duration: .5 }, '>0.35')
        .to(dimmer, { opacity: 0, duration: .8, delay: .3 })
        .call(() => { gsap.to(['#cakeText', '#cakeTopline'], { opacity: 0, duration: .4 }); })
        .call(() => window.SceneManager && window.SceneManager.goTo(6), null, '+=0.35');
    }, { once: true });
  };
}
