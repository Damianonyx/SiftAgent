(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu(); toggle.focus();
    }
  });
  const mobile = window.matchMedia('(max-width: 650px)');
  mobile.addEventListener('change', () => { if (!mobile.matches) closeMenu(); });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const next = document.querySelector('#next-step');
  const labels = ['Next: the evidence', 'Next: keep watch', 'Back to your criteria'];
  let selected = 0;
  function showStep(index, focus = false) {
    selected = index;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
    document.querySelector('#step-count').textContent = `0${index + 1} / 03`;
    next.replaceChildren(document.createTextNode(labels[index] + ' '));
    const arrow = document.createElement('span');
    arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true'); next.append(arrow);
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showStep(i));
    tab.addEventListener('keydown', (event) => {
      let target;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) target = (i + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) target = (i + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); showStep(target, true); }
    });
  });
  next.addEventListener('click', () => showStep((selected + 1) % tabs.length));

  // The animation samples only the supplied brand image. It never fetches
  // market data, creates a trading signal, or sends interaction telemetry.
  async function startPixelSimulation() {
    const hero = document.querySelector('#home');
    const image = document.querySelector('#mascot-source');
    const stage = document.querySelector('#pixel-stage');
    const canvas = document.querySelector('#signal-canvas');
    const controls = document.querySelector('#motion-controls');
    const pause = document.querySelector('#toggle-motion');
    const scatter = document.querySelector('#scatter-pixels');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    if (image.complete && !image.naturalWidth) return;
    if (!image.complete) {
      await new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
      });
    }
    const grid = 94;
    const sampler = document.createElement('canvas');
    sampler.width = sampler.height = grid;
    const sampleContext = sampler.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return;
    sampleContext.drawImage(image, 0, 0, grid, grid);
    // If a file:// browser forbids reading image pixels, the original mascot
    // remains visible. The portable HTML embeds the image to avoid that issue.
    const pixels = sampleContext.getImageData(0, 0, grid, grid).data;
    const points = [];
    let seed = 5379;
    function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function isDark(x, y) {
      if (x < 0 || y < 0 || x >= grid || y >= grid) return false;
      const index = (y * grid + x) * 4;
      return pixels[index] + pixels[index + 1] + pixels[index + 2] < 220 && pixels[index + 3] > 200;
    }
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        if (isDark(x, y)) {
          const nx = (x + .5) / grid, ny = (y + .5) / grid;
          const edge = !isDark(x - 1, y) || !isDark(x + 1, y) || !isDark(x, y - 1) || !isDark(x, y + 1);
          points.push({ tx: nx, ty: ny, x: nx, y: ny, edge, phase: random() * Math.PI * 2, tone: random(), delay: .6 + random() * .8 });
        }
      }
    }
    if (points.length < 50) return;
    const motes = Array.from({ length: 130 }, () => ({ x: random(), y: random(), size: random(), phase: random() * Math.PI * 2 }));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reduced.matches, inView = true, frameId = 0, previousFrame = 0, time = 0;
    let width = 1, height = 1, logoSize = 1, logoLeft = 0, logoTop = 0, intro = 0;
    const pointer = { x: -2, y: -2 };

    function sizeCanvas() {
      const box = stage.getBoundingClientRect();
      width = Math.max(1, box.width); height = Math.max(1, box.height);
      logoSize = width <= 650 ? Math.min(width * 1.75, height * .98, 780) : Math.min(width * .66, height * 1.02, 970);
      logoLeft = (width - logoSize) / 2;
      logoTop = height * .49 - logoSize / 2;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(paused, 0);
    }
    function scatterPoints() {
      intro = 0;
      for (const p of points) {
        const angle = random() * Math.PI * 2;
        const distance = .4 + random() * .5;
        p.x = .5 + Math.cos(angle) * distance;
        p.y = .5 + Math.sin(angle) * distance;
      }
    }
    function draw(still = false, step = 1) {
      context.clearRect(0, 0, width, height);
      const unit = logoSize / grid;
      const cell = Math.max(1.1, unit * .3);
      const breath = still ? 0 : Math.sin(time * .48) * .008;
      const rotation = still ? 0 : Math.sin(time * .18) * .025;
      for (const p of motes) {
        const drift = still ? 0 : time * .004;
        const x = ((p.x + drift * (.3 + p.size)) % 1) * width;
        const y = ((p.y - drift * .5 + 1) % 1) * height + (still ? 0 : Math.sin(time * .22 + p.phase) * 7);
        const shimmer = still ? 1 : .7 + Math.sin(time * .5 + p.phase) * .3;
        context.fillStyle = `rgba(223,219,176,${(.16 + p.size * .32) * shimmer})`;
        const dot = .8 + p.size * 1.6;
        context.fillRect(x, y, dot, dot);
      }
      for (const p of points) {
        const offsetX = (p.tx - .5) * rotation;
        let tx = p.tx + offsetX;
        let ty = p.ty + breath;
        if (!still && pointer.x >= 0) {
          const dx = tx - pointer.x, dy = ty - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance > .0001 && distance < .15) {
            const force = (.15 - distance) * .4;
            tx += dx / distance * force;
            ty += dy / distance * force;
          }
        }
        if (still) { p.x = p.tx; p.y = p.ty; }
        else if (intro > p.delay) {
          const ease = 1 - Math.pow(.93, step);
          p.x += (tx - p.x) * ease;
          p.y += (ty - p.y) * ease;
        }
        const flicker = still ? 1 : .8 + .2 * Math.sin(time * .45 + p.phase);
        const entrance = still ? 1 : .08 + .92 * Math.min(intro / 3, 1);
        const opacity = (p.edge ? .62 : .12 + p.tone * .18) * flicker * entrance;
        context.fillStyle = `rgba(230,204,104,${opacity})`;
        context.fillRect(logoLeft + p.x * logoSize - cell / 2, logoTop + p.y * logoSize - cell / 2, cell, cell);
      }
    }
    function frame(timestamp) {
      frameId = 0;
      if (paused || !inView || document.hidden) return;
      // A 30 fps ceiling keeps the simulation modest on mobile devices.
      if (!previousFrame || timestamp - previousFrame >= 32) {
        const dt = previousFrame ? Math.min((timestamp - previousFrame) / 1000, .1) : 1 / 30;
        previousFrame = timestamp; time += dt; intro += dt;
        draw(false, dt * 30);
      }
      frameId = requestAnimationFrame(frame);
    }
    function run() {
      if (!frameId && !paused && inView && !document.hidden) { previousFrame = 0; frameId = requestAnimationFrame(frame); }
    }
    function suspend() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; previousFrame = 0; }
    function updateControls() {
      pause.textContent = paused ? 'Play motion' : 'Pause motion';
      pause.setAttribute('aria-pressed', String(paused));
      scatter.disabled = paused;
      // Finish the one-time entrance when paused; resuming particles must not
      // hide or replay already-readable text and links.
      if (paused) hero.classList.add('intro-finished');
    }
    pause.addEventListener('click', () => {
      paused = !paused;
      if (paused) suspend(); else run();
      updateControls();
    });
    scatter.addEventListener('click', () => { if (!paused) { scatterPoints(); run(); } });
    hero.addEventListener('pointermove', (event) => {
      if (paused) return;
      const box = stage.getBoundingClientRect();
      pointer.x = (event.clientX - box.left - logoLeft) / logoSize;
      pointer.y = (event.clientY - box.top - logoTop) / logoSize;
    }, { passive: true });
    const clearPointer = () => { pointer.x = pointer.y = -2; };
    hero.addEventListener('pointerleave', clearPointer);
    hero.addEventListener('pointerup', (event) => { if (event.pointerType !== 'mouse') clearPointer(); }, { passive: true });
    hero.addEventListener('pointercancel', clearPointer);
    document.addEventListener('visibilitychange', () => { if (document.hidden) suspend(); else run(); });
    reduced.addEventListener('change', () => {
      if (reduced.matches) { paused = true; suspend(); draw(true); updateControls(); }
    });
    if ('IntersectionObserver' in window) {
      const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) run(); else suspend(); }, { threshold: .01 });
      visibility.observe(hero);
    }
    if ('ResizeObserver' in window) new ResizeObserver(sizeCanvas).observe(stage);
    else window.addEventListener('resize', sizeCanvas, { passive: true });
    if (!paused) scatterPoints();
    sizeCanvas();
    stage.classList.add('canvas-ready'); controls.hidden = false; updateControls(); run();
  }
  startPixelSimulation().catch(() => {
    // Keep the original image visible if canvas/image access is unavailable.
    document.querySelector('#pixel-stage').classList.remove('canvas-ready');
    document.querySelector('#motion-controls').hidden = true;
  });
})();
