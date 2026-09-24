(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Nav: scrolled state + mobile menu
  const nav = document.querySelector('.site-nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    links.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Count-up
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduce) { el.textContent = target; return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('[data-count]').forEach(countUp);

  // Uptime bars (30 days, one minor incident)
  const bars = document.getElementById('uptime-bars');
  for (let i = 0; i < 30; i++) {
    const b = document.createElement('i');
    if (i === 17) b.className = 'warn';
    b.style.transitionDelay = `${i * 25}ms`;
    bars.appendChild(b);
  }

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // Billing toggle
  const billingButtons = document.querySelectorAll('[data-billing]');
  billingButtons.forEach((btn) => btn.addEventListener('click', () => {
    billingButtons.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    const mode = btn.dataset.billing;
    document.querySelectorAll('.amount').forEach((el) => {
      const from = Number(el.textContent);
      const to = Number(el.dataset[mode]);
      if (reduce) { el.textContent = to; return; }
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 500, 1);
        el.textContent = Math.round(from + (to - from) * p);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }));

  // Typing terminal
  const term = document.querySelector('#term code');
  const lines = [
    ['cm', '$ orbita deploy mi-sitio.com'],
    ['', '→ Subiendo archivos…  128 MB'],
    ['', '→ Configurando PHP 8.3 + NVMe'],
    ['ok', '✓ SSL emitido (Let’s Encrypt)'],
    ['ok', '✓ CDN activo en 6 regiones'],
    ['ok', '✓ En línea en 42s · 99.99% uptime'],
  ];
  const render = (count, partial = '') => {
    term.innerHTML = lines.slice(0, count).map(([c, t]) => `<span class="${c}">${t}</span>`).join('\n') +
      (count < lines.length ? `${count ? '\n' : ''}<span class="${lines[count][0]}">${partial}</span>` : '') +
      '<span class="caret"></span>';
  };
  if (reduce) {
    render(lines.length);
  } else {
    let line = 0; let ch = 0;
    const type = () => {
      if (line >= lines.length) { setTimeout(() => { line = 0; ch = 0; type(); }, 3500); return; }
      const text = lines[line][1];
      ch++;
      render(line, text.slice(0, ch));
      if (ch >= text.length) { line++; ch = 0; render(line); setTimeout(type, 420); }
      else setTimeout(type, line === 0 ? 55 : 18);
    };
    setTimeout(type, 700);
  }

  // Pointer FX: cursor glow, card spotlight, 3D tilt
  if (finePointer && !reduce) {
    const glow = document.querySelector('.cursor-glow');
    window.addEventListener('pointermove', (e) => {
      glow.style.setProperty('--x', `${e.clientX}px`);
      glow.style.setProperty('--y', `${e.clientY}px`);
    }, { passive: true });

    document.querySelectorAll('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const strength = el.classList.contains('orbit-stage') ? 10 : 6;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * strength}deg) rotateY(${(x - 0.5) * strength}deg)`;
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
})();
