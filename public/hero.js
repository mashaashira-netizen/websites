/* Motion belongs to the artwork and the reading order. No scroll hijacking. */
(() => {
  const hero = document.querySelector('.hero--ocircle');
  if (!hero || !window.gsap) return;
  const art = hero.querySelector('.hero-artwork');
  const media = gsap.matchMedia();
  let inView = true;
  let entrance;
  let atmosphere;

  function synchronize() {
    const paused = document.documentElement.classList.contains('motion-paused');
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (entrance) entrance.progress(1).pause();
      if (atmosphere) atmosphere.pause();
      return;
    }
    if (atmosphere) atmosphere.paused(document.hidden || !inView);
  }

  media.add({ reduced: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 651px)', mobile: '(max-width: 650px)' }, context => {
    if (context.conditions.reduced) return;
    const startPaused = document.documentElement.classList.contains('motion-paused');
    entrance = gsap.timeline({ paused: startPaused, defaults: { ease: 'power3.out', duration: 1.05 } });
    entrance.addLabel('open', 0)
      .from(art, { autoAlpha: 0, scale: 1.045, duration: 1.8, ease: 'power2.out' }, 'open')
      .from(hero.querySelector('.hero-copy>.eyebrow'), { autoAlpha: 0, y: 10 }, 'open+=0.12')
      .from(hero.querySelector('.hero-location'), { autoAlpha: 0, y: 14 }, 'open+=0.2')
      .from(hero.querySelectorAll('.hero-line'), { autoAlpha: 0, y: 25, stagger: .12 }, 'open+=0.3')
      .from(hero.querySelectorAll('.hero-description,.hero-primary,.hero-detail'), { autoAlpha: 0, y: 13, stagger: .08 }, 'open+=0.58')
      .from(hero.querySelectorAll('.hero-film,.hero-senses,.hero-side-note'), { autoAlpha: 0, duration: .9 }, 'open+=0.85');
    atmosphere = gsap.to(art, { x: context.conditions.desktop ? -9 : -4, y: 5, scale: 1.012, duration: 15, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: startPaused });
    synchronize();
    return () => { entrance = null; atmosphere = null; };
  }, hero);

  new MutationObserver(synchronize).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', synchronize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      document.body.classList.toggle('hero-is-visible', inView);
      synchronize();
    }, { threshold: .02 }).observe(hero);
  }
})();
