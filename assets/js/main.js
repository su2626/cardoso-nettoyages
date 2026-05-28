/* =============================================================
   CARDOSO NETTOYAGES — JS principal
   Loader, nav, reveal au scroll, compteurs, formulaire.
   ============================================================= */

(function () {
    'use strict';

    const $  = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

    /* =====================================================
       1. LOADER — split lettres avec stagger, progress
    ===================================================== */
    (function loader() {
        const el = $('#loader');
        const count = $('#loaderCount');
        const fill = $('.loader-fill');

        // Landing pages : pas de loader, on n'a rien à faire
        if (!el || !count || !fill) {
            document.body.classList.add('loaded');
            return;
        }

        // Split du brand en lettres animées
        $$('.loader-brand > span', el).forEach((line, lineIdx) => {
            const text = line.textContent;
            line.textContent = '';
            [...text].forEach((ch, i) => {
                const span = document.createElement('span');
                span.className = 'brand-letter';
                span.style.animationDelay = `${(lineIdx * 0.15) + (i * 0.03)}s`;
                span.textContent = ch === ' ' ? ' ' : ch;
                line.appendChild(span);
            });
        });

        // Compteur et barre — easeOutCubic
        const total = 1700;
        const start = performance.now();
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const progress = Math.min((now - start) / total, 1);
            const eased = easeOutCubic(progress);
            const n = Math.floor(eased * 100);
            count.textContent = n;
            fill.style.width = (eased * 100) + '%';
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setTimeout(() => {
                    el.classList.add('hidden');
                    document.body.classList.add('loaded');
                }, 280);
            }
        };
        requestAnimationFrame(tick);
    })();

    /* =====================================================
       2. NAVBAR — état scrolled, burger mobile
    ===================================================== */
    const nav = $('#nav');
    const burger = $('#navBurger');
    const navList = $('#navList');

    if (nav) {
        const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (burger && navList) {
        burger.addEventListener('click', () => {
            const opened = burger.classList.toggle('open');
            navList.classList.toggle('open');
            burger.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });

        $$('.nav-link, .nav-phone').forEach(a => {
            a.addEventListener('click', () => {
                burger.classList.remove('open');
                navList.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* =====================================================
       3. REVEAL AU SCROLL — IntersectionObserver simple
    ===================================================== */
    const revealTargets = [
        '.hero-content > *',
        '.section-head',
        '.section-head > *',
        '.service',
        '.approach-text > *',
        '.approach-visual',
        '.figure',
        '.testi',
        '.contact-left > *',
        '.contact-form',
        '.svc-title',
        '.svc-lead',
        '.svc-img',
        '.svc-text',
        '.include-card',
        '.process-steps li',
        '.other-card'
    ];

    $$(revealTargets.join(', ')).forEach((el, i) => {
        el.classList.add('reveal');
        // Petit stagger sur les groupes
        if (el.matches('.figure, .testi, .include-card, .process-steps li, .other-card, .service')) {
            const idx = Array.from(el.parentNode.children).indexOf(el);
            el.style.transitionDelay = (idx * 60) + 'ms';
        }
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    $$('.reveal').forEach(el => revealObserver.observe(el));

    /* =====================================================
       4. PARALLAX léger — GSAP si disponible
    ===================================================== */
    function initParallax() {
        if (!window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);

        // Hero image descend doucement
        if ($('.hero-img')) {
            gsap.to('.hero-img', {
                yPercent: 12,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Image approche
        if ($('.visual-frame img')) {
            gsap.to('.visual-frame img', {
                yPercent: -8,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.approach',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Mot Cardoso géant du footer qui s'étire
        if ($('.footer-giant span')) {
            gsap.from('.footer-giant span', {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.footer',
                    start: 'top bottom',
                    end: 'center bottom',
                    scrub: true
                }
            });
        }
    }

    window.addEventListener('load', () => setTimeout(initParallax, 100));

    /* =====================================================
       5. COMPTEURS ANIMÉS — IntersectionObserver
    ===================================================== */
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    $$('[data-counter]').forEach(el => counterObserver.observe(el));

    function animateCounter(el) {
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || '';
        const format = el.dataset.format;
        const duration = 2000;
        const start = performance.now();
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.floor(target * eased);

            let display = current.toString();
            if (format === 'thousands') {
                display = current.toLocaleString('fr-CH').replace(/,/g, "'");
            }
            el.textContent = display + suffix;

            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    /* =====================================================
       6. SCROLL DOUX SUR ANCRES
    ===================================================== */
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = $(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 56;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* =====================================================
       7. FORMULAIRE — soumission AJAX
    ===================================================== */
    const form = $('#contactForm');
    const status = $('#formStatus');

    if (form && status) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.classList.remove('show', 'success', 'error');

            const data = new FormData(form);
            if (!data.get('name') || !data.get('email') || !data.get('message') || !data.get('consent')) {
                showStatus('Merci de remplir tous les champs requis.', 'error');
                return;
            }

            const btn = form.querySelector('.submit');
            const original = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span>Envoi en cours</span>';

            try {
                const res = await fetch('contact.php', { method: 'POST', body: data });
                const json = await res.json();
                if (json.success) {
                    showStatus(json.message || 'Merci, votre message a bien été envoyé.', 'success');
                    form.reset();
                } else {
                    showStatus(json.message || 'Une erreur est survenue.', 'error');
                }
            } catch {
                showStatus('Erreur de connexion. Joignez-nous au 026 322 32 70.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = original;
            }
        });

        function showStatus(msg, type) {
            status.textContent = msg;
            status.classList.remove('success', 'error');
            status.classList.add(type, 'show');
            setTimeout(() => status.classList.remove('show'), 7000);
        }
    }

    /* =====================================================
       8. ANNÉE DYNAMIQUE
    ===================================================== */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
