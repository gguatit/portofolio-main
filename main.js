// ==============================================
// Kalpha_Dev Portfolio — GSAP Animation Engine
// ==============================================

var CONFIG = {
  EMAIL: 'dev@kalpha.kr',
  GITHUB_USERNAME: 'gguatit',
  GITHUB_REPO_LIMIT: 6,
  GITHUB_API_BASE: 'https://api.github.com',
  GITHUB_PINNED_API: 'https://gh-pinned-repos-tsj7ta5xfhep.deno.dev'
};

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.defaults({ overwrite: 'auto' });

// ==============================================
// UTIL: Text split preserving <br>
// ==============================================
function splitTextPreserveBR(el) {
  var result = [];
  var childNodes = Array.prototype.slice.call(el.childNodes);
  childNodes.forEach(function (node) {
    if (node.nodeType === 3) {
      // Text node — split into characters
      var text = node.textContent;
      for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        var char;
        if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
          char = text[i] + text[i + 1];
          i += 1;
        } else {
          char = text[i];
        }
        result.push({ type: 'char', value: char });
      }
    } else if (node.nodeType === 1 && node.tagName === 'BR') {
      result.push({ type: 'break' });
    }
  });
  return result;
}

function buildSpansFromSplit(el, splitResult) {
  var frag = document.createDocumentFragment();
  var spans = [];
  splitResult.forEach(function (item) {
    if (item.type === 'break') {
      frag.appendChild(document.createElement('br'));
    } else {
      var s = document.createElement('span');
      s.textContent = item.value;
      frag.appendChild(s);
      spans.push(s);
    }
  });
  el.innerHTML = '';
  el.appendChild(frag);
  return spans;
}

// ==============================================
// MAIN ANIMATION SETUP
// ==============================================
function setupAnimations() {
  // Show body immediately after GSAP initializes
  document.body.classList.add('gsap-ready');

  var mm = gsap.matchMedia();

  // --- REDUCED MOTION ---
  mm.add('(prefers-reduced-motion: reduce)', function () {
    gsap.set('.hero-orb, .hero-desc, .hero-actions, .about-content, .skills-grid, ' +
             '.section-desc, .github-project-card, .journey-timeline, .browser-frame, ' +
             '.journey-card, .section-num',
      { opacity: 1, y: 0, x: 0, scale: 1, clearProps: 'transform,filter,clipPath' }
    );
    gsap.set('.hero-title span', { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: 'blur(0px)', clearProps: 'transform,filter' });
  });

  // --- FULL MOTION ---
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var ctx = gsap.context(function () {

      // ========================================
      // HERO — Cinematic Timeline
      // ========================================
      var titleEl = document.querySelector('.hero-title');
      var orb = document.querySelector('.hero-orb');
      var desc = document.querySelector('.hero-desc');
      var actions = document.querySelector('.hero-actions');

      // Split hero title, preserving <br>
      var splitData = splitTextPreserveBR(titleEl);
      var titleSpans = buildSpansFromSplit(titleEl, splitData);

      var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Phase 1: Background orb expands
      heroTl.fromTo(orb,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.3, ease: 'power4.out' },
        0
      );

      // Phase 2: Title — per-character 3D depth entry
      //      Each char: slight 3D rotation + blur → crisp, staggered from center
      if (titleSpans.length) {
        gsap.set(titleSpans, {
          opacity: 0,
          y: 56,
          scale: 0.55,
          rotationX: -50,
          rotationY: -15,
          filter: 'blur(8px)',
          transformOrigin: 'center bottom'
        });

        heroTl.to(titleSpans, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          filter: 'blur(0px)',
          duration: 1.0,
          stagger: { amount: 0.65, from: 'start', grid: null },
          ease: 'back.out(1.6)'
        }, 0.12);
      }

      // Phase 3: Description — clip-path curtain reveal
      if (desc) {
        gsap.set(desc, { opacity: 0, clipPath: 'inset(0 0 100% 0)' });
        heroTl.to(desc, {
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.85,
          ease: 'power3.inOut'
        }, 0.55);
      }

      // Phase 4: CTA buttons — sequential bounce
      if (actions) {
        var btns = actions.querySelectorAll('.btn');
        gsap.set(btns, { opacity: 0, y: 20, scale: 0.85 });
        heroTl.to(btns, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.14,
          ease: 'back.out(2.2)'
        }, 0.7);
      }

      // Orb idle breathing
      gsap.to(orb, {
        scale: 1.1,
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.8
      });

      // ========================================
      // SECTION NUMBER REVEALS
      // ========================================
      gsap.utils.toArray('.section-num').forEach(function (num) {
        gsap.set(num, { opacity: 0, y: -20, scale: 0.9 });
        ScrollTrigger.create({
          trigger: num.closest('section'),
          start: 'top 85%',
          once: true,
          onEnter: function () {
            gsap.to(num, { opacity: 0.04, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' });
          }
        });
      });

      // ========================================
      // SECTION DESCRIPTIONS
      // ========================================
      gsap.utils.toArray('.section-desc').forEach(function (sd) {
        gsap.set(sd, { opacity: 0, y: 20 });
        ScrollTrigger.create({
          trigger: sd.closest('section'),
          start: 'top 82%',
          once: true,
          onEnter: function () {
            gsap.to(sd, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
          }
        });
      });

      // ========================================
      // ABOUT — Staggered slide + list cascade
      // ========================================
      var aboutContent = document.querySelector('.about-content');
      if (aboutContent) {
        var aboutP = aboutContent.querySelectorAll('p');
        var aboutListItems = aboutContent.querySelectorAll('.about-info li');

        gsap.set(aboutContent, { opacity: 1 }); // container visible

        if (aboutP.length) {
          gsap.set(aboutP, { opacity: 0, x: -36 });
        }
        if (aboutListItems.length) {
          gsap.set(aboutListItems, { opacity: 0, x: -20 });
        }

        ScrollTrigger.create({
          trigger: '#about',
          start: 'top 72%',
          once: true,
          onEnter: function () {
            var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            if (aboutP.length) {
              tl.to(aboutP, {
                opacity: 1, x: 0,
                duration: 0.6,
                stagger: { each: 0.15, from: 'start' }
              }, 0);
            }
            if (aboutListItems.length) {
              tl.to(aboutListItems, {
                opacity: 1, x: 0,
                duration: 0.45,
                stagger: 0.08
              }, '-=0.1');
            }
          }
        });
      }

      // ========================================
      // SKILLS — 3D grid drop cascade
      // ========================================
      var skillGroups = document.querySelectorAll('.skill-group');
      var skillsGrid = document.querySelector('.skills-grid');
      if (skillsGrid) { gsap.set(skillsGrid, { opacity: 1 }); }

      if (skillGroups.length) {
        gsap.set(skillGroups, { opacity: 0, y: -60, scale: 0.82, rotationX: 15 });

        ScrollTrigger.create({
          trigger: '#skills',
          start: 'top 72%',
          once: true,
          onEnter: function () {
            gsap.to(skillGroups, {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationX: 0,
              duration: 0.75,
              stagger: { each: 0.16, from: 'start' },
              ease: 'back.out(1.3)'
            });

            // List items inside each group stagger after parent arrives
            skillGroups.forEach(function (group, gi) {
              var items = group.querySelectorAll('.skill-list li');
              if (!items.length) return;
              gsap.set(items, { opacity: 0, x: -12 });
              gsap.to(items, {
                opacity: 1,
                x: 0,
                duration: 0.35,
                stagger: 0.06,
                ease: 'power2.out',
                delay: 0.3 + gi * 0.16
              });
            });
          }
        });
      }

      // ========================================
      // PROJECTS — Perspective plane rise
      // ========================================
      var projectsContainer = document.getElementById('github-projects');
      var projectsTriggered = false;

      function animateProjects() {
        if (projectsTriggered) return;
        var cards = document.querySelectorAll('.github-project-card');
        if (!cards.length) return;
        projectsTriggered = true;

        gsap.set(cards, {
          opacity: 0,
          y: 70,
          scale: 0.88,
          rotationX: 12
        });

        ScrollTrigger.create({
          trigger: '#projects',
          start: 'top 72%',
          once: true,
          onEnter: function () {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationX: 0,
              duration: 0.8,
              stagger: { each: 0.12, from: 'start' },
              ease: 'power3.out',
              onComplete: function () {
                // Clear transform for card tilt to take over
                cards.forEach(function (c) {
                  c.style.transform = '';
                });
              }
            });
          }
        });
      }

      // Initial call (for static cards)
      animateProjects();

      // Observer for dynamically-loaded GitHub cards
      if (projectsContainer) {
        var obs = new MutationObserver(function () {
          // Reset — cards replaced
          projectsTriggered = false;
          animateProjects();
          setupCardTilt();
        });
        obs.observe(projectsContainer, { childList: true });
      }

      // ========================================
      // JOURNEY — Timeline draw + card reveals
      // ========================================
      var journeySection = document.querySelector('#journey');
      var journeyTimeline = document.querySelector('.journey-timeline');
      var journeyDots = document.querySelectorAll('.journey-dot');
      var journeyCards = document.querySelectorAll('.journey-card');
      var journeyItems = document.querySelectorAll('.journey-item');

      if (journeyTimeline && journeySection) {
        // Cards start hidden
        if (journeyCards.length) {
          gsap.set(journeyCards, { opacity: 0, x: -30 });
        }

        // Pin the journey section while line draws (caution: may need height)
        ScrollTrigger.create({
          trigger: journeySection,
          start: 'top 55%',
          once: true,
          onEnter: function () {
            // Draw the line
            journeyTimeline.classList.add('drawn');

            // Cards stagger reveal
            if (journeyCards.length) {
              gsap.to(journeyCards, {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: 'power3.out'
              });
            }

            // Dots activate sequentially with delay
            journeyItems.forEach(function (item, i) {
              gsap.delayedCall(0.2 + i * 0.18, function () {
                item.classList.add('active');
              });
            });
          }
        });
      }

      // ========================================
      // DEMO — Browser frame bounce + traffic lights glow
      // ========================================
      var browserFrame = document.querySelector('.browser-frame');
      if (browserFrame) {
        gsap.set(browserFrame, { opacity: 0, y: 50, scale: 0.92 });

        ScrollTrigger.create({
          trigger: '#demo',
          start: 'top 75%',
          once: true,
          onEnter: function () {
            gsap.to(browserFrame, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: 'back.out(1.6)'
            });

            // Traffic lights glow sequentially
            var lights = browserFrame.querySelectorAll('.light');
            gsap.set(lights, { opacity: 0.5 });
            gsap.to(lights, {
              opacity: 1,
              duration: 0.3,
              stagger: { each: 0.15, from: 'start' },
              ease: 'power2.out',
              delay: 0.5
            });
          }
        });
      }

      // ========================================
      // CONTACT — Scale pop + CTA bounce
      // ========================================
      var contactSection = document.querySelector('#contact');
      var contactContent = contactSection ? contactSection.querySelector('.sub-container') : null;
      if (contactContent) {
        var contactP = contactContent.querySelector('p');
        var contactBtn = contactContent.querySelector('.btn');

        gsap.set(contactContent, { opacity: 1 }); // container visible
        if (contactP) gsap.set(contactP, { opacity: 0, y: 16 });
        if (contactBtn) gsap.set(contactBtn, { opacity: 0, scale: 0.85 });

        ScrollTrigger.create({
          trigger: '#contact',
          start: 'top 78%',
          once: true,
          onEnter: function () {
            if (contactP) {
              gsap.to(contactP, {
                opacity: 1, y: 0,
                duration: 0.6,
                ease: 'power2.out'
              });
            }
            if (contactBtn) {
              gsap.to(contactBtn, {
                opacity: 1, scale: 1,
                duration: 0.65,
                ease: 'back.out(2)',
                delay: 0.15
              });
            }
          }
        });
      }

    }, document); // gsap.context scope
  }); // end matchMedia full motion
}

// ==============================================
// CARD 3D TILT — Glass depth + inner parallax
// ==============================================
function setupCardTilt() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cards = document.querySelectorAll('.github-project-card');
  cards.forEach(function (card) {
    var setT = gsap.quickSetter(card, 'transform');
    var h3 = card.querySelector('h3');
    var tags = card.querySelector('.repo-tags');
    var p = card.querySelector('p:not(.repo-meta)');
    var meta = card.querySelector('.repo-meta');
    var btns = card.querySelector('.btns');

    // Inner element depth layering
    if (h3) gsap.set(h3, { transformStyle: 'preserve-3d', willChange: 'transform' });
    if (tags) gsap.set(tags, { transformStyle: 'preserve-3d', willChange: 'transform' });
    if (p) gsap.set(p, { transformStyle: 'preserve-3d', willChange: 'transform' });
    if (meta) gsap.set(meta, { transformStyle: 'preserve-3d', willChange: 'transform' });
    if (btns) gsap.set(btns, { transformStyle: 'preserve-3d', willChange: 'transform' });

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      var cx = r.width / 2;
      var cy = r.height / 2;
      var rx = ((y - cy) / cy) * -10;
      var ry = ((x - cx) / cx) * 10;

      // Edge highlight angle — opposite to tilt direction
      var deg = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
      var edgeDeg = deg + 180;
      card.style.setProperty('--edge-angle', edgeDeg + 'deg');

      // Iridescent edge sheen
      var irid = ((deg + 180) % 360).toFixed(0);
      card.style.setProperty('--iridescence', 'hue-rotate(' + irid + 'deg)');

      // Card transform — subtle for natural feel
      setT('perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-3px)');

      // Inner element parallax — each layer at different depth
      if (h3) h3.style.transform = 'translateZ(40px) translateX(' + (-ry * 0.4).toFixed(1) + 'px) translateY(' + (-rx * 0.4).toFixed(1) + 'px)';
      if (p) p.style.transform = 'translateZ(15px)';
      if (tags) tags.style.transform = 'translateZ(25px) translateX(' + (-ry * 0.2).toFixed(1) + 'px) translateY(' + (-rx * 0.2).toFixed(1) + 'px)';
      if (meta) meta.style.transform = 'translateZ(10px)';
      if (btns) btns.style.transform = 'translateZ(5px)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--edge-angle', '135deg');
      card.style.setProperty('--iridescence', 'hue-rotate(0deg)');
      gsap.to(card, {
        transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        duration: 0.8,
        ease: 'power3.out'
      });
      if (h3) gsap.to(h3, { duration: 0.6, clearProps: 'transform', ease: 'power3.out' });
      if (p) gsap.to(p, { duration: 0.6, clearProps: 'transform', ease: 'power3.out' });
      if (tags) gsap.to(tags, { duration: 0.6, clearProps: 'transform', ease: 'power3.out' });
      if (meta) gsap.to(meta, { duration: 0.6, clearProps: 'transform', ease: 'power3.out' });
      if (btns) gsap.to(btns, { duration: 0.6, clearProps: 'transform', ease: 'power3.out' });
    });
  });
}

// ==============================================
// CUSTOM CURSOR — PREMIUM
// ==============================================
function setupCursor() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cursor = document.querySelector('.cursor');
  if (!cursor) return;

  var dot = cursor.querySelector('.cursor-dot');
  var glow = document.querySelector('.cursor-glow');
  var rippleContainer = document.querySelector('.ripple-container');

  var setX = gsap.quickSetter(cursor, 'x', 'px');
  var setY = gsap.quickSetter(cursor, 'y', 'px');
  var setGX = glow ? gsap.quickSetter(glow, 'x', 'px') : null;
  var setGY = glow ? gsap.quickSetter(glow, 'y', 'px') : null;

  var cx = window.innerWidth / 2;
  var cy = window.innerHeight / 2;
  var gx = cx, gy = cy;
  var tx = cx, ty = cy;
  var isHovering = false;
  var clicked = false;

  // Trail: ring buffer of recent positions
  var TRAIL_COUNT = 4;
  var trailDots = [];
  var trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.setAttribute('aria-hidden', 'true');
  document.body.appendChild(trail);

  for (var i = 0; i < TRAIL_COUNT; i++) {
    var td = document.createElement('div');
    td.className = 'trail-dot';
    td.style.cssText = 'position:fixed;top:0;left:0;width:4px;height:4px;margin-left:-2px;margin-top:-2px;border-radius:50%;background:var(--accent);pointer-events:none;z-index:9997;opacity:' + (0.35 - i * 0.08).toFixed(2) + ';';
    trail.appendChild(td);
    trailDots.push({ el: td, x: cx, y: cy });
  }

  // Track mouse target
  window.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
  });

  // Hover detection — delegate for dynamic elements
  document.addEventListener('mouseenter', function (e) {
    var el = e.target.closest('a, button, .btn, .github-project-card, .skill-group, input, textarea, [role="button"]');
    if (el) isHovering = true;
  }, true);
  document.addEventListener('mouseleave', function (e) {
    var el = e.target.closest('a, button, .btn, .github-project-card, .skill-group, input, textarea, [role="button"]');
    if (el) isHovering = false;
  }, true);

  // Click feedback + ripple
  window.addEventListener('mousedown', function (e) {
    clicked = true;
    spawnRipple(e.clientX, e.clientY, rippleContainer);
  });
  window.addEventListener('mouseup', function () { clicked = false; });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', function () {
    cursor.style.opacity = '0';
    if (glow) glow.style.opacity = '0';
    trailDots.forEach(function (t) { t.el.style.opacity = '0'; });
  });
  document.addEventListener('mouseenter', function () {
    cursor.style.opacity = '1';
    if (glow) glow.style.opacity = '1';
    trailDots.forEach(function (t, i) { t.el.style.opacity = (0.35 - i * 0.08).toFixed(2); });
  });

  // Magnetic targets — headings and links
  var magneticEls = document.querySelectorAll('.btn, .nav a, .skill-group h3, .journey-card h3, .about-content h3, .section-title');
  var MAGNETIC_RANGE = 80;

  // Ripple: simple per-click ring — no collision system

  // Smooth lerp update via GSAP ticker
  gsap.ticker.add(function () {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    setX(cx);
    setY(cy);

    // Glow — slower follow, larger offset
    gx += (tx - gx) * 0.06;
    gy += (ty - gy) * 0.06;
    if (setGX) { setGX(gx); setGY(gy); }

    // Trail — each dot trails the previous
    trailDots[0].x += (cx - trailDots[0].x) * 0.4;
    trailDots[0].y += (cy - trailDots[0].y) * 0.4;
    trailDots[0].el.style.transform = 'translate(' + trailDots[0].x.toFixed(1) + 'px,' + trailDots[0].y.toFixed(1) + 'px)';
    for (var i = 1; i < TRAIL_COUNT; i++) {
      trailDots[i].x += (trailDots[i-1].x - trailDots[i].x) * 0.3;
      trailDots[i].y += (trailDots[i-1].y - trailDots[i].y) * 0.3;
      trailDots[i].el.style.transform = 'translate(' + trailDots[i].x.toFixed(1) + 'px,' + trailDots[i].y.toFixed(1) + 'px)';
    }

    // Magnetic effect — headings lean toward cursor
    for (var j = 0; j < magneticEls.length; j++) {
      var el = magneticEls[j];
      var rect = el.getBoundingClientRect();
      var elCx = rect.left + rect.width / 2;
      var elCy = rect.top + rect.height / 2;
      var dx = tx - elCx;
      var dy = ty - elCy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAGNETIC_RANGE) {
        var force = (1 - dist / MAGNETIC_RANGE) * 4;
        el.style.transform = 'translate(' + (dx * force * 0.06).toFixed(1) + 'px,' + (dy * force * 0.06).toFixed(1) + 'px)';
      } else {
        el.style.transform = 'translate(0px, 0px)';
      }
    }

    cursor.classList.toggle('hover', isHovering);
    cursor.classList.toggle('click', clicked);
  });
}

function spawnRipple(x, y, container) {
  if (!container) return;
  var ring = document.createElement('div');
  ring.className = 'ripple-ring';
  var size = 40;
  ring.style.left = (x - size / 2) + 'px';
  ring.style.top = (y - size / 2) + 'px';
  ring.style.width = size + 'px';
  ring.style.height = size + 'px';
  container.appendChild(ring);

  gsap.fromTo(ring,
    { scale: 0, opacity: 0.6 },
    { scale: 5, opacity: 0, duration: 2, ease: 'power2.out', onComplete: function () { ring.remove(); } }
  );
}

// ==============================================
// NAV ACTIVE TRACKING
// ==============================================
function setupNavTracking() {
  var links = document.querySelectorAll('.nav a');
  var sections = document.querySelectorAll('section[id]');

  sections.forEach(function (sec) {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 15%',
      end: 'bottom 15%',
      onEnter: function () { setActive('#' + sec.id); },
      onEnterBack: function () { setActive('#' + sec.id); }
    });
  });

  function setActive(hash) {
    links.forEach(function (l) {
      l.classList.remove('active');
      if (l.getAttribute('href') === hash) l.classList.add('active');
    });
  }
}

// ==============================================
// PROGRESS BAR
// ==============================================
function setupProgressBar() {
  var bar = document.querySelector('.progress-bar');
  if (!bar) return;

  function update() {
    var st = window.scrollY;
    var dh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = Math.min(dh > 0 ? (st / dh) * 100 : 0, 100) + '%';
  }

  var ready = false;
  window.addEventListener('scroll', function () {
    if (!ready) {
      requestAnimationFrame(function () { update(); ready = false; });
      ready = true;
    }
  });
  update();
}

// ==============================================
// LIVE CLOCK (KST)
// ==============================================
function setupLiveClock() {
  var clock = document.querySelector('.live-clock');
  if (!clock) return;

  function tick() {
    var n = new Date();
    var k = new Date(n.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    clock.textContent = 'KST ' +
      String(k.getHours()).padStart(2, '0') + ':' +
      String(k.getMinutes()).padStart(2, '0') + ':' +
      String(k.getSeconds()).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

// ==============================================
// NAVIGATION — SCROLLTOPLUGIN
// ==============================================
function setupNavScroll() {
  var links = document.querySelectorAll('.nav a');
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      e.preventDefault();
      var target = document.querySelector(id);
      if (target) {
        gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 80 }, ease: 'power2.inOut' });
      }
    });
  });
}

// ==============================================
// GITHUB PROJECTS
// ==============================================
var ghContainer = document.getElementById('github-projects');

function fmtNum(v) { return new Intl.NumberFormat('ko-KR').format(v); }

function fmtDate(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '날짜 정보 없음';
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function ghState(msg, cls) {
  if (!ghContainer) return;
  ghContainer.innerHTML = '';
  var el = document.createElement('div');
  el.className = cls;
  el.textContent = msg;
  ghContainer.appendChild(el);
}

function mkTags(langs) {
  var div = document.createElement('div');
  div.className = 'repo-tags';
  langs.forEach(function (l) {
    var s = document.createElement('span');
    s.className = 'skill-tag';
    s.textContent = l;
    div.appendChild(s);
  });
  return div;
}

function mkCard(repo, langs) {
  var c = document.createElement('article');
  c.className = 'github-project-card';

  var h3 = document.createElement('h3');
  h3.textContent = repo.name;

  var p = document.createElement('p');
  p.textContent = repo.description || '설명이 없습니다.';

  var meta = document.createElement('p');
  meta.className = 'repo-meta';
  meta.textContent = '\u2B50 ' + fmtNum(repo.stargazers_count) + ' \u00B7 ' +
    (repo.updated_at ? '업데이트 ' + fmtDate(repo.updated_at) : 'Pinned');

  var act = document.createElement('div');
  act.className = 'btns';

  var ghLink = document.createElement('a');
  ghLink.href = repo.html_url;
  ghLink.target = '_blank';
  ghLink.rel = 'noopener noreferrer';
  ghLink.className = 'btn';
  ghLink.innerHTML = '<i class="fab fa-github" aria-hidden="true"></i> GitHub';
  act.appendChild(ghLink);

  if (repo.homepage) {
    var live = document.createElement('a');
    live.href = repo.homepage;
    live.target = '_blank';
    live.rel = 'noopener noreferrer';
    live.className = 'btn';
    live.innerHTML = '<i class="fas fa-external-link-alt" aria-hidden="true"></i> 데모';
    act.appendChild(live);
  }

  c.appendChild(h3);
  c.appendChild(p);
  c.appendChild(mkTags(langs));
  c.appendChild(meta);
  c.appendChild(act);
  return c;
}

async function fetchLanguages(url) {
  try {
    var res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return [];
    var data = await res.json();
    return Object.entries(data)
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, 4)
      .map(function (e) { return e[0]; });
  } catch (_) {
    return [];
  }
}

async function getPinned(user) {
  var u = CONFIG.GITHUB_PINNED_API + '/?username=' + encodeURIComponent(user);
  var r = await fetch(u);
  if (!r.ok) return null;
  var d = await r.json();
  return d.length ? d : null;
}

async function getRepos(user) {
  var u = CONFIG.GITHUB_API_BASE + '/users/' + encodeURIComponent(user) +
    '/repos?sort=updated&per_page=' + CONFIG.GITHUB_REPO_LIMIT + '&type=owner';
  var r = await fetch(u, { headers: { Accept: 'application/vnd.github+json' } });
  if (!r.ok) {
    if (r.status === 403) throw new Error('GitHub API 호출 한도 초과');
    throw new Error('요청 실패 (' + r.status + ')');
  }
  var data = await r.json();
  return data.filter(function (x) { return !x.fork; });
}

function pinnedToCard(p) {
  return {
    name: p.repo,
    description: p.description || '설명이 없습니다.',
    html_url: p.link,
    homepage: p.website || '',
    stargazers_count: p.stars || 0,
    language: p.language || null,
    languages_url: p.languages_url || null,
    updated_at: null
  };
}

async function loadGithub() {
  if (!ghContainer) return;
  var user = ghContainer.dataset.githubUser || CONFIG.GITHUB_USERNAME;

  ghState('GitHub 저장소를 불러오는 중...', 'github-loading');

  try {
    var pinned = await getPinned(user);

    if (pinned) {
      var cards = await Promise.all(
        pinned.map(async function (p) {
          var repo = pinnedToCard(p);
          var langsUrl = 'https://api.github.com/repos/' + repo.name + '/languages';
          var langs = await fetchLanguages(langsUrl);
          if (!langs.length && repo.language) langs = [repo.language];
          return mkCard(repo, langs);
        })
      );
      ghContainer.innerHTML = '';
      cards.forEach(function (c) { ghContainer.appendChild(c); });
      setupCardTilt();
      return;
    }

    var repos = await getRepos(user);
    if (!repos.length) {
      ghState('표시할 저장소가 없습니다.', 'github-empty');
      return;
    }

    var repoCards = await Promise.all(
      repos.map(async function (repo) {
        var langs = await fetchLanguages(repo.languages_url);
        if (!langs.length && repo.language) langs = [repo.language];
        return mkCard(repo, langs);
      })
    );

    ghContainer.innerHTML = '';
    repoCards.forEach(function (c) { ghContainer.appendChild(c); });
    setupCardTilt();
  } catch (err) {
    console.error('GitHub 조회 실패:', err);
    ghState('GitHub 정보를 불러오지 못했습니다. (' + err.message + ')', 'github-error');
  }
}

// ==============================================
// BOOT
// ==============================================
document.addEventListener('DOMContentLoaded', function () {
  setupCursor();
  setupAnimations();
  setupProgressBar();
  setupLiveClock();
  setupNavScroll();
  setupNavTracking();
  loadGithub();
});
