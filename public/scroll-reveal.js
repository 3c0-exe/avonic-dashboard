/**
 * scroll-reveal.js — AVONIC Landing Page
 * Handles nav + hero load animations and all scroll-triggered entrance animations.
 * Uses IntersectionObserver; does NOT touch .anim-hidden.
 */

(function () {
  /* ── Inject styles ─────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── NAV: slide down from top on load ── */
    @keyframes sr-navIn {
      from { opacity: 0; transform: translateY(-22px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #navbar { animation: sr-navIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

    /* ── HERO: staggered fade-up on load ── */
    @keyframes sr-heroUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .hero-load {
      opacity: 0;
      animation: sr-heroUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .hero-load.hl-d1 { animation-delay: 0.15s; }
    .hero-load.hl-d2 { animation-delay: 0.30s; }
    .hero-load.hl-d3 { animation-delay: 0.45s; }
    .hero-load.hl-d4 { animation-delay: 0.60s; }
    .hero-load.hl-d5 { animation-delay: 0.75s; }

    /* ── SCROLL REVEAL: base hidden state ── */
    .scroll-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .scroll-reveal.slide-left  { transform: translateX(-32px); }
    .scroll-reveal.slide-right { transform: translateX( 32px); }
    .scroll-reveal.scale-in    { transform: scale(0.94); }

    /* Revealed state */
    .scroll-reveal.revealed {
      opacity: 1;
      transform: translateY(0) translateX(0) scale(1);
    }

    /* Stagger delays */
    .scroll-reveal.sr-d1 { transition-delay: 0.05s; }
    .scroll-reveal.sr-d2 { transition-delay: 0.15s; }
    .scroll-reveal.sr-d3 { transition-delay: 0.25s; }
    .scroll-reveal.sr-d4 { transition-delay: 0.35s; }
    .scroll-reveal.sr-d5 { transition-delay: 0.45s; }
    .scroll-reveal.sr-d6 { transition-delay: 0.55s; }
  `;
  document.head.appendChild(style);

  /* ── Observer ──────────────────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  /* ── Tag & observe elements once DOM is ready ──────────────── */
  function init() {

    /* Helper: add scroll-reveal classes to a selector */
    function tag(selector, extraClasses = '') {
      document.querySelectorAll(selector).forEach((el, i) => {
        el.classList.add('scroll-reveal');
        if (extraClasses) extraClasses.split(' ').forEach(c => el.classList.add(c));
        observer.observe(el);
      });
    }

    /* Helper: stagger a list of children inside a parent */
    function staggerChildren(parentSelector, childSelector) {
      document.querySelectorAll(parentSelector).forEach(parent => {
        parent.querySelectorAll(childSelector).forEach((child, i) => {
          child.classList.add('scroll-reveal', `sr-d${Math.min(i + 1, 6)}`);
          observer.observe(child);
        });
      });
    }

    /* ── HERO SECTION: load animations (no scroll needed) ─────── */
    const heroSelectors = [
      // badge
      { sel: '#hero-section .anim-hidden.stagger-1', delay: 'hl-d1' },
      // h1
      { sel: '#hero-section .anim-hidden.stagger-2', delay: 'hl-d2' },
      // body paragraph
      { sel: '#hero-section .anim-hidden.stagger-3', delay: 'hl-d3' },
      // CTA + stats strip
      { sel: '#hero-section .anim-hidden.stagger-4', delay: 'hl-d4' },
    ];
    heroSelectors.forEach(({ sel, delay }) => {
      document.querySelectorAll(sel).forEach(el => {
        // Remove existing animate-fade-up so our class takes over cleanly
        el.classList.remove('animate-fade-up');
        el.classList.add('hero-load', delay);
      });
    });

    // Hero right col wrapper — subtle slide in from right
    const heroRight = document.querySelector('#hero-section .hidden.md\\:flex.relative.justify-center');
    if (heroRight) {
      heroRight.classList.add('hero-load', 'hl-d5');
    }

    /* ── FARMERS SECTION ──────────────────────────────────────── */
    // Desktop farmer image — slides in from left
    const farmerImgDesktop = document.querySelector('#farmers-section .hidden.md\\:flex.relative.items-center');
    if (farmerImgDesktop) {
      farmerImgDesktop.classList.add('scroll-reveal', 'slide-left');
      observer.observe(farmerImgDesktop);
    }
    // Mobile farmer image
    const farmerImgMobile = document.querySelector('#farmers-section .md\\:hidden.mb-5');
    if (farmerImgMobile) {
      farmerImgMobile.classList.add('scroll-reveal', 'sr-d2');
      observer.observe(farmerImgMobile);
    }
    tag('#farmers-section .flex.items-center.gap-2.mb-2');          // eyebrow
    tag('#farmers-section h2',            'sr-d1');
    tag('#farmers-section p.font-semibold','sr-d2');
    tag('#farmers-section p.leading-relaxed','sr-d3');
    tag('#farmers-section .flex.flex-wrap.gap-2\\.5','sr-d4');      // tag pills
    tag('#farmers-section a.inline-flex',  'sr-d5');

    /* ── SYSTEM SECTION (What is AVONIC?) ─────────────────────── */
    tag('#system-section .flex.items-center.gap-2.mb-12');
    tag('#system-section h2',             'sr-d1');
    tag('#system-section ul.space-y-3',   'sr-d2');
    tag('#system-section p.leading-relaxed','sr-d3');
    tag('#system-section .hidden.md\\:flex.justify-center', 'slide-right sr-d2'); // desktop img

    /* ── WATCHES / SENSOR SECTION ─────────────────────────────── */
    tag('#watches-section .text-center.mb-12');                      // header block
    staggerChildren('#watches-section .grid', '.metric-card');       // sensor cards
    tag('#watches-section p.text-center.text-xs.mt-8', 'sr-d5');    // bottom note

    /* ── MODES SECTION ────────────────────────────────────────── */
    tag('#modes-section .text-center.mb-12');                        // header
    tag('#modes-section .flex.justify-center.mb-10');                // toggle tabs
    // Mode panels — reveal illustration & copy separately
    document.querySelectorAll('.mode-panel').forEach(panel => {
      const img  = panel.querySelector('img, video');
      const copy = panel.querySelector('.flex-1.max-w-lg');
      if (img)  { img.classList.add('scroll-reveal', 'slide-left');  observer.observe(img);  }
      if (copy) { copy.classList.add('scroll-reveal', 'slide-right','sr-d1'); observer.observe(copy); }
    });

    /* ── GET STARTED SECTION ──────────────────────────────────── */
    tag('#get-started-section .flex.items-center.gap-2.mb-8');       // eyebrow
    tag('#get-started-section h2',        'sr-d1');
    staggerChildren('#get-started-section', '.step-item');           // steps
    tag('#get-started-section .mt-10',    'sr-d4');                  // CTA button
    tag('#get-started-section .hidden.md\\:flex', 'slide-right sr-d2'); // desktop img

    /* ── TUTORIALS SECTION ────────────────────────────────────── */
    tag('#tutorials-section .text-center.mb-12');                    // header
    staggerChildren('#tutorials-section .grid', '.group');           // video cards
    tag('#tutorials-section .text-center:last-child', 'sr-d4');     // watch more btn

    /* ── CONTRIBUTES / SDG SECTION ───────────────────────────── */
    tag('#contributes-section .text-center.mb-16');                  // header
    staggerChildren('#contributes-section .grid', '.sdg-card');      // SDG cards
    tag('#contributes-section .rounded-2xl.px-8', 'sr-d4');         // quote block

    /* ── FAQ SECTION ─────────────────────────────────────────── */
    tag('#faq-section .mb-14');                                      // header + illustration
    staggerChildren('#faq-section', '.faq-item');                    // FAQ items

    /* ── FOOTER ───────────────────────────────────────────────── */
    tag('#footer .grid > div:first-child',  'sr-d1');
    tag('#footer .grid > div:nth-child(2)', 'sr-d2');
    tag('#footer .grid > div:nth-child(3)', 'sr-d3');
    tag('#footer .grid > div:nth-child(4)', 'sr-d4');
    tag('#footer .border-t',               'sr-d2');
  }

  /* Run after DOM is fully parsed */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();