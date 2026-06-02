/* ============================================================
   DARK OPS — script.js
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

const SUCCESS_HTML = `
  <div style="padding:2.5rem 0; text-align:center; display:flex; flex-direction:column; gap:1rem; align-items:center;">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c41e3a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <p style="font-family:'Fraunces',serif;font-size:1.4rem;font-style:italic;font-weight:300;color:#f5f5f5;">Message received.</p>
    <p style="font-size:0.875rem;color:#a0a0a0;">I'll be in touch within 48 hours.</p>
  </div>`;

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Visual feedback
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';
    formNote.style.color  = '';

    const fd = new FormData(form);
    const payload = {
      name:    fd.get('name')    || '',
      email:   fd.get('email')   || '',
      subject: fd.get('subject') || '',
      message: fd.get('message') || '',
      company: fd.get('company') || '', // honeypot — real users leave this blank
    };

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      form.innerHTML = SUCCESS_HTML;
    } catch (err) {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send message';
      formNote.textContent  = `Couldn't send — ${err.message} You can also email admin@darkops.com directly.`;
      formNote.style.color  = 'var(--accent-text)';
    }
  });
}

/* ── Tool modal ────────────────────────────────────────────── */
const toolDescriptions = {
  gcp: {
    title: 'Google Cloud Platform',
    body: [
      'Google Cloud Platform (GCP) is the infrastructure layer behind everything I build. It provides the services that make automation reliable, scalable, and yours — rather than dependent on a third-party SaaS tool that can change pricing or disappear.',
      'The GCP services I use most: <strong>Cloud Functions</strong> and <strong>Cloud Run</strong> for running automation logic serverlessly, <strong>BigQuery</strong> for data warehousing and SQL analytics, <strong>Cloud Storage</strong> for file handling and data staging, <strong>Pub/Sub</strong> for event-driven messaging between systems, and <strong>Cloud Scheduler</strong> for running jobs on a timed basis.',
      'Building on GCP means your automations live in your own Google account — you own the infrastructure, you control the costs, and there is no vendor lock-in to a tool I chose for convenience.'
    ]
  },
  python: {
    title: 'Python',
    body: [
      'Python is the primary language I use to write automation logic, data transformations, and API integrations. It is well-suited for this work because of its readability, extensive library ecosystem, and first-class support across all GCP services.',
      'In practice this looks like: pulling data from an API and loading it into BigQuery, transforming a messy CSV export into a clean structured table, writing the logic that decides how a lead gets routed, or building a lightweight backend that your internal tool talks to.',
      'Python code is also easy to hand off. If your team ever wants to take ownership of what I built, the code is readable and well-documented — not a black box.'
    ]
  },
  sql: {
    title: 'SQL',
    body: [
      'SQL (Structured Query Language) is the standard language for working with structured data. In the context of GCP, this typically means <strong>BigQuery SQL</strong> — used to query, clean, join, and aggregate data from multiple sources into something actionable.',
      'If your business has data sitting in spreadsheets, exports, or databases that you cannot easily make sense of, SQL is usually the first tool applied. It is how raw data becomes a report, a dashboard, or an input to the next step in a pipeline.',
      'SQL is not a product you subscribe to — it is a language that runs wherever your data lives. On GCP, BigQuery lets you run SQL queries against terabytes of data in seconds, with no infrastructure to manage.'
    ]
  },
  n8n: {
    title: 'n8n',
    body: [
      'n8n is an open-source workflow automation tool that lets me visually connect apps, APIs, and services. Think of it as a self-hosted alternative to Zapier — with one key difference: <strong>your workflows run on your own infrastructure</strong>, so your data does not pass through a third party and there are no per-task usage fees.',
      'n8n is well suited for complex, multi-step automations that involve branching logic, loops, error handling, or custom code. It has pre-built integrations for hundreds of tools, and when a native integration does not exist, it can talk directly to any REST API.',
      'Because it is self-hosted on GCP, n8n fits naturally into the rest of your infrastructure — it can read from your databases, write to BigQuery, trigger Cloud Functions, and connect to anything your business already uses.'
    ]
  },
  zapier: {
    title: 'Zapier',
    body: [
      'Zapier is a cloud-based automation platform that connects thousands of apps through pre-built integrations called Zaps. When a trigger happens in one app — a new form submission, a new row in a spreadsheet, a new email — Zapier can automatically take action in one or more other apps.',
      'It is the fastest way to connect tools your team already uses without writing any code. Common examples: a new contact in your CRM automatically triggers a welcome email and a Slack notification, or a completed booking in your scheduling tool creates a row in a tracking spreadsheet.',
      'Zapier is best for straightforward, linear automations between popular apps. For more complex logic, custom data transformations, or workflows that need to stay on your own infrastructure, n8n or a custom GCP solution is usually the better fit — and I can advise on which approach makes sense for your situation.'
    ]
  },
  workspace: {
    title: 'Google Workspace',
    body: [
      'Google Workspace is the suite of business tools most small and mid-sized teams already run on: Gmail, Drive, Sheets, Docs, Calendar, and Forms. What most teams do not realize is that every one of these tools has an API — meaning they can all be automated.',
      'Through the Workspace APIs I can build automations like: auto-populating a tracking sheet when a form is submitted, sending templated emails triggered by data changes, syncing calendar data into a reporting pipeline, managing shared Drive permissions programmatically, or pulling Gmail data into a workflow.',
      'If your team lives in Google Workspace, there is almost always significant automation potential sitting unused. It is often the fastest place to find wins because the tools and the data are already there.'
    ]
  },
  rest: {
    title: 'REST APIs',
    body: [
      'A REST API (Representational State Transfer Application Programming Interface) is the standard way that web services communicate with each other over the internet. Almost every modern SaaS tool — your CRM, booking system, marketing platform, payment processor, project management tool — exposes a REST API.',
      'In plain terms: a REST API is a set of rules that lets one piece of software ask another piece of software for data or tell it to do something. When I build an integration between two tools that do not natively connect, REST APIs are how that gets done.',
      'If two tools your business uses do not talk to each other and there is no native integration, a REST API integration is almost always the answer. It is also how I pull data from external sources into your own systems, and how custom internal tools communicate with the services behind them.'
    ]
  }
};

const toolModal    = document.getElementById('tool-modal');
const toolTitle    = document.getElementById('tool-modal-title');
const toolBody     = document.getElementById('tool-modal-body');
const toolClose    = document.getElementById('tool-modal-close');
const toolBackdrop = document.getElementById('tool-modal-backdrop');

// Remembers what had focus before the modal opened, so we can restore it.
let modalLastFocused = null;

// Visible, focusable elements inside the modal (for the Tab trap).
function modalFocusable() {
  return Array.from(
    toolModal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => el.offsetParent !== null);
}

function openModal(key) {
  const data = toolDescriptions[key];
  if (!data) return;

  modalLastFocused = document.activeElement;

  toolTitle.textContent = data.title;
  toolBody.innerHTML = data.body.map(p => `<p>${p}</p>`).join('');

  toolModal.setAttribute('aria-hidden', 'false');
  toolModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  toolClose.focus();
}

function closeModal() {
  toolModal.classList.remove('open');
  toolModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Return focus to the pill (or whatever) that opened the modal.
  if (modalLastFocused && typeof modalLastFocused.focus === 'function') {
    modalLastFocused.focus();
  }
  modalLastFocused = null;
}

document.querySelectorAll('.stack-pill[data-tool]').forEach(pill => {
  pill.addEventListener('click', () => openModal(pill.dataset.tool));
});

toolClose.addEventListener('click', closeModal);
toolBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (!toolModal.classList.contains('open')) return;

  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  // Trap Tab focus inside the modal so it can't drift to the page behind it.
  if (e.key === 'Tab') {
    const focusable = modalFocusable();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
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
