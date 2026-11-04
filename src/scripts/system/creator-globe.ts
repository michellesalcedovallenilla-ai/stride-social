// Behaviour for social/CreatorGlobe.astro.
// - Draws the cut-away globe on a canvas: a dotted world on the cap of a large sphere, sliced across
//   near the bottom (a lit rim and a layered cross-section under it), with a cyan beam rising from
//   the selected region into the phone. Redrawn only while it moves.
// - Selecting a region turns the globe (longitude) and rolls it (latitude) until that region sits
//   at the marker, then the phone slides that region's reel in. Ways to select: drag or swipe the
//   globe (a swipe moves to the next region that way; a spring settles it), scroll through the pinned section (one
//   region per step), or the region tabs (click, arrow keys, Home/End).
// - The phone plays only the selected reel, only while on screen; its button pauses it (WCAG 2.2.2).
//   Under reduced motion the globe jumps instead of turning and nothing autoplays.

type Region = { key: string; label: string; lat: number; lon: number };

const D = Math.PI / 180;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

// Stylised continent outlines (longitude, latitude) for the dot map: coarse shapes, not cartography.
const LAND: number[][][] = [
  // North America, Central America, Greenland
  [[-165, 68], [-140, 70], [-110, 73], [-85, 73], [-75, 63], [-62, 58], [-55, 50], [-65, 45], [-70, 42], [-76, 37], [-81, 31], [-80, 25], [-87, 30], [-95, 29], [-97, 25], [-100, 20], [-106, 23], [-110, 24], [-117, 32], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-165, 60]],
  [[-105, 20], [-97, 16], [-88, 13], [-83, 9], [-77, 8], [-80, 10], [-84, 15], [-88, 17], [-90, 21], [-97, 21]],
  [[-55, 60], [-45, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 77]],
  // South America
  [[-80, 10], [-72, 12], [-60, 10], [-50, 0], [-35, -6], [-38, -15], [-48, -25], [-58, -35], [-65, -45], [-70, -55], [-75, -50], [-72, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 7]],
  // Europe, Britain, Ireland, Iceland
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [8, 57], [5, 62], [15, 69], [28, 71], [40, 68], [45, 60], [40, 50], [30, 45], [28, 41], [22, 36], [15, 38], [12, 44], [8, 44], [3, 42], [-4, 37]],
  [[-6, 50], [2, 51], [1, 53], [-2, 56], [-3, 58.5], [-6, 58], [-5, 55], [-3, 54], [-5, 52]],
  [[-10, 52], [-6, 52], [-6, 55], [-8, 55.3], [-10, 54]],
  [[-24, 64], [-14, 64], [-14, 66.5], [-22, 66.5]],
  // Africa, Arabia, Madagascar
  [[-17, 21], [-10, 30], [-6, 35], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [28, -34], [18, -34], [12, -18], [9, -1], [8, 4], [-8, 5], [-17, 14]],
  [[35, 30], [48, 30], [56, 25], [58, 21], [52, 15], [43, 12], [39, 20], [35, 28]],
  [[44, -16], [50, -14], [48, -25], [44, -24]],
  // Asia, Japan, South-East Asian islands
  [[30, 45], [40, 68], [60, 70], [80, 73], [100, 77], [120, 73], [140, 72], [160, 70], [180, 68], [180, 62], [163, 58], [156, 51], [143, 50], [140, 45], [135, 42], [130, 42], [122, 40], [121, 31], [117, 23], [108, 21], [109, 12], [104, 9], [100, 13], [99, 8], [103, 1], [98, 8], [94, 16], [91, 22], [87, 21], [80, 15], [77, 8], [72, 21], [67, 25], [60, 25], [57, 27], [50, 30], [44, 38], [40, 42]],
  [[130, 31], [136, 34], [141, 38], [141, 45], [140, 41], [135, 35]],
  [[95, 5], [106, -6], [115, -8], [120, -9], [119, 0], [118, 6], [109, 2], [104, -2]],
  [[131, -1], [141, -3], [150, -7], [143, -9], [135, -4]],
  // Australia, New Zealand
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [151, -34], [145, -38], [138, -35], [131, -31], [124, -33], [116, -35], [114, -27]],
  [[172, -35], [178, -38], [174, -41], [170, -46], [167, -46], [173, -40]],
];

const inside = (x: number, y: number, poly: number[][]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

let dotCache: Float32Array | null = null;
/** Land as an even dot grid: [lon, lat, lon, lat, …] in degrees, built once. */
const landDots = () => {
  if (dotCache) return dotCache;
  const out: number[] = [];
  for (let lat = -56; lat <= 82; lat += 2) {
    const step = 2 / Math.max(0.2, Math.cos(lat * D));
    for (let lon = -180; lon < 180; lon += step) if (LAND.some((p) => inside(lon, lat, p))) out.push(lon, lat);
  }
  return (dotCache = new Float32Array(out));
};

function initGlobe(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-globe-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const regions: Region[] = JSON.parse(root.dataset.regions ?? '[]');
  if (!regions.length) return;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-globe-tab]')];
  const screens = [...root.querySelectorAll<HTMLElement>('[data-globe-screen]')];
  const nows = [...root.querySelectorAll<HTMLElement>('[data-globe-now]')];
  const messages = [...root.querySelectorAll<HTMLElement>('[data-globe-message]')];
  const phone = root.querySelector<HTMLElement>('[data-globe-phone]');
  const status = root.querySelector<HTMLElement>('[data-globe-status]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-globe-toggle]');
  const dots = landDots();

  // View state: the point of the globe at the centre of the view (degrees), and where it's heading.
  let index = 0;
  let tilt = 40;
  let lon = regions[0].lon;
  let lat = regions[0].lat - tilt;
  let tLon = lon;
  let tLat = lat;
  let vLon = 0;
  let vLat = 0;
  let raf = 0;
  let inView = false;
  let userPaused = reduced();

  // Geometry, in CSS pixels: the sphere's centre sits far below the canvas, so only its cap shows.
  let W = 0;
  let H = 0;
  let R = 0;
  let cx = 0;
  let cy = 0;
  let cutY = 0;
  let rimA = 0;
  let markerY = 0;

  const layout = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // A round planet: nearly its whole upper half shows, about three quarters of the screen wide.
    const top = H * 0.1;
    cutY = H * 0.82;
    const capH = cutY - top;
    const halfWidth = Math.min(W * 0.36, 640);
    R = Math.max(capH, (halfWidth ** 2 + capH ** 2) / (2 * capH));
    cx = W / 2;
    cy = top + R;
    rimA = Math.sqrt(Math.max(0, R ** 2 - (cy - cutY) ** 2));
    // The marker (where the selected region sits) is low on the planet, just clear of the phone above it.
    markerY = top + capH * 0.76;
    tilt = Math.asin(Math.min(0.97, (cy - markerY) / R)) / D;
    tLat = regions[index].lat - tilt;
    if (!raf) lat = tLat;
  };

  const project = (pLon: number, pLat: number) => {
    const l = (pLon - lon) * D;
    const p = pLat * D;
    const c = lat * D;
    const cosP = Math.cos(p);
    const x = cosP * Math.sin(l);
    const y = Math.cos(c) * Math.sin(p) - Math.sin(c) * cosP * Math.cos(l);
    const z = Math.sin(c) * Math.sin(p) + Math.cos(c) * cosP * Math.cos(l);
    return [cx + R * x, cy - R * y, z];
  };

  const nearest = () => {
    let best = 0;
    regions.forEach((r, i) => {
      if (Math.abs(wrap(r.lon - lon)) < Math.abs(wrap(regions[best].lon - lon))) best = i;
    });
    return best;
  };

  /* ---------- Drawing ---------- */
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const rimB = rimA * 0.085;

    // A soft halo of atmosphere around the planet, behind everything else, fading out towards
    // the cut so it never ends in a hard line.
    const halo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.25);
    halo.addColorStop(0, 'rgba(207, 237, 248, 0.35)');
    halo.addColorStop(0.35, 'rgba(207, 237, 248, 0.12)');
    halo.addColorStop(1, 'rgba(207, 237, 248, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    const fade = ctx.createLinearGradient(0, cutY - H * 0.25, 0, cutY);
    fade.addColorStop(0, 'rgba(0, 0, 0, 1)');
    fade.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    // The cross-section: a layered slab under the rim, as if the globe were cut through.
    const depth = H - cutY;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cutY, rimA, rimB, 0, 0, Math.PI);
    ctx.lineTo(cx - rimA, cutY);
    ctx.ellipse(cx, cutY + depth, rimA * 0.96, rimB, 0, Math.PI, 0, true);
    ctx.closePath();
    const slab = ctx.createLinearGradient(0, cutY, 0, H);
    slab.addColorStop(0, '#7892ab');
    slab.addColorStop(0.55, '#294368');
    slab.addColorStop(1, 'rgba(6, 20, 43, 0)');
    ctx.fillStyle = slab;
    ctx.fill();
    ctx.clip();
    // The core, glowing through the cut.
    const core = ctx.createRadialGradient(cx, cutY + depth * 0.25, 0, cx, cutY + depth * 0.25, rimA * 0.55);
    core.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    core.addColorStop(0.4, 'rgba(207, 237, 248, 0.2)');
    core.addColorStop(1, 'rgba(207, 237, 248, 0)');
    ctx.fillStyle = core;
    ctx.fillRect(cx - rimA, cutY, rimA * 2, depth + rimB);
    for (let k = 1; k <= 6; k++) {
      ctx.beginPath();
      ctx.ellipse(cx, cutY + (depth * k) / 7, rimA * (1 - k * 0.006), rimB, 0, 0, Math.PI);
      ctx.strokeStyle = `rgba(207, 237, 248, ${0.45 - k * 0.06})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // The cap: clipped to the sphere and to the front edge of the cut.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, cutY);
    ctx.lineTo(cx + rimA, cutY);
    ctx.ellipse(cx, cutY, rimA, rimB, 0, 0, Math.PI);
    ctx.lineTo(0, cutY);
    ctx.closePath();
    ctx.clip();

    const sheen = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.85, 0, cx, cy - R * 0.4, R * 1.05);
    sheen.addColorStop(0, '#e9fafd');
    sheen.addColorStop(0.35, '#cfedf8');
    sheen.addColorStop(0.75, '#7892ab');
    sheen.addColorStop(1, '#294368');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, W, H);
    // Light catching the upper left of the planet.
    const shine = ctx.createRadialGradient(cx - R * 0.45, cy - R * 0.8, 0, cx - R * 0.45, cy - R * 0.8, R * 0.7);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, W, H);

    // Graticule.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    const line = (pts: number[][]) => {
      ctx.beginPath();
      let pen = false;
      for (const [a, b] of pts) {
        const [x, y, z] = project(a, b);
        if (z <= 0) {
          pen = false;
          continue;
        }
        if (pen) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        pen = true;
      }
      ctx.stroke();
    };
    for (let m = -180; m < 180; m += 30) line(Array.from({ length: 46 }, (_, i) => [m, -90 + i * 4]));
    for (let p = -60; p <= 60; p += 30) line(Array.from({ length: 91 }, (_, i) => [-180 + i * 4, p]));

    // Land dots, stronger towards the viewer, batched into three tones.
    const bins: [string, number][] = [
      ['rgba(255, 255, 255, 0.5)', 1.3],
      ['rgba(255, 255, 255, 0.8)', 1.7],
      ['rgba(255, 255, 255, 1)', 2],
    ];
    bins.forEach(([fill, size], bin) => {
      ctx.beginPath();
      for (let i = 0; i < dots.length; i += 2) {
        const [x, y, z] = project(dots[i], dots[i + 1]);
        if (z <= 0.02 || y > cutY + 4) continue;
        if (Math.min(2, Math.floor(z * 3)) !== bin) continue;
        ctx.moveTo(x + size, y);
        ctx.arc(x, y, size, 0, Math.PI * 2);
      }
      ctx.fillStyle = fill;
      ctx.fill();
    });

    // Region markers and names; the selected one strongest, with a ring.
    const active = nearest();
    ctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    regions.forEach((r, i) => {
      const [x, y, z] = project(r.lon, r.lat);
      if (z <= 0.05) return;
      const on = i === active;
      ctx.beginPath();
      ctx.arc(x, y, on ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#ffffff' : `rgba(255, 255, 255, ${0.5 + z * 0.4})`;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = on ? 18 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      if (on) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.fillStyle = on ? '#ffffff' : `rgba(255, 255, 255, ${0.45 + z * 0.4})`;
      ctx.fillText(r.label.toUpperCase(), x + 20, y);
    });
    ctx.restore();

    // Atmosphere along the cap's edge, and the lit front edge of the cut.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, cutY);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(207, 237, 248, 0.75)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(207, 237, 248, 0.8)';
    ctx.shadowBlur = 36;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cutY, rimA, rimB, 0, 0, Math.PI);
    ctx.strokeStyle = 'rgba(207, 237, 248, 0.95)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(207, 237, 248, 0.8)';
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.restore();

    // The beam from the marker up towards the phone.
    const beam = ctx.createLinearGradient(0, markerY, 0, 0);
    beam.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    beam.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = beam;
    ctx.fillRect(cx - 1, 0, 2, markerY);
  };

  /* ---------- Motion ---------- */
  const loop = () => {
    raf = 0;
    vLon = vLon * 0.74 + (tLon - lon) * 0.08;
    vLat = vLat * 0.74 + (tLat - lat) * 0.08;
    lon += vLon;
    lat += vLat;
    if (Math.abs(tLon - lon) < 0.02 && Math.abs(tLat - lat) < 0.02 && Math.abs(vLon) < 0.02 && Math.abs(vLat) < 0.02) {
      lon = tLon;
      lat = tLat;
      draw();
      return;
    }
    draw();
    raf = requestAnimationFrame(loop);
  };
  const run = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  /* ---------- The phone and the labels ---------- */
  const syncVideo = () => {
    screens.forEach((s, i) => {
      const v = s.querySelector<HTMLVideoElement>('video');
      if (!v) return;
      if (i === index && inView && !userPaused && !root.closest('.is-media-held')) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play().catch(() => {});
      } else v.pause();
    });
    const hasVideo = !!screens[index]?.querySelector('video');
    phone?.classList.toggle('has-no-video', !hasVideo);
    phone?.classList.toggle('is-paused', userPaused);
    toggle?.setAttribute('aria-label', userPaused ? 'Play video' : 'Pause video');
  };

  let notifySecondReel = () => {}; // set with the notifications, below
  const showRegion = (i: number) => {
    // "Explore Our Work" leads to this region's own campaign, where it has one.
    const campaign = screens[i]?.dataset.work;
    root.querySelector('[data-globe-notice-work]')?.setAttribute('href', campaign ? `/work?spotlight=${campaign}` : '/work');
    const from = index;
    index = i;
    if (i === 1) notifySecondReel();
    tabs.forEach((t, n) => {
      t.setAttribute('aria-selected', String(n === i));
      t.tabIndex = n === i ? 0 : -1;
    });
    phone?.setAttribute('aria-labelledby', tabs[i]?.id ?? '');
    // On phones the tabs are a sideways row: keep the selected one in view.
    const row = tabs[i]?.parentElement;
    if (row && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: tabs[i].offsetLeft - (row.clientWidth - tabs[i].offsetWidth) / 2, behavior: reduced() ? 'auto' : 'smooth' });
    }
    screens.forEach((s, n) => {
      s.classList.toggle('is-active', n === i);
      s.classList.toggle('is-before', n === from && n !== i);
      s.setAttribute('aria-hidden', String(n !== i));
    });
    nows.forEach((n, k) => n.classList.toggle('is-active', k === i));
    // Fewer messages than regions: they take turns, so each step brings a new one.
    messages.forEach((m, k) => {
      const on = k === i % messages.length;
      m.classList.toggle('is-active', on);
      if (on) m.removeAttribute('aria-hidden');
      else m.setAttribute('aria-hidden', 'true');
    });
    if (status) status.textContent = `${regions[i].label} selected`;
    syncVideo();
  };

  /** Turn the globe to region i (the shortest way round) and show it in the phone. */
  const select = (i: number) => {
    i = Math.min(regions.length - 1, Math.max(0, i));
    tLon = lon + wrap(regions[i].lon - lon);
    tLat = regions[i].lat - tilt;
    if (i !== index) showRegion(i);
    if (reduced()) {
      lon = tLon;
      lat = tLat;
      draw();
      return;
    }
    run();
  };

  /* ---------- Drag and swipe ---------- */
  let dragging = false;
  let lastX = 0;
  let startLon = 0;
  let startIndex = 0;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    startLon = lon;
    startIndex = index;
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.add('is-dragging');
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer is already gone */
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lon -= (dx / R) * (180 / Math.PI) * 1.4;
    tLon = lon;
    lastX = e.clientX;
    draw();
  });
  // A deliberate swipe always moves on: to the region nearest the view, or at least the next one
  // in the direction of the swipe (regions can be far apart). The spring carries it the rest of the way.
  const release = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    const moved = lon - startLon;
    let target = nearest();
    if (target === startIndex && Math.abs(moved) > 12) target = (startIndex + Math.sign(moved) + regions.length) % regions.length;
    select(target);
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  /* ---------- Tabs ---------- */
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  root.querySelector('[data-globe-tabs]')?.addEventListener('keydown', (e) => {
    const ev = e as KeyboardEvent;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
    let i: number | null = step !== undefined ? (index + step + regions.length) % regions.length : null;
    if (ev.key === 'Home') i = 0;
    if (ev.key === 'End') i = regions.length - 1;
    if (i === null) return;
    ev.preventDefault();
    select(i);
    tabs[i]?.focus();
  });

  toggle?.addEventListener('click', () => {
    userPaused = !userPaused;
    syncVideo();
  });

  /* ---------- Scroll: one region per step while the stage is pinned ---------- */
  let scrollIndex = 0;
  const onScroll = () => {
    const rect = root.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    if (travel <= 0) return;
    const progress = Math.min(0.999, Math.max(0, -rect.top / travel));
    const i = Math.floor(progress * regions.length);
    if (i !== scrollIndex) {
      scrollIndex = i;
      select(i);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- The notifications: each once ---------- */
  // Arrived means in view and, on the homepage, with the Social card fully open (home-portals.ts).
  // The first comes on arrival and stays a few seconds, or until the visitor takes hold of the globe;
  // the second replaces it at the second reel.
  const notice = root.querySelector<HTMLElement>('[data-globe-notice]');
  const workNotice = root.querySelector<HTMLElement>('[data-globe-notice-work]');
  const portalPage = root.closest<HTMLElement>('[data-chapter]');
  const arrived = () => inView && !(portalPage && !portalPage.closest('.portals:not(.is-live)') && !portalPage.classList.contains('is-open'));
  let noticeTimer = 0;
  let noticed = false;
  let workNoticed = false;
  const hideNotice = () => {
    window.clearTimeout(noticeTimer);
    notice?.classList.remove('is-shown');
    workNotice?.classList.remove('is-shown');
  };
  const drop = (el: HTMLElement, delay: number) => {
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      el.classList.add('is-shown');
      noticeTimer = window.setTimeout(hideNotice, 7000);
    }, delay);
  };
  const maybeNotify = () => {
    if (noticed || !notice || !arrived()) return;
    noticed = true;
    drop(notice, 500);
  };
  notifySecondReel = () => {
    if (workNoticed || !workNotice || !arrived()) return;
    workNoticed = true;
    noticed = true;
    const wasShowing = !!notice?.classList.contains('is-shown');
    hideNotice();
    drop(workNotice, wasShowing ? 450 : 150);
  };
  canvas.addEventListener('pointerdown', () => notice?.classList.remove('is-shown'));

  /* ---------- No header while the stage is pinned ---------- */
  // The logo stripe runs along the top of the screen, where the header would cover it (desktop with
  // motion, where the stripe shows). It returns as the stage leaves, or the Social card closes.
  const withStripe = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  const updateHeader = () => {
    const rect = root.getBoundingClientRect();
    const open = !portalPage || portalPage.classList.contains('is-open');
    document.documentElement.classList.toggle('is-on-globe', withStripe.matches && open && rect.top <= 1 && rect.bottom >= window.innerHeight);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader, { passive: true });
  if (portalPage) {
    new MutationObserver(() => {
      maybeNotify();
      updateHeader();
    }).observe(portalPage, { attributes: true, attributeFilter: ['class'] });
  }
  updateHeader();

  new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    syncVideo();
    maybeNotify();
  }, { threshold: 0.2 }).observe(root);
  // On the homepage it waits, behind the Social card, until the card has opened (home-portals.ts).
  root.closest('[data-media-hold]')?.addEventListener('media:hold', syncVideo);
  new ResizeObserver(() => {
    layout();
    draw();
  }).observe(canvas);

  layout();
  showRegion(0);
  draw();
  onScroll();
}

export function initCreatorGlobes() {
  document.querySelectorAll<HTMLElement>('[data-creator-globe]').forEach((root) => {
    if (root.dataset.globeReady) return;
    root.dataset.globeReady = 'true';
    initGlobe(root);
  });
}
