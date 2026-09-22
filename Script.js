// ===== Year in footer =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Scroll progress bar + nav state + back-to-top =====
const progressBar = document.getElementById('progressBar');
const nav = document.getElementById('nav');
const toTop = document.getElementById('toTop');

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
  if (nav) nav.classList.toggle('is-scrolled', scrollTop > 24);
  if (toTop) toTop.classList.toggle('is-visible', scrollTop > 600);
}
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== Mobile nav toggle =====
const navBurger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

if (navBurger && navLinks) {
  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navBurger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navBurger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Scroll reveal (staggered, per section) =====
const revealEls = document.querySelectorAll('[data-reveal]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const groups = new Map(); // parent -> [elements] to stagger together

  revealEls.forEach(el => {
    const parent = el.closest('section, header') || document.body;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const parent = el.closest('section, header') || document.body;
      const siblings = groups.get(parent) || [el];
      const index = siblings.indexOf(el);
      el.style.transitionDelay = (index * 90) + 'ms';
      el.classList.add('is-visible');
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// ===== Count-up stats =====
const statNums = document.querySelectorAll('.stat__num');

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

if ('IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => statObserver.observe(el));
} else {
  statNums.forEach(el => { el.textContent = (parseInt(el.dataset.count, 10) || 0).toLocaleString(); });
}

// ===== Testimonial slider =====
const reviews = document.querySelectorAll('.review');
const reviewDots = document.querySelectorAll('.review-dots button');
const reviewPrev = document.getElementById('reviewPrev');
const reviewNext = document.getElementById('reviewNext');
let reviewIndex = 0;
let reviewTimer;

function showReview(index) {
  reviewIndex = (index + reviews.length) % reviews.length;
  reviews.forEach((r, i) => r.classList.toggle('is-active', i === reviewIndex));
  reviewDots.forEach((d, i) => d.classList.toggle('is-active', i === reviewIndex));
}

function startReviewAutoplay() {
  clearInterval(reviewTimer);
  if (prefersReducedMotion) return;
  reviewTimer = setInterval(() => showReview(reviewIndex + 1), 6000);
}

if (reviews.length) {
  reviewDots.forEach((dot, i) => dot.addEventListener('click', () => { showReview(i); startReviewAutoplay(); }));
  if (reviewPrev) reviewPrev.addEventListener('click', () => { showReview(reviewIndex - 1); startReviewAutoplay(); });
  if (reviewNext) reviewNext.addEventListener('click', () => { showReview(reviewIndex + 1); startReviewAutoplay(); });
  startReviewAutoplay();
}

// ===== Hero blob subtle parallax on pointer move (desktop only) =====
const heroSection = document.getElementById('hero');
if (heroSection && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
  const blobs = heroSection.querySelectorAll('.hero__blob');
  heroSection.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 18;
    const y = (e.clientY / innerHeight - 0.5) * 18;
    blobs.forEach((blob, i) => {
      const factor = i === 0 ? 1 : -1;
      blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
}

// ===== Search form: gentle placeholder guard (no backend yet) =====
document.querySelectorAll('.hero__search, .footer__newsletter').forEach(form => {
  form.addEventListener('submit', (e) => e.preventDefault());
});
