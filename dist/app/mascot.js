// Render the approved artwork directly; its character is never redrawn.
// Motion is decorative and independent of provider activity.
export function startMascot() {
  const canvas = document.querySelector('#mascot-canvas');
  const card = canvas.parentElement, button = document.querySelector('#motion');
  const context = canvas.getContext('2d');
  if (!context) { button.hidden = true; return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, visible = true, width = 0, height = 0;
  let frame = 0, pointer = null, animation;
  const source = new Image();
  const sync = () => {
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume mascot animation' : 'Pause mascot animation');
    button.innerHTML = paused
      ? '<svg class="icon" viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z"/></svg>'
      : '<svg class="icon" viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>';
  };
  const draw = () => {
    if (!width || !height || !source.complete || !source.naturalWidth) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    // The source file is the unchanged approved design image. Only its
    // scene is rendered; DOM overlays replace example labels with agent state.
    // Cover-fit inside the approved scene region (never beyond it), so the
    // pixel art keeps its proportions at every card shape.
    const sx = source.naturalWidth / 1774, sy = source.naturalHeight / 887;
    const target = width / height;
    // Narrow cards use a compact header, so they crop below the artwork's example labels.
    const narrow = target < 1.45;
    const region = narrow ? { x: 851, y: 250, w: 473, h: 251 } : { x: 851, y: 203, w: 473, h: 298 };
    let cw = region.w, ch = region.h;
    if (target < cw / ch) cw = ch * target; else ch = cw / target;
    const cx = Math.min(Math.max(1080 - cw / 2, region.x), region.x + region.w - cw);
    const cy = Math.min(Math.max(region.y + (region.h - ch) * .5, region.y), region.y + region.h - ch);
    context.drawImage(source, cx * sx, cy * sy, cw * sx, ch * sy, 0, 0, width, height);
    if (narrow) {
      // Soft scene-coloured patch over the artwork's example label corner
      // (top-left of the scene); the character itself is never covered.
      const X = v => (v - cx) * width / cw, Y = v => (v - cy) * height / ch;
      const fade = context.createLinearGradient(X(1012), 0, X(1036), 0);
      fade.addColorStop(0, 'rgba(9,10,7,1)'); fade.addColorStop(1, 'rgba(9,10,7,0)');
      context.fillStyle = fade; context.fillRect(X(800), Y(150), X(1036) - X(800), Y(306) - Y(150));
      for (let i = 0; i < 10; i++) { // feather the lower edge
        context.globalAlpha = 1 - (i + 1) / 11;
        context.fillRect(X(800), Y(306 + i * 2), X(1036) - X(800), Y(308 + i * 2) - Y(306 + i * 2) + .5);
      }
      context.globalAlpha = 1;
    }
    const t = frame * .015;
    context.shadowBlur = 8;
    context.shadowColor = '#ffe344';
    for (let i = 0; i < 16; i++) {
      const phase = i * 2.399, drift = paused ? 0 : t * (.18 + i % 3 * .07);
      let x = width * (.12 + .78 * ((Math.sin(phase + drift) + 1) / 2));
      let y = height * (.40 + .46 * ((Math.cos(phase * .7 + drift) + 1) / 2));
      if (pointer && !paused) {
        const d = Math.hypot(x - pointer.x, y - pointer.y);
        if (d < 50) { x += (x - pointer.x) * .4; y += (y - pointer.y) * .4; }
      }
      context.globalAlpha = .12 + (Math.sin(phase + drift) + 1) * .2;
      context.fillStyle = '#ffe42e';
      context.fillRect(x, y, i % 4 === 0 ? 4 : 2, i % 4 === 0 ? 4 : 2);
    }
    context.globalAlpha = 1;
    context.shadowBlur = 0;
  };
  const tick = () => {
    if (visible && !paused) { frame++; draw(); }
    animation = requestAnimationFrame(tick);
  };
  source.onload = () => { card.classList.add('ready'); button.hidden = false; draw(); };
  source.onerror = () => { button.hidden = true; };
  // A card may name a recoloured copy of the same artwork (same size and layout),
  // e.g. the workspace's brand-yellow scene; the website uses the original.
  source.src = new URL(`./${card.dataset.art || 'reference-art.jpg'}`, import.meta.url).href;
  new ResizeObserver(() => {
    width = canvas.clientWidth || card.clientWidth; height = canvas.clientHeight || card.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio; canvas.height = height * ratio; draw();
  }).observe(card);
  new IntersectionObserver(entries => visible = entries[0].isIntersecting).observe(card);
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const r = canvas.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  canvas.addEventListener('pointerleave', () => pointer = null);
  button.addEventListener('click', () => { paused = !paused; sync(); draw(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; sync(); draw(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animation); else tick();
  });
  sync(); tick();
}
