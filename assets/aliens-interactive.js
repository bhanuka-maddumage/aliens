/* Custom elements initialize on insertion, including Shopify section reloads. */
if (!customElements.get('aliens-carousel')) {
  customElements.define('aliens-carousel', class extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-carousel-track]');
      this.controls = this.querySelector('[data-carousel-controls]');
      this.previous = this.querySelector('[data-carousel-prev]');
      this.next = this.querySelector('[data-carousel-next]');
      if (!this.track || !this.controls || !this.previous || !this.next) return;
      this.abortController?.abort();
      this.abortController = new AbortController();
      const options = { signal: this.abortController.signal };
      this.previous.addEventListener('click', () => this.move(-1), options);
      this.next.addEventListener('click', () => this.move(1), options);
      this.track.addEventListener('scroll', () => this.updateControls(), { ...options, passive: true });
      this.resizeObserver = new ResizeObserver(() => this.updateControls());
      this.resizeObserver.observe(this.track);
      this.updateControls();
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.resizeObserver?.disconnect();
    }

    move(direction) {
      const isRtl = getComputedStyle(this.track).direction === 'rtl';
      const distance = this.track.firstElementChild?.getBoundingClientRect().width || this.track.clientWidth;
      const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
      this.track.scrollBy({
        left: direction * (isRtl ? -1 : 1) * (distance + gap),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
    }

    updateControls() {
      const max = this.track.scrollWidth - this.track.clientWidth;
      const position = Math.abs(this.track.scrollLeft);
      this.controls.hidden = max < 2;
      this.previous.disabled = position < 2;
      this.next.disabled = position >= max - 2;
    }
  });
}
