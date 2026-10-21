/* Progressive enhancement: the complete offering is already present in the HTML. */
document.documentElement.classList.add('js');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const video = document.querySelector('#hero-video');
const heroToggle = document.querySelector('#hero-toggle');
const motionToggle = document.querySelector('#motion-toggle');
const config = window.ASHIRA_CONFIG || {};
let motionPaused = reduceMotion.matches;
let heroUserPaused = false;
let audience = 'individual';
let selectedPlan = 'single';
let hasSelectedPlan = false;
let activeIntent = 'conversation';
let heroInView = true;
const playIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor"/></svg>';
const pauseIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

function updateVideoControl() {
  heroToggle.setAttribute('aria-label', video.paused ? 'Play background film' : 'Pause background film');
  heroToggle.querySelector('span').innerHTML = video.paused ? playIcon : pauseIcon;
}

function loadHero() {
  const source = video.querySelector('source');
  if (!source.getAttribute('src')) {
    source.src = source.dataset.src;
    video.load();
  }
}

function syncVideo() {
  if (!motionPaused && !heroUserPaused && heroInView && !document.hidden && !document.querySelector('dialog[open]')) {
    loadHero();
    video.play().catch(() => updateVideoControl());
  } else video.pause();
  updateVideoControl();
}

video.addEventListener('play', updateVideoControl);
video.addEventListener('pause', updateVideoControl);
heroToggle.addEventListener('click', () => {
  if (video.paused) {
    heroUserPaused = false;
    if (motionPaused) setMotion(false);
    syncVideo();
  } else {
    heroUserPaused = true;
    video.pause();
  }
});

function setMotion(paused) {
  motionPaused = paused;
  document.documentElement.classList.toggle('motion-paused', paused);
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.setAttribute('aria-label', paused ? 'Resume background motion' : 'Pause background motion');
  motionToggle.querySelector('.motion-label').textContent = paused ? 'Resume motion' : 'Pause motion';
  motionToggle.querySelector('span').innerHTML = paused ? playIcon : pauseIcon;
  syncVideo();
  document.dispatchEvent(new CustomEvent('ashira:motion', { detail: { paused } }));
}
motionToggle.addEventListener('click', () => setMotion(!motionPaused));
reduceMotion.addEventListener('change', event => setMotion(event.matches));
document.addEventListener('visibilitychange', syncVideo);

// Reveal content once; content stays readable when JavaScript is disabled.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  new IntersectionObserver(entries => {
    heroInView = entries[0].isIntersecting;
    syncVideo();
  }, { threshold: 0.05 }).observe(document.querySelector('.hero'));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));

// A small reading cue and a mobile action bar after the opening section.
const progress = document.querySelector('.reading-progress');
const mobileBar = document.querySelector('.mobile-bottom-bar');
let scrollPending = false;
function updateScroll() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
  const begin = document.querySelector('#begin').getBoundingClientRect();
  const pastHero = document.querySelector('.hero').getBoundingClientRect().bottom < 0;
  const showBar = pastHero && begin.top > innerHeight && !document.querySelector('dialog[open]');
  mobileBar.classList.toggle('is-visible', showBar);
  // Offscreen controls must not remain in the keyboard order.
  mobileBar.inert = !showBar;
  scrollPending = false;
}
addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
addEventListener('resize', updateScroll, { passive: true });

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
function closeMenu(returnFocus = false) {
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(menuToggle.getAttribute('aria-expanded') === 'true'); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const tabs = [...document.querySelectorAll('.session-tabs [role="tab"]')];
function activateTab(tab, moveFocus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (moveFocus) tab.focus();
  document.dispatchEvent(new Event('ashira:layout'));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs.at(-1);
    if (target) { event.preventDefault(); activateTab(target, true); }
  });
});

const planLabels = { single: 'a single private session · 2 hours · $460', monthly: 'monthly membership · $368/month', twice: 'twice-monthly membership · $644/month' };
function chooseAudience(value) {
  audience = value;
  if (activeIntent === 'referral' || activeIntent === 'temple') {
    activeIntent = 'conversation';
    hasSelectedPlan = false;
    document.querySelector('#conversation-cta').innerHTML = 'Schedule a 15-Minute Conversation <svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
  }
  document.querySelectorAll('[data-audience]').forEach(button => {
    const selected = button.dataset.audience === value;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  updateSelectionNote();
}
function updateSelectionNote() {
  document.querySelector('#selection-note').textContent = hasSelectedPlan
    ? `You're exploring ${planLabels[selectedPlan]}.`
    : audience === 'individual' ? 'A space to explore your intentions, at your own pace.' : 'A space for both partners’ intentions, rhythms, and boundaries.';
}
document.querySelectorAll('[data-audience]').forEach(button => button.addEventListener('click', () => chooseAudience(button.dataset.audience)));
document.querySelectorAll('[data-select]').forEach(link => link.addEventListener('click', () => chooseAudience(link.dataset.select)));
document.querySelectorAll('[data-plan]').forEach(link => link.addEventListener('click', () => {
  selectedPlan = link.dataset.plan;
  hasSelectedPlan = true;
  activeIntent = 'session';
  document.querySelector('#conversation-cta').innerHTML = 'Discuss this option <svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>';
  updateSelectionNote();
}));
document.querySelectorAll('[data-intent]').forEach(link => link.addEventListener('click', () => {
  activeIntent = link.dataset.intent;
  hasSelectedPlan = false;
  document.querySelector('#conversation-cta').innerHTML = activeIntent === 'referral'
    ? 'Discuss a referral <svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>'
    : activeIntent === 'temple' ? 'Explore future gatherings <svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>' : 'Schedule a 15-Minute Conversation <svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>';
  document.querySelector('#selection-note').textContent = activeIntent === 'referral' ? 'A conversation about a professional referral and continuity of care.' : activeIntent === 'temple' ? 'Future Temple invitations are considered individually.' : 'A space to explore your intentions, at your own pace.';
}));

function openDialog(dialog) {
  closeMenu();
  dialog.showModal();
  document.body.classList.add('dialog-open');
  syncVideo();
  document.dispatchEvent(new Event('ashira:dialog'));
  updateScroll();
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (dialog.id === 'film-dialog') {
      const player = document.querySelector('#film-player');
      player.pause();
      player.removeAttribute('src');
      player.load();
    }
    syncVideo();
    document.dispatchEvent(new Event('ashira:dialog'));
    updateScroll();
  });
});
const films = {
  ashira: { src: 'media/ashira-film.mp4', title: 'A glimpse of the work', description: 'A sensory glimpse from the Ashira film. Use the player controls for sound and playback.' },
  breath: { src: 'media/breath-practice.mp4', title: 'A moment with the breath', description: 'A breath and movement practice from the Ashira footage. Follow only what feels comfortable, and pause whenever you need.' }
};
document.querySelectorAll('[data-film]').forEach(button => button.addEventListener('click', () => {
  const film = films[button.dataset.film];
  document.querySelector('#film-title').textContent = film.title;
  document.querySelector('#film-description').textContent = film.description;
  const player = document.querySelector('#film-player');
  player.src = film.src;
  player.load();
  openDialog(document.querySelector('#film-dialog'));
  // Playback begins only after a deliberate visitor action; audio never autoplays.
}));

function safePublicUrl(value) {
  if (!value) return null;
  try { const parsed = new URL(value, location.href); return parsed.protocol === 'https:' ? parsed.href : null; }
  catch { return null; }
}
function inquire(intent) {
  const coupleText = audience === 'couple' ? 'couples work' : 'individual work';
  const summary = document.querySelector('#inquiry-summary');
  const intentType = intent === 'session' && hasSelectedPlan && selectedPlan !== 'single' ? 'membership' : intent;
  summary.textContent = intent === 'referral'
    ? 'A professional conversation about complementary somatic work and continuity of care.'
    : intent === 'temple' ? 'Interest in future, invitation-only Tantra Temple gatherings.'
    : hasSelectedPlan ? `You're exploring ${planLabels[selectedPlan]}, for ${coupleText}.`
    : intent === 'session' ? `A two-hour private session in Philadelphia, for ${coupleText}. $460.`
    : `A complimentary 15-minute conversation about ${coupleText}.`;
  const target = safePublicUrl(intentType === 'referral' ? config.referralUrl : intentType === 'membership' ? config.membershipUrl : intentType === 'session' ? config.sessionUrl : config.conversationUrl);
  const destination = document.querySelector('#inquiry-destination');
  const status = document.querySelector('.booking-status');
  status.hidden = Boolean(target);
  destination.href = target || 'https://www.ashiratantra.com/';
  destination.innerHTML = target ? 'Continue to your next step <svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>' : 'Visit Ashira Tantra <svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>';
  openDialog(document.querySelector('#inquiry-dialog'));
}
document.querySelector('#conversation-cta').addEventListener('click', () => inquire(activeIntent));
document.querySelector('#session-cta').addEventListener('click', () => {
  selectedPlan = 'single';
  hasSelectedPlan = false;
  activeIntent = 'session';
  updateSelectionNote();
  inquire('session');
});
document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
setMotion(motionPaused);
updateScroll();
