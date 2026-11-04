import { announce, track } from '../lib/track';
import { FORMS_LIVE } from '../lib/env';
import { canMotion } from '../lib/motion';

// Invite and partner forms. They post JSON to the form's action. Until the endpoints exist (Phase 5)
// a 404 gets an honest "not open yet" message instead of a fake success.
const PREVIEW = {
  invite: 'This is a preview, so no invite was sent. Sign-up opens when the site launches. Until then, join the Discord and come on Thursday.',
  partner: 'This is a preview, so nothing was sent. Partner enquiries open when the site launches. Until then, say hello in the Discord.',
};
const FALLBACK = 'Sign-up opens with the live site. For now, join the Discord and say hello.';

// Inline validation for forms marked data-inline-errors: a message under the blank, aria-invalid, nothing cleared.
function validateInline(form: HTMLFormElement) {
  let first: HTMLInputElement | HTMLTextAreaElement | null = null;
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-pc]').forEach((el) => {
    const err = document.getElementById(el.getAttribute('aria-describedby')!)!;
    const bad = !el.checkValidity();
    el.setAttribute('aria-invalid', String(bad));
    err.hidden = !bad;
    err.textContent = bad ? (el.validity.valueMissing ? el.dataset.need : el.dataset.bad) ?? '' : '';
    if (bad && !first) first = el;
    if (!el.dataset.pcBound) { el.dataset.pcBound = '1'; el.addEventListener('input', () => { if (el.checkValidity()) { el.setAttribute('aria-invalid', 'false'); err.hidden = true; } }); }
  });
  (first as HTMLElement | null)?.focus();
  return !first;
}

document.querySelectorAll<HTMLFormElement>('form[data-invite-form], form[data-partner-form]').forEach((form) => {
  const kind = form.hasAttribute('data-invite-form') ? 'invite' : 'partner';
  const success = form.querySelector<HTMLElement>(`[data-${kind}-success]`);
  const fields = form.querySelector<HTMLElement>(`[data-${kind}-fields]`) ?? form;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const note = Object.assign(document.createElement('p'), { hidden: true, className: 'text-[15px] leading-[1.5]' });
  note.setAttribute('role', 'status');
  form.append(note);

  // Spam defences: hidden honeypot, Turnstile widget when a site key is set, and where the visit came from.
  form.insertAdjacentHTML('beforeend', '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">');
  const params = new URLSearchParams(location.search);
  form.insertAdjacentHTML('beforeend', `<input type="hidden" name="source" value="${CSS.escape(params.get('utm_source') ?? (document.referrer ? new URL(document.referrer).hostname : 'direct')).replace(/\\/g, '')}">`);
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
  if (siteKey && FORMS_LIVE) {
    submit.insertAdjacentHTML('beforebegin', `<div class="cf-turnstile" data-sitekey="${siteKey}" data-theme="auto"></div>`);
    if (!document.querySelector('script[data-turnstile]')) { const ts = Object.assign(document.createElement('script'), { src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true }); ts.dataset.turnstile = ''; document.head.append(ts); }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!(form.hasAttribute('data-inline-errors') ? validateInline(form) : form.reportValidity())) return;
    track(`${kind}_submitted`);
    const label = submit.textContent!;
    submit.disabled = true;
    submit.textContent = submit.dataset.sending ?? 'Sending...';
    note.hidden = true;
    try {
      // Kill switch (PUBLIC_FORMS_LIVE=0): send and store nothing, and say so instead of faking a success.
      if (!FORMS_LIVE) {
        submit.disabled = false;
        submit.textContent = label;
        note.textContent = PREVIEW[kind];
        note.hidden = false;
        announce(PREVIEW[kind]);
        return;
      }
      const res = await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (res.status === 404 || res.status === 503) throw Object.assign(new Error('not-open'), { soft: true });
      if (!res.ok) throw new Error(String(res.status));
      // Preview host: the API used the test event and '-test' tabs; show the preview message, not the success state.
      if ((await res.json().catch(() => ({}))).preview) {
        submit.disabled = false;
        submit.textContent = label;
        note.textContent = PREVIEW[kind];
        note.hidden = false;
        announce(PREVIEW[kind]);
        return;
      }
      track(`${kind}_success`);
      if (success) { if (fields.hasAttribute('data-fade') && canMotion()) { fields.classList.add('is-out'); await new Promise((r) => setTimeout(r, 200)); } fields.hidden = true; success.hidden = false; success.focus?.(); } else { submit.textContent = 'Invite sent'; }
      announce(success?.textContent ?? 'Done');
      form.dispatchEvent(new CustomEvent(`ik:${kind}-success`, { bubbles: true }));
    } catch (err) {
      submit.disabled = false;
      submit.textContent = label;
      note.textContent = (err as { soft?: boolean }).soft ? FALLBACK : 'Something went wrong. Please try again in a moment.';
      note.hidden = false;
    }
  });
});
