// Thensday site: nav state, scroll reveals, and the hero phone animation. No dependencies.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = /[?&]still\b/.test(location.search); // static snapshot mode for screenshots

  // Nav hairline once scrolled
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Reveal on scroll
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce.matches && !still) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- Hero phone ----------
  var phone = document.getElementById('phone');
  if (!phone) return;
  var $ = function (id) { return document.getElementById(id); };
  var tap = $('tap'), prog = $('prog'), ring = $('ring'), readStep = $('readStep'),
      sum = $('sum'), badge = $('readBadge'), moment = $('moment'), toast = $('toast'),
      c1 = $('c1'), c2 = $('c2'), thApp = $('thApp');
  var facts = phone.querySelectorAll('.fact'), qs = phone.querySelectorAll('.q');
  var beats = document.querySelectorAll('.beats span');
  var SUMMARY = 'A tiny brunch spot in Alfama. Go before 9; the pastel de nata is €1.80.';

  var run = 0;          // generation counter: bumping it cancels a running loop
  var visible = true;

  function beat(n) { beats.forEach(function (b, i) { b.classList.toggle('on', i === n); }); }
  function sleep(ms, gen) {
    return new Promise(function (res, rej) {
      setTimeout(function () { gen === run ? res() : rej('cancel'); }, ms);
    });
  }
  function tapAt(el) {
    var s = phone.querySelector('.screen').getBoundingClientRect();
    var r = el.getBoundingClientRect();
    tap.style.left = (r.left - s.left + r.width / 2) + 'px';
    tap.style.top = (r.top - s.top + r.height / 2) + 'px';
    tap.classList.remove('go'); void tap.offsetWidth; tap.classList.add('go');
  }
  function reset() {
    phone.className = 'phone';
    prog.style.transition = 'none'; prog.style.width = '0';
    ring.style.strokeDashoffset = 100; readStep.textContent = 'Watching… 0%';
    sum.textContent = ''; badge.classList.remove('on');
    facts.forEach(function (f) { f.classList.remove('on'); });
    qs.forEach(function (q) { q.classList.remove('on'); });
    [c1, c2].forEach(function (c) { c.classList.remove('sel', 'press'); });
    moment.classList.remove('on'); toast.classList.remove('on'); thApp.classList.remove('press');
    beat(0);
  }
  function finalState() {
    reset();
    phone.classList.add('s-card', 's-reveal', 'ost2');
    prog.style.width = '60%';
    ring.style.strokeDashoffset = 0;
    sum.textContent = SUMMARY; badge.classList.add('on');
    facts.forEach(function (f) { f.classList.add('on'); });
    qs.forEach(function (q) { q.classList.add('on'); });
    c1.classList.add('sel'); c2.classList.add('sel'); moment.classList.add('on');
    beat(3);
  }

  async function loop() {
    var gen = ++run;
    try {
      for (;;) {
        reset();
        await sleep(60, gen);
        prog.style.transition = 'width 3.2s linear'; prog.style.width = '62%';
        await sleep(1700, gen);
        phone.classList.add('ost2');
        await sleep(1300, gen);
        // share
        tapAt(phone.querySelector('.share-btn svg'));
        await sleep(300, gen);
        phone.classList.add('s-sheet');
        await sleep(1050, gen);
        thApp.classList.add('press'); tapAt(thApp.querySelector('span'));
        await sleep(280, gen);
        // read
        phone.classList.remove('s-sheet'); phone.classList.add('s-card'); beat(1);
        await sleep(450, gen);
        for (var p = 0; p <= 100; p += 4) {
          ring.style.strokeDashoffset = 100 - p;
          readStep.textContent = p < 50 ? 'Watching… ' + p + '%' : p < 80 ? 'Listening…' : 'Reading the caption…';
          await sleep(68, gen);
        }
        phone.classList.add('s-reveal'); badge.classList.add('on');
        await sleep(350, gen);
        for (var i = 1; i <= SUMMARY.length; i++) {
          sum.innerHTML = '';
          sum.appendChild(document.createTextNode(SUMMARY.slice(0, i)));
          var c = document.createElement('span'); c.className = 'caret'; sum.appendChild(c);
          await sleep(26, gen);
        }
        sum.textContent = SUMMARY;
        for (var f = 0; f < facts.length; f++) { facts[f].classList.add('on'); await sleep(220, gen); }
        // ask
        await sleep(300, gen); beat(2);
        qs[0].classList.add('on'); await sleep(250, gen); qs[1].classList.add('on');
        await sleep(900, gen);
        tapAt(c1); c1.classList.add('press'); await sleep(160, gen); c1.classList.remove('press'); c1.classList.add('sel');
        await sleep(800, gen);
        tapAt(c2); c2.classList.add('press'); await sleep(160, gen); c2.classList.remove('press'); c2.classList.add('sel');
        // moment
        await sleep(450, gen); beat(3);
        moment.classList.add('on');
        await sleep(1500, gen);
        toast.classList.add('on');
        await sleep(2600, gen);
        toast.classList.remove('on');
        await sleep(900, gen);
      }
    } catch (e) { /* cancelled */ }
  }

  function start() { if (reduce.matches || still) { run++; finalState(); } else loop(); }
  function stop() { run++; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var v = es[0].isIntersecting;
      if (v && !visible) { visible = true; start(); }
      else if (!v && visible) { visible = false; stop(); }
    }, { threshold: 0.15 }).observe(phone);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (visible) start();
  });
  if (reduce.addEventListener) reduce.addEventListener('change', start);
  start();
})();
