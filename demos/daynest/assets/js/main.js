(function () {
  const S = window.SITE || {};

  function injectShared() {
    document.querySelectorAll('[data-site]').forEach((el) => {
      const key = el.getAttribute('data-site');
      if (Object.prototype.hasOwnProperty.call(S, key)) el.textContent = S[key];
    });
    document.querySelectorAll('[data-site-href]').forEach((el) => {
      const key = el.getAttribute('data-site-href');
      if (S[key]) el.setAttribute('href', S[key]);
    });
  }

  function mobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-menu-panel]');
    if (!toggle || !panel) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      panel.inert = true;
      toggle.setAttribute('aria-label', 'เปิดเมนู');
      document.body.classList.remove('menu-open');
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
      panel.inert = open;
      toggle.setAttribute('aria-label', open ? 'เปิดเมนู' : 'ปิดเมนู');
      document.body.classList.toggle('menu-open', !open);
    });

    window.addEventListener('resize', () => { if (window.innerWidth > 820) close(); });
    panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
  }

  function headerScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function reviewSlider() {
    const slides = [...document.querySelectorAll('[data-review]')];
    const dots = [...document.querySelectorAll('[data-review-dot]')];
    if (slides.length < 2) return;
    let index = 0;

    function show(i) {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
      index = i;
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(() => { if (!document.hidden && !document.querySelector('.review-shell:hover, .review-shell:focus-within')) show((index + 1) % slides.length); }, 5200);
    }
  }

  function categoryHover() {
    const rows = [...document.querySelectorAll('[data-category-row]')];
    const image = document.querySelector('[data-category-image]');
    if (!rows.length || !image) return;
    rows.forEach((row) => {
      const update = () => {
        const src = row.getAttribute('data-image');
        if (src) image.style.backgroundImage = `url('${src}')`;
      };
      row.addEventListener('mouseenter', update);
      row.addEventListener('focus', update);
    });
  }

  function filterMenu() {
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const groups = [...document.querySelectorAll('[data-menu-group]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      groups.forEach(group => { group.hidden = button.dataset.filter !== 'all' && group.dataset.menuGroup !== button.dataset.filter; });
    }));
  }
  filterMenu();
  injectShared();
  mobileMenu();
  headerScroll();
  reviewSlider();
  categoryHover();
})();
