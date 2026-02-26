/* ================================================================
   一模智造APS — Main JavaScript
   粒子动画、滚动交互、计数器、Tab切换
   ================================================================ */

(function() {
    'use strict';

    // ============================================================
    // Hero Canvas: Particle Network Animation
    // ============================================================
    class ParticleNetwork {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: null, y: null, radius: 150 };
            this.particleCount = 80;
            this.connectionDistance = 180;
            this.animationId = null;

            this.resize();
            this.init();
            this.animate();

            window.addEventListener('resize', () => this.resize());
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });
            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }

        resize() {
            const dpr = window.devicePixelRatio || 1;
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            this.ctx.scale(dpr, dpr);
            this.width = rect.width;
            this.height = rect.height;
        }

        init() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.2,
                    color: Math.random() > 0.7 ? '#00f0ff' : (Math.random() > 0.5 ? '#0066ff' : '#1a3a5c')
                });
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Update & draw particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > this.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.height) p.vy *= -1;

                // Keep in bounds
                p.x = Math.max(0, Math.min(this.width, p.x));
                p.y = Math.max(0, Math.min(this.height, p.y));

                // Mouse interaction
                if (this.mouse.x !== null) {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.mouse.radius) {
                        const force = (this.mouse.radius - dist) / this.mouse.radius;
                        p.vx += (dx / dist) * force * 0.02;
                        p.vy += (dy / dist) * force * 0.02;
                    }
                }

                // Clamp velocity
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 1) {
                    p.vx *= 0.99;
                    p.vy *= 0.99;
                }

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fill();

                // Draw connections
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.connectionDistance) {
                        const opacity = (1 - dist / this.connectionDistance) * 0.15;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = '#00f0ff';
                        this.ctx.globalAlpha = opacity;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }

            this.ctx.globalAlpha = 1;
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            cancelAnimationFrame(this.animationId);
        }
    }

    // Initialize particle network
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        new ParticleNetwork(heroCanvas);
    }

    // ============================================================
    // Navigation: Scroll behavior + Mobile toggle
    // ============================================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    // Scroll handling
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Add scrolled class
        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = scrollY;
    });

    // Mobile navigation toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const spans = navToggle.querySelectorAll('span');
            if (navLinks.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            }
        });

        // Close mobile nav on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            });
        });
    }

    // ============================================================
    // Smooth scroll for anchor links
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // ============================================================
    // Counter Animation
    // ============================================================
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * eased);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Observe counters
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter, .counter-result');
                counters.forEach(counter => {
                    if (!counter.dataset.animated) {
                        const target = parseInt(counter.dataset.target);
                        animateCounter(counter, target);
                        counter.dataset.animated = 'true';
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    // Observe hero stats
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) counterObserver.observe(heroStats);

    // Observe result cards
    document.querySelectorAll('.result-card').forEach(card => {
        counterObserver.observe(card);
    });

    // ============================================================
    // Progress bar fill animation
    // ============================================================
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fills = entry.target.querySelectorAll('.result-progress-fill');
                fills.forEach(fill => {
                    const width = fill.dataset.width;
                    if (width) {
                        setTimeout(() => {
                            fill.style.width = width + '%';
                        }, 200);
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    const resultsDashboard = document.querySelector('.results-dashboard');
    if (resultsDashboard) progressObserver.observe(resultsDashboard);

    // ============================================================
    // Tech Solution Tabs
    // ============================================================
    const techTabs = document.querySelectorAll('.tech-tab');
    const techPanels = document.querySelectorAll('.tech-panel');

    techTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;

            // Update active tab
            techTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active panel
            techPanels.forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById('panel-' + tabId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // ============================================================
    // Scroll Reveal
    // ============================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Auto-add reveal class to sections
    document.querySelectorAll('.section-header, .pain-card, .tech-layout, .pricing-compare, .value-card, .result-card, .cta-grid').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // ============================================================
    // Form Submission (demo)
    // ============================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.btn-form');
            const originalHTML = submitBtn.innerHTML;

            submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" dur="1s" from="0 12 12" to="360 12 12" repeatCount="indefinite"/></circle></svg> 提交中...</span>';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = '✓ 提交成功！我们将尽快联系您';
                submitBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';

                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    contactForm.reset();
                }, 3000);
            }, 1500);
        });
    }

    // ============================================================
    // Pain card touch support for mobile
    // ============================================================
    if ('ontouchstart' in window) {
        document.querySelectorAll('.pain-card').forEach(card => {
            card.addEventListener('click', function() {
                // Remove active from all other cards
                document.querySelectorAll('.pain-card').forEach(c => {
                    if (c !== this) c.classList.remove('flipped');
                });
                this.classList.toggle('flipped');
            });
        });

        // Add CSS for touch flip
        const style = document.createElement('style');
        style.textContent = `
            .pain-card.flipped .pain-card-front { transform: rotateY(180deg); }
            .pain-card.flipped .pain-card-back { transform: rotateY(0); }
            @media (hover: none) {
                .pain-card:hover .pain-card-front { transform: none; }
                .pain-card:hover .pain-card-back { transform: rotateY(180deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    // Floating data particles in background
    // ============================================================
    function createFloatingParticle() {
        const section = document.querySelector('.section-results');
        if (!section) return;

        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: ${Math.random() > 0.5 ? '#00f0ff' : '#0066ff'};
            border-radius: 50%;
            opacity: ${Math.random() * 0.4 + 0.1};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            pointer-events: none;
            animation: float ${Math.random() * 4 + 3}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        section.style.position = 'relative';
        section.style.overflow = 'hidden';
        section.appendChild(particle);
    }

    for (let i = 0; i < 15; i++) {
        createFloatingParticle();
    }

    // ============================================================
    // Glitch effect on hover for section tags
    // ============================================================
    document.querySelectorAll('.section-tag').forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            void this.offsetHeight; // trigger reflow
            const originalText = this.textContent;
            const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?01';
            let iterations = 0;

            const glitchInterval = setInterval(() => {
                this.textContent = originalText.split('').map((char, index) => {
                    if (index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');

                iterations += 1;

                if (iterations > originalText.length) {
                    clearInterval(glitchInterval);
                    this.textContent = originalText;
                }
            }, 40);
        });
    });

})();
