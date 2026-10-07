/**
 * VERITY FLUX — Dynamic JavaScript Service Pages Engine
 * Renders dedicated service description pages dynamically via JavaScript.
 * Supports URL hash routing (#service/{id}), browser back/forward history,
 * and seamless transitions matching the coffee/beige luxury aesthetic.
 */

(function () {
  const DEFAULT_TITLE = "Verity Flux | Digital Experiences Built for Growing Businesses";

  function getServiceIdFromHash() {
    const hash = window.location.hash || '';
    if (hash.startsWith('#service/')) {
      const slug = hash.replace('#service/', '').trim();
      return slug.replace('.html', '');
    }
    return null;
  }

  function renderServicePage(serviceId) {
    const data = window.VERITY_SERVICES_DATA;
    if (!data || !data[serviceId]) {
      closeServicePage();
      return;
    }

    const s = data[serviceId];
    const prevService = data[s.prevId] || null;
    const nextService = data[s.nextId] || null;

    const container = document.getElementById('serviceDetailPage');
    const mainContent = document.getElementById('mainLandingContent');

    if (!container || !mainContent) return;

    // Update Document Title
    document.title = `${s.title} | Verity Flux`;

    // Render Highlights
    const highlightsHtml = s.highlights.map(h => `
      <div class="service-highlight-item">
        <div class="service-highlight-label">${h.label}</div>
        <div class="service-highlight-val">${h.value}</div>
      </div>
    `).join('');

    // Render Why Needed Paragraphs
    const whyHtml = s.whyNeeded.map(p => `
      <p class="service-text-card-p">${p}</p>
    `).join('');

    // Render What We Provide Paragraphs
    const whatHtml = s.whatWeProvide.map(p => `
      <p class="service-text-card-p">${p}</p>
    `).join('');

    // Render 4 Benefits Cards
    const benefitsHtml = s.benefits.map(b => `
      <div class="service-benefit-card">
        <span class="service-benefit-icon">${b.icon}</span>
        <h3 class="service-benefit-title">${b.title}</h3>
        <p class="service-benefit-desc">${b.desc}</p>
      </div>
    `).join('');

    // Render 6 Scope Included Cards
    const includedHtml = s.included.map(item => `
      <div class="service-included-card">
        <div class="service-included-check">✓</div>
        <div>
          <div class="service-included-title">${item.title}</div>
          <div class="service-included-desc">${item.desc}</div>
        </div>
      </div>
    `).join('');

    // WhatsApp Message
    const waText = encodeURIComponent(`Hi Verity Flux, I am interested in discussing ${s.title} for my business.`);

    // Build Complete Page Template
    container.innerHTML = `
      <!-- Service Hero -->
      <section class="service-detail-hero">
        <div class="container">
          <div class="service-breadcrumb">
            <a href="#hero" class="js-home-link">Home</a>
            <span class="service-breadcrumb-sep">/</span>
            <a href="#services" class="js-back-to-services">Services</a>
            <span class="service-breadcrumb-sep">/</span>
            <span>${s.title}</span>
          </div>

          <div class="service-hero-badge">
            <span>${s.tag}</span>
          </div>

          <h1 class="service-hero-title">${s.headline}</h1>

          <p class="service-hero-lead">${s.shortDesc}</p>

          <div class="service-hero-actions">
            <a href="#services" class="btn btn-secondary js-back-to-services">
              ← Back to All Services
            </a>
          </div>

          <div class="service-hero-highlights">
            ${highlightsHtml}
          </div>
        </div>
      </section>

      <!-- Why & What Section -->
      <section class="service-content-section alt-bg">
        <div class="container">
          <div class="service-two-col">
            <div class="service-text-card">
              <div class="service-text-card-tag">The Challenge</div>
              <h2 class="service-text-card-title">Why Your Business Needs It</h2>
              ${whyHtml}
            </div>

            <div class="service-text-card">
              <div class="service-text-card-tag">Our Craftsmanship</div>
              <h2 class="service-text-card-title">What Verity Flux Provides</h2>
              ${whatHtml}
            </div>
          </div>
        </div>
      </section>

      <!-- Key Benefits -->
      <section class="service-content-section">
        <div class="container">
          <div class="section-header text-center">
            <div class="section-label"><span class="label-track">BENEFITS</span> <span class="label-divider">/</span> STRATEGIC IMPACT</div>
            <h2 class="section-heading">Key Benefits for Your Brand</h2>
            <p class="section-subheading">
              How investing in ${s.title} delivers immediate and measurable results.
            </p>
          </div>

          <div class="service-benefits-grid">
            ${benefitsHtml}
          </div>
        </div>
      </section>

      <!-- What Is Included -->
      <section class="service-content-section alt-bg">
        <div class="container">
          <div class="section-header text-center">
            <div class="section-label"><span class="label-track">DELIVERABLES</span> <span class="label-divider">/</span> SCOPE OF WORK</div>
            <h2 class="section-heading">What Is Included</h2>
            <p class="section-subheading">
              Complete, transparent scope of deliverables engineered for your success.
            </p>
          </div>

          <div class="service-included-grid">
            ${includedHtml}
          </div>
        </div>
      </section>

      <!-- Service Switcher & CTA Box -->
      <section class="service-content-section">
        <div class="container">
          <div class="service-nav-bar">
            ${prevService ? `
              <a href="#service/${prevService.id}" class="service-nav-link">
                ← Previous: ${prevService.title}
              </a>
            ` : '<span></span>'}
            <a href="#services" class="service-nav-link js-back-to-services">
              ↑ All Services Overview
            </a>
            ${nextService ? `
              <a href="#service/${nextService.id}" class="service-nav-link">
                Next: ${nextService.title} →
              </a>
            ` : '<span></span>'}
          </div>

          <div class="service-cta-box">
            <h2 class="service-cta-title">Ready to get started with ${s.title}?</h2>
            <p class="service-cta-desc">
              Let's craft a tailored solution that clarifies your offer, attracts qualified clients, and elevates your business online.
            </p>
            <div class="service-cta-btns">
              <button type="button" class="btn btn-primary js-start-service-project" data-service-name="${s.title}">
                Start Your Project →
              </button>
              <a href="https://wa.me/918982820353?text=${waText}" target="_blank" class="btn btn-outline" rel="noopener noreferrer">
                Discuss on WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </section>
    `;

    // Switch View
    mainContent.style.display = 'none';
    container.style.display = 'block';

    // Scroll to Top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Attach Interactivity inside the rendered view
    attachServicePageEvents(container, s.title);
  }

  function closeServicePage(targetHash = '#services') {
    const container = document.getElementById('serviceDetailPage');
    const mainContent = document.getElementById('mainLandingContent');

    if (!container || !mainContent) return;

    container.style.display = 'none';
    container.innerHTML = '';
    mainContent.style.display = 'block';

    document.title = DEFAULT_TITLE;

    // Scroll to the targeted section
    if (targetHash) {
      const targetEl = document.querySelector(targetHash);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  }

  function attachServicePageEvents(container, serviceTitle) {
    // Back to services links
    container.querySelectorAll('.js-back-to-services').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '#services');
        closeServicePage('#services');
      });
    });

    // Back to home link
    container.querySelectorAll('.js-home-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '#hero');
        closeServicePage('#hero');
      });
    });

    // Start Project button (pre-fills form & scrolls to contact)
    container.querySelectorAll('.js-start-service-project').forEach(btn => {
      btn.addEventListener('click', () => {
        const sName = btn.getAttribute('data-service-name') || serviceTitle;
        closeServicePage('#contact');
        history.pushState(null, '', '#contact');

        // Pre-fill dropdown
        setTimeout(() => {
          const select = document.querySelector('#contactService');
          if (select) {
            for (let i = 0; i < select.options.length; i++) {
              if (select.options[i].value.toLowerCase().includes(sName.toLowerCase()) ||
                  select.options[i].text.toLowerCase().includes(sName.toLowerCase())) {
                select.selectedIndex = i;
                break;
              }
            }
          }
          const nameField = document.querySelector('#contactName');
          if (nameField) nameField.focus();
        }, 150);
      });
    });
  }

  function handleRoute() {
    const serviceId = getServiceIdFromHash();
    if (serviceId) {
      renderServicePage(serviceId);
    } else {
      const container = document.getElementById('serviceDetailPage');
      if (container && container.style.display !== 'none') {
        const currentHash = window.location.hash || '#hero';
        closeServicePage(currentHash);
      }
    }
  }

  // Listen to hash changes & initial load
  window.addEventListener('hashchange', handleRoute);
  document.addEventListener('DOMContentLoaded', () => {
    // Handle initial route if landing directly on #service/{id}
    if (getServiceIdFromHash()) {
      handleRoute();
    }
  });

  // Expose helper globally
  window.VerityServicePages = {
    open: (id) => {
      window.location.hash = `#service/${id}`;
    },
    close: closeServicePage
  };
})();
