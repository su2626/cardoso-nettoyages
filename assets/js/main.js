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
       1. LOADER — saleté clippée aux lettres, érodée par bruit
    ===================================================== */
    (function loader() {
        const el = $('#loader');
        const word = $('#loaderWord');
        const cleanCv = $('#loaderClean');
        const dirtCv = $('#loaderDirt');
        const pctNum = $('#loaderCount');

        // Landing pages : pas de loader
        if (!el || !word || !cleanCv || !dirtCv || !pctNum) {
            document.body.classList.add('loaded');
            startHero();
            return;
        }

        const TEXT = 'Cardoso Nettoyages';
        const DURATION = 5200;
        const DPR = Math.min(window.devicePixelRatio || 1, 2);

        const cleanCx = cleanCv.getContext('2d');
        const dirtCx = dirtCv.getContext('2d');

        let W = 0, H = 0;
        let cw = 0, ch = 0;
        let fontSize = 0;
        let textBaselineY = 0;

        let dirtBaseCv;
        let textMaskCv;
        let maskCv, maskCx, maskData;
        let mw = 0, mh = 0;
        let noise = null;

        function fontStr(px) {
            return '700 ' + px + 'px "Fraunces", "Times New Roman", Georgia, serif';
        }

        // Bruit de valeur, 3 octaves, biais gauche→droite
        function buildNoise(w, h) {
            const out = new Float32Array(w * h);
            const octaves = [
                { scale: 10, amp: 0.55 },
                { scale: 28, amp: 0.30 },
                { scale: 70, amp: 0.18 }
            ];
            for (const oct of octaves) {
                const scale = oct.scale, amp = oct.amp;
                const gw = Math.ceil(w / scale) + 2;
                const gh = Math.ceil(h / scale) + 2;
                const grid = new Float32Array(gw * gh);
                for (let i = 0; i < grid.length; i++) grid[i] = Math.random();
                for (let y = 0; y < h; y++) {
                    const gy = y / scale, gyi = gy | 0, fy = gy - gyi;
                    const sy = fy * fy * (3 - 2 * fy);
                    for (let x = 0; x < w; x++) {
                        const gx = x / scale, gxi = gx | 0, fx = gx - gxi;
                        const sx = fx * fx * (3 - 2 * fx);
                        const i00 = grid[gyi * gw + gxi];
                        const i10 = grid[gyi * gw + gxi + 1];
                        const i01 = grid[(gyi + 1) * gw + gxi];
                        const i11 = grid[(gyi + 1) * gw + gxi + 1];
                        const top = i00 + (i10 - i00) * sx;
                        const bot = i01 + (i11 - i01) * sx;
                        out[y * w + x] += (top + (bot - top) * sy) * amp;
                    }
                }
            }
            // Biais gauche→droite fort pour que le balayage lise bien à travers le mot
            const bias = 0.50;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const i = y * w + x;
                    const u = x / (w - 1);
                    const e = u * u * (3 - 2 * u);
                    out[i] = out[i] * (1 - bias) + e * bias;
                }
            }
            // Normalisation 0..1
            let mn = Infinity, mx = -Infinity;
            for (let i = 0; i < out.length; i++) {
                if (out[i] < mn) mn = out[i];
                if (out[i] > mx) mx = out[i];
            }
            const range = mx - mn || 1;
            for (let i = 0; i < out.length; i++) out[i] = (out[i] - mn) / range;
            return out;
        }

        // Peinture de la saleté : taches rouille, suie, coulures, grain
        function paintDirt(ctx, w, h, fs) {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, 'rgba(8, 4, 2, 0.90)');
            g.addColorStop(1, 'rgba(28, 10, 6, 0.86)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            // Taches de rouille (brun chaud)
            for (let i = 0; i < 36; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const r = fs * (0.18 + Math.random() * 0.55);
                const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
                const a = 0.32 + Math.random() * 0.35;
                rg.addColorStop(0, 'rgba(96, 36, 18, ' + a + ')');
                rg.addColorStop(0.6, 'rgba(60, 20, 10, ' + (a * 0.6) + ')');
                rg.addColorStop(1, 'rgba(60, 20, 10, 0)');
                ctx.fillStyle = rg;
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            }

            // Flaques de suie sombres
            for (let i = 0; i < 22; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const r = fs * (0.10 + Math.random() * 0.34);
                const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
                rg.addColorStop(0, 'rgba(0, 0, 0, ' + (0.55 + Math.random() * 0.35) + ')');
                rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = rg;
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            }

            // Coulures verticales (gravité)
            ctx.lineWidth = 1;
            for (let i = 0; i < 80; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const len = fs * (0.25 + Math.random() * 0.9);
                const ang = (Math.random() * 18 + 81) * Math.PI / 180;
                ctx.strokeStyle = 'rgba(0, 0, 0, ' + (0.10 + Math.random() * 0.22) + ')';
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
                ctx.stroke();
            }

            // Grain fin
            for (let i = 0; i < 5200; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const r = Math.random() * 0.9 + 0.2;
                ctx.fillStyle = 'rgba(0, 0, 0, ' + (Math.random() * 0.50) + ')';
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            }

            // Quelques particules chaudes (poussière qui attrape la lumière)
            for (let i = 0; i < 700; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const r = Math.random() * 0.6 + 0.2;
                ctx.fillStyle = 'rgba(210, 160, 110, ' + (Math.random() * 0.22) + ')';
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            }
        }

        function drawCleanText(ctx) {
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#f0e4d0';
            ctx.font = fontStr(fontSize);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(TEXT, W / 2, textBaselineY);
        }

        function drawTextMask(ctx) {
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#ffffff';
            ctx.font = fontStr(fontSize);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(TEXT, W / 2, textBaselineY);
        }

        function setup() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            fontSize = Math.max(36, Math.min(vw * 0.075, vh * 0.16, 180));

            const probe = document.createElement('canvas').getContext('2d');
            probe.font = fontStr(fontSize);
            const m = probe.measureText(TEXT);
            const ascent = m.actualBoundingBoxAscent || fontSize * 0.78;
            const descent = m.actualBoundingBoxDescent || fontSize * 0.22;
            const textW = m.width;
            const textH = ascent + descent;

            const padX = Math.max(20, fontSize * 0.08);
            const padY = Math.max(16, fontSize * 0.18);

            W = Math.ceil(textW + padX * 2);
            H = Math.ceil(textH + padY * 2);
            cw = Math.floor(W * DPR);
            ch = Math.floor(H * DPR);
            textBaselineY = padY + ascent;

            word.style.width = W + 'px';
            word.style.height = H + 'px';

            [cleanCv, dirtCv].forEach(function (cv) {
                cv.width = cw;
                cv.height = ch;
                cv.style.width = W + 'px';
                cv.style.height = H + 'px';
            });

            // Buffer saleté
            dirtBaseCv = document.createElement('canvas');
            dirtBaseCv.width = cw;
            dirtBaseCv.height = ch;
            const dCx = dirtBaseCv.getContext('2d');
            dCx.setTransform(DPR, 0, 0, DPR, 0, 0);
            paintDirt(dCx, W, H, fontSize);

            // Masque silhouette des lettres
            textMaskCv = document.createElement('canvas');
            textMaskCv.width = cw;
            textMaskCv.height = ch;
            drawTextMask(textMaskCv.getContext('2d'));

            // Masque de bruit (mi-résolution)
            mw = Math.max(8, Math.floor(cw * 0.55));
            mh = Math.max(8, Math.floor(ch * 0.55));
            noise = buildNoise(mw, mh);

            maskCv = document.createElement('canvas');
            maskCv.width = mw;
            maskCv.height = mh;
            maskCx = maskCv.getContext('2d');
            maskData = maskCx.createImageData(mw, mh);
            const md = maskData.data;
            for (let i = 0; i < mw * mh; i++) {
                md[i * 4 + 0] = 0;
                md[i * 4 + 1] = 0;
                md[i * 4 + 2] = 0;
                md[i * 4 + 3] = 0;
            }

            dirtCx.imageSmoothingEnabled = true;
            dirtCx.imageSmoothingQuality = 'high';

            drawCleanText(cleanCx);
        }

        const EDGE = 0.085;

        function renderAt(p) {
            const t = -EDGE + p * (1 + 2 * EDGE);
            const tLow = t - EDGE;
            const tHigh = t + EDGE;
            const inv2e = 1 / (2 * EDGE);

            const md = maskData.data;
            for (let i = 0; i < noise.length; i++) {
                const n = noise[i];
                let a;
                if (n <= tLow) a = 255;
                else if (n >= tHigh) a = 0;
                else {
                    const k = (tHigh - n) * inv2e;
                    a = (k * k * (3 - 2 * k) * 255) | 0;
                }
                md[i * 4 + 3] = a;
            }
            maskCx.putImageData(maskData, 0, 0);

            // 1) clear → 2) peinture saleté → 3) clip aux lettres → 4) érosion par bruit
            dirtCx.setTransform(1, 0, 0, 1, 0, 0);
            dirtCx.globalCompositeOperation = 'source-over';
            dirtCx.clearRect(0, 0, cw, ch);
            dirtCx.drawImage(dirtBaseCv, 0, 0);
            dirtCx.globalCompositeOperation = 'destination-in';
            dirtCx.drawImage(textMaskCv, 0, 0);
            dirtCx.globalCompositeOperation = 'destination-out';
            dirtCx.drawImage(maskCv, 0, 0, cw, ch);
            dirtCx.globalCompositeOperation = 'source-over';
        }

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        let t0 = null;
        let finished = false;

        function tick(t) {
            if (t0 == null) t0 = t;
            const linear = Math.min((t - t0) / DURATION, 1);
            const eased = easeInOutCubic(linear);

            renderAt(eased);
            pctNum.textContent = Math.round(eased * 100);

            if (linear < 1) {
                requestAnimationFrame(tick);
            } else if (!finished) {
                finished = true;
                // Frame finale propre garantie
                dirtCx.setTransform(1, 0, 0, 1, 0, 0);
                dirtCx.clearRect(0, 0, cw, ch);
                pctNum.textContent = '100';

                setTimeout(() => {
                    el.classList.add('hidden');
                    document.body.classList.add('loaded');
                    startHero();
                }, 400);
            }
        }

        let resizeTO;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTO);
            resizeTO = setTimeout(() => {
                if (finished) {
                    setup();
                    drawCleanText(cleanCx);
                    dirtCx.setTransform(1, 0, 0, 1, 0, 0);
                    dirtCx.clearRect(0, 0, cw, ch);
                } else {
                    setup();
                }
            }, 140);
        });

        function start() {
            setup();
            renderAt(0); // Frame 0 = lettres entièrement sales
            requestAnimationFrame(tick);
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => requestAnimationFrame(start));
        } else {
            requestAnimationFrame(start);
        }
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
