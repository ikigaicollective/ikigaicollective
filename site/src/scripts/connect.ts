import { LIVE_HOST } from '../lib/env';
import { announce, store, track } from '../lib/track';
import copy from '../content/site/copy.json';

const PROD = 'https://ikigaicollective.org/mcp';
// Production is the real address; anywhere else (preview, local) it follows the origin the visitor is on.
const address = location.hostname === LIVE_HOST ? PROD : `${location.origin}/mcp`;
document.querySelectorAll('[data-addr]').forEach((el) => (el.textContent = address));

// Copy buttons: [data-copy-from="<id>"] copies that element's text, flashes "Copied" for 2s, tells screen readers.
async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  }
}
document.querySelectorAll<HTMLButtonElement>('[data-copy-from]').forEach((btn) => {
  let timer: number;
  btn.addEventListener('click', async () => {
    const text = document.getElementById(btn.dataset.copyFrom!)?.textContent ?? '';
    if (!(await copyText(text))) return announce(copy.connect.setup.copyFailed);
    btn.textContent = copy.connect.setup.copied;
    announce(copy.connect.setup.copiedAnnounce);
    track('connect-copy', { block: btn.dataset.block });
    clearTimeout(timer);
    timer = window.setTimeout(() => (btn.textContent = copy.connect.setup.copy), 2000);
  });
});

// Tabs: roving tabindex, arrow keys, Home/End; the last tab used is remembered.
const KEY = 'ik-connect-tab';
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role=tab]')];
const select = (tab: HTMLButtonElement, focus = false, record = false) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')!)?.classList.toggle('on', on);
  });
  if (focus) tab.focus();
  if (record) { store.set(KEY, tab.dataset.tab!); track('connect-tab', { tab: tab.dataset.tab }); }
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(t, false, true));
  t.addEventListener('keydown', (e) => {
    const to = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select(tabs[to], true, true);
  });
});
const saved = tabs.find((t) => t.dataset.tab === store.get(KEY));
if (saved) select(saved);
