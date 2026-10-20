(() => {
  if (!customElements.get('aliens-recently-viewed')) {
    customElements.define('aliens-recently-viewed', class extends HTMLElement {
      connectedCallback() {
        if (this.initialized) return;
        this.initialized = true;
        if (this.dataset.enabled !== 'true' || window.Shopify?.designMode) return;
        this.onConsent = () => this.refreshHistory();
        document.addEventListener('visitorConsentCollected', this.onConsent);
        if (window.Shopify?.customerPrivacy) {
          this.refreshHistory();
        } else if (window.Shopify?.loadFeatures) {
          window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], error => {
            if (!error && this.isConnected) this.refreshHistory();
          });
        }
      }
      async refreshHistory() {
        const generation = this.generation = (this.generation || 0) + 1;
        const allowed = window.Shopify?.customerPrivacy?.analyticsProcessingAllowed?.() === true;
        this.controller?.abort();
        this.querySelector('[data-recent-grid]')?.replaceChildren();
        this.hidden = true;
        // Fail closed if the privacy API is missing or its regional consent check denies access.
        if (!allowed) return;
        const key = `aliens:recent:${this.dataset.store}`;
        let handles = [];
        try {
          const stored = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(stored)) {
            handles = [...new Set(stored.filter(handle => typeof handle === 'string' && /^[a-z0-9-]+$/.test(handle)))].slice(0, 20);
          }
          if (this.dataset.current && !window.Shopify?.designMode) {
            localStorage.setItem(key, JSON.stringify([this.dataset.current, ...handles.filter(handle => handle !== this.dataset.current)].slice(0, 20)));
          }
        } catch (_) { /* Storage may be disabled; the storefront remains usable. */ }
        const recent = handles.filter(handle => handle !== this.dataset.current).slice(0, Number(this.dataset.limit) || 4);
        if (!recent.length) return;
        this.controller = new AbortController();
        const root = (this.dataset.root || '/').replace(/\/?$/, '/');
        const results = await Promise.allSettled(recent.map(async handle => {
          const response = await fetch(`${root}products/${encodeURIComponent(handle)}.js`, { signal: this.controller.signal, credentials: 'same-origin' });
          if (!response.ok) throw new Error('Product unavailable');
          return response.json();
        }));
        if (!this.isConnected || generation !== this.generation || window.Shopify?.customerPrivacy?.analyticsProcessingAllowed?.() !== true) return;
        const list = this.querySelector('[data-recent-grid]');
        if (!list) return;
        const formatter = new Intl.NumberFormat(document.documentElement.lang || 'en', {
          style: 'currency',
          currency: window.Shopify?.currency?.active || this.dataset.currency || 'USD',
          currencyDisplay: this.dataset.currencyCode === 'true' ? 'code' : 'symbol',
        });
        results.forEach(result => {
          if (result.status !== 'fulfilled') return;
          const product = result.value;
          if (!product.handle || !Number.isFinite(product.price)) return;
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.className = 'aliens-recent-card';
          link.href = `${root}products/${encodeURIComponent(product.handle)}`;
          if (product.featured_image) {
            const image = document.createElement('img');
            const imageUrl = new URL(product.featured_image, location.origin);
            imageUrl.searchParams.set('width', '640');
            image.src = imageUrl.href;
            image.alt = '';
            image.loading = 'lazy';
            image.width = 640;
            image.height = 640;
            link.append(image);
          }
          const title = document.createElement('h3');
          title.textContent = product.title;
          const price = document.createElement('p');
          const formattedPrice = formatter.format(product.price / 100);
          price.textContent = product.price_varies ? (this.dataset.from || 'From [price]').replace('[price]', formattedPrice) : formattedPrice;
          link.append(title, price);
          item.append(link);
          list.append(item);
        });
        if (list.children.length) {
          this.hidden = false;
          this.querySelector('[data-recent-empty]')?.remove();
        }
      }
      disconnectedCallback() {
        this.controller?.abort();
        document.removeEventListener('visitorConsentCollected', this.onConsent);
        this.initialized = false;
      }
    });
  }

  if (!customElements.get('aliens-complementary')) {
    customElements.define('aliens-complementary', class extends HTMLElement {
      connectedCallback() {
        if (this.initialized || this.dataset.enabled !== 'true') return;
        this.initialized = true;
        this.observer = new IntersectionObserver(entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          this.observer.disconnect();
          this.load();
        }, { rootMargin: '400px' });
        this.observer.observe(this);
      }
      async load() {
        this.controller = new AbortController();
        try {
          const response = await fetch(this.dataset.url, { signal: this.controller.signal, credentials: 'same-origin' });
          if (!response.ok) throw new Error('Recommendations unavailable');
          const html = new DOMParser().parseFromString(await response.text(), 'text/html');
          const content = html.querySelector('[data-complementary-content]');
          if (!this.isConnected) return;
          if (content) this.replaceChildren(content);
          else if (!window.Shopify?.designMode) this.hidden = true;
        } catch (_) {
          if (!window.Shopify?.designMode) this.hidden = true;
        }
      }
      disconnectedCallback() {
        this.observer?.disconnect();
        this.controller?.abort();
      }
    });
  }
})();
