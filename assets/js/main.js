/* =============================================================
   CARDOSO NETTOYAGES SÀRL — SCRIPT PRINCIPAL
   Gère : loader, curseur, navbar, parallax, animations,
          typewriter, compteurs, tilt 3D, particules, formulaire.
   ============================================================= */

(function () {
    'use strict';

    /* =====================================================
       0. UTILITAIRES
    ===================================================== */
    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const lerp = (a, b, t) => a + (b - a) * t;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = matchMedia('(hover: none)').matches;

    /* =====================================================
       1. LOADER
    ===================================================== */
    window.addEventListener('load', () => {
        const loader = $('#loader');
        setTimeout(() => {
            loader.classList.add('hidden');
            startHeroAnimations();
        }, 1600);
    });

    /* =====================================================
       2. CURSEUR PERSONNALISÉ (avec traîne)
    ===================================================== */
    if (!isTouch) {
        const cursor = $('#cursor');
        const follower = $('#cursorFollower');
        let mx = 0, my = 0, fx = 0, fy = 0;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            // Le petit point suit instantanément (translate3d pour GPU)
            cursor.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
        }, { passive: true });

        // Le grand cercle suit avec interpolation (effet "traîne")
        const followLoop = () => {
            fx = lerp(fx, mx, 0.18);
            fy = lerp(fy, my, 0.18);
            follower.style.transform = `translate3d(${fx}px, ${fy}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(followLoop);
        };
        followLoop();

        // États hover sur tous les éléments interactifs
        const hoverTargets = 'a, button, .service-card, input, textarea, select, label, .form-check';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            }
        });
    }

    /* =====================================================
       3. NAVBAR — état sticky + menu mobile
    ===================================================== */
    const navbar = $('#navbar');
    const navToggle = $('#navToggle');
    const navMenu = $('#navMenu');

    const onScrollNav = () => {
        if (window.scrollY > 60) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    };
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Fermer le menu mobile au clic sur un lien
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    /* =====================================================
       4. HERO — animations d'entrée
    ===================================================== */
    function startHeroAnimations() {
        // Lignes du titre qui montent
        $$('.title-line').forEach(line => line.classList.add('in'));

        // Typewriter sur le sous-titre
        startTypewriter();
    }

    function startTypewriter() {
        if (reducedMotion) {
            $('#typewriter').textContent = 'Entretien intérieur et extérieur de haut niveau, pour les professionnels et les particuliers exigeants de Suisse romande.';
            $('#typewriter').classList.add('done');
            return;
        }
        const text = 'Entretien intérieur et extérieur de haut niveau, pour les professionnels et les particuliers exigeants de Suisse romande.';
        const el = $('#typewriter');
        let i = 0;
        const speed = 28;

        setTimeout(() => {
            const tick = () => {
                if (i <= text.length) {
                    el.textContent = text.slice(0, i);
                    i++;
                    setTimeout(tick, speed);
                } else {
                    el.classList.add('done');
                }
            };
            tick();
        }, 1200);
    }

    /* =====================================================
       5. RÉVÉLATION AU SCROLL (IntersectionObserver)
    ===================================================== */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    $$('.reveal').forEach(el => revealObserver.observe(el));

    /* =====================================================
       6. PARALLAX (GSAP ScrollTrigger si dispo, sinon RAF)
    ===================================================== */
    function initParallax() {
        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);

            // Hero — fond qui descend plus lentement
            gsap.to('.hero-bg', {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // Hero — contenu qui remonte légèrement
            gsap.to('.hero-content', {
                yPercent: -20,
                opacity: .3,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // Section services — fond parallax
            gsap.to('.services-parallax', {
                yPercent: -25,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.services',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // Forme rouge du À propos
            gsap.to('.about-shape', {
                yPercent: -15,
                rotation: 6,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.about',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });

        } else {
            // Fallback léger sans GSAP
            const heroBg = $('.hero-bg');
            const servicesBg = $('.services-parallax');
            let ticking = false;

            const onScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const y = window.scrollY;
                        if (heroBg) heroBg.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
                        if (servicesBg) {
                            const rect = servicesBg.parentElement.getBoundingClientRect();
                            const offset = (rect.top - window.innerHeight) * 0.15;
                            servicesBg.style.transform = `translate3d(0, ${offset}px, 0)`;
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    }

    // GSAP arrive en async (defer), on attend qu'il soit prêt
    window.addEventListener('load', () => {
        setTimeout(initParallax, 100);
    });

    /* =====================================================
       7. COMPTEURS ANIMÉS
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

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);

            let display = current.toString();
            if (format === 'thousands') {
                display = current.toLocaleString('fr-CH').replace(/,/g, "'");
            }

            el.textContent = display + suffix;

            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }

    /* =====================================================
       8. TILT 3D SUR CARTES DE SERVICES
    ===================================================== */
    if (!isTouch && !reducedMotion) {
        $$('[data-tilt]').forEach(card => {
            const max = 8; // rotation max en degrés

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                const rx = -y * max;
                const ry = x * max;
                card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    /* =====================================================
       9. PARTICULES DU HERO (canvas)
    ===================================================== */
    (function initParticles() {
        const canvas = $('#particles');
        if (!canvas || reducedMotion) return;
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];

        const resize = () => {
            w = canvas.width = canvas.offsetWidth * devicePixelRatio;
            h = canvas.height = canvas.offsetHeight * devicePixelRatio;
        };
        resize();
        window.addEventListener('resize', resize);

        const count = Math.min(60, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 18000));

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
                vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
                vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
                a: Math.random() * 0.4 + 0.15
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // Lignes entre particules proches
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 140 * devicePixelRatio;
                    if (dist < maxDist) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - dist / maxDist)})`;
                        ctx.lineWidth = 0.5 * devicePixelRatio;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Points
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.fillStyle = `rgba(255, 255, 255, ${p.a})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(draw);
        };
        draw();
    })();

    /* =====================================================
       10. SCROLL DOUX POUR ANCRES
    ===================================================== */
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href === '#') return;
            const target = $(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* =====================================================
       11. FORMULAIRE — soumission AJAX
    ===================================================== */
    const form = $('#contactForm');
    const status = $('#formStatus');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.classList.remove('show', 'success', 'error');

            // Validation basique côté client
            const data = new FormData(form);
            if (!data.get('name') || !data.get('email') || !data.get('message') || !data.get('consent')) {
                showStatus('Merci de remplir tous les champs obligatoires.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Envoi en cours...</span>';

            try {
                const res = await fetch('contact.php', { method: 'POST', body: data });
                const json = await res.json();

                if (json.success) {
                    showStatus(json.message || 'Merci ! Votre message a bien été envoyé.', 'success');
                    form.reset();
                } else {
                    showStatus(json.message || 'Une erreur est survenue. Veuillez réessayer.', 'error');
                }
            } catch (err) {
                showStatus('Erreur de connexion. Vous pouvez nous joindre au 026 322 32 70.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.classList.remove('success', 'error');
        status.classList.add(type, 'show');
        setTimeout(() => status.classList.remove('show'), 8000);
    }

    /* =====================================================
       12. ANNÉE DYNAMIQUE FOOTER
    ===================================================== */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
