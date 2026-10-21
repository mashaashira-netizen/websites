/* Motion follows the reading journey; content remains complete without it. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const ambient = [...document.querySelectorAll('.ambient-video')];
  const visible = new WeakMap();
  const ambientObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target, entry.isIntersecting));
    syncAmbient();
  }, { threshold: .08 });
  ambient.forEach(film => ambientObserver.observe(film));
  function syncAmbient() {
    const stopped = document.documentElement.classList.contains('motion-paused') || document.hidden || document.querySelector('dialog[open]');
    ambient.forEach(film => {
      if (stopped || !visible.get(film)) { film.pause(); return; }
      const source = film.querySelector('source');
      if (!source.src) { source.src = source.dataset.src; film.load(); }
      film.play().catch(() => {});
    });
  }
  document.addEventListener('visibilitychange', syncAmbient);
  document.addEventListener('ashira:motion', syncAmbient);
  document.addEventListener('ashira:dialog', syncAmbient);
  // Opening an accordion changes the following chapter positions.
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
    document.dispatchEvent(new Event('ashira:layout'));
  }));
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  let context;
  function setUpMotion() {
    context?.revert();
    if (reduce.matches || document.documentElement.classList.contains('motion-paused')) return;
    context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out', duration: .85 } });
      // Only run the opening sequence while the opening screen is visible.
      if (scrollY < 150) {
        intro.from('[data-hero-reveal]', { y: 24, autoAlpha: 0, stagger: .11, clearProps: 'transform,opacity,visibility' });
        intro.from('.hero-stage', { y: 30, autoAlpha: 0, duration: 1.05, clearProps: 'transform,opacity,visibility' }, .1);
      }
      document.querySelectorAll('[data-reveal]').forEach(target => {
        gsap.from(target, {
          y: 25, autoAlpha: 0, duration: .85, ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: target, start: 'top 92%', once: true }
        });
      });
      const desktop = matchMedia('(min-width: 761px)').matches;
      if (desktop) {
        gsap.fromTo('.connection-film img', { yPercent: -5, scale: 1.1 }, {
          yPercent: 5, scale: 1.1, ease: 'none',
          scrollTrigger: { trigger: '.connection-film', start: 'top bottom', end: 'bottom top', scrub: .6 }
        });
      }
      document.querySelectorAll('[data-step]').forEach(step => {
        ScrollTrigger.create({ trigger: step, start: 'top 65%', end: 'bottom 35%', toggleClass: 'is-active' });
      });
    });
    ScrollTrigger.refresh();
  }
  media.add('(prefers-reduced-motion: no-preference)', setUpMotion);
  document.addEventListener('ashira:motion', setUpMotion);
  reduce.addEventListener('change', setUpMotion);
  let layoutFrame;
  document.addEventListener('ashira:layout', () => {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
