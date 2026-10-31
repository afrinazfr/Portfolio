(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Nav */
  var nav = $('#nav');
  var toggle = $('#navToggle');
  var links = $('#navLinks');

  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    links.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  }
  toggle.addEventListener('click', function () { setMenu(!links.classList.contains('is-open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var navLinks = $$('a', links);
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function (a) {
        var active = a.getAttribute('href') === '#' + entry.target.id;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(function (s) { spy.observe(s); });

  /* Gantt: dates from the CV. An open-ended role runs to today. */
  var ROWS = [
    { name: 'Bachelor, Business Management', from: [2020, 9], to: [2024, 7], type: 'edu' },
    { name: 'PMO Intern, PT Phincon', from: [2023, 2], to: [2024, 2] },
    { name: 'Account Mgmt Intern, Magnus', from: [2024, 3], to: [2024, 6] },
    { name: "Project Strategic, BERT's", from: [2024, 7], to: [2025, 5] },
    { name: 'PMO, PT Mandiri Utama Finance', from: [2025, 8], to: null, type: 'now' }
  ];
  var now = new Date();
  var toMonths = function (d) { return d[0] * 12 + d[1] - 1; };
  var start = toMonths(ROWS[0].from);
  var end = now.getFullYear() * 12 + now.getMonth() + 1;
  var pct = function (m) { return ((m - start) / (end - start)) * 100; };

  var chart = $('#gantt');
  chart.setAttribute('role', 'img');
  chart.setAttribute('aria-label', 'Gantt chart of study from 2020 to 2024 and four consecutive roles from 2023 to the present.');
  var years = '<div class="gantt__years" aria-hidden="true">';
  for (var y = 2021; y <= now.getFullYear(); y++) {
    years += '<span style="left:' + pct(y * 12).toFixed(2) + '%">' + y + '</span>';
  }
  chart.innerHTML = years + '</div>' + ROWS.map(function (r) {
    var a = toMonths(r.from);
    var b = r.to ? toMonths(r.to) + 1 : end;
    return '<div class="gantt__row"><span class="gantt__name">' + r.name + '</span><span class="gantt__track">' +
      '<span class="gantt__bar' + (r.type ? ' gantt__bar--' + r.type : '') + '" style="left:' + pct(a).toFixed(2) +
      '%;width:' + (pct(b) - pct(a)).toFixed(2) + '%"></span></span></div>';
  }).join('');

  /* Reveal and count-up */
  function countUp(el) {
    var target = +el.dataset.count;
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    var t0 = null;
    function step(t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / 1100, 1);
      el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      seen.unobserve(entry.target);
      var num = $('[data-count]', entry.target);
      if (num && !reduced) countUp(num);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(function (el) { seen.observe(el); });

  /* Project filter */
  var filters = $$('[data-filter]');
  var cases = $$('#cases .case');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var f = btn.dataset.filter;
      cases.forEach(function (c) {
        c.hidden = f !== 'all' && c.dataset.cat.split(' ').indexOf(f) === -1;
        c.classList.add('is-in');
      });
    });
  });

  /* Skill evidence */
  var skills = $$('#skillGroups button');
  function pick(btn) {
    skills.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
    $('#skillName').textContent = btn.textContent;
    $('#skillText').textContent = btn.dataset.e;
  }
  skills.forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { pick(b); });
  });
  pick(skills[2]);
})();
