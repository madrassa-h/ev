/* Madrassa Hannover – gemeinsames Skript */
(function () {
  var burger = document.querySelector('.nav-burger'), links = document.querySelector('.nav-links');
  function close() {
    links.classList.remove('is-open'); burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Menü öffnen');
  }
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    document.addEventListener('click', function (e) {
      if (!links.contains(e.target) && !burger.contains(e.target)) close();
    });
  }
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('is-active');
  });

  // Sticky header: transparent on homepage hero, solid after scroll / on other pages
  var header = document.querySelector('.site-header');
  var isHome = !!document.querySelector('.hero-with-slider');
  function updateHeader() {
    if (!header) return;
    if (!isHome || window.scrollY > 60) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Kacheln im Hero umdrehen (Touch/Tastatur)
  document.querySelectorAll('.t').forEach(function (t) {
    t.addEventListener('click', function () { t.classList.toggle('on'); });
  });

  // Nächster Unterricht (Di + Fr 17:00–19:30 Arabisch, Sa 12:00–13:00 Nachhilfe)
  var out = document.getElementById('next');
  if (out) {
    var L = { 2: ['Arabisch', '17:00', 19.5], 5: ['Arabisch', '17:00', 19.5], 6: ['Nachhilfe', '12:00', 13] };
    var names = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    var now = new Date(), h = now.getHours() + now.getMinutes() / 60, today = now.getDay();
    var td = document.querySelector('.day[data-d="' + today + '"]');
    if (td) td.classList.add('today');
    for (var i = 0; i < 8; i++) {
      var d = (today + i) % 7, l = L[d];
      if (l && (i > 0 || h < l[2])) {
        var when = i === 0 ? 'Heute' : i === 1 ? 'Morgen' : names[d];
        out.textContent = 'Nächster Unterricht: ' + when + ', ' + l[1] + ' Uhr (' + l[0] + ')';
        break;
      }
    }
  }

  // Zahlen hochzählen, sobald sichtbar
  var cn = document.querySelectorAll('.cnt');
  if (cn.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var el = e.target, to = +el.dataset.to, t0 = performance.now();
        (function step(t) {
          var p = Math.min((t - t0) / 1000, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .6 });
    cn.forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal, .bx, .proj article, .news-item, .step-card, .subject-tile');
  if (reveals.length && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (el) {
      if (!el.classList.contains('subject-tile')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)';
      }
      ro.observe(el);
    });
  }

  // Focus cards: staggered reveal on scroll
  var cards = document.querySelectorAll('.reveal-card');
  if (cards.length && 'IntersectionObserver' in window) {
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = (+el.dataset.delay || 0);
        if (reduced) {
          el.classList.add('is-visible');
        } else {
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
        }
        co.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(function (el, i) {
      el.dataset.delay = String(i * 90);
      el.style.transition = 'opacity .55s cubic-bezier(.22,1,.36,1) ' + (i * 0.02) + 's, transform .55s cubic-bezier(.22,1,.36,1) ' + (i * 0.02) + 's';
      co.observe(el);
    });
  }


  // Footer reveal
  var footer = document.querySelector('.site-footer');
  if (footer && 'IntersectionObserver' in window) {
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          footer.classList.add('is-visible');
          fo.unobserve(footer);
        }
      });
    }, { threshold: 0.12 });
    fo.observe(footer);
  }

  // Professioneller Bild-Slider
  (function () {
    var slider = document.querySelector('.photo-slider');
    if (!slider) return;
    var slides = Array.from(slider.querySelectorAll('.slide'));
    var prevBtn = slider.querySelector('.slider-btn.prev');
    var nextBtn = slider.querySelector('.slider-btn.next');
    var dotsWrap = slider.querySelector('.slider-dots');
    var current = 0;
    var timer = null;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Bild ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.from(dotsWrap.children);

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restart() {
      if (reduced) return;
      clearInterval(timer);
      timer = setInterval(next, 4800);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });

    // Pause on hover
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', restart);

    // Keyboard
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); restart(); }
      if (e.key === 'ArrowRight') { next(); restart(); }
    });

    // Touch swipe
    var startX = 0;
    slider.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].screenX - startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) next(); else prev();
        restart();
      }
    }, { passive: true });

    restart();
  })();

})();
