/* Selected Work: tabs, MUF dashboard, Magnus metrics, BERT's campaign charts, Phincon sprints. */
(function () {
  var DATA = window.PORTFOLIO_DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var num = function (n) { return n.toLocaleString('en-US'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* Tooltip shared by every chart: any element with data-tip */
  var tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  function showTip(el, x, y) {
    tip.innerHTML = el.getAttribute('data-tip');
    tip.classList.add('is-on');
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8);
    var top = y - h - 14 < 8 ? y + 18 : y - h - 14;
    tip.style.transform = 'translate(' + left + 'px,' + top + 'px)';
  }
  function hideTip() { tip.classList.remove('is-on'); }
  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (el) showTip(el, e.clientX, e.clientY); else hideTip();
  });
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (!el) return hideTip();
    var r = el.getBoundingClientRect();
    showTip(el, r.left + r.width / 2, r.top);
  });
  document.addEventListener('scroll', hideTip, { passive: true });

  /* Generic accessible tabs */
  function tabs(list, onSelect) {
    var btns = $$('[role="tab"]', list);
    function select(btn, focus) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      if (focus) btn.focus();
      onSelect(btn);
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(btns[(i + d + btns.length) % btns.length], true); }
      });
    });
    return function (btn) { select(btn); };
  }

  /* Work tabs */
  var selectWork = tabs($('.wtabs'), function (btn) {
    $$('.wpanel').forEach(function (p) { p.hidden = p.id !== btn.getAttribute('aria-controls'); });
  });
  $$('[data-open]').forEach(function (a) {
    a.addEventListener('click', function () { selectWork($('#tab-' + a.getAttribute('data-open'))); });
  });

  /* ---------- Magnus (simulated) ---------- */
  function mfmt(m, v) {
    return m.fmt === 'k' ? v.toFixed(1) + 'k' : m.fmt === '%' ? v.toFixed(1).replace(/\.0$/, '') + '%' : m.fmt === 's' ? v + 's' : v.toFixed(1) + 's';
  }
  $('#magnusGrid').innerHTML = DATA.magnus.map(function (m) {
    var v = m.values, first = v[0], last = v[v.length - 1];
    var delta = m.fmt === '%' ? (last - first).toFixed(1) + ' pts' : Math.round(((last - first) / first) * 100) + '%';
    var better = m.good === 'up' ? last > first : last < first;
    var W = 240, H = 64, min = Math.min.apply(null, v), max = Math.max.apply(null, v);
    var px = function (i) { return (i / (v.length - 1)) * W; };
    var py = function (val) { return H - 6 - ((val - min) / (max - min || 1)) * (H - 14); };
    var line = v.map(function (val, i) { return px(i).toFixed(1) + ',' + py(val).toFixed(1); }).join(' ');
    var hits = v.map(function (val, i) {
      return '<rect x="' + (px(i) - W / v.length / 2).toFixed(1) + '" y="0" width="' + (W / v.length).toFixed(1) + '" height="' + H + '" data-tip="<b>' + m.key + '</b><br>Week ' + (i + 1) + ': ' + mfmt(m, val) + '"/>';
    }).join('');
    return '<article class="metric">' +
      '<header><h4>' + m.key + '</h4><span class="mono">' + m.unit + '</span></header>' +
      '<p class="metric__v">' + mfmt(m, last) + '<span class="delta delta--' + (better ? 'good' : 'bad') + '">' + (last > first ? '▲ ' : '▼ ') + delta.replace('-', '') + '</span></p>' +
      '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,' + H + ' ' + line + ' ' + W + ',' + H + '"/><polyline points="' + line + '"/>' +
      '<circle cx="' + px(v.length - 1) + '" cy="' + py(last) + '" r="3"/><g class="hit">' + hits + '</g></svg>' +
      '<p class="metric__q">' + m.q + '</p></article>';
  }).join('');

  /* ---------- BERT's (reported) ---------- */
  var B = DATA.bert, ig = B.platforms[0], tt = B.platforms[1], all = B.overall;
  var rate = function (o) { return (o.interactions / o.plays) * 100; };
  var kpiB = function (v, l, sub) { return '<div class="kpi"><p class="kpi__v">' + v + '</p><p class="kpi__l">' + l + '</p><p class="kpi__s">' + sub + '</p></div>'; };
  $('#bertKpis').innerHTML =
    kpiB(num(all.audience), 'Reported Audience', 'Not unique users') +
    kpiB(num(all.plays), 'Plays', 'Instagram + TikTok') +
    kpiB(num(all.interactions), 'Interactions', 'Instagram + TikTok') +
    kpiB(rate(all).toFixed(2) + '%', 'Interaction rate by plays', 'Overall') +
    kpiB(all.kol, 'KOLs', ig.kol + ' Instagram · ' + tt.kol + ' TikTok');

  var rows = [['Reported Audience', 'audience'], ['Plays', 'plays'], ['Interactions', 'interactions'], ['KOLs', 'kol']];
  $('#bertShare').innerHTML = '<div class="split">' + rows.map(function (r) {
    var a = ig[r[1]], b = tt[r[1]], t = all[r[1]];
    var sa = (a / t) * 100;
    return '<div class="split__row"><span class="split__l">' + r[0] + '</span><span class="split__t">' +
      '<i class="split__a" style="width:' + sa + '%" tabindex="0" data-tip="<b>Instagram · ' + r[0] + '</b><br>' + num(a) + ' of ' + num(t) + '">' + Math.round(sa) + '%</i>' +
      '<i class="split__b" style="width:' + (100 - sa) + '%" tabindex="0" data-tip="<b>TikTok · ' + r[0] + '</b><br>' + num(b) + ' of ' + num(t) + '">' + Math.round(100 - sa) + '%</i></span></div>';
  }).join('') + '</div><ul class="legend"><li><i class="sw sw--ig"></i>Instagram</li><li><i class="sw sw--tt"></i>TikTok</li></ul>';

  var scale = 6;
  var bars = [['Instagram', ig, 'ig'], ['TikTok', tt, 'tt']];
  $('#bertRate').innerHTML = '<div class="rates">' + bars.map(function (r) {
    var v = rate(r[1]);
    return '<div class="rate"><span class="rate__l">' + r[0] + '</span><span class="rate__t"><i class="rate__bar rate__bar--' + r[2] + '" style="width:' + (v / scale) * 100 +
      '%" tabindex="0" data-tip="<b>' + r[0] + '</b><br>' + num(r[1].interactions) + ' interactions ÷ ' + num(r[1].plays) + ' plays"></i></span><span class="rate__v">' + v.toFixed(2) + '%</span></div>';
  }).join('') + '<div class="rate__avg" style="left:calc(var(--rl) + (100% - var(--rl) - var(--rv)) * ' + (rate(all) / scale) + ')"><span>Overall ' + rate(all).toFixed(2) + '%</span></div></div>' +
    '<p class="panel-card__note">TikTok ran ' + (rate(tt) - rate(ig)).toFixed(2) + ' points above Instagram on interaction rate, from ' + Math.round((tt.plays / all.plays) * 100) + '% of total plays.</p>';

  /* ---------- Phincon ---------- */
  var row = $('#sprintRow');
  for (var i = 1; i <= 21; i++) row.insertAdjacentHTML('beforeend', '<span><b>' + i + '</b></span>');
})();
