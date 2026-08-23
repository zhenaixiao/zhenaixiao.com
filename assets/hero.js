/* Zhenai Advisory hero — coastlines, Montreal->Shenzhen arc, city labels, traveller.
   Extracted from the hero export so one copy serves /, /fr/ and /cn/.
   Per-page copy is passed via data-zha-* attributes on #zha-hero.
   Requires d3 v7 + topojson-client v3; polls for both for up to 8s. */
(function () {
  var root = document.getElementById('zha-hero');
  if (!root) return;
  var svg = root.querySelector('[data-zha-map]');
  var coastLo = svg.querySelector('[data-zha-coast-lo]');
  var coastHi = svg.querySelector('[data-zha-coast-hi]');
  var route = svg.querySelector('[data-zha-route]');
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = null, cycle = null, redrawTimer = null;

  var MTL = [-73.57, 45.50];
  var SHZ = [114.06, 22.54];
  /* --- per-page config, read from data-* on #zha-hero (English defaults) --- */
  function cfg(name, fallback) {
    var v = root.getAttribute('data-zha-' + name);
    return (v === null || v === '') ? fallback : v;
  }
  function cfgLines(name, fallback) {
    var v = root.getAttribute('data-zha-' + name);
    return v ? v.split('|') : fallback;
  }
  var MTL_NAME  = cfg('mtl-name', 'MONTR\u00c9AL');
  var SHZ_NAME  = cfg('shz-name', 'SHENZHEN');
  var LABEL_FONT = cfg('label-font', "'Poppins', system-ui, sans-serif");
  var TOPO_URL   = cfg('topo', '/assets/countries-110m.json');
  var MTL_LINES = cfgLines('mtl-lines', ['Our base in North America, and a', 'bilingual entry point into English', 'and French-speaking markets on', 'both sides of the Atlantic.']);
  var SHZ_LINES = cfgLines('shz-lines', ["Our base in China, at the centre of", "the country's manufacturing and", 'technological innovation.']);
  /* reserve for a fixed right-hand contact rail, if the page has one. 0 = none. */
  var RIGHT_GUTTER = parseFloat(cfg('right-gutter', '66'));

  function drawRoute(proj, coasts) {
    var pm = proj(MTL), ps = proj(SHZ);
    if (!pm || !ps) return;
    var narrow = window.matchMedia('(max-width: 640px)').matches;
    var box = svg.getBoundingClientRect();
    // the map is preserveAspectRatio="slice", so one viewBox unit is k screen px
    var k = Math.max(box.width / 1600, box.height / 900) || 0.9;
    var title = root.querySelector('.zha-hero__title');
    var tb = title && title.getBoundingClientRect();
    var headTop = tb ? tb.top - box.top : box.height * 0.62;
    var u = 1 / k;
    // the sliced viewBox window actually on screen, in viewBox units
    var halfW = (box.width * u) / 2;
    var visL = 800 - halfW, visR = 800 + halfW;
    var blockW = 178 * u;
    var room = blockW + 16 * u;
    var clusterH = (12 * 1.4 + 4 * 15.5) * u;
    var S = { r: 4.6 * u, w: 1.15 * u, name: 12 * u, nls: 2.5 * u, desc: 10.5 * u, dls: 0.3 * u, off: 14 * u, lead: 15.5 * u };
    var mtlX, shzX, mtlSide, shzSide, mtlDrop, shzDrop, mtl, shz, bow;

    if (narrow) {
      /* A phone slices the viewBox far tighter than the Montreal-Shenzhen
         longitude span, so Montreal falls outside it entirely. Scale the map
         down until that span fits the width: both dots then sit on their true
         projected positions and the coastlines line up underneath them. */
      var sideM = 56 * u;
      var s = ((visR - visL) - sideM * 2) / (ps[0] - pm[0]);
      mtlX = visL + sideM;
      shzX = mtlX + (ps[0] - pm[0]) * s;
      var vOff = (ps[1] - pm[1]) * s;
      mtlSide = 'right';
      shzSide = 'left';
      /* measure each block from its own line count rather than a worst case,
         which is what leaves room for all of this to fit */
      var mtlH = (12 * 1.4 + MTL_LINES.length * 15.5) * u;
      var shzH = (12 * 1.4 + SHZ_LINES.length * 15.5) * u;
      var gap = 24 * u;
      mtlDrop = mtlH / 2 + 14 * u;
      /* at this scale the pair sits only vOff apart, so the two blocks would
         overlap; stack Shenzhen's a clear `gap` below Montreal's instead */
      shzDrop = mtlH + 14 * u + gap + shzH / 2 - vOff;
      bow = Math.min((shzX - mtlX) * 0.085, 40 * u);
      /* centre the whole annotation in the band between the fixed nav and the
         headline, so neither dot can be clipped by the top edge */
      var navEl = document.querySelector('nav');
      var navH = (navEl ? navEl.getBoundingClientRect().height : 0) * u;
      var bandTop = navH + 20 * u;
      var bandBot = headTop * u - 24 * u;
      var needAbove = bow + S.r * 2;
      var needBelow = vOff + shzDrop + shzH / 2;
      var slack = Math.max(0, (bandBot - bandTop) - (needAbove + needBelow));
      var mtlY = bandTop + needAbove + slack / 2;
      mtl = [mtlX, mtlY];
      shz = [shzX, mtlY + vOff];
      var tx = mtlX - pm[0] * s, ty = mtlY - pm[1] * s;
      coasts.forEach(function (g) {
        if (!g) return;
        g.setAttribute('transform', 'translate(' + tx.toFixed(1) + ',' + ty.toFixed(1) + ') scale(' + s.toFixed(4) + ')');
        /* the transform scales the stroke too; keep the hairline as fine as it
           reads on desktop */
        g.setAttribute('stroke-width', (1.15 / s).toFixed(2));
      });
    } else {
      var lift = 131;
      mtlX = pm[0];
      shzX = ps[0];
      // each block sits outboard of its dot in open water where there is room,
      // and drops below the dot when it has to sit inboard of the arc instead
      mtlSide = (mtlX - visL) > room ? 'left' : 'right';
      shzSide = ((visR - RIGHT_GUTTER * u) - shzX) > room ? 'right' : 'left';
      mtlDrop = mtlSide === 'left' ? 0 : clusterH / 2 + 14 * u;
      shzDrop = shzSide === 'right' ? 0 : clusterH / 2 + 14 * u;
      // the lower annotation stops just above the headline; the arc flattens
      // when the remaining band is short rather than crowding the header
      var low = (headTop - 34) * u - clusterH / 2 - shzDrop;
      var span = shzX - mtlX;
      bow = Math.max(20 * u, Math.min(span * 0.085, low - lift - 95 * u));
      var dy = low - ps[1];
      coasts.forEach(function (g) {
        if (!g) return;
        g.setAttribute('transform', 'translate(0,' + dy.toFixed(1) + ')');
        g.setAttribute('stroke-width', '1.15');
      });
      mtl = [mtlX, pm[1] + dy];
      shz = [shzX, low];
    }

    var cx = (mtl[0] + shz[0]) / 2;
    var cy = Math.min(mtl[1], shz[1]) - bow;
    var arc = document.createElementNS(NS, 'path');
    arc.setAttribute('class', 'zha-hero__arc');
    arc.setAttribute('d', 'M ' + mtl[0] + ' ' + mtl[1] + ' Q ' + cx + ' ' + cy + ' ' + shz[0] + ' ' + shz[1]);
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', '#F7F2E8');
    arc.setAttribute('stroke-width', S.w.toFixed(2));
    arc.setAttribute('stroke-linecap', 'round');
    route.appendChild(arc);
    var len = arc.getTotalLength();
    arc.style.strokeDasharray = len;
    if (reduced) {
      arc.style.strokeDashoffset = 0;
    } else {
      arc.style.strokeDashoffset = len;
      arc.style.setProperty('--zha-len', len);
      arc.style.animation = 'zha-draw 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards';
    }

    var mark = function (pt, name, lines, side, drop, off) {
      var anchor = side === 'left' ? 'end' : 'start';
      var o = off == null ? S.off : off;
      var x = side === 'left' ? pt[0] - o : pt[0] + o;
      var cyy = pt[1] + drop;
      var cH = S.name * 1.4 + lines.length * S.lead;
      var nameY = cyy - cH / 2 + S.name;
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', pt[0]); dot.setAttribute('cy', pt[1]); dot.setAttribute('r', S.r.toFixed(1));
      dot.setAttribute('fill', '#F7F2E8');
      route.appendChild(dot);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x.toFixed(1));
      t.setAttribute('y', nameY.toFixed(1));
      t.setAttribute('text-anchor', anchor);
      t.setAttribute('fill', 'rgba(247,242,232,0.85)');
      t.setAttribute('font-family', LABEL_FONT);
      t.setAttribute('font-size', S.name.toFixed(1));
      t.setAttribute('font-weight', '500');
      t.setAttribute('letter-spacing', S.nls.toFixed(2));
      t.textContent = name;
      route.appendChild(t);
      var d = document.createElementNS(NS, 'text');
      d.setAttribute('x', x.toFixed(1));
      d.setAttribute('y', (nameY + S.name * 0.5 + S.lead).toFixed(1));
      d.setAttribute('text-anchor', anchor);
      d.setAttribute('fill', 'rgba(247,242,232,0.55)');
      d.setAttribute('font-family', LABEL_FONT);
      d.setAttribute('font-size', S.desc.toFixed(1));
      d.setAttribute('font-weight', '300');
      d.setAttribute('letter-spacing', S.dls.toFixed(2));
      lines.forEach(function (ln, i) {
        var ts = document.createElementNS(NS, 'tspan');
        ts.setAttribute('x', x.toFixed(1));
        if (i) ts.setAttribute('dy', S.lead.toFixed(1));
        ts.textContent = ln;
        d.appendChild(ts);
      });
      route.appendChild(d);
      if (!reduced) {
        [dot, t, d].forEach(function (el, i) {
          el.style.opacity = '0';
          el.style.animation = 'zha-settle 0.5s cubic-bezier(0.16, 1, 0.3, 1) ' + (1.75 + i * 0.07) + 's forwards';
          el.style.transformBox = 'fill-box';
          el.style.transformOrigin = 'center';
        });
      }
    };

    // both blocks sit outboard, just clear of their dot and of the coastlines
    var outward = 30 * u;
    var mtlOff = mtlSide === 'left' ? Math.max(S.off, Math.min(outward, mtlX - visL - blockW - 24 * u)) : S.off;
    var shzOff = shzSide === 'right' ? Math.max(S.off, Math.min(outward, visR - RIGHT_GUTTER * u - shzX - blockW - 24 * u)) : S.off;
    mark(mtl, MTL_NAME, MTL_LINES, mtlSide, mtlDrop, mtlOff);
    mark(shz, SHZ_NAME, SHZ_LINES, shzSide, shzDrop, shzOff);

    if (reduced) return;
    var traveller = document.createElementNS(NS, 'circle');
    traveller.setAttribute('r', (S.r * 0.8).toFixed(1));
    traveller.setAttribute('fill', '#F7F2E8');
    traveller.setAttribute('opacity', '0');
    route.appendChild(traveller);

    var dir = 1;
    // cubic-bezier(0.35, 0, 0.65, 1): near-constant speed, slight ease at each end
    var bez = function (t) {
      var u2 = t;
      for (var i = 0; i < 6; i++) {
        var x = 3 * (1 - u2) * (1 - u2) * u2 * 0.35 + 3 * (1 - u2) * u2 * u2 * 0.65 + u2 * u2 * u2;
        var dx = 0.35 * 3 * (1 - 4 * u2 + 3 * u2 * u2) + 0.65 * 3 * (2 * u2 - 3 * u2 * u2) + 3 * u2 * u2;
        if (Math.abs(x - t) < 1e-4) break;
        u2 -= (x - t) / (dx || 1e-6);
      }
      u2 = Math.min(1, Math.max(0, u2));
      return 3 * u2 * u2 - 2 * u2 * u2 * u2;
    };
    var travel = function () {
      var dur = 3500, t0 = performance.now();
      var step = function (now) {
        var t = Math.min((now - t0) / dur, 1);
        var e = bez(t);
        var p = arc.getPointAtLength((dir === 1 ? e : 1 - e) * len);
        traveller.setAttribute('cx', p.x);
        traveller.setAttribute('cy', p.y);
        traveller.setAttribute('opacity', Math.pow(Math.sin(Math.PI * t), 0.5).toFixed(3));
        if (t < 1) raf = requestAnimationFrame(step);
        else { traveller.setAttribute('opacity', '0'); dir *= -1; }
      };
      raf = requestAnimationFrame(step);
    };
    setTimeout(travel, 2400);
    cycle = setInterval(travel, 14500);
  }

  (async function build() {
    var W = 1600, H = 900;
    var ready = function () { return window.d3 && window.topojson; };
    for (var i = 0; i < 100 && !ready(); i++) await new Promise(function (r) { setTimeout(r, 80); });
    if (!ready()) return;
    var d3 = window.d3;
    // Atlantic-centred, so Canada reads left and China right
    var proj = d3.geoNaturalEarth1().rotate([-32, 0]).fitExtent([[-90, -40], [W + 90, H + 300]], { type: 'Sphere' });
    var path = d3.geoPath(proj);
    try {
      var topo = await fetch(TOPO_URL).then(function (r) { return r.json(); });
      // a === b keeps only exterior rings: coastlines, no internal country borders
      var shore = window.topojson.mesh(topo, topo.objects.countries, function (a, b) { return a === b; });
      var d = path(shore);
      [coastLo, coastHi].forEach(function (g) {
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d);
        g.appendChild(p);
      });
    } catch (e) { /* coastlines are decorative; the route still draws */ }

    drawRoute(proj, [coastLo, coastHi]);

    window.addEventListener('resize', function () {
      clearTimeout(redrawTimer);
      redrawTimer = setTimeout(function () {
        if (cycle) clearInterval(cycle);
        if (raf) cancelAnimationFrame(raf);
        while (route.firstChild) route.removeChild(route.firstChild);
        drawRoute(proj, [coastLo, coastHi]);
      }, 280);
    });
  })();
})();
