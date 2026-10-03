/* ==========================================================================
   SAAMYA PSYNCE AI — site behaviour
   No dependencies. Every module exits quietly if its markup is absent,
   so the same file can be loaded on every page.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A mouse can hover; a finger cannot. Pointer-tracking effects are wasted
  // work on touch, where they only fire on tap and then stick.
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ----------------------------------------------------------------------
     Theme — monochrome light / dark
     The inline script in each <head> has already applied the stored theme
     before first paint; this only wires up the toggle.
     ---------------------------------------------------------------------- */
  function initTheme() {
    var root = document.documentElement;
    var toggles = document.querySelectorAll('.theme-toggle');

    var label = function (theme) {
      return theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
    };

    var apply = function (theme) {
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('theme', theme); } catch (e) { /* private mode */ }

      toggles.forEach(function (btn) {
        btn.setAttribute('aria-label', label(theme));
        btn.setAttribute('title', label(theme));
      });

      // Let the hero canvas repaint in the new ink colour.
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
    };

    toggles.forEach(function (btn) {
      btn.setAttribute('aria-label', label(root.getAttribute('data-theme')));
      btn.setAttribute('title', label(root.getAttribute('data-theme')));
      btn.addEventListener('click', function () {
        apply(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
      });
    });

    // Follow the OS only while the visitor has never chosen explicitly.
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onSystemChange = function (e) {
      var stored = null;
      try { stored = localStorage.getItem('theme'); } catch (err) { /* ignore */ }
      if (stored) return;
      root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
      document.dispatchEvent(new CustomEvent('themechange'));
    };

    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  /* ----------------------------------------------------------------------
     Material ripple
     ---------------------------------------------------------------------- */
  function initRipple() {
    if (reduceMotion) return;

    var selector = '.btn, .icon-btn, .fab, .tabs__btn, .socials a';

    document.addEventListener('pointerdown', function (e) {
      var target = e.target.closest ? e.target.closest(selector) : null;
      if (!target) return;

      var rect = target.getBoundingClientRect();
      // Radius must reach the furthest corner from the press point.
      var size = Math.max(rect.width, rect.height) * 1.1;

      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      target.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  }

  /* ----------------------------------------------------------------------
     Header: compact-on-scroll + mobile drawer
     ---------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav__toggle');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle) return;

    var close = function () {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    header.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) close();
    });
  }

  /* ----------------------------------------------------------------------
     Scroll-to-top FAB — created here because it is a JS-only affordance
     ---------------------------------------------------------------------- */
  function initFab() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'fab';
    fab.setAttribute('aria-label', 'Back to top');
    fab.setAttribute('title', 'Back to top');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(fab);

    fab.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    var onScroll = function () {
      fab.classList.toggle('is-visible', window.scrollY > 700);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseFloat(entry.target.getAttribute('data-reveal-delay')) || 0;
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, delay);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Count-up numbers
     ---------------------------------------------------------------------- */
  function initCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';

      if (reduceMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }

      var duration = 1500;
      var start = null;

      var frame = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      };

      requestAnimationFrame(frame);
    };

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(run);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    nodes.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Spotlight cards
     ---------------------------------------------------------------------- */
  function initSpotlight() {
    var cards = document.querySelectorAll('.card--spot');
    if (!cards.length || reduceMotion || !finePointer) return;

    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ----------------------------------------------------------------------
     Industry tabs (ARIA tablist)
     ---------------------------------------------------------------------- */
  function initTabs() {
    var root = document.querySelector('[data-tabs]');
    if (!root) return;

    var buttons = Array.prototype.slice.call(root.querySelectorAll('.tabs__btn'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.tabs__panel'));
    if (!buttons.length) return;

    var select = function (index) {
      buttons.forEach(function (btn, i) {
        var on = i === index;
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.setAttribute('tabindex', on ? '0' : '-1');
      });
      panels.forEach(function (panel, i) {
        panel.classList.toggle('is-active', i === index);
      });
    };

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { select(i); });

      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % buttons.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = buttons.length - 1;
        if (next === null) return;
        e.preventDefault();
        select(next);
        buttons[next].focus();
      });
    });

    select(0);
  }

  /* ----------------------------------------------------------------------
     Contact form
     Static hosting has no backend, so this validates client-side and then
     hands off to the visitor's mail client. Add data-endpoint to the form
     to POST to Formspree or a PHP handler instead.
     ---------------------------------------------------------------------- */
  function initForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;

    var status = form.querySelector('.form__status');
    var endpoint = form.getAttribute('data-endpoint') || '';

    var setError = function (field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      var slot = wrap.querySelector('.field__error');
      wrap.classList.toggle('has-error', Boolean(message));
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (slot) slot.textContent = message || '';
    };

    var validate = function () {
      var ok = true;
      var firstBad = null;

      form.querySelectorAll('[required]').forEach(function (field) {
        var value = (field.value || '').trim();
        var message = '';

        if (!value) {
          message = 'This field is required.';
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          message = 'Enter a valid email address.';
        }

        setError(field, message);
        if (message) {
          ok = false;
          if (!firstBad) firstBad = field;
        }
      });

      if (firstBad) firstBad.focus();
      return ok;
    };

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrap = field.closest('.field');
        if (wrap && wrap.classList.contains('has-error')) setError(field, '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      var data = new FormData(form);

      if (endpoint) {
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (!res.ok) throw new Error('Request failed');
            form.reset();
            if (status) {
              status.hidden = false;
              status.textContent = 'Thank you. Your message has been received — we will respond within two business days.';
            }
          })
          .catch(function () {
            if (status) {
              status.hidden = false;
              status.textContent = 'Something went wrong. Please email us directly at hello@saamyapsynce.com.';
            }
          });
        return;
      }

      var subject = 'Enquiry from ' + (data.get('name') || 'website');
      var body = [
        'Name: ' + (data.get('name') || ''),
        'Email: ' + (data.get('email') || ''),
        'Company: ' + (data.get('company') || ''),
        'Area of interest: ' + (data.get('interest') || ''),
        '',
        data.get('message') || ''
      ].join('\n');

      window.location.href = 'mailto:hello@saamyapsynce.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (status) {
        status.hidden = false;
        status.textContent = 'Opening your email app with the message ready to send.';
      }
    });
  }

  /* ----------------------------------------------------------------------
     Hero neural network canvas — monochrome, follows the active theme
     ---------------------------------------------------------------------- */
  function initNeural() {
    var canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var nodes = [];
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pointer = { x: -9999, y: -9999 };
    var frameId = null;
    var ink = '255, 255, 255';

    var LINK_DISTANCE = 138;
    var POINTER_RADIUS = 170;

    function readInk() {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue('--canvas-ink').trim();
      ink = v || '255, 255, 255';
    }

    function size() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      // Scale node count to area, but cap it so phones stay smooth.
      var count = Math.min(Math.round((width * height) / 15000), 90);
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.26,
          vy: (Math.random() - 0.5) * 0.26,
          r: Math.random() * 1.5 + 0.8,
          // Varying alpha is what creates depth once colour is gone.
          a: Math.random() * 0.5 + 0.3
        });
      }
    }

    function paint(animate) {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];

        if (animate) {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;

          var pdx = n.x - pointer.x;
          var pdy = n.y - pointer.y;
          var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < POINTER_RADIUS && pdist > 0.1) {
            var push = (1 - pdist / POINTER_RADIUS) * 0.9;
            n.x += (pdx / pdist) * push;
            n.y += (pdy / pdist) * push;
          }
        }

        // Edges to later neighbours only, so each pair is drawn once.
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x;
          var dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= LINK_DISTANCE) continue;

          var alpha = (1 - dist / LINK_DISTANCE) * 0.22;
          ctx.strokeStyle = 'rgba(' + ink + ', ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + ink + ', ' + n.a.toFixed(3) + ')';
        ctx.fill();
      }

      if (animate) frameId = requestAnimationFrame(function () { paint(true); });
    }

    function start() {
      readInk();
      size();
      seed();
      if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
      paint(!reduceMotion);
    }

    // Cursor repulsion is a mouse affordance. On touch the same listener
    // would fire throughout every scroll gesture for no visible benefit.
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      }, { passive: true });

      window.addEventListener('pointerleave', function () {
        pointer.x = -9999;
        pointer.y = -9999;
      });
    }

    // Mobile browsers fire resize every time the URL bar slides away. Re-seeding
    // there would make the field visibly jump mid-scroll, so a height-only
    // change just resizes the backing bitmap and keeps the nodes where they are.
    var lastWidth = window.innerWidth;
    var resizeTimer;

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          start();                 // real width change: rebuild the field
        } else {
          size();                  // keep the bitmap crisp, keep the nodes
          if (reduceMotion) paint(false);
        }
      }, 180);
    });

    // Repaint in the new ink when the theme flips, keeping node positions.
    document.addEventListener('themechange', function () {
      readInk();
      if (reduceMotion) paint(false);
    });

    // Pause the loop when the tab is hidden — no point burning cycles.
    document.addEventListener('visibilitychange', function () {
      if (reduceMotion) return;
      if (document.hidden) {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = null;
      } else if (!frameId) {
        paint(true);
      }
    });

    start();
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------------------------------------------------------------- */
  function init() {
    initTheme();
    initRipple();
    initHeader();
    initFab();
    initReveal();
    initCounters();
    initSpotlight();
    initTabs();
    initForm();
    initNeural();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
