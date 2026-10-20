(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches) entry.target.classList.add('aliens-revealed');
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.12}) : null;
  function init(root = document) {
    if (document.body.classList.contains('aliens-motion') && observer) {
      root.querySelectorAll('[data-aliens-reveal]').forEach(el => observer.observe(el));
    }
  }
  init();
  document.addEventListener('shopify:section:load', e => init(e.target));
  document.addEventListener('shopify:section:unload', e => e.target.querySelectorAll('[data-aliens-reveal]').forEach(el => observer?.unobserve(el)));

  if (!customElements.get('aliens-video')) customElements.define('aliens-video', class extends HTMLElement {
    connectedCallback() {
      this.video = this.querySelector('video');
      this.onMotion = () => {
        if (reduced.matches || !document.body.classList.contains('aliens-motion')) this.video?.pause();
        else if (this.video) this.video.play().catch(() => {});
      };
      reduced.addEventListener('change', this.onMotion);
      this.onMotion();
    }
    disconnectedCallback() { reduced.removeEventListener('change', this.onMotion); }
  });
  if (!customElements.get('aliens-announcement')) customElements.define('aliens-announcement', class extends HTMLElement {
    connectedCallback() {
      this.controller = new AbortController();
      this.querySelector('[data-announcement-close]')?.addEventListener('click', () => {
        this.hidden = true;
        document.querySelector('.header__heading-link')?.focus();
      }, {signal: this.controller.signal});
    }
    disconnectedCallback() { this.controller?.abort(); }
  });
  let header;
  const updateHeader = () => header?.classList.toggle('aliens-header-scrolled', window.scrollY > 40);
  const findHeader = () => {
    header = document.querySelector('[data-aliens-transparent]');
    document.body.classList.toggle('aliens-transparent-home', Boolean(header));
    updateHeader();
  };
  findHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});
  document.addEventListener('shopify:section:load', findHeader);
  document.addEventListener('shopify:section:unload', () => requestAnimationFrame(findHeader));
})();
