/* ============================================================
   DARKDEVOPS — Worker
   Serves the static site (via the [assets] binding) and handles
   the contact form at POST /api/contact.

   Email is sent through Cloudflare Email Routing's native
   send_email binding (CONTACT_EMAIL) — no third-party API keys.
   ============================================================ */

import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

const MAX = { name: 100, email: 254, subject: 80, message: 5000 };
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

  const text =
    `New inquiry from the DarkDevOps site\n` +
    `------------------------------------\n` +
    `Name:    ${name}\n` +
    `Email:   ${email}\n` +
    `Subject: ${subject}\n\n` +
    `${message}\n`;

  try {
    const msg = createMimeMessage();
    // FROM must be an address on a domain verified in this Cloudflare account.
    msg.setSender({ name: 'DarkDevOps Website', addr: 'noreply@darkdevops.com' });
    msg.setRecipient(env.CONTACT_TO);
    msg.setSubject(`DarkDevOps inquiry: ${subject}`);
    // So replying in your inbox goes straight back to the sender. Bare address
    // only — mimetext rejects the "Name <addr>" form in setHeader.
    msg.setHeader('Reply-To', email);
    msg.addMessage({ contentType: 'text/plain', data: text });

    await env.CONTACT_EMAIL.send(
      new EmailMessage('noreply@darkdevops.com', env.CONTACT_TO, msg.asRaw())
    );
  } catch (err) {
    console.error('send_email failed:', err && err.message);
    return json({ ok: false, error: 'Could not send right now. Please email directly.' }, 502);
  }

  return json({ ok: true });
}
