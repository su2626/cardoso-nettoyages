/* =============================================================
   CARDOSO NETTOYAGES — SCRIPT ÉDITORIAL
   Smooth scroll, split text, curseur magnétique, parallax doux
   ============================================================= */

(function () {
    'use strict';

    const $  = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
    const lerp = (a, b, t) => a + (b - a) * t;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = matchMedia('(hover: none)').matches;

    /* =====================================================
       1. LOADER — compteur + barre (motion confiée au CSS)
    ===================================================== */
    (function loader() {
        const el = $('#loader');
        const count = $('#loaderCount');
        const fill = $('.loader-fill');
        // Pas de loader (landing pages) : on lance le hero directement
        if (!el || !count || !fill) {
            document.body.classList.add('loaded');
            startHero();
            return;
        }

        // Animation : easeOutCubic pour un atterrissage en douceur
        const total = 2100;
        const start = performance.now();
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / total, 1);
            const eased = easeOutCubic(progress);
            const n = Math.floor(eased * 100);
            count.textContent = String(n).padStart(2, '0');
            fill.style.width = (eased * 100) + '%';
            if (progress < 1) requestAnimationFrame(tick);
            else setTimeout(() => {
                el.classList.add('hidden');
                document.body.classList.add('loaded');
                startHero();
            }, 380);
        };
        requestAnimationFrame(tick);
    })();

    /* =====================================================
       2. SPLIT TEXT — mots et caractères
    ===================================================== */
    function splitChars(el) {
        const text = el.textContent;
        el.textContent = '';
        const frag = document.createDocumentFragment();
        for (const ch of text) {
            const span = document.createElement('span');
            span.className = 'char';
            span.dataset.char = '';
            span.textContent = ch === ' ' ? ' ' : ch;
            frag.appendChild(span);
        }
        el.appendChild(frag);
        return $$('.char', el);
    }

    function splitWords(el) {
        // On récupère le HTML pour préserver <em>, <strong>, <br>
        const nodes = Array.from(el.childNodes);
        el.innerHTML = '';

        const wrap = (text, parent) => {
            const tokens = text.split(/(\s+)/);
            tokens.forEach(token => {
                if (/^\s+$/.test(token)) {
                    parent.appendChild(document.createTextNode(' '));
                } else if (token.length) {
                    const span = document.createElement('span');
                    span.className = 'word';
                    span.dataset.word = '';
                    span.textContent = token;
                    parent.appendChild(span);
                }
            });
        };

        nodes.forEach(node => {
            if (node.nodeType === 3) {
                // Texte brut
                wrap(node.textContent, el);
            } else if (node.nodeName === 'BR') {
                el.appendChild(document.createElement('br'));
            } else if (node.nodeType === 1) {
                // élément (em, strong) — on conserve la balise et wrap dedans
                const clone = node.cloneNode(false);
                wrap(node.textContent, clone);
                el.appendChild(clone);
            }
        });
        return $$('[data-word]', el);
    }

    /* =====================================================
       3. HERO — entrée séquentielle
    ===================================================== */
    function startHero() {
        $$('.hero-title [data-split]').forEach((row, i) => {
            const chars = splitChars(row);
            chars.forEach((c, j) => {
                c.style.transition = `transform 1s var(--ease-out)`;
                c.style.transitionDelay = `${i * 0.18 + j * 0.012}s`;
                requestAnimationFrame(() => {
                    c.style.transform = 'translateY(0)';
                });
            });
        });
    }

    /* =====================================================
       4. CURSEUR PERSONNALISÉ + magnétique
    ===================================================== */
    if (!isTouch) {
        const cursor = $('#cursor');
        const label = $('#cursorLabel');
        let mx = 0, my = 0, cx = 0, cy = 0;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
        }, { passive: true });

        const loop = () => {
            cx = lerp(cx, mx, 0.22);
            cy = lerp(cy, my, 0.22);
            cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        };
        loop();

        // Cible avec data-cursor : on affiche le label
        const interactive = 'a, button, [data-cursor]';
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest(interactive);
            if (target) {
                cursor.classList.add('active');
                const lbl = target.dataset.cursor;
                if (lbl) label.textContent = lbl;
                else label.textContent = '';
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactive)) {
                cursor.classList.remove('active');
                label.textContent = '';
            }
        });
    }

    /* =====================================================
       5. NAVBAR
    ===================================================== */
    const nav = $('#nav');
    const burger = $('#navBurger');
    const navList = $('#navList');

    const onNavScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    };
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, { passive: true });

    if (burger && navList) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            navList.classList.toggle('open');
        });

        $$('.nav-link, .nav-cta').forEach(a => {
            a.addEventListener('click', () => {
                burger.classList.remove('open');
                navList.classList.remove('open');
            });
        });
    }

    /* =====================================================
       6. REVEAL AU SCROLL (mots, sections)
    ===================================================== */
    // Préparer les éléments [data-split-words]
    $$('[data-split-words]').forEach(el => splitWords(el));

    const wordObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                $$('.word', entry.target).forEach((w, i) => {
                    w.style.transitionDelay = `${i * 0.045}s`;
                });
                wordObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    $$('[data-split-words]').forEach(el => wordObserver.observe(el));

    // Reveal générique des sections (fade up subtil)
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    $$('.manifesto, .expertises, .approach, .figures, .testimonials, .quote-block, .contact').forEach(s => sectionObserver.observe(s));

    /* =====================================================
       7. PARALLAX (GSAP si dispo, fallback RAF)
    ===================================================== */
    function initParallax() {
        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);

            // Hero image qui descend lentement
            gsap.to('.hero-img', {
                yPercent: 18,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // Hero contenu qui remonte légèrement
            gsap.to('.hero-content', {
                yPercent: -30,
                opacity: .4,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });

            // Image approach qui monte au scroll
            gsap.to('.visual-frame img', {
                yPercent: -10,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.approach',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // Mot CARDOSO du footer qui s'étire vers le haut
            gsap.from('.footer-giant span', {
                yPercent: 40,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.footer',
                    start: 'top bottom',
                    end: 'center bottom',
                    scrub: true
                }
            });

        } else {
            // Fallback léger
            const heroImg = $('.hero-img');
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const y = window.scrollY;
                        if (heroImg) heroImg.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    window.addEventListener('load', () => setTimeout(initParallax, 100));

    /* =====================================================
       8. COMPTEURS ANIMÉS
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
        const duration = 2200;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
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
       9. SCROLL DOUX SUR ANCRES
    ===================================================== */
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href === '#') return;
            const target = $(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 60;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* =====================================================
       10. FORMULAIRE — soumission AJAX
    ===================================================== */
    const form = $('#contactForm');
    const status = $('#formStatus');

    if (form) {
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
            btn.innerHTML = '<span class="submit-text">Envoi…</span>';

            try {
                const res = await fetch('contact.php', { method: 'POST', body: data });
                const json = await res.json();
                if (json.success) {
                    showStatus(json.message || 'Merci ! Votre message a bien été envoyé.', 'success');
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
    }

    function showStatus(msg, type) {
        status.textContent = msg;
        status.classList.remove('success', 'error');
        status.classList.add(type, 'show');
        setTimeout(() => status.classList.remove('show'), 7000);
    }

    /* =====================================================
       11. ANNÉE DYNAMIQUE
    ===================================================== */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
