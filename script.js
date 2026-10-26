/**
 * @file script.js
 * @description Vanilla JavaScript interactions for Bukni Sri Ramagopal's Portfolio
 * Features: Light/Dark theme switching with localStorage & prefers-color-scheme,
 * mobile drawer navigation with keyboard support, scroll-spy active link tracking,
 * IntersectionObserver reveal animations, and client-side mailto form dispatch.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Theme Toggle & Preference Persistence
  // --------------------------------------------------------------------------
  const THEME_STORAGE_KEY = 'portfolio-theme-preference';
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeColorMeta = document.getElementById('theme-color-meta');

  /**
   * Safe localStorage accessor with try/catch
   */
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (err) {
      console.warn('localStorage is unavailable for reading theme preference:', err);
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      console.warn('localStorage is unavailable for saving theme preference:', err);
    }
  }

  /**
   * Determine preferred theme from storage or system query
   */
  function getPreferredTheme() {
    const saved = getStoredTheme();
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /**
   * Apply theme to root document & update meta theme color
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        'aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
      themeToggleBtn.setAttribute(
        'title',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#090d16' : '#2563eb');
    }
  }

  // Initial theme initialization
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Toggle button event handler
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      setStoredTheme(nextTheme);
    });
  }

  // React to OS-level color scheme changes if user hasn't explicitly set preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      const stored = getStoredTheme();
      if (!stored) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. Mobile Navigation Drawer & Keyboard Navigation
  // --------------------------------------------------------------------------
  const menuToggleBtn = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileNav() {
    if (!mobileNav || !menuToggleBtn) return;
    mobileNav.classList.add('is-open');
    menuToggleBtn.classList.add('is-active');
    menuToggleBtn.setAttribute('aria-expanded', 'true');
    menuToggleBtn.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileNav || !menuToggleBtn) return;
    mobileNav.classList.remove('is-open');
    menuToggleBtn.classList.remove('is-active');
    menuToggleBtn.setAttribute('aria-expanded', 'false');
    menuToggleBtn.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  if (menuToggleBtn && mobileNav) {
    menuToggleBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.contains('is-open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close when clicking any nav link
    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
      });
    });

    // Close when ESC key is pressed
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMobileNav();
        menuToggleBtn.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Scroll-Spy: Active Nav Link Highlight
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const headerOffset = 120;

    sections.forEach(function (section) {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - headerOffset;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        desktopNavLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
        mobileNavLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // --------------------------------------------------------------------------
  // 4. Scroll-Reveal Animations (Respects prefers-reduced-motion)
  // --------------------------------------------------------------------------
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // If user prefers reduced motion or API is missing, reveal immediately
    revealElements.forEach(function (el) {
      el.classList.add('is-revealed');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Contact Form Handler (Client-side mailto link builder)
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const subjectInput = document.getElementById('subject');
      const messageInput = document.getElementById('message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      // Construct formatted mailto body
      const mailRecipient = 'srirambukni@gmail.com';
      const mailSubject = subject || `Portfolio Contact from ${name}`;
      const mailBody = `Hi Sri Ramagopal,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}`;

      const mailtoUrl = `mailto:${encodeURIComponent(mailRecipient)}?subject=${encodeURIComponent(
        mailSubject
      )}&body=${encodeURIComponent(mailBody)}`;

      // Display feedback status
      if (formStatus) {
        formStatus.textContent = 'Opening your email client to send message...';
        formStatus.className = 'form-status status-success';
      }

      // Open email client
      window.location.href = mailtoUrl;
    });
  }

  // --------------------------------------------------------------------------
  // 6. Current Year Stamp in Footer
  // --------------------------------------------------------------------------
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
})();
