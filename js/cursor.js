/* Kawaii fairy dust: glossy dots, 4-point stars, thin sparkles and the odd tiny heart trail the
   normal system cursor, twinkle on hover and burst on click. The cursor itself is never changed.
   Mouse / trackpad only; off for touch and reduced motion. */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!Element.prototype.animate) return;

  // Every particle is Muted Rose; the CSS adds a small ivory gloss highlight
  var PALETTE = ['#A94F65'];
  var HOVER = 'a, button, [role="tab"], .role, .metric, .panel-card, .pz-panel, .note-card';
  var MAX = 60;
  var live = 0;

  var layer = document.createElement('div');
  layer.className = 'dust';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function () { return PALETTE[(Math.random() * PALETTE.length) | 0]; };
  // mix = { dot, star, sparkle, heart } weights
  function shape(mix) {
    var r = Math.random() * (mix.dot + mix.star + mix.sparkle + mix.heart);
    if ((r -= mix.dot) < 0) return 'dot';
    if ((r -= mix.star) < 0) return 'star';
    if ((r -= mix.sparkle) < 0) return 'sparkle';
    return 'heart';
  }
  var SIZE = { dot: [2.5, 5], star: [6, 10], sparkle: [7, 12], heart: [7, 9] };

  // One particle: floats along (dx, dy) with a gentle sway, twinkles once, then shrinks away
  function spawn(x, y, dx, dy, mix, opts) {
    if (live >= MAX) return;
    opts = opts || {};
    var kind = shape(mix);
    var size = rand(SIZE[kind][0], SIZE[kind][1]);
    var p = document.createElement('i');
    p.className = 'dust__' + kind;
    p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;--c:' + pick();
    layer.appendChild(p);
    live++;

    var rot = kind === 'heart' ? rand(-20, 20) : rand(-120, 120);
    var sway = rand(-6, 6);
    var s0 = rand(0.75, 1);
    var o = opts.opacity || rand(0.7, 1);
    var dur = opts.dur || rand(700, 1100);
    var at = function (f, sx, sc, op, r) {
      return { transform: 'translate(calc(-50% + ' + (dx * f + sx) + 'px), calc(-50% + ' + dy * f + 'px)) rotate(' + r + 'deg) scale(' + sc + ')', opacity: op };
    };
    var anim = p.animate([
      at(0, 0, s0 * 0.6, 0, 0),
      Object.assign(at(0.15, 0, s0, o, rot * 0.15), { offset: 0.12 }),
      Object.assign(at(0.45, sway, s0 * 1.25, o, rot * 0.5), { offset: 0.4 }),
      at(1, -sway * 0.5, 0.1, 0, rot)
    ], { duration: dur, easing: 'cubic-bezier(.25,.6,.3,1)', fill: 'forwards' });
    var done = function () { if (p.parentNode) { p.remove(); live--; } };
    anim.onfinish = done;
    setTimeout(done, dur + 200);
  }

  // Trail: a particle roughly every 16px of travel, drifting softly upward like dust in light
  var TRAIL = { dot: 4.5, star: 3, sparkle: 1.5, heart: 0.8 };
  var lastX = null, lastY = null, lastT = 0;
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var now = performance.now();
    if (lastX !== null && (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 16 || now - lastT < 32)) return;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    spawn(e.clientX + rand(-5, 5), e.clientY + rand(-5, 5), rand(-10, 10), rand(-18, 4), TRAIL);
  }, { passive: true });

  // Hover: a few twinkles around the element's edge, once per entry
  var HOV = { dot: 1, star: 4, sparkle: 3, heart: 1.5 };
  var current = null;
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var el = e.target.closest && e.target.closest(HOVER);
    if (el === current) return;
    current = el;
    if (!el) return;
    var r = el.getBoundingClientRect();
    if (r.width > window.innerWidth * 0.9 && r.height > 300) return; // skip huge containers
    for (var i = 0; i < 4; i++) {
      var side = Math.random() < 0.5;
      var x = side ? rand(r.left, r.right) : (Math.random() < 0.5 ? r.left : r.right);
      var y = side ? (Math.random() < 0.5 ? r.top : r.bottom) : rand(r.top, r.bottom);
      spawn(x, y, rand(-8, 8), rand(-16, -6), HOV, { dur: rand(800, 1100), opacity: 0.9 });
    }
  });

  // Click: a glossy halo ring plus 8 to 12 particles scattering outward
  var BURST = { dot: 3, star: 4, sparkle: 2, heart: 1.2 };
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    var x = e.clientX, y = e.clientY;
    var glow = document.createElement('i');
    glow.className = 'dust__glow';
    glow.style.cssText = 'left:' + x + 'px;top:' + y + 'px';
    layer.appendChild(glow);
    glow.animate([
      { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0.9 },
      { transform: 'translate(-50%,-50%) scale(3.2)', opacity: 0 }
    ], { duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    setTimeout(function () { glow.remove(); }, 800);

    var n = 8 + ((Math.random() * 5) | 0);
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + rand(-0.25, 0.25);
      var d = rand(24, 48);
      spawn(x, y, Math.cos(a) * d, Math.sin(a) * d - 6, BURST, { dur: rand(600, 950) });
    }
  });
})();
