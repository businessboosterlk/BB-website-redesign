/* Business Booster 2027 — small, dependency-free enhancements. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav: solid background after scrolling */
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', scrollY > 30); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Mobile menu */
  var btn = document.querySelector('.menu-btn');
  var menu = document.querySelector('.mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) btn.click(); });
  }

  /* Reveal on scroll (content is readable before this runs) */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });

  } else { doc.classList.add('no-observer'); }

  /* Statement: words light up as the paragraph scrolls through the viewport */
  var st = document.querySelector('[data-words]');
  if (st) {
    var html = st.innerHTML.replace(/<span class="hl">(.*?)<\/span>|([^\s<]+)/g, function (m, hl, w) {
      if (hl) return hl.split(' ').map(function (x) { return '<span class="w hl">' + x + '</span>'; }).join(' ');
      return '<span class="w">' + w + '</span>';
    });
    st.innerHTML = html;
    var words = st.querySelectorAll('.w');
    function light() {
      var r = st.getBoundingClientRect();
      var p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
      var n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
    }
    if (reduce) words.forEach(function (w) { w.classList.add('lit'); });
    else { addEventListener('scroll', light, { passive: true }); addEventListener('resize', light); light(); }
  }

  /* Orange light trails drawn on canvas (hero and reel placeholders).
     To use a real film instead, put <video autoplay muted loop playsinline src="assets/video/reel.mp4"> in place of the canvas. */
  /* Hero film: fade in once it plays; the light-trail canvas stays as the fallback */
  document.querySelectorAll('.hero-film').forEach(function (film) {
    if (reduce) return;
    var frame = film.closest('.hero-frame');
    var clips; try { clips = JSON.parse(film.getAttribute('data-clips')); } catch (e) { return; }
    var vids = film.querySelectorAll('video'), tags = frame.querySelector('.film-tags');
    var SHOW = 4200, i = 0, cur = 0, timer;
    if (tags) tags.innerHTML = clips.map(function (c) { return '<li>' + c.label + '</li>'; }).join('');
    function mark() { if (tags) [].forEach.call(tags.children, function (li, k) { li.classList.toggle('on', k === i); }); }
    function load(v, k) { v.src = clips[k].src; v.load(); }
    function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    vids[0].addEventListener('playing', function first() {
      vids[0].removeEventListener('playing', first);
      frame.classList.add('has-video'); mark();
      load(vids[1], 1 % clips.length);
      timer = setInterval(next, SHOW);
    });
    function next() {
      var a = vids[cur], b = vids[1 - cur];
      i = (i + 1) % clips.length;
      b.currentTime = 0; play(b); b.classList.add('on'); a.classList.remove('on');
      cur = 1 - cur; mark();
      setTimeout(function () { a.pause(); load(a, (i + 1) % clips.length); }, 1200);
    }
    vids.forEach(function (v) { v.loop = true; });
    vids[0].classList.add('on'); load(vids[0], 0); play(vids[0]);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearInterval(timer); vids[cur].pause(); }
      else if (frame.classList.contains('has-video')) { play(vids[cur]); clearInterval(timer); timer = setInterval(next, SHOW); }
    });
  });

  document.querySelectorAll('canvas.streaks').forEach(function (c) { lights(c); });
  function lights(c) {
    if (!c.getContext) return;
    var ctx = c.getContext('2d'), W, H, dpr, streaks = [], running = true, raf;
    var palette = ['255,90,31', '255,138,61', '255,180,120', '255,226,200', '200,60,10'];
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, W / 14));
      streaks = [];
      for (var i = 0; i < count; i++) streaks.push(make(true));
      ctx.fillStyle = '#050302'; ctx.fillRect(0, 0, W, H);
    }
    function make(anywhere) {
      var cy = H * (0.28 + Math.random() * 0.5);
      return {
        x: anywhere ? Math.random() * W : -Math.random() * W * 0.4,
        y: cy + (Math.random() - 0.5) * H * 0.18,
        len: 80 + Math.random() * 420, v: 0.6 + Math.random() * 3.2, w: 0.6 + Math.random() * 2.6,
        col: palette[(Math.random() * palette.length) | 0], a: 0.25 + Math.random() * 0.6, wob: Math.random() * Math.PI * 2
      };
    }
    function frame(t) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5,3,2,0.22)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < streaks.length; i++) {
        var s = streaks[i];
        s.x += s.v; var y = s.y + Math.sin(t / 1400 + s.wob) * 6;
        var g = ctx.createLinearGradient(s.x - s.len, y, s.x, y);
        g.addColorStop(0, 'rgba(' + s.col + ',0)');
        g.addColorStop(0.85, 'rgba(' + s.col + ',' + s.a + ')');
        g.addColorStop(1, 'rgba(255,240,225,' + Math.min(1, s.a + 0.3) + ')');
        ctx.strokeStyle = g; ctx.lineWidth = s.w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x - s.len, y); ctx.lineTo(s.x, y); ctx.stroke();
        if (s.x - s.len > W) streaks[i] = make(false);
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    size();
    addEventListener('resize', size);
    if (reduce) { for (var k = 0; k < 120; k++) frame(k * 16); running = false; return; }
    raf = requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) {
      var vis = e[0].isIntersecting;
      if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
      if (!vis) { running = false; cancelAnimationFrame(raf); }
    }).observe(c);
  }

  /* Contact form: compose a WhatsApp message from the fields */
  var form = document.querySelector('[data-wa-form]');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), lines = ['Hi Business Booster.'];
    if (f.get('name')) lines.push('I am ' + f.get('name') + (f.get('business') ? ' from ' + f.get('business') : '') + '.');
    if (f.get('need')) lines.push('I need help with: ' + f.get('need') + '.');
    if (f.get('message')) lines.push(f.get('message'));
    location.href = 'https://wa.me/94767412531?text=' + encodeURIComponent(lines.join(' '));
  });

  var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- v2: cursor glow, spotlight cards, scroll services, stacked work ---------- */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;

  /* Cursor-following gradient across the whole site */
  if (fine && !reduce) {
    var g = document.createElement('div'); g.className = 'cursor-glow'; g.setAttribute('aria-hidden', 'true');
    document.body.appendChild(g);
    var tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, raf = 0;
    function tick() {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      g.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(tick) : 0;
    }
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY; g.classList.add('on');
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { g.classList.remove('on'); });
  }

  /* Spotlight that follows the pointer inside cards */
  if (fine) document.querySelectorAll('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Services: sticky stage swaps illustration as each step scrolls into the middle */
  var scroller = document.querySelector('.svc-scroll');
  if (scroller) {
    var stage = scroller.querySelector('.svc-stage');
    var steps = [].slice.call(scroller.querySelectorAll('.svc-step'));
    var count = stage.querySelector('.svc-stage-count b');
    var bar = stage.querySelector('.svc-progress i');
    var ills = steps.map(function (s) {
      var src = s.querySelector('.ill-inline .ill');
      var c = src.cloneNode(true); stage.appendChild(c); return c;
    });
    function setActive(i) {
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); ills[k].classList.toggle('on', k === i); });
      if (count) count.textContent = String(i + 1).padStart(2, '0');
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
    }
    setActive(0);
    function onScroll() {
      var mid = innerHeight * 0.5, best = 0, bestD = Infinity;
      steps.forEach(function (s, k) {
        var r = s.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = k; }
      });
      setActive(best);
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Work: earlier cards shrink and dim as the next one stacks over them */
  var cards = [].slice.call(document.querySelectorAll('.stack-card'));
  if (cards.length && !reduce) {
    function stack() {
      cards.forEach(function (c, i) {
        var next = cards[i + 1]; if (!next) { c.style.transform = ''; c.style.filter = ''; return; }
        var r = c.getBoundingClientRect(), n = next.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (r.bottom - n.top) / r.height));
        c.style.transform = 'scale(' + (1 - p * 0.06) + ')';
        c.style.filter = 'brightness(' + (1 - p * 0.45) + ')';
      });
    }
    addEventListener('scroll', stack, { passive: true }); addEventListener('resize', stack); stack();
  }

  /* Muted background videos on sub-pages: respect reduced motion */
  if (reduce) document.querySelectorAll('.media-tile video').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
})();

/* ---------- v3: text reveal, floating WhatsApp, reel parallax ---------- */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Section titles read as one line: turn their line breaks into spaces */
  document.querySelectorAll('.section-head h2 br').forEach(function (b) { b.replaceWith(' '); });

  /* Split headings into words so each line slides up from a mask */
  function splitWords(el) {
    var w = 0, walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        var m = document.createElement('span'); m.className = 'wm';
        var i = document.createElement('span'); i.className = 'wi'; i.style.setProperty('--w', w++); i.textContent = p;
        m.appendChild(i); frag.appendChild(m);
      });
      n.parentNode.replaceChild(frag, n);
    });
    el.classList.add('wsplit');
  }

  var scope = document.querySelectorAll('main, .footer');
  var headSel = 'h1, h2, .stack-info h3, .svc-step h3, .pillar h3, .tool h3, .split-card h3, .step h3, .team-intro h3';
  var textSel = 'p, .label, .btn, .pill-row, .stack-tags, .stack-meta, .stack-head, .checks li, .svc-step ul, .svc-step .idx, .svc-step .more, .hero-actions, .film-tags, .faq details, .sector, .cta-contacts, .footer li, .socials, .wordmark, .marquee';
  var skip = function (el) { return el.closest('.ill, [data-reveal], .statement, .mobile-menu, .nav, .reel, .cta-row .btn, .wa-float') && !el.matches('[data-reveal]'); };

  var targets = [];
  scope.forEach(function (root) {
    root.querySelectorAll(headSel).forEach(function (h) { if (!skip(h) && !h.closest('.wsplit')) { splitWords(h); h.classList.add('tx-h'); targets.push(h); } });
    root.querySelectorAll(textSel).forEach(function (t) { if (!skip(t) && !t.closest('.tx') && !t.closest('.wsplit') && !t.querySelector('.wsplit')) { t.classList.add('tx'); targets.push(t); } });
  });
  /* the reel and the CTA panel animate as whole blocks */
  document.querySelectorAll('.reel, .cta').forEach(function (b) { if (!b.hasAttribute('data-reveal')) b.setAttribute('data-reveal', ''); });

  /* Stagger items that enter the screen together */
  function show(list) {
    list.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
    list.forEach(function (el, k) { el.style.setProperty('--d', Math.min(k * 0.08, 0.6) + 's'); el.classList.add('in'); });
  }
  if (reduce || !hasIO) { doc.classList.add('no-observer'); targets.forEach(function (t) { t.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (entries) {
      var batch = [];
      entries.forEach(function (e) { if (e.isIntersecting) { batch.push(e.target); io.unobserve(e.target); } });
      if (batch.length) show(batch);
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(function (t) { io.observe(t); });
    document.querySelectorAll('[data-reveal]').forEach(function (t) { io.observe(t); });
  }

  /* Floating "Chat with us" button, shown once the hero is scrolled past */
  var wa = document.createElement('a');
  wa.className = 'wa-float';
  wa.href = 'https://wa.me/94767412531?text=' + encodeURIComponent("Hi Business Booster, I'd like to talk about growing my business.");
  wa.setAttribute('aria-label', 'Chat with us on WhatsApp');
  wa.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4Z"/></svg><span>Chat with us</span>';
  document.body.appendChild(wa);
  var hero = document.querySelector('.hero, .sub-hero, .page-hero');
  function toggleWa() {
    var limit = hero ? hero.offsetTop + hero.offsetHeight * 0.75 : 400;
    var menuOpen = document.querySelector('.mobile-menu.open');
    wa.classList.toggle('show', scrollY > limit && !menuOpen);
  }
  addEventListener('scroll', toggleWa, { passive: true }); addEventListener('resize', toggleWa); toggleWa();

  /* Reel photo drifts slowly as the section scrolls */
  var img = document.querySelector('.reel-img');
  if (img && !reduce) {
    var box = img.parentElement;
    function par() {
      var r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      img.style.setProperty('--py', (p * -40).toFixed(1) + 'px');
    }
    addEventListener('scroll', par, { passive: true }); par();
  }
})();

/* ---------- v4: light / dark theme toggle ---------- */
(function () {
  var d = document.documentElement;
  function label() {
    var light = d.getAttribute('data-theme') === 'light';
    document.querySelectorAll('.theme-btn').forEach(function (b) { b.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme'); });
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', light ? '#ffffff' : '#060606');
  }
  document.querySelectorAll('.theme-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = d.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      d.setAttribute('data-theme', next);
      try { localStorage.setItem('bb-theme', next); } catch (e) {}
      label();
    });
  });
  label();
})();

/* ---------- v5: nav switches to dark glass while it sits over the hero ---------- */
(function () {
  var nav = document.querySelector('.nav'), hero = document.querySelector('.hero-frame');
  if (!nav || !hero) return;
  function check() { nav.classList.toggle('on-hero', hero.getBoundingClientRect().bottom > nav.offsetHeight + 20); }
  addEventListener('scroll', check, { passive: true }); addEventListener('resize', check); check();
})();
