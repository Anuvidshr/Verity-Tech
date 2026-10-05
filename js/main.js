/**
 * VERITY TECH — Interactive Engine
 * Handles navigation, mobile drawer, case study modals, contact form logic, and WhatsApp links.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initContactForm();
  initScrollAnimations();
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
  const whatsappNumber = '918982820353'; // Verity Tech WhatsApp

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const defaultMsg = encodeURIComponent("Hello Verity Tech team! I would like to enquire about building a website and digital services for my business.");
      window.open(`https://wa.me/${whatsappNumber}?text=${defaultMsg}`, '_blank');
    });
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
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
      alert('Please fill in your Name, Email, and Phone / WhatsApp number.');
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

    // Simulate reliable submission (ready to plug in Formspree/EmailJS)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      statusEl.className = 'form-status success';
      statusEl.innerHTML = `
        <strong>Enquiry Received!</strong> Thank you, <strong>${name}</strong>. A digital strategist from Verity Tech will review your requirements for <em>${businessName || 'your business'}</em> and reach out within 24 hours.
        <div style="margin-top: 0.6rem;">
          <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Verity Tech, I just submitted an inquiry for ${businessName || name} regarding ${service}. My budget is ${budget}.`)}" target="_blank" style="color: #63E6BE; text-decoration: underline; font-weight: 600;">
            Want a faster response? Click here to chat with us on WhatsApp (+91 89828 20353) →
          </a>
        </div>
      `;

      form.reset();
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 900);
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
