(() => {
  'use strict';

  const about = document.getElementById('about');
  const works = document.getElementById('works');
  const footer = document.getElementById('site-footer');
  if (!about || !works || !footer) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DURATION = 900;
  const WHEEL_THRESHOLD = 140;
  const WHEEL_IDLE = 280;
  const GESTURE_GAP = 350;
  let frameId = 0;
  let animating = false;
  let wheelAmount = 0;
  let wheelDirection = 0;
  let lastWheelAt = -Infinity;
  let lastInnerScrollAt = -Infinity;
  let quietUntil = 0;
  let touch = null;

  const detailOpen = () => document.body.classList.contains('detail-open');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pageStops = () => {
    const end = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return [0, Math.min(about.offsetTop, end), Math.min(works.offsetTop, end), end];
  };
  const nearestPage = () => {
    const stops = pageStops();
    return stops.reduce((best, top, index) => Math.abs(top - window.scrollY) < Math.abs(stops[best] - window.scrollY) ? index : best, 0);
  };
  const innerScroller = (index) => index === 1 ? about : index === 2 ? works : null;
  const canScroll = (element, direction) => element && (direction > 0
    ? element.scrollTop + element.clientHeight < element.scrollHeight - 2
    : element.scrollTop > 2);

  // cubic-bezier(.42, 0, .58, 1): a gentle start, acceleration, then a slow stop.
  const cubic = (t, first, second) => 3 * (1 - t) ** 2 * t * first + 3 * (1 - t) * t ** 2 * second + t ** 3;
  const ease = (progress) => {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 12; i += 1) {
      const middle = (low + high) / 2;
      if (cubic(middle, .42, .58) < progress) low = middle;
      else high = middle;
    }
    return cubic((low + high) / 2, 0, 1);
  };

  function animateTo(index, onDone) {
    const stops = pageStops();
    const target = stops[clamp(index, 0, stops.length - 1)];
    const start = window.scrollY;
    if (reducedMotion.matches || Math.abs(target - start) < 1) {
      window.scrollTo(0, target);
      quietUntil = performance.now() + GESTURE_GAP;
      onDone?.();
      return;
    }
    animating = true;
    let beganAt = null;
    const step = (timestamp) => {
      if (beganAt === null) beganAt = timestamp;
      const progress = clamp((timestamp - beganAt) / DURATION, 0, 1);
      window.scrollTo(0, start + (target - start) * ease(progress));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
        return;
      }
      window.scrollTo(0, target);
      frameId = 0;
      animating = false;
      quietUntil = Math.max(quietUntil, performance.now() + GESTURE_GAP);
      onDone?.();
    };
    frameId = requestAnimationFrame(step);
  }

  document.addEventListener('wheel', (event) => {
    if (detailOpen() || event.ctrlKey) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (!delta) return;
    const now = performance.now();
    if (animating || now < quietUntil) {
      event.preventDefault();
      quietUntil = now + GESTURE_GAP;
      return;
    }
    const index = nearestPage();
    const scroller = innerScroller(index);
    const direction = Math.sign(delta);
    if (canScroll(scroller, direction)) {
      wheelAmount = 0;
      lastInnerScrollAt = now;
      if (event.target.closest?.('.about, .works') === scroller) return;
      event.preventDefault();
      scroller.scrollTop = clamp(scroller.scrollTop + delta, 0, scroller.scrollHeight - scroller.clientHeight);
      return;
    }
    event.preventDefault();
    if (now - lastInnerScrollAt < WHEEL_IDLE) return;
    if (direction !== wheelDirection || now - lastWheelAt > WHEEL_IDLE) wheelAmount = 0;
    wheelDirection = direction;
    lastWheelAt = now;
    wheelAmount += Math.abs(delta);
    if (wheelAmount < WHEEL_THRESHOLD) return;
    wheelAmount = 0;
    if (index + direction >= 0 && index + direction < pageStops().length) animateTo(index + direction);
  }, { passive: false });

  document.addEventListener('touchstart', (event) => {
    if (detailOpen() || animating || event.touches.length !== 1) { touch = null; return; }
    const point = event.touches[0];
    touch = { index: nearestPage(), x: point.screenX, y: point.screenY, lastY: point.screenY,
      startedAt: performance.now(), startScroll: window.scrollY, mode: null,
      targetScroller: event.target.closest?.('.about, .works') || null };
  }, { passive: true });

  document.addEventListener('touchmove', (event) => {
    if (detailOpen()) return;
    if (animating) { event.preventDefault(); return; }
    if (!touch || event.touches.length !== 1) return;
    const point = event.touches[0];
    const delta = point.screenY - touch.y;
    if (touch.mode === 'ignored' || (!touch.mode && Math.abs(point.screenX - touch.x) > Math.abs(delta) * 1.2)) {
      touch.mode = 'ignored';
      return;
    }
    const direction = Math.sign(touch.lastY - point.screenY);
    const scroller = innerScroller(touch.index);
    if (scroller && canScroll(scroller, direction) && touch.mode !== 'page') {
      touch.mode = 'inner';
      if (touch.targetScroller !== scroller) {
        event.preventDefault();
        scroller.scrollTop = clamp(scroller.scrollTop + touch.lastY - point.screenY, 0, scroller.scrollHeight - scroller.clientHeight);
      }
      touch.lastY = point.screenY;
      return;
    }
    if (touch.mode === 'inner') {
      touch.y = point.screenY;
      touch.startedAt = performance.now();
      touch.startScroll = window.scrollY;
    }
    touch.mode = 'page';
    touch.lastY = point.screenY;
    event.preventDefault();
    if (reducedMotion.matches) return;
    const stops = pageStops();
    const previous = stops[Math.max(0, touch.index - 1)];
    const next = stops[Math.min(stops.length - 1, touch.index + 1)];
    window.scrollTo(0, clamp(touch.startScroll - (point.screenY - touch.y) * .6, previous, next));
  }, { passive: false });

  function finishTouch(event) {
    if (!touch) return;
    const gesture = touch;
    touch = null;
    if (gesture.mode !== 'page' || detailOpen()) return;
    const distance = gesture.y - event.changedTouches[0].screenY;
    const amount = Math.abs(distance);
    const elapsed = Math.max(1, performance.now() - gesture.startedAt);
    const deliberate = amount >= Math.max(120, window.innerHeight * .18)
      && (amount / elapsed >= .15 || amount >= window.innerHeight * .3);
    animateTo(gesture.index + (deliberate ? Math.sign(distance) : 0));
  }
  document.addEventListener('touchend', finishTouch, { passive: true });
  document.addEventListener('touchcancel', finishTouch, { passive: true });

  document.addEventListener('click', (event) => {
    if (detailOpen()) return;
    const link = event.target.closest?.('a[href^="#"]');
    const hash = link?.getAttribute('href');
    const index = { '#top': 0, '#about': 1, '#works': 2 }[hash];
    if (index === undefined) return;
    event.preventDefault();
    if (animating) return;
    animateTo(index, () => {
      if (location.hash === hash) return;
      try { history.pushState(null, '', hash); }
      catch { location.hash = hash; }
    });
  });

  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#work/') || !animating) return;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    animating = false;
    wheelAmount = 0;
  });
})();
