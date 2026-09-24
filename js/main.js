/* ═══════════════════════════════════════════════════════════════════
   MAIN — scene manager, transitions, finale + replay
   Scene implementations live in scenes.js / bow.js / carousel.js /
   letter.js. This file wires them together.
   ═══════════════════════════════════════════════════════════════════ */

const SceneManager = {
  current: 1,
  busy: false,

  /* Enter-scene setup: starts/replays each scene's animation */
  onEnter(scene) {
    switch (scene) {
      case 1: playFlowerIntro(); break;
      case 2: break;
      case 3: window.__startBow && window.__startBow(); break;
      case 4: window.__growTree && window.__growTree(); break;
      case 5: window.__buildCake && window.__buildCake(); break;
      case 6:
        if (window.memorySwiper) window.memorySwiper.update();
        break;
      case 7: break;
      case 8: playFinale(); break;
    }
  },

  onLeave(scene) {
    if (scene === 3 && window.__stopBow) window.__stopBow();
    if (scene === 8 && window.__stopFireworks) window.__stopFireworks();
  },

  /* Core transition: current scene out → ocean wipe → next scene in */
  goTo(target) {
    if (this.busy || target === this.current) return;
    this.busy = true;
    const wipe = document.getElementById('wipe');
    const wave = wipe.querySelector('.wipe-wave');
    const from = document.getElementById('scene-' + this.current);
    const to = document.getElementById('scene-' + target);
    if (!to) { this.busy = false; return; }

    this.onLeave(this.current);
    this.current = target;

    const tl = gsap.timeline({ onComplete: () => { this.busy = false; } });
    tl.to(wipe, { visibility: 'visible', duration: 0 })
      .to(from, { autoAlpha: 0, y: -26, duration: 0.4, ease: 'power2.in' })
      .to(wave, { yPercent: 0, duration: 0.55, ease: 'power2.inOut' }, '-=0.15')
      .call(() => {
        from.classList.remove('is-active');
        gsap.set(from, { clearProps: 'all' });
        to.classList.add('is-active');
        gsap.set(to, { autoAlpha: 0, y: 26 });
      })
      .to(wave, { yPercent: -101, duration: 0.6, ease: 'power2.inOut', delay: 0.08 })
      .to(to, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.45')
      .set(wipe, { visibility: 'hidden' })
      .call(() => this.onEnter(target), null, '-=0.3');
  },
};
window.SceneManager = SceneManager;

/* ── Ambient bubbles (every scene) ─────────────────────────────── */
function initBubbles() {
  document.querySelectorAll('[data-bubbles]').forEach((layer) => {
    for (let i = 0; i < 7; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = 5 + Math.random() * 15;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.setProperty('--drift', (Math.random() * 70 - 35) + 'px');
      b.style.animationDuration = (9 + Math.random() * 9) + 's';
      b.style.animationDelay = (-Math.random() * 12) + 's';
      layer.appendChild(b);
    }
  });
}

/* ── Scene 8: fireworks + confetti finale ──────────────────────── */
function playFinale() {
  // cannon confetti
  if (window.confetti) {
    const colors = ['#ff7f2a', '#35c4b5', '#7fd0f0', '#ff5d8f', '#ffe9c9'];
    confetti({ particleCount: 130, spread: 100, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors }), 400);
    setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors }), 800);
    const iv = setInterval(() => confetti({ particleCount: 55, spread: 80, origin: { y: 0.5 }, colors }), 2200);
    window.__finaleConfettiIv = iv;
  }
  window.__startFireworks && window.__startFireworks();

  gsap.fromTo('.finale-title',
    { scale: 0.6, opacity: 0, y: 30 },
    { scale: 1, opacity: 1, y: 0, duration: 1, ease: 'back.out(1.5)' });
  gsap.fromTo('#replayBtn',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, delay: 0.6 });
}

/* Lightweight canvas fireworks behind the finale text */
function initFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, raf = null, running = false, rockets = [], sparks = [], lastLaunch = 0;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const PALETTE = ['#ff7f2a', '#35c4b5', '#7fd0f0', '#ff5d8f', '#ffe9c9', '#ff9e57'];

  function launch() {
    const x = W * (0.15 + Math.random() * 0.7);
    rockets.push({ x, y: H + 10, vx: (Math.random() - 0.5) * 1.2, vy: -(7.5 + Math.random() * 3.5),
      targetY: H * (0.18 + Math.random() * 0.3), color: PALETTE[(Math.random() * PALETTE.length) | 0] });
  }

  function explode(r) {
    const n = 46;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
      const s = 2 + Math.random() * 3.2;
      sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 1, color: Math.random() < 0.75 ? r.color : PALETTE[(Math.random() * PALETTE.length) | 0] });
    }
  }

  function tick(t) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    if (t - lastLaunch > 950) { launch(); lastLaunch = t; }
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx; r.y += r.vy; r.vy += 0.06;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = r.color;
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2); ctx.fill();
      if (r.y <= r.targetY || r.vy >= -1) { explode(r); rockets.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.045; s.vx *= 0.985; s.vy *= 0.985;
      s.life -= 0.014;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(s.x, s.y, 1.9, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  }

  window.__startFireworks = function () {
    size(); running = true; rockets = []; sparks = []; lastLaunch = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  };
  window.__stopFireworks = function () {
    running = false; cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, W, H);
    if (window.__finaleConfettiIv) { clearInterval(window.__finaleConfettiIv); window.__finaleConfettiIv = null; }
  };
  window.addEventListener('resize', () => { if (running) size(); });
}

/* ── Replay: full state reset back to Scene 1 ──────────────────── */
function resetAll() {
  // pin gate
  const pin = document.getElementById('pinInput');
  if (pin) { pin.value = ''; pin.dataset.locked = ''; pin.style.borderColor = ''; }
  const lock = document.getElementById('lockCard');
  if (lock) gsap.set(lock, { clearProps: 'all' });

  // gift
  const gift = document.getElementById('gift');
  if (gift) gift.dataset.open = '';
  gsap.set('#giftLid', { clearProps: 'all' });
  gsap.set('#gift .ribbon-h', { clearProps: 'all' });
  gsap.set('#giftGlow', { clearProps: 'all' });
  gsap.set('#unwrapBtn, #giftHint', { clearProps: 'all' });

  // bow scene reveal
  gsap.set('#bigReveal, #bowInstruction', { clearProps: 'all' });

  // tree + cake rebuildable state
  const treeBtn = document.getElementById('treeContinue');
  if (treeBtn) treeBtn.classList.add('hidden');
  gsap.set('#treeText, #treeText .word', { clearProps: 'all' });
  gsap.set('#cakeText, #cakeTopline', { clearProps: 'all' });
  gsap.set('#cakeDimmer', { opacity: 0 });
  initCakeScene(); // rebuilds the cake fresh (old tiers/candle/sparkles removed inside)

  // letter scroll back to top
  const panel = document.getElementById('letterPanel');
  if (panel) panel.scrollTop = 0;
  if (window.memorySwiper) window.memorySwiper.slideTo(0, 0);

  SceneManager.current = 8;
  SceneManager.goTo(1);
}

/* ── Boot ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const safe = (fn, label) => { try { fn(); } catch (err) { console.error(`[init:${label}]`, err); } };
  safe(initBubbles, 'bubbles');
  safe(initBowScene, 'bow');
  safe(initCarousel, 'carousel');
  safe(initFireworks, 'fireworks');

  document.getElementById('replayBtn')?.addEventListener('click', resetAll);
  document.getElementById('treeContinue')?.addEventListener('click', () => SceneManager.goTo(5));
  document.getElementById('carouselContinue')?.addEventListener('click', () => SceneManager.goTo(7));
  document.getElementById('letterContinue')?.addEventListener('click', () => SceneManager.goTo(8));

  safe(playFlowerIntro, 'scene1');   // Scene 1 starts immediately
  safe(initPinGate, 'pin');
  safe(initGiftBox, 'gift');
  safe(initTreeScene, 'tree');
  safe(initCakeScene, 'cake');
});
