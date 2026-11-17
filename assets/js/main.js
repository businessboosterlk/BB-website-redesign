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
    setTimeout(function () { items.forEach(function (el) { el.classList.add('in'); }); }, 6000);
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
