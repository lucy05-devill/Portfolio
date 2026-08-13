document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. Draw the hero arc line on load ---- */
  const arcPath = document.getElementById('arc-path');
  if (arcPath) {
    if (reduceMotion) {
      arcPath.classList.add('drawn');
    } else {
      requestAnimationFrame(() => {
        setTimeout(() => arcPath.classList.add('drawn'), 200);
      });
    }
  }

  /* ---- 2. Scroll reveal ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---- 3. Count-up metrics ---- */
  const counters = document.querySelectorAll('.count');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion || !target) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => countObserver.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---- 4. Active tab highlighting on scroll ---- */
  const tabs = document.querySelectorAll('[data-tab]');
  const sections = Array.from(tabs).map((tab) => document.querySelector(tab.getAttribute('href')));

  const setActiveTab = () => {
    const scrollPos = window.scrollY + 140;
    let activeIndex = 0;
    sections.forEach((section, i) => {
      if (section && section.offsetTop <= scrollPos) activeIndex = i;
    });
    tabs.forEach((tab, i) => {
      const isActive = i === activeIndex;
      tab.classList.toggle('active', isActive);
      if (isActive) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });
  };

  window.addEventListener('scroll', setActiveTab, { passive: true });
  setActiveTab();
});
