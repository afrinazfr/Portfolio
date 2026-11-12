/* PRISM replica: Dashboard Project and Dashboard PMO, rendered from fictional data in data.js */
(function () {
  var M = window.PORTFOLIO_DATA.muf;
  var root = document.getElementById('prism');
  if (!root) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var r1 = function (n) { return Math.round(n * 10) / 10; };
  var pct = function (a, b) { return b ? Math.round((a / b) * 100) : 0; };
  var D = function (iso) { return new Date(iso + 'T00:00:00'); };
  var fmt = function (iso) { return D(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }); };
  var monthName = function (ym) { return D(ym + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); };
  var REPORT = D(M.reportDate);
  var ym = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
  var monthIdx = function (s) { var p = s.split('-'); return +p[0] * 12 + +p[1] - 1; };

  /* ---------- Derived model ---------- */
  var people = M.people.map(function (p) { return { name: p[0], section: p[1], role: p[2] }; });
  var sections = people.map(function (p) { return p.section; }).filter(function (s, i, a) { return a.indexOf(s) === i; });
  var projects = M.projects.map(function (r) {
    var p = { code: r[0], name: r[1], cycle: r[2], bu: r[3], pm: r[4], phase: r[5], start: r[6], end: r[7], plan: r[8], actual: r[9],
      mdPlan: r[10], mdUsed: r[11], dev: r[12], uat: r[13], devSub: r[14], uatSub: r[15], bugs: r[16] };
    p.status = p.phase === 'Done' ? 'Done' : p.phase === 'Not Started' ? 'Not Started' :
      (p.plan - p.actual >= 10 || D(p.end) < REPORT) ? 'Delay' : 'On Track';
    p.devTotal = p.devSub[0] + p.devSub[1] + p.devSub[2];
    p.uatTotal = p.uatSub[0] + p.uatSub[1] + p.uatSub[2];
    p.mdClass = p.mdPlan >= 200 ? 'Very High' : p.mdPlan >= 150 ? 'High' : p.mdPlan >= 110 ? 'Medium' : p.mdPlan >= 75 ? 'Low' : 'Very Low';
    return p;
  });
  var byCode = function (c) { return projects.filter(function (p) { return p.code === c; })[0]; };
  var STATUS = ['On Track', 'Delay', 'Done', 'Not Started'];
  var SC = { 'On Track': 'ok', 'Delay': 'bad', 'Done': 'done', 'Not Started': 'ns' };
  var CLASSES = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  var TEAM_OF_BUG = ['Backend', 'Frontend', 'Data', 'Infrastructure'];

  // Monthly MD load per project: remaining MD spread over its remaining months plus a PIR buffer month;
  // 40% goes to DEV PICs, 20% to UAT PICs, the rest is PM and support effort
  function loads(month) {
    var m = monthIdx(month), cur = monthIdx(ym(REPORT)), out = [];
    projects.forEach(function (p) {
      if (p.phase === 'Done') return;
      var s = Math.max(monthIdx(p.start.slice(0, 7)), cur), e = monthIdx(p.end.slice(0, 7));
      if (m < s || m > e) return;
      var md = Math.max(p.mdPlan - p.mdUsed, 0) / (e - s + 2);
      out.push({ p: p, md: md });
    });
    return out;
  }
  function personLoad(month) {
    var map = {};
    people.forEach(function (x) { map[x.name] = { total: 0, items: [] }; });
    var unassigned = 0;
    loads(month).forEach(function (l) {
      var p = l.p;
      if (!p.dev.length && !p.uat.length) { unassigned += l.md; return; }
      p.dev.forEach(function (n) { var v = (l.md * 0.4) / p.dev.length; map[n].total += v; map[n].items.push([p.code, v]); });
      p.uat.forEach(function (n) { var v = (l.md * 0.2) / p.uat.length; map[n].total += v; map[n].items.push([p.code, v]); });
    });
    return { map: map, unassigned: unassigned };
  }
  // Year-to-date mandays per person, split by subtask category
  var mandays = people.map(function (x) {
    var row = { name: x.name, section: x.section, role: x.role, dev: 0, uat: 0, sup: 0, pirDev: 0, pirUat: 0 };
    projects.forEach(function (p) {
      var pir = p.phase === 'Done' || p.phase === 'Deployment';
      if (p.dev.indexOf(x.name) > -1) {
        row.dev += (p.mdUsed * 0.6) / p.dev.length;
        row.sup += (p.mdUsed * 0.05) / p.dev.length;
        if (pir) row.pirDev += 2;
      }
      if (p.uat.indexOf(x.name) > -1) {
        row.uat += (p.mdUsed * 0.3) / p.uat.length;
        if (pir) row.pirUat += 2;
      }
    });
    row.total = row.dev + row.uat + row.sup + row.pirDev + row.pirUat;
    return row;
  });

  /* ---------- Building blocks ---------- */
  function panel(title, body, opts) {
    opts = opts || {};
    return '<section class="pz-panel' + (opts.cls ? ' ' + opts.cls : '') + '"><header class="pz-panel__h"><h5>' + title + '</h5>' +
      (opts.sub ? '<p>' + opts.sub + '</p>' : '') + '</header>' + body + '</section>';
  }
  function select(id, options, value, label) {
    return '<label class="pz-field"><span>' + label + '</span><select id="' + id + '">' + options.map(function (o) {
      var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
      return '<option value="' + esc(v) + '"' + (v === value ? ' selected' : '') + '>' + esc(l) + '</option>';
    }).join('') + '</select></label>';
  }
  function search(target, ph) {
    return '<label class="pz-field pz-field--search"><span>Search</span><input type="search" data-search="' + target + '" placeholder="' + ph + '"></label>';
  }
  function tools(html) { return '<div class="pz-tools">' + html + '</div>'; }
  function table(id, head, rows, foot) {
    return '<div class="pz-tablewrap"><table class="pz-table" id="' + id + '"><thead><tr>' + head.map(function (h) {
      return '<th' + (h[1] ? ' class="n"' : '') + '>' + h[0] + '</th>';
    }).join('') + '</tr></thead><tbody>' + (rows.length ? rows.join('') : '<tr><td colspan="' + head.length + '" class="pz-empty">No data</td></tr>') +
      '</tbody>' + (foot || '') + '</table></div>';
  }
  function tr(cells, nums) {
    return '<tr>' + cells.map(function (c, i) { return '<td' + (nums && nums.indexOf(i) > -1 ? ' class="n"' : '') + '>' + c + '</td>'; }).join('') + '</tr>';
  }
  function pill(s) { return '<span class="pz-pill pz-pill--' + SC[s] + '">' + s + '</span>'; }
  function stat(v, l, tone) { return '<div class="pz-stat' + (tone ? ' pz-stat--' + tone : '') + '"><b>' + v + '</b><span>' + l + '</span></div>'; }
  function prog(v, plan) {
    return '<span class="pz-prog"><i style="width:' + v + '%"></i>' + (plan != null ? '<em style="left:' + plan + '%"></em>' : '') + '</span><small>' + v + '%</small>';
  }
  function mini(seg) {
    var t = seg[0] + seg[1] + seg[2];
    if (!t) return '<span class="pz-muted">–</span>';
    return '<span class="pz-mini" data-tip="To Do ' + seg[0] + ' · In Progress ' + seg[1] + ' · Done ' + seg[2] + '">' +
      ['todo', 'prog', 'done'].map(function (c, i) { return seg[i] ? '<i class="s-' + c + '" style="width:' + (seg[i] / t) * 100 + '%"></i>' : ''; }).join('') + '</span>';
  }
  function legend(items) {
    return '<ul class="pz-legend">' + items.map(function (i) { return '<li><i class="' + i[0] + '"></i>' + i[1] + '</li>'; }).join('') + '</ul>';
  }
  function hbars(rows, max, opts) {
    opts = opts || {};
    return '<div class="pz-hbars">' + rows.map(function (r) {
      return '<div class="pz-hbar"><span class="pz-hbar__l">' + r.label + '</span><span class="pz-hbar__t">' +
        (opts.ref ? '<em style="left:' + (opts.ref / max) * 100 + '%"></em>' : '') +
        '<i class="' + (r.cls || 'c-1') + '" style="width:' + Math.min(100, (r.value / (r.max || max)) * 100) + '%" tabindex="0" data-tip="' + esc(r.tip || '') + '"></i></span>' +
        '<span class="pz-hbar__v">' + r.text + '</span></div>';
    }).join('') + '</div>';
  }
  function donut(segs, center) {
    var total = segs.reduce(function (a, s) { return a + s.v; }, 0);
    if (!total) return '<p class="pz-empty">No bugs recorded</p>';
    var R = 52, C = 2 * Math.PI * R, off = 0;
    var arcs = segs.map(function (s) {
      if (!s.v) return '';
      var len = (s.v / total) * C;
      var a = '<circle class="' + s.cls + '" r="' + R + '" cx="70" cy="70" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + -off +
        '" tabindex="0" data-tip="<b>' + esc(s.label) + '</b><br>' + s.v + ' of ' + total + '"/>';
      off += len;
      return a;
    }).join('');
    return '<div class="pz-donut"><svg viewBox="0 0 140 140" role="img" aria-label="' + esc(center) + '"><g transform="rotate(-90 70 70)">' + arcs +
      '</g><text x="70" y="68">' + total + '</text><text class="s" x="70" y="84">' + center + '</text></svg>' +
      legend(segs.map(function (s) { return [s.cls, esc(s.label) + ' <b>' + s.v + '</b>']; })) + '</div>';
  }
  function columns(groups, max) {
    return '<div class="pz-cols">' + groups.map(function (g) {
      var t = g.segs.reduce(function (a, s) { return a + s.v; }, 0);
      return '<div class="pz-col"><span class="pz-col__n">' + t + '</span><span class="pz-col__stack" style="height:' + (t / max) * 100 + '%">' +
        g.segs.map(function (s) {
          return s.v ? '<i class="' + s.cls + '" style="height:' + (s.v / t) * 100 + '%" tabindex="0" data-tip="' + esc(s.tip) + '"></i>' : '';
        }).join('') + '</span><span class="pz-col__l">' + g.label + '</span></div>';
    }).join('') + '</div>';
  }
  function line(series, x0, x1, yMax, title) {
    var W = 520, H = 220, L = 34, R = 12, T = 12, B = 28;
    var t0 = D(x0).getTime(), t1 = D(x1).getTime();
    var x = function (t) { return L + ((t - t0) / (t1 - t0)) * (W - L - R); };
    var y = function (v) { return H - B - (v / (yMax || 1)) * (H - T - B); };
    var s = '<svg class="pz-line" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(title) + '">';
    [0, 0.5, 1].forEach(function (f) {
      var v = Math.round(yMax * f);
      s += '<line class="g" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + '</text>';
    });
    [t0, (t0 + t1) / 2, t1].forEach(function (t, i) {
      s += '<text x="' + x(t) + '" y="' + (H - 8) + '" text-anchor="' + ['start', 'middle', 'end'][i] + '">' + fmt(ym(new Date(t)) + '-' + String(new Date(t).getDate()).padStart(2, '0')) + '</text>';
    });
    var rt = REPORT.getTime();
    if (rt > t0 && rt < t1) s += '<line class="today" x1="' + x(rt) + '" x2="' + x(rt) + '" y1="' + T + '" y2="' + (H - B) + '"/><text class="today-l" x="' + (x(rt) + 4) + '" y="' + (T + 10) + '">Report date</text>';
    series.forEach(function (se) {
      if (!se.pts.length) return;
      s += '<polyline class="' + se.cls + '" points="' + se.pts.map(function (p) { return x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1); }).join(' ') + '"/>';
      if (se.dots) se.pts.forEach(function (p) {
        s += '<circle class="' + se.cls + '" cx="' + x(p[0]).toFixed(1) + '" cy="' + y(p[1]).toFixed(1) + '" r="3.5" tabindex="0" data-tip="<b>' + se.name + '</b><br>' +
          new Date(p[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ': ' + Math.round(p[1]) + ' subtasks remaining"/>';
      });
    });
    return s + '</svg>';
  }
  function burndown(p, kind) {
    var total = kind === 'dev' ? p.devTotal : p.uatTotal, done = kind === 'dev' ? p.devSub[2] : p.uatSub[2];
    var s = D(p.start).getTime(), e = D(p.end).getTime(), span = e - s;
    var ws = kind === 'dev' ? s : s + span * 0.6, we = kind === 'dev' ? s + span * 0.75 : e;
    var week = 7 * 864e5, ideal = [], actual = [];
    for (var t = ws; t <= we + 1; t += week) ideal.push([Math.min(t, we), total * (1 - (Math.min(t, we) - ws) / (we - ws))]);
    if (ideal[ideal.length - 1][0] < we) ideal.push([we, 0]);
    var now = Math.min(REPORT.getTime(), we);
    if (now > ws) {
      for (var u = ws; u <= now; u += week) actual.push([u, total - done * Math.pow((u - ws) / (now - ws), 1.2)]);
      actual.push([now, total - done]);
    }
    var iso = function (t) { var d = new Date(t); return ym(d) + '-' + String(d.getDate()).padStart(2, '0'); };
    return { chart: line([{ pts: ideal, cls: 'ideal', name: 'Ideal' }, { pts: actual, cls: 'actual', name: 'Actual', dots: true }], iso(ws), iso(we), total, kind.toUpperCase() + ' burndown'),
      total: total, done: done, empty: !total };
  }

  /* ---------- Views ---------- */
  var state = { view: 'capacity', month: M.months[0], section: 'all', project: 'PRJ-2601', daily: 'PRJ-2609', cycle: 'all' };
  var openProjects = projects.filter(function (p) { return p.phase !== 'Not Started'; });

  var VIEWS = {
    capacity: { group: 'Dashboard Project', title: 'Remaining Mandays Capacity', sub: 'Capacity vs allocated mandays for the selected month', render: function () {
      var pl = personLoad(state.month), cap = people.length * M.mdPerPersonMonth;
      var alloc = Object.keys(pl.map).reduce(function (a, k) { return a + pl.map[k].total; }, 0) + pl.unassigned;
      var rows = function (cycle) {
        return projects.filter(function (p) { return p.cycle === cycle; }).map(function (p) {
          var rem = Math.max(p.mdPlan - p.mdUsed, 0);
          return tr(['<b>' + p.code + '</b><span>' + esc(p.name) + '</span>', esc(p.bu), p.mdPlan, p.mdUsed, rem, prog(Math.min(100, pct(p.mdUsed, p.mdPlan)))], [2, 3, 4]);
        });
      };
      var head = [['Project'], ['Business unit'], ['MD plan', 1], ['MD used', 1], ['Remaining', 1], ['Used']];
      var secRows = sections.map(function (s) {
        var ppl = people.filter(function (x) { return x.section === s; });
        var c = ppl.length * M.mdPerPersonMonth, a = ppl.reduce(function (t, x) { return t + pl.map[x.name].total; }, 0);
        return { label: s, value: a, max: c, cls: a > c ? 'c-bad' : 'c-1', text: r1(c - a) + ' MD left', tip: '<b>' + s + '</b><br>Capacity ' + c + ' MD · Allocated ' + r1(a) + ' MD' };
      });
      var maxSec = Math.max.apply(null, sections.map(function (s) { return people.filter(function (x) { return x.section === s; }).length * M.mdPerPersonMonth; }));
      return tools(select('pzMonth', M.months.map(function (m) { return [m, monthName(m)]; }), state.month, 'Period')) +
        '<div class="pz-stats">' + stat(cap, 'Capacity (MD)') + stat(r1(alloc), 'Allocated (MD)') +
        stat(r1(cap - alloc), 'Remaining (MD)', cap - alloc < 0 ? 'bad' : '') + stat(pct(alloc, cap) + '%', 'Utilization') + '</div>' +
        '<div class="pz-grid pz-grid--2">' +
        panel('Oncycle projects', tools(search('pzT1', 'Search project…')) + table('pzT1', head, rows('Oncycle'))) +
        panel('Offcycle projects', tools(search('pzT2', 'Search project…')) + table('pzT2', head, rows('Offcycle'))) + '</div>' +
        panel('Remaining MD per section', '<p class="pz-note">Bar shows allocated MD against each section\'s capacity of ' + M.mdPerPersonMonth + ' MD per person.</p>' +
          hbars(secRows, maxSec, {}) , { cls: 'pz-panel--dark' });
    } },

    projectview: { group: 'Dashboard Project', title: 'Project View', sub: 'Subtasks, PIC numbers and bug analysis per project', render: function () {
      var p = byCode(state.project);
      var DEV_T = ['Build API endpoint', 'Implement screen', 'Integrate service', 'Fix validation rule', 'Write unit tests', 'Refactor module', 'Prepare SIT data', 'Configure batch job'];
      var UAT_T = ['Execute test scenario', 'Retest defect', 'Prepare UAT data', 'Regression check'];
      var subs = [], n = 101;
      [['DEV', p.devSub, p.dev, DEV_T], ['UAT', p.uatSub, p.uat, UAT_T]].forEach(function (k) {
        var st = ['To Do', 'In Progress', 'Done'], i = 0;
        k[1].forEach(function (cnt, si) {
          for (var c = 0; c < cnt; c++, i++) {
            subs.push(tr(['<b>' + p.code.replace('PRJ-', 'DMO-') + '-' + (n++) + '</b>', k[3][i % k[3].length], 'Subtask ' + k[0], esc(k[2][i % (k[2].length || 1)] || '–'),
              '<span class="pz-st pz-st--' + si + '">' + st[si] + '</span>']));
          }
        });
      });
      var picRows = openProjects.map(function (x) {
        return tr(['<b>' + x.code + '</b><span>' + esc(x.name) + '</span>', x.dev.length, x.devTotal, mini(x.devSub), x.uat.length, x.uatTotal, mini(x.uatSub)], [1, 2, 4, 5]);
      });
      return tools(select('pzProject', openProjects.map(function (x) { return [x.code, x.code + ' · ' + x.name]; }), state.project, 'Project')) +
        panel('Data from Jira filter', tools(search('pzSubs', 'Search all columns…')) +
          table('pzSubs', [['Key'], ['Summary'], ['Issue type'], ['Assignee'], ['Status']], subs), { sub: subs.length + ' subtasks in ' + esc(p.name) }) +
        '<div class="pz-grid pz-grid--2">' +
        panel('Bugs by issue type', donut(M.bugTypes.map(function (t, i) { return { v: p.bugs[i], label: t, cls: 'c-' + (i + 1) }; }), 'bugs')) +
        panel('Bugs by team', hbars(TEAM_OF_BUG.map(function (t, i) {
          return { label: t, value: p.bugs[i], text: p.bugs[i], cls: 'c-' + (i + 1), tip: '<b>' + t + '</b><br>' + p.bugs[i] + ' bugs' };
        }), Math.max.apply(null, p.bugs) || 1)) + '</div>' +
        panel('PIC DEV &amp; UAT number', table('pzPic', [['Project'], ['PIC DEV', 1], ['Subtasks DEV', 1], ['Status DEV'], ['PIC UAT', 1], ['Subtasks UAT', 1], ['Status UAT']], picRows) +
          legend([['s-todo', 'To Do'], ['s-prog', 'In Progress'], ['s-done', 'Done']]));
    } },

    utilization: { group: 'Dashboard Project', title: 'IT Team Utilization', sub: 'Allocated mandays vs capacity per team member', render: function () {
      var pl = personLoad(state.month), cap = M.mdPerPersonMonth;
      var list = people.filter(function (x) { return state.section === 'all' || x.section === state.section; });
      var rows = list.map(function (x) {
        var l = pl.map[x.name], u = (l.total / cap) * 100;
        return { label: esc(x.name) + '<small>' + x.role + '</small>', value: u, text: Math.round(u) + '%', cls: u > 100 ? 'c-bad' : u >= 80 ? 'c-3' : 'c-2',
          tip: '<b>' + esc(x.name) + '</b> · ' + r1(l.total) + ' of ' + cap + ' MD<br>' + (l.items.length ? l.items.map(function (i) { return i[0] + ': ' + r1(i[1]) + ' MD'; }).join('<br>') : 'No allocation') };
      });
      var over = rows.filter(function (r) { return r.value > 100; }).length;
      var avg = rows.length ? Math.round(rows.reduce(function (a, r) { return a + r.value; }, 0) / rows.length) : 0;
      return tools(select('pzMonth', M.months.map(function (m) { return [m, monthName(m)]; }), state.month, 'Period') +
          select('pzSection', [['all', 'All sections']].concat(sections), state.section, 'Section')) +
        '<div class="pz-stats">' + stat(list.length, 'Team members') + stat(avg + '%', 'Average utilization') + stat(over, 'Over-allocated', over ? 'bad' : '') +
        stat(r1(pl.unassigned), 'Unassigned MD') + '</div>' +
        panel('IT team utilization', hbars(rows, 140, { ref: 100 }) + legend([['c-2', 'Below 80%'], ['c-3', '80–100%'], ['c-bad', 'Over 100%'], ['ref', '100% capacity']]),
          { sub: monthName(state.month) + ' · hover a bar to see the projects behind it' });
    } },

    planning: { group: 'Dashboard Project', title: 'Planning & Progress Project', sub: 'Plan vs actual progress, Oncycle and Offcycle', render: function () {
      var head = [['Project'], ['PM'], ['Phase'], ['Plan start'], ['Plan end'], ['Plan', 1], ['Actual', 1], ['Deviation', 1], ['Status']];
      var rows = function (c) {
        return projects.filter(function (p) { return p.cycle === c; }).map(function (p) {
          var dv = p.actual - p.plan;
          return tr(['<b>' + p.code + '</b><span>' + esc(p.name) + '</span>', esc(p.pm), p.phase, fmt(p.start), fmt(p.end), p.plan + '%', p.actual + '%',
            '<span class="' + (dv <= -10 ? 'pz-neg' : '') + '">' + (dv > 0 ? '+' : '') + dv + ' pts</span>', pill(p.status)], [5, 6, 7]);
        });
      };
      return panel('Planning &amp; progress – Oncycle', tools(search('pzP1', 'Search project…')) + table('pzP1', head, rows('Oncycle'))) +
        panel('Planning &amp; progress – Offcycle', tools(search('pzP2', 'Search project…')) + table('pzP2', head, rows('Offcycle')));
    } },

    pm: { group: 'Dashboard PMO', title: 'Project PM', sub: 'Projects per PM by status and mandays classification', render: function () {
      var groups = M.pms.map(function (pm) {
        var mine = projects.filter(function (p) { return p.pm === pm; });
        return { label: esc(pm), segs: STATUS.map(function (s) {
          var l = mine.filter(function (p) { return p.status === s; });
          return { v: l.length, cls: 'st-' + SC[s], tip: '<b>' + pm + ' · ' + s + '</b><br>' + l.map(function (p) { return p.code + ' ' + esc(p.name); }).join('<br>') };
        }) };
      });
      var max = Math.max.apply(null, groups.map(function (g) { return g.segs.reduce(function (a, s) { return a + s.v; }, 0); }));
      var cls = M.pms.map(function (pm) {
        var mine = projects.filter(function (p) { return p.pm === pm; });
        return tr(['<b>' + esc(pm) + '</b>'].concat(CLASSES.map(function (c) {
          var n = mine.filter(function (p) { return p.mdClass === c; }).length;
          return n ? '<span class="pz-heat" style="--a:' + (0.15 + n * 0.25) + '">' + n + '</span>' : '<span class="pz-muted">0</span>';
        })).concat(['<b>' + mine.length + '</b>']), [1, 2, 3, 4, 5, 6]);
      });
      var tot = '<tfoot>' + tr(['Total'].concat(CLASSES.map(function (c) { return projects.filter(function (p) { return p.mdClass === c; }).length; })).concat([projects.length]), [1, 2, 3, 4, 5, 6]) + '</tfoot>';
      return '<div class="pz-grid pz-grid--2">' +
        panel('Project PM', columns(groups, max) + legend(STATUS.map(function (s) { return ['st-' + SC[s], s]; })), { sub: 'Hover a segment to list its projects' }) +
        panel('Project PM – Mandays classification', table('pzCls', [['PM']].concat(CLASSES.map(function (c) { return [c, 1]; })).concat([['Total', 1]]), cls, tot) +
          '<p class="pz-note">Very Low &lt; 75 MD · Low 75–109 · Medium 110–149 · High 150–199 · Very High ≥ 200</p>') + '</div>';
    } },

    detail: { group: 'Dashboard PMO', title: 'Project Detail', sub: 'Project list, Gantt chart and subtask status', render: function () {
      var list = projects.filter(function (p) { return state.cycle === 'all' || p.cycle === state.cycle; });
      var rows = list.map(function (p) {
        return tr(['<b>' + p.code + '</b><span>' + esc(p.name) + '</span>', p.cycle, esc(p.bu), esc(p.pm), p.phase, fmt(p.start), fmt(p.end), prog(p.actual, p.plan), pill(p.status)]);
      });
      var m0 = Math.min.apply(null, projects.map(function (p) { return monthIdx(p.start.slice(0, 7)); }));
      var m1 = Math.max.apply(null, projects.map(function (p) { return monthIdx(p.end.slice(0, 7)); })) + 1;
      var t0 = new Date(Math.floor(m0 / 12), m0 % 12, 1).getTime(), t1 = new Date(Math.floor(m1 / 12), m1 % 12, 1).getTime();
      var X = function (iso) { return ((D(iso).getTime() - t0) / (t1 - t0)) * 100; };
      var ticks = '';
      for (var m = m0; m < m1; m++) {
        var d = new Date(Math.floor(m / 12), m % 12, 1);
        ticks += '<span style="left:' + ((d.getTime() - t0) / (t1 - t0)) * 100 + '%">' + d.toLocaleDateString('en-GB', { month: 'short' }) + (d.getMonth() === 0 ? ' ' + String(d.getFullYear()).slice(2) : '') + '</span>';
      }
      var gantt = '<div class="pz-gantt"><div class="pz-gantt__axis">' + ticks + '<b style="left:' + ((REPORT.getTime() - t0) / (t1 - t0)) * 100 + '%"></b></div>' + list.map(function (p) {
        var l = X(p.start), w = X(p.end) - l;
        return '<div class="pz-gantt__row"><span class="pz-gantt__l">' + p.code + '</span><span class="pz-gantt__t"><i class="st-' + SC[p.status] + '" style="left:' + l + '%;width:' + w + '%" tabindex="0" data-tip="<b>' +
          p.code + ' · ' + esc(p.name) + '</b><br>' + fmt(p.start) + ' – ' + fmt(p.end) + '<br>Plan ' + p.plan + '% · Actual ' + p.actual + '%"><u style="width:' + p.actual + '%"></u></i></span></div>';
      }).join('') + '</div>';
      var sub = list.filter(function (p) { return p.devTotal + p.uatTotal; }).map(function (p) {
        var s = [p.devSub[0] + p.uatSub[0], p.devSub[1] + p.uatSub[1], p.devSub[2] + p.uatSub[2]];
        return tr(['<b>' + p.code + '</b><span>' + esc(p.name) + '</span>', mini(s), s[0], s[1], s[2]], [2, 3, 4]);
      });
      return tools(select('pzCycle', [['all', 'All cycles'], 'Oncycle', 'Offcycle'], state.cycle, 'Cycle')) +
        panel('Project detail', tools(search('pzD', 'Search project…')) + table('pzD', [['Project'], ['Cycle'], ['Business unit'], ['PM'], ['Phase'], ['Start'], ['End'], ['Progress'], ['Status']], rows)) +
        panel('Gantt chart project detail', gantt + legend(STATUS.map(function (s) { return ['st-' + SC[s], s]; }).concat([['today', 'Report date'], ['fill', 'Actual progress']])), { sub: 'Bar = plan window, darker fill = actual progress' }) +
        panel('Subtask status per project', table('pzSS', [['Project'], ['Status'], ['To Do', 1], ['In Progress', 1], ['Done', 1]], sub) + legend([['s-todo', 'To Do'], ['s-prog', 'In Progress'], ['s-done', 'Done']]));
    } },

    mandays: { group: 'Dashboard PMO', title: 'Details Mandays', sub: 'Mandays per user by subtask category, year to date', render: function () {
      var list = mandays.filter(function (x) { return state.section === 'all' || x.section === state.section; });
      var rows = list.map(function (x) {
        return tr(['<b>' + esc(x.name) + '</b>', x.section, x.role, r1(x.dev), r1(x.uat), r1(x.sup), r1(x.pirDev), r1(x.pirUat), '<b>' + r1(x.total) + '</b>'], [3, 4, 5, 6, 7, 8]);
      });
      var sum = function (k) { return r1(list.reduce(function (a, x) { return a + x[k]; }, 0)); };
      var foot = '<tfoot>' + tr(['Total', '', '', sum('dev'), sum('uat'), sum('sup'), sum('pirDev'), sum('pirUat'), sum('total')], [3, 4, 5, 6, 7, 8]) + '</tfoot>';
      return tools(select('pzSection', [['all', 'All sections']].concat(sections), state.section, 'Section')) +
        panel('Details mandays (all users)', tools(search('pzM', 'Search name…')) +
          table('pzM', [['Name'], ['Section'], ['Role'], ['MD Subtask DEV', 1], ['MD Subtask UAT', 1], ['MD Support Project', 1], ['MD PIR [DEV]', 1], ['MD PIR [UAT]', 1], ['Total MD', 1]], rows, foot));
    } },

    daily: { group: 'Dashboard PMO', title: 'Daily Progress', sub: 'Issues, timeline, status report and burndown per project', render: function () {
      var p = byCode(state.daily);
      var iss = M.issues.filter(function (i) { return i[0] === p.code; }).map(function (i) {
        return tr([esc(i[1]), '<span class="pz-tag pz-tag--' + i[2].toLowerCase() + '">' + i[2] + '</span>', fmt(i[3]), fmt(i[4]), i[5]], [4]);
      });
      var ph = ['Requirement', 'Development', 'SIT', 'UAT', 'Deployment'], fr = [0.15, 0.4, 0.15, 0.2, 0.1];
      var s = D(p.start).getTime(), e = D(p.end).getTime(), acc = 0;
      var now = Math.max(0, Math.min(1, (REPORT.getTime() - s) / (e - s)));
      var tl = '<div class="pz-phases">' + ph.map(function (name, i) {
        var a = acc; acc += fr[i];
        var cur = name === p.phase;
        return '<span class="' + (cur ? 'is-cur' : acc <= now ? 'is-past' : '') + '" style="width:' + fr[i] * 100 + '%" data-tip="<b>' + name + '</b><br>' +
          fmt(ym(new Date(s + (e - s) * a)) + '-01') + ' – ' + fmt(ym(new Date(s + (e - s) * acc)) + '-01') + '">' + name + '</span>';
      }).join('') + '<b style="left:' + now * 100 + '%"></b></div><p class="pz-note">' + fmt(p.start) + ' → ' + fmt(p.end) + ' · marker shows report date</p>';
      var REPORTS = {
        'Requirement': ['BRD draft reviewed with business owner', 'Obtain BRD sign-off and freeze scope'],
        'Development': ['Sprint build delivered to SIT environment', 'Complete remaining DEV subtasks and prepare SIT'],
        'SIT': ['SIT cycle 1 executed', 'Resolve SIT defects and hand over to UAT'],
        'UAT': ['UAT scenarios executed with business users', 'Close open defects and obtain UAT sign-off'],
        'Deployment': ['UAT sign-off obtained, TAT in progress', 'Complete TAT, go-live and schedule PIR'],
        'Done': ['Go-live completed', 'Post-implementation review'],
        'Not Started': ['Project registered', 'Kick-off and requirement gathering']
      };
      var rep = REPORTS[p.phase];
      var bd = burndown(p, 'dev'), bu = burndown(p, 'uat');
      var perPic = function (seg, pics) {
        if (!pics.length) return '<p class="pz-empty">No PIC assigned</p>';
        var groups = pics.map(function (n, i) {
          var share = function (v) { return Math.floor(v / pics.length) + (i < v % pics.length ? 1 : 0); };
          var v = [share(seg[0]), share(seg[1]), share(seg[2])];
          return { label: esc(n), segs: [{ v: v[2], cls: 's-done', tip: n + ' · Done ' + v[2] }, { v: v[1], cls: 's-prog', tip: n + ' · In Progress ' + v[1] }, { v: v[0], cls: 's-todo', tip: n + ' · To Do ' + v[0] }] };
        });
        var max = Math.max.apply(null, groups.map(function (g) { return g.segs.reduce(function (a, x) { return a + x.v; }, 0); })) || 1;
        return columns(groups, max);
      };
      return tools(select('pzDaily', openProjects.map(function (x) { return [x.code, x.code + ' · ' + x.name]; }), state.daily, 'Project')) +
        '<div class="pz-head"><div><b>' + p.code + ' · ' + esc(p.name) + '</b><span>' + p.cycle + ' · ' + esc(p.bu) + ' · PM ' + esc(p.pm) + '</span></div>' +
        '<div class="pz-head__r">' + stat(p.plan + '%', 'Plan') + stat(p.actual + '%', 'Actual', p.status === 'Delay' ? 'bad' : '') + pill(p.status) + '</div></div>' +
        '<div class="pz-grid pz-grid--2">' +
        panel('Issue', table('pzI', [['Issue'], ['Type'], ['Start'], ['End'], ['Hours', 1]], iss)) +
        panel('Project status report', '<dl class="pz-report"><div><dt>Status</dt><dd>' + pill(p.status) + ' ' + p.phase + '</dd></div><div><dt>Action completed</dt><dd>' + rep[0] +
          '</dd></div><div><dt>Next action</dt><dd>' + rep[1] + '</dd></div></dl>') + '</div>' +
        panel('Project timeline', tl) +
        '<div class="pz-grid pz-grid--2">' +
        panel('DEV burndown – ideal vs actual', bd.empty ? '<p class="pz-empty">No DEV subtasks</p>' : bd.chart + legend([['ideal', 'Ideal'], ['actual', 'Actual']]), { sub: bd.done + ' of ' + bd.total + ' DEV subtasks done' }) +
        panel('UAT burndown – ideal vs actual', bu.empty ? '<p class="pz-empty">No UAT subtasks</p>' : bu.chart + legend([['ideal', 'Ideal'], ['actual', 'Actual']]), { sub: bu.done + ' of ' + bu.total + ' UAT subtasks done' }) +
        panel('Subtask bar chart DEV', perPic(p.devSub, p.dev) + legend([['s-done', 'Done'], ['s-prog', 'In Progress'], ['s-todo', 'To Do']])) +
        panel('Subtask bar chart UAT', perPic(p.uatSub, p.uat) + legend([['s-done', 'Done'], ['s-prog', 'In Progress'], ['s-todo', 'To Do']])) + '</div>' +
        panel('Bug analysis', donut(M.bugTypes.map(function (t, i) { return { v: p.bugs[i], label: t, cls: 'c-' + (i + 1) }; }), 'bugs'));
    } }
  };

  /* ---------- Shell ---------- */
  var groups = ['Dashboard Project', 'Dashboard PMO'];
  var nav = $('#pzNav'), mnav = $('#pzMnav'), body = $('#pzBody');
  nav.innerHTML = groups.map(function (g) {
    return '<p class="pz-nav__g">' + g + '</p>' + Object.keys(VIEWS).filter(function (k) { return VIEWS[k].group === g; }).map(function (k) {
      return '<button type="button" data-pz="' + k + '">' + VIEWS[k].title + '</button>';
    }).join('');
  }).join('');
  mnav.innerHTML = groups.map(function (g) {
    return '<optgroup label="' + g + '">' + Object.keys(VIEWS).filter(function (k) { return VIEWS[k].group === g; }).map(function (k) {
      return '<option value="' + k + '">' + VIEWS[k].title + '</option>';
    }).join('') + '</optgroup>';
  }).join('');
  $('#pzYear').textContent = M.reportingYear;
  $('#pzDate').textContent = REPORT.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  function go(view) {
    state.view = view;
    $$('[data-pz]', nav).forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('data-pz') === view ? 'page' : 'false'); });
    mnav.value = view;
    render();
  }
  function render() {
    var v = VIEWS[state.view];
    $('#pzTitle').textContent = v.title;
    $('#pzGroup').textContent = v.group;
    $('#pzSub').textContent = v.sub;
    body.innerHTML = v.render();
  }
  nav.addEventListener('click', function (e) { var b = e.target.closest('[data-pz]'); if (b) go(b.getAttribute('data-pz')); });
  mnav.addEventListener('change', function () { go(mnav.value); });
  body.addEventListener('change', function (e) {
    var map = { pzMonth: 'month', pzSection: 'section', pzProject: 'project', pzDaily: 'daily', pzCycle: 'cycle' };
    if (map[e.target.id]) { state[map[e.target.id]] = e.target.value; render(); }
  });
  body.addEventListener('input', function (e) {
    var t = e.target.getAttribute('data-search');
    if (!t) return;
    var q = e.target.value.toLowerCase();
    $$('#' + t + ' tbody tr', body).forEach(function (row) { row.hidden = q && row.textContent.toLowerCase().indexOf(q) === -1; });
  });
  go('capacity');
})();
