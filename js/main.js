/**
 * VERITY FLUX — Interactive Engine
 * Handles navigation, mobile drawer, case study modals, contact form logic, and WhatsApp links.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initContactForm();
  initScrollAnimations();
  initFluxSystem();
  initScrollProgressBar();
  initProcessTimelineScroll();
});

/* ==========================================================================
   Dual Theme System (Dark & Light)
   ========================================================================== */
function initTheme() {
  const desktopBtn = document.querySelector('#themeToggleBtn');
  const mobileBtn = document.querySelector('#mobileThemeToggleBtn');

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('vt-theme', theme);
    } catch (e) { }
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    const label = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    [desktopBtn, mobileBtn].forEach(btn => {
      if (btn) {
        btn.setAttribute('title', label);
        btn.setAttribute('aria-label', label);
      }
    });
  }

  function toggleTheme() {
    const current = getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  if (desktopBtn) {
    desktopBtn.addEventListener('click', toggleTheme);
  }
  if (mobileBtn) {
    mobileBtn.addEventListener('click', toggleTheme);
  }

  updateToggleButtons(getCurrentTheme());
}

/* ==========================================================================
   Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileOverlay = document.querySelector('.mobile-drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header blur effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveNav();
  }, { passive: true });

  // Mobile menu toggle
  function toggleMenu(forceClose = false) {
    const isOpen = forceClose ? false : !mobileDrawer.classList.contains('open');
    mobileDrawer.classList.toggle('open', isOpen);
    mobileOverlay.classList.toggle('active', isOpen);
    mobileToggle.classList.toggle('active', isOpen);
    mobileToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => toggleMenu());
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => toggleMenu(true));
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // ESC key to close mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMenu(true);
    }
  });

  // Handle #work hash alias smoothly
  if (window.location.hash === '#work') {
    const testimonialsSec = document.querySelector('#testimonials');
    if (testimonialsSec) {
      setTimeout(() => {
        testimonialsSec.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }

  // Highlight active section on scroll
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          const isMatch = href === `#${sectionId}` || (sectionId === 'testimonials' && href === '#work');
          link.classList.toggle('active', isMatch);
        });
      }
    });
  }
}



function prefillContactForm(service, businessType, notes = '') {
  const serviceSelect = document.querySelector('#contactService');
  const businessSelect = document.querySelector('#contactBusinessType');
  const messageArea = document.querySelector('#contactMessage');
  const contactSection = document.querySelector('#contact');

  if (serviceSelect && service) {
    serviceSelect.value = service;
  }
  if (businessSelect && businessType) {
    businessSelect.value = businessType;
  }
  if (messageArea && notes) {
    messageArea.value = notes;
  }

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const nameField = document.querySelector('#contactName');
      if (nameField) nameField.focus();
    }, 600);
  }
}

/* ==========================================================================
   Contact Form & WhatsApp Integration
   ========================================================================== */
function initContactForm() {
  const form = document.querySelector('#projectEnquiryForm');
  const statusEl = document.querySelector('#formStatus');
  const whatsappBtn = document.querySelector('#directWhatsAppBtn');
  const whatsappNumber = '918982820353'; // Verity Flux WhatsApp

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const defaultMsg = encodeURIComponent("Hello Verity Flux team! I would like to enquire about building a website and digital services for my business.");
      window.open(`https://wa.me/${whatsappNumber}?text=${defaultMsg}`, '_blank');
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = form.querySelector('#contactName').value.trim();
    const businessName = form.querySelector('#contactBusinessName').value.trim();
    const email = form.querySelector('#contactEmail').value.trim();
    const phone = form.querySelector('#contactPhone').value.trim();
    const businessType = form.querySelector('#contactBusinessType').value;
    const service = form.querySelector('#contactService').value;
    const budget = form.querySelector('#contactBudget').value;
    const message = form.querySelector('#contactMessage').value.trim();

    if (!name || !email || !phone) {
      statusEl.className = 'form-status error';
      statusEl.innerHTML = '<strong>Please complete required fields:</strong> Name, Email, and Phone / WhatsApp number.';
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Button loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      Sending Enquiry...
    `;
    statusEl.className = 'form-status';
    statusEl.innerHTML = '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          businessName,
          email,
          phone,
          businessType,
          service,
          budget,
          message
        })
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        statusEl.className = 'form-status success';
        statusEl.innerHTML = `
          <strong>Enquiry Received!</strong> Thank you, <strong>${name}</strong>. We've logged your request and sent a confirmation receipt to <strong>${email}</strong>. A digital strategist from Verity Flux will review your brief for <em>${businessName || 'your project'}</em> and reach out within 24 hours.
          <div style="margin-top: 0.6rem;">
            <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Verity Flux, I just submitted a website enquiry for ${businessName || name} regarding ${service}. My budget is ${budget}.`)}" target="_blank" style="color: var(--gold); text-decoration: underline; font-weight: 600;">
              Want a faster response? Click here to chat with us on WhatsApp →
            </a>
          </div>
        `;
        form.reset();
      } else {
        const errorMsg = result.error || 'Unable to submit your enquiry. Please verify your details or message us directly on WhatsApp.';
        statusEl.className = 'form-status error';
        statusEl.innerHTML = `
          <strong>Could not send enquiry:</strong> ${errorMsg}
          <div style="margin-top: 0.6rem;">
            <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Verity Flux, I tried submitting an enquiry for ${businessName || name} regarding ${service} on the website. Can we connect here?`)}" target="_blank" style="color: var(--gold); text-decoration: underline; font-weight: 600;">
              Click here to message us directly on WhatsApp instead →
            </a>
          </div>
        `;
      }
    } catch (networkError) {
      statusEl.className = 'form-status error';
      statusEl.innerHTML = `
        <strong>Connection Error:</strong> Could not reach the server. Please check your internet connection or reach out to us directly on WhatsApp.
        <div style="margin-top: 0.6rem;">
          <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Verity Flux, I would like to enquire about building a website for ${businessName || name} regarding ${service}.`)}" target="_blank" style="color: var(--gold); text-decoration: underline; font-weight: 600;">
            Chat on WhatsApp (+91 89828 20353) →
          </a>
        </div>
      `;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

/* ==========================================================================
   Scroll-Reveal Animations
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.service-card, .testimonial-card, .why-card, .process-step, .industry-card, .digital-item');

  if (!('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`;
    observer.observe(el);
  });
}

/* ==========================================================================
   The Flux System Interactive Controller
   - 3D mouse parallax
   - Interactive card proximity & connection beam flaring
   - Sequential ecosystem polishing cycle
   ========================================================================== */
function initFluxSystem() {
  const heroSection = document.querySelector('.hero-section');
  const fluxSystem = document.querySelector('#fluxSystem');
  const fluxStage = document.querySelector('#fluxStage');
  const cards = document.querySelectorAll('.flux-card');

  if (!fluxSystem || !fluxStage) return;

  const beamMap = {
    'fluxCardWeb': document.querySelector('#beamWeb'),
    'fluxCardBook': document.querySelector('#beamBook'),
    'fluxCardQr': document.querySelector('#beamQr'),
    'fluxCardGrow': document.querySelector('#beamGrow')
  };

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- 1. Smooth 3D Mouse Parallax ---
  if (!isReducedMotion) {
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let isMouseOver = false;

    const onMouseMove = (e) => {
      if (window.innerWidth <= 640) return;
      const rect = fluxSystem.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotX = Math.max(-7, Math.min(7, -dy * 7));
      targetRotY = Math.max(-8, Math.min(8, dx * 8));
      isMouseOver = true;
    };

    const onMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      isMouseOver = false;
    };

    if (heroSection) {
      heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
      heroSection.addEventListener('mouseleave', onMouseLeave);
    }

    function renderParallax() {
      if (window.innerWidth > 640) {
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        fluxStage.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      } else {
        fluxStage.style.transform = 'none';
      }
      requestAnimationFrame(renderParallax);
    }
    requestAnimationFrame(renderParallax);
  }

  // --- 2. Card Proximity & Beam Lighting ---
  let isUserInteracting = false;
  let interactionTimeout = null;

  cards.forEach(card => {
    const beam = beamMap[card.id];

    card.addEventListener('mouseenter', () => {
      isUserInteracting = true;
      clearTimeout(interactionTimeout);

      // Remove automated focus during active user hover
      cards.forEach(c => c.classList.remove('active-focus'));
      card.classList.add('active-focus');

      if (beam) {
        beam.style.opacity = '1';
        beam.style.strokeWidth = '3.5px';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('active-focus');
      if (beam) {
        beam.style.opacity = '';
        beam.style.strokeWidth = '';
      }

      interactionTimeout = setTimeout(() => {
        isUserInteracting = false;
      }, 1200);
    });
  });

  // --- 3. Sequential Ecosystem Polishing Cycle ---
  if (!isReducedMotion && cards.length > 0) {
    let activeCardIndex = 0;

    setInterval(() => {
      if (isUserInteracting) return;

      cards.forEach((c, idx) => {
        const beam = beamMap[c.id];
        if (idx === activeCardIndex) {
          c.classList.add('active-focus');
          if (beam) {
            beam.style.opacity = '1';
            beam.style.strokeWidth = '3px';
          }
        } else {
          c.classList.remove('active-focus');
          if (beam) {
            beam.style.opacity = '';
            beam.style.strokeWidth = '';
          }
        }
      });

      // Clear the pulse after 2.6s so cards breathe between transitions
      setTimeout(() => {
        if (!isUserInteracting) {
          cards.forEach(c => {
            c.classList.remove('active-focus');
            const beam = beamMap[c.id];
            if (beam) {
              beam.style.opacity = '';
              beam.style.strokeWidth = '';
            }
          });
        }
      }, 2600);

      activeCardIndex = (activeCardIndex + 1) % cards.length;
    }, 4500);
  }
}

/* ==========================================================================
   Editorial Scroll Progress Bar
   ========================================================================== */
function initScrollProgressBar() {
  const bar = document.querySelector('#scrollProgressBar');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}


/* ==========================================================================
   Process Timeline Dynamic Scroll Fill & Step Activation
   ========================================================================== */
function initProcessTimelineScroll() {
  const processSection = document.querySelector('#process');
  const fill = document.querySelector('#processProgressFill');
  const steps = document.querySelectorAll('.process-step');
  if (!processSection || !fill || steps.length === 0) return;

  function onScroll() {
    const rect = processSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Track scroll engagement within process section
    const startOffset = windowHeight * 0.75;
    const totalDist = rect.height + startOffset * 0.4;
    const currentProgress = (startOffset - rect.top) / totalDist;
    const clamped = Math.max(0, Math.min(1, currentProgress));

    // Progress bar width from 0% to 100%
    fill.style.width = `${(clamped * 100).toFixed(1)}%`;

    // Activate steps sequentially (4 steps: 0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0)
    const activeIndex = Math.min(steps.length - 1, Math.floor(clamped * steps.length));
    steps.forEach((step, idx) => {
      step.classList.toggle('is-active', idx <= activeIndex);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

