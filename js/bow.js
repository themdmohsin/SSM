/* ═══════════════════════════════════════════════════════════════════
   SCENE 3 — BOW & ARROW (Matter.js)  ·  locked-angle slingshot
   ═══════════════════════════════════════════════════════════════════
   The bow always points at the heart (angle locked + ballistic lead).
   The ONLY control: pull the string back (anywhere on screen) and
   release. Pull distance = power. Release fires the arrow with real
   Matter.js physics; hit the heart → explosion → reveal.
   ═══════════════════════════════════════════════════════════════════ */

function initBowScene() {
  const canvas = document.getElementById('bowCanvas');
  const sceneEl = document.getElementById('scene-3');
  if (!canvas || !sceneEl) return;
  const ctx = canvas.getContext('2d');

  const { Engine, Bodies, Body, Composite, Events } = Matter;

  const state = {
    running: false, fired: false, hit: false,
    aiming: false, pull: 0,            // current pull distance (px)
    heart: null, arrow: null, engine: null,
    lockedAngle: -0.5,                 // set in buildWorld (aims at heart)
    particles: [], floaters: [], trail: [],
    raf: null, lastT: 0, resetTimer: null, shakeUntil: 0,
  };

  const MAX_PULL = 150;     // px of string travel (scaled below)
  const G = 0.3;            // world gravity
  const REF_SPEED = 24;     // speed used to pre-compensate the aim drop

  let W = 0, H = 0, scale = 1;

  /* ── Layout ──────────────────────────────────────────────────── */
  function layout() {
    const r = sceneEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, r.width * dpr);
    canvas.height = Math.max(1, r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = r.width; H = r.height;
    scale = Math.min(W / 500, H / 500, 1.15);
  }

  const bowPos = () => ({ x: W * 0.14, y: H * 0.80 });
  const heartPos = () => ({ x: W * 0.72, y: H * 0.34 });
  const heartR = () => 44 * scale;
  const ARROW_LEN = () => 104 * scale;
  const maxPull = () => MAX_PULL * scale;

  /* ── Physics world ───────────────────────────────────────────── */
  function buildWorld() {
    if (state.engine) { Events.off(state.engine); Engine.clear(state.engine); state.engine = null; }

    const engine = Engine.create();
    engine.gravity.y = G;
    engine.gravity.scale = 0.001;

    const ground = Bodies.rectangle(W / 2, H + 60, W * 2, 100, { isStatic: true, label: 'ground' });
    const heart = Bodies.circle(heartPos().x, heartPos().y, heartR(), { isStatic: true, label: 'heart' });
    const arrow = Bodies.rectangle(bowPos().x, bowPos().y, ARROW_LEN(), 8 * scale, {
      label: 'arrow', frictionAir: 0.008, density: 0.0022,
      isStatic: true, angle: state.lockedAngle,
    });

    state.heart = heart;
    state.arrow = arrow;
    Composite.add(engine.world, [ground, heart, arrow]);

    Events.on(engine, 'collisionStart', (evt) => {
      if (state.hit) return;
      for (const pair of evt.pairs) {
        const l = pair.bodyA.label + '|' + pair.bodyB.label;
        if (l.includes('heart') && l.includes('arrow')) { onHeartHit(); return; }
        if (l.includes('ground') && l.includes('arrow')) { onMiss(); return; }
      }
    });

    // Lock the aim: straight at the heart + ballistic drop lead
    const b = bowPos(), hp = heartPos();
    const dx = hp.x - b.x, dy = hp.y - b.y;
    const dist = Math.hypot(dx, dy);
    const drop = 0.5 * G * Math.pow(dist / REF_SPEED, 2) * 0.9; // expected drop at ref power
    state.lockedAngle = Math.atan2(dy - drop, dx);
    state.arrow.angle = state.lockedAngle;

    state.engine = engine;
  }

  /* ── Input: pull = distance dragged (any direction) ───────────── */
  function updateAim(e) {
    const r = canvas.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    const b = bowPos();
    // project the drag onto the pull axis (opposite of fire direction)
    const pullVec = { x: -Math.cos(state.lockedAngle), y: -Math.sin(state.lockedAngle) };
    const d = (p.x - b.x) * pullVec.x + (p.y - b.y) * pullVec.y;
    state.pull = Math.max(0, Math.min(d, maxPull()));
  }

  function onDown(e) {
    if (!state.running || state.hit || state.fired) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    state.aiming = true;
    state.pull = 0;
    updateAim(e);
  }
  function onMove(e) {
    if (!state.aiming) return;
    e.preventDefault();
    updateAim(e);
  }
  function onUp() {
    if (!state.aiming) return;
    state.aiming = false;
    if (state.pull > maxPull() * 0.15 && !state.fired && !state.hit) fire();
    state.pull = 0;
  }

  /* ── Fire ─────────────────────────────────────────────────────── */
  function fire() {
    const power = state.pull / maxPull();
    const speed = 11 + 19 * power;

    state.fired = true;
    const b = bowPos();
    const tip = {
      x: b.x + Math.cos(state.lockedAngle) * 34 * scale,
      y: b.y + Math.sin(state.lockedAngle) * 34 * scale,
    };
    Body.setStatic(state.arrow, false);
    Body.setPosition(state.arrow, tip);
    Body.setAngle(state.arrow, state.lockedAngle);
    Body.setVelocity(state.arrow, {
      x: Math.cos(state.lockedAngle) * speed,
      y: Math.sin(state.lockedAngle) * speed,
    });
    Body.setAngularVelocity(state.arrow, 0);
    state.trail.length = 0;
  }

  /* ── Miss → reset for another try ─────────────────────────────── */
  function onMiss() {
    if (state.resetTimer || state.hit) return;
    state.resetTimer = setTimeout(() => {
      state.resetTimer = null;
      resetArrow();
    }, 600);
  }

  function resetArrow() {
    if (!state.engine) return;
    Body.setPosition(state.arrow, bowPos());
    Body.setAngle(state.arrow, state.lockedAngle);
    Body.setVelocity(state.arrow, { x: 0, y: 0 });
    Body.setAngularVelocity(state.arrow, 0);
    Body.setStatic(state.arrow, true);
    state.fired = false;
    state.trail.length = 0;
  }

  /* ── Hit → heart explosion + reveal ───────────────────────────── */
  function onHeartHit() {
    state.hit = true;
    state.aiming = false;
    Body.setStatic(state.arrow, true);

    const hp = heartPos();
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * 5;
      state.particles.push({
        x: hp.x, y: hp.y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2.2,
        size: 2.5 + Math.random() * 5.5, life: 1,
        color: ['#ff5d8f', '#e63965', '#ff8fab', '#ff7f2a', '#ffc2d1'][i % 5],
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      });
    }
    for (let i = 0; i < 10; i++) {
      state.floaters.push({
        x: hp.x + (Math.random() - 0.5) * heartR() * 1.6,
        y: hp.y + (Math.random() - 0.5) * heartR(),
        vx: (Math.random() - 0.5) * 0.7, vy: -0.7 - Math.random() * 0.9,
        size: 11 + Math.random() * 13, life: 1,
        color: ['#ff5d8f', '#e63965', '#ff8fab', '#ffc2d1'][i % 4],
        rot: (Math.random() - 0.5) * 0.7,
      });
    }
    state.shakeUntil = performance.now() + 320;

    if (window.confetti) {
      confetti({
        particleCount: 70, spread: 85, startVelocity: 26,
        origin: { x: hp.x / window.innerWidth, y: hp.y / window.innerHeight },
        colors: ['#ff5d8f', '#ff8fab', '#ffc2d1', '#ff7f2a', '#7fd0f0'],
      });
    }
    reveal();
  }

  function reveal() {
    gsap.timeline()
      .to('#bowInstruction', { opacity: 0, duration: 0.3 })
      .fromTo('#bigReveal', { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'back.out(1.4)', delay: 0.3 })
      .to({}, { duration: 2.4 })
      .call(() => window.SceneManager && window.SceneManager.goTo(4));
  }

  /* ── Drawing ──────────────────────────────────────────────────── */
  function heartPath(cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.3);
    ctx.bezierCurveTo(cx + s * 0.5, cy - s * 0.3, cx + s, cy + s * 0.1, cx, cy + s * 0.9);
    ctx.bezierCurveTo(cx - s, cy + s * 0.1, cx - s * 0.5, cy - s * 0.3, cx, cy + s * 0.3);
    ctx.closePath();
  }

  /* Arrow drawn in local frame: tip at (+len*0.5, 0), fletching at (-len*0.5, 0) */
  function drawArrowLocal(len) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffe9c9';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2 - 9 * scale, 0); ctx.stroke();
    ctx.fillStyle = '#ff7f2a';
    ctx.beginPath();
    ctx.moveTo(len / 2, 0);
    ctx.lineTo(len / 2 - 11 * scale, -5 * scale);
    ctx.lineTo(len / 2 - 11 * scale, 5 * scale);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5d8f';
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(-len / 2 - 9 * scale, -5.5 * scale);
    ctx.lineTo(-len / 2 - 2 * scale, 0);
    ctx.lineTo(-len / 2 - 9 * scale, 5.5 * scale);
    ctx.closePath(); ctx.fill();
  }

  /* The bow: rotated frame, limbs curve forward, string pulls to the nock */
  function drawBow(t) {
    const b = bowPos();
    const R = 52 * scale;
    const power = state.aiming ? state.pull / maxPull() : 0;
    const nockRest = 14 * scale;
    const nock = { x: nockRest - state.pull, y: 0 };

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(state.lockedAngle);

    // grip
    ctx.strokeStyle = '#6d4426';
    ctx.lineWidth = 10 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8 * scale, 0); ctx.lineTo(10 * scale, 0); ctx.stroke();

    // limbs (recurve-ish curves)
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 6.5 * scale;
    ctx.beginPath();
    ctx.moveTo(10 * scale, 0);
    ctx.quadraticCurveTo(R * 0.55, -R * 0.52, R * 0.98, -R * 0.62);
    ctx.moveTo(10 * scale, 0);
    ctx.quadraticCurveTo(R * 0.55, R * 0.52, R * 0.98, R * 0.62);
    ctx.stroke();

    // string (color shifts toward coral with power)
    const tipA = { x: R * 0.98, y: -R * 0.62 };
    const tipB = { x: R * 0.98, y: R * 0.62 };
    ctx.strokeStyle = power > 0.02
      ? `rgba(255, ${Math.round(230 - 120 * power)}, ${Math.round(210 - 120 * power)}, 0.95)`
      : 'rgba(255,246,235,0.85)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(tipA.x, tipA.y);
    ctx.lineTo(nock.x, nock.y);
    ctx.lineTo(tipB.x, tipB.y);
    ctx.stroke();

    // nocked arrow: tip forward from the nock
    if (!state.fired) {
      ctx.save();
      ctx.translate(nock.x + ARROW_LEN() * 0.45, 0);
      drawArrowLocal(ARROW_LEN());
      ctx.restore();

      // aim guide (locked direction) — brighter with power
      ctx.setLineDash([5, 8]);
      ctx.strokeStyle = `rgba(255,194,209,${0.25 + 0.4 * power})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nock.x + ARROW_LEN() * 0.5, 0);
      ctx.lineTo(nock.x + ARROW_LEN() * 0.5 + 230 * scale, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // full-power glow ring
      if (power > 0.97) {
        ctx.strokeStyle = 'rgba(255,127,42,0.65)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, R * 1.25, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ── Main draw ────────────────────────────────────────────────── */
  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // ground glow
    const grd = ctx.createLinearGradient(0, H - 40, 0, H);
    grd.addColorStop(0, 'rgba(53,196,181,0)');
    grd.addColorStop(1, 'rgba(53,196,181,0.16)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, H - 40, W, 40);

    ctx.save();
    if (performance.now() < state.shakeUntil) {
      ctx.translate((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
    }

    // heart
    if (!state.hit) {
      const hp = heartPos();
      const beat = 1 + 0.055 * Math.sin(t / 240);
      const s = heartR() * beat;
      ctx.save();
      ctx.shadowColor = 'rgba(255,93,143,0.8)';
      ctx.shadowBlur = 26;
      const g = ctx.createRadialGradient(hp.x - s * 0.3, hp.y, s * 0.1, hp.x, hp.y, s * 1.1);
      g.addColorStop(0, '#ff8fab');
      g.addColorStop(1, '#e63965');
      ctx.fillStyle = g;
      heartPath(hp.x, hp.y - s * 0.1, s);
      ctx.fill();
      ctx.restore();
    }

    // flight trail
    state.trail.forEach((p, i) => {
      ctx.globalAlpha = (i / state.trail.length) * 0.5;
      ctx.fillStyle = '#ffc2d1';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4 * scale, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    drawBow(t);

    // flying arrow (world space)
    if (state.fired) {
      const ap = state.arrow.position;
      ctx.save();
      ctx.translate(ap.x, ap.y);
      ctx.rotate(state.arrow.angle);
      drawArrowLocal(ARROW_LEN());
      ctx.restore();
    }

    // burst particles
    state.particles.forEach((p) => {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // rising mini hearts
    state.floaters.forEach((f) => {
      ctx.globalAlpha = Math.max(f.life, 0);
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.fillStyle = f.color;
      const s = f.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(s * 0.5, -s * 0.3, s, s * 0.1, 0, s * 0.9);
      ctx.bezierCurveTo(-s, s * 0.1, -s * 0.5, -s * 0.3, 0, s * 0.3);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ── Loop ─────────────────────────────────────────────────────── */
  function updateParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.18;
      p.rot += p.vr; p.life -= 0.016;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.x += f.vx; f.y += f.vy; f.life -= 0.006;
      if (f.life <= 0) state.floaters.splice(i, 1);
    }
  }

  function tick(t) {
    if (!state.running) return;
    const dt = Math.min((t - state.lastT) / 16.667 || 1, 3);
    state.lastT = t;

    if (state.engine) {
      if (state.fired && !state.hit) {
        const v = state.arrow.velocity;
        if (Math.hypot(v.x, v.y) > 0.5) Body.setAngle(state.arrow, Math.atan2(v.y, v.x));
        state.trail.push({ x: state.arrow.position.x, y: state.arrow.position.y });
        if (state.trail.length > 14) state.trail.shift();
      }
      Engine.update(state.engine, Math.min(16.667 * dt, 33));

      if (state.fired && !state.hit) {
        const ap = state.arrow.position;
        if (ap.x > W + 80 || ap.x < -80 || ap.y < -100 || ap.y > H + 80) onMiss();
      }
    }
    updateParticles();
    draw(t);
    state.raf = requestAnimationFrame(tick);
  }

  /* ── Start / stop (called by the scene manager) ───────────────── */
  window.__startBow = function startBow() {
    layout();
    buildWorld();
    Object.assign(state, { running: true, fired: false, hit: false, aiming: false, pull: 0 });
    state.particles.length = 0;
    state.floaters.length = 0;
    state.trail.length = 0;
    state.shakeUntil = 0;
    gsap.set('#bigReveal', { autoAlpha: 0 });
    gsap.set('#bowInstruction', { opacity: 1 });
    state.lastT = performance.now();
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(tick);
  };

  window.__stopBow = function stopBow() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    if (state.engine) { Events.off(state.engine); Engine.clear(state.engine); state.engine = null; }
  };

  window.addEventListener('resize', () => {
    if (!state.running) return;
    layout();
    buildWorld();
    state.fired = false; state.hit = false;
    state.particles.length = 0;
    state.floaters.length = 0;
  });

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}
