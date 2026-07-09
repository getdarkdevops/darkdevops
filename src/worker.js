/* ============================================================
   DARKDEVOPS — Worker
   Serves the static site (via the [assets] binding) and handles
   the contact form at POST /api/contact.

   Email is sent through Cloudflare Email Routing's native
   send_email binding (CONTACT_EMAIL) — no third-party API keys.
   ============================================================ */

import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage, Mailbox } from 'mimetext';

const MAX = { name: 100, email: 254, subject: 80, message: 5000 };

const BOOKING_URL = 'https://calendly.com/darkdevops/discovery';

// Copy for the confirmation we send back to the person who filled the form,
// keyed by the <select name="subject"> values in index.html. `label` is also
// what gets used in the inquiry email's subject line.
const TOPICS = {
  workflow: {
    label: 'Workflow Automation',
    line: 'Most workflow problems I see are a handful of manual steps that quietly cost someone an hour a day. The first thing I want to understand is which step hurts most, and what happens downstream when it gets missed.',
  },
  pipelines: {
    label: 'Data Pipelines',
    line: 'Messy data usually has a shape to it. Before proposing anything I want to see where it comes from, who touches it by hand, and what decision it is supposed to support.',
  },
  tools: {
    label: 'Internal Tools',
    line: 'Internal tools are worth building when a SaaS subscription no longer fits how your team actually works. I want to hear what your team does today in spreadsheets, and where the workarounds live.',
  },
  api: {
    label: 'API Integrations',
    line: 'When two tools will not talk, the fix is usually smaller than it looks. I want to know which systems need to stay in sync, and how quickly they need to agree with each other.',
  },
  other: {
    label: 'Something else',
    line: 'Happy to hear what you are working on. If it involves manual work that repeats, there is usually something worth automating.',
  },
};

const topicFor = key => TOPICS[key] ?? TOPICS.other;
// Basic, intentionally-permissive email shape check. Real validation
// is "can we deliver it" — we just reject obvious garbage here.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405);
      }
      return handleContact(request, env);
    }

    // Any non-asset path that isn't the API falls through to here.
    return json({ ok: false, error: 'Not found' }, 404);
  },
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: a hidden field real users never see. Bots fill it.
  // Pretend success so the bot doesn't learn it was blocked.
  if (typeof data.company === 'string' && data.company.trim() !== '') {
    return json({ ok: true });
  }

  const name    = String(data.name    ?? '').trim();
  const email   = String(data.email   ?? '').trim();
  const subject = String(data.subject ?? '').trim();
  const message = String(data.message ?? '').trim();

  const errors = [];
  if (!name)                          errors.push('name is required');
  if (name.length > MAX.name)         errors.push('name is too long');
  if (!EMAIL_RE.test(email))          errors.push('a valid email is required');
  if (email.length > MAX.email)       errors.push('email is too long');
  if (!subject)                       errors.push('subject is required');
  if (subject.length > MAX.subject)   errors.push('subject is too long');
  if (!message)                       errors.push('message is required');
  if (message.length > MAX.message)   errors.push('message is too long');

  if (errors.length) {
    return json({ ok: false, error: errors.join('; ') }, 422);
  }

  const topic = topicFor(subject);

  const text =
    `New inquiry from the DarkDevOps site\n` +
    `------------------------------------\n` +
    `Name:    ${name}\n` +
    `Email:   ${email}\n` +
    `Subject: ${topic.label}\n\n` +
    `${message}\n`;

  try {
    const msg = createMimeMessage();
    // FROM must be an address on a domain verified in this Cloudflare account.
    msg.setSender({ name: 'DarkDevOps Website', addr: 'noreply@darkdevops.com' });
    msg.setRecipient(env.CONTACT_TO);
    msg.setSubject(`DarkDevOps inquiry: ${topic.label}`);
    // So replying in your inbox goes straight back to the sender. Address
    // headers must be Mailbox objects — mimetext rejects plain strings.
    msg.setHeader('Reply-To', new Mailbox(email));
    msg.addMessage({ contentType: 'text/plain', data: text });

    await env.CONTACT_EMAIL.send(
      new EmailMessage('noreply@darkdevops.com', env.CONTACT_TO, msg.asRaw())
    );
  } catch (err) {
    console.error('send_email failed:', err && err.message);
    return json({ ok: false, error: 'Could not send right now. Please email directly.' }, 502);
  }

  // The lead is safely in the inbox. The confirmation back to the sender is a
  // nicety on top: if it fails we log it and still report success, because a
  // delivered lead with no confirmation beats a lost lead.
  await sendAutoReply(env, { name, email, topic });

  return json({ ok: true });
}

async function sendAutoReply(env, { name, email, topic }) {
  // Absent until the sending domain is onboarded to Cloudflare Email Service.
  // Until then there is no binding and we simply skip.
  if (!env.CONTACT_AUTOREPLY) return;

  // Deliberately does not echo the visitor's message back to them. The address
  // is attacker-controlled and unverified, so this mail must never carry
  // attacker-supplied prose that could be relayed to a third party.
  const firstName = name.split(/\s+/)[0];
  const text =
    `Hi ${firstName},\n\n` +
    `Thanks for reaching out about ${topic.label.toLowerCase()}. Your message came through and I read every one myself.\n\n` +
    `${topic.line}\n\n` +
    `The fastest way forward is a 15 minute call. No pitch, no prep needed. Grab whatever time works:\n\n` +
    `${BOOKING_URL}\n\n` +
    `If none of those times fit, just reply to this email and we will find one.\n\n` +
    `Sam Poulson\n` +
    `DarkDevOps\n` +
    `GCP automation, internal tools, and data pipelines\n` +
    `darkdevops.com\n`;

  try {
    const msg = createMimeMessage();
    msg.setSender({ name: 'Sam Poulson (DarkDevOps)', addr: 'sales@darkdevops.com' });
    msg.setRecipient(email);
    msg.setSubject(`Thanks for reaching out, ${firstName}`);
    msg.setHeader('Reply-To', new Mailbox('sales@darkdevops.com'));
    // Keeps this out of the sender's own auto-responder loops.
    msg.setHeader('Auto-Submitted', 'auto-replied');
    msg.addMessage({ contentType: 'text/plain', data: text });

    await env.CONTACT_AUTOREPLY.send(
      new EmailMessage('sales@darkdevops.com', email, msg.asRaw())
    );
  } catch (err) {
    console.error('auto-reply failed:', err && err.message);
  }
}
