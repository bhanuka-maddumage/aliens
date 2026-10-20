(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const homepage = document.body.dataset.aliensPage === 'index';
  const revealSection = section => {
    section.classList.remove('aliens-scroll-pending');
    section.classList.add('aliens-scroll-visible');
    sectionObserver?.unobserve(section);
  };
  const sectionObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) revealSection(entry.target);
    });
  }, {threshold: 0, rootMargin: '0px 0px -40px 0px'}) : null;
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches) entry.target.classList.add('aliens-revealed');
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.12}) : null;
  function init(root = document) {
    if (homepage && sectionObserver && document.body.classList.contains('aliens-motion') &&
        !reduced.matches && !window.Shopify?.designMode) {
      document.querySelectorAll('#MainContent > .shopify-section').forEach(section => {
        if (root !== document && root !== section && !root.contains(section)) return;
        if (section.querySelector('.aliens-hero--intro') ||
            section.classList.contains('aliens-scroll-visible') ||
            section.getBoundingClientRect().top < window.innerHeight) return;
        section.classList.add('aliens-scroll-section', 'aliens-scroll-pending');
        sectionObserver.observe(section);
      });
    }
    if (document.body.classList.contains('aliens-motion') && observer) {
      root.querySelectorAll('[data-aliens-reveal]').forEach(el => {
        // Homepage sections animate as a whole, without a second nested reveal.
        if (!homepage || !el.closest('#MainContent')) observer.observe(el);
      });
    }
  }
  init();
  document.addEventListener('shopify:section:load', e => init(e.target));
  document.addEventListener('shopify:section:unload', e => e.target.querySelectorAll('[data-aliens-reveal]').forEach(el => observer?.unobserve(el)));
  document.addEventListener('shopify:section:unload', e => sectionObserver?.unobserve(e.target));
  document.addEventListener('focusin', e => {
    const section = e.target.closest('.aliens-scroll-pending');
    if (section) revealSection(section);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) document.querySelectorAll('.aliens-scroll-pending').forEach(revealSection);
  });

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
