/* ============================================================
   DARK INK — script.js
   ============================================================ */

'use strict';

/* ── Nav: scroll-triggered background ─────────────────────── */
const nav = document.getElementById('nav');

const updateNav = () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
};

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ── Mobile nav toggle ─────────────────────────────────────── */
const navToggle  = document.getElementById('nav-toggle');
const navMobile  = document.getElementById('nav-mobile');
const mobileLinks = navMobile.querySelectorAll('a');

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navMobile.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Scroll-triggered animations ──────────────────────────── */
const animatedEls = document.querySelectorAll('.animate');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate--visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

animatedEls.forEach(el => observer.observe(el));

/* ── Smooth anchor scroll (keyboard & pointer) ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── Contact form: basic client-side UX ───────────────────── */
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('form-submit');
const formNote   = document.getElementById('form-note');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Visual feedback
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Sending…';

    // Simulate async (swap for real fetch/formspree/etc.)
    setTimeout(() => {
      form.innerHTML = `
        <div style="padding:2.5rem 0; text-align:center; display:flex; flex-direction:column; gap:1rem; align-items:center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c41e3a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <p style="font-family:'Fraunces',serif;font-size:1.4rem;font-style:italic;font-weight:300;color:#f5f5f5;">Message received.</p>
          <p style="font-size:0.875rem;color:#a0a0a0;">I'll be in touch within 48 hours.</p>
        </div>`;
    }, 1200);
  });
}

/* ── Clip cards: lightweight hover label swap ──────────────── */
const clipLabels = [
  'Late-Night Gaming Session',
  'Cloud Build Walkthrough',
  'Behind the Scenes',
  'Tech Talk Live',
];

document.querySelectorAll('.clip-card').forEach((card, i) => {
  const label = card.querySelector('.clip-card__label');
  if (label && clipLabels[i]) label.textContent = clipLabels[i];
});

/* ── Active nav link highlight on scroll ──────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--text-primary)'
            : '';
        });
      }
    });
  },
  { threshold: 0.35 }
);

sections.forEach(s => sectionObserver.observe(s));
