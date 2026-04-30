(function () {
  if (window.NWLVL_DESIGN_VERSION !== "v2") return;

  const body = document.body;
  if (!body) return;
  body.classList.add("design-v2");

  const lowPower =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.innerWidth < 980;
  const starCount = lowPower ? 160 : 320;

  const grid = document.createElement("div");
  grid.className = "v2-bg-grid";
  const starsCanvas = document.createElement("canvas");
  starsCanvas.className = "v2-bg-stars";
  const constCanvas = document.createElement("canvas");
  constCanvas.className = "v2-bg-constellations";
  const vignette = document.createElement("div");
  vignette.className = "v2-vignette";
  const grain = document.createElement("div");
  grain.className = "v2-grain";

  body.prepend(grain);
  body.prepend(vignette);
  body.prepend(constCanvas);
  body.prepend(starsCanvas);
  body.prepend(grid);

  const sctx = starsCanvas.getContext("2d");
  const cctx = constCanvas.getContext("2d");
  let w = 0;
  let h = 0;

  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.2,
    t: Math.random() * Math.PI * 2,
    tw: Math.random() * 0.024 + 0.008,
  }));

  const constellations = [
    {
      points: [{ x: 0.18, y: 0.16 }, { x: 0.22, y: 0.23 }, { x: 0.26, y: 0.3 }, { x: 0.2, y: 0.31 }],
      links: [[0, 1], [1, 2], [2, 3]],
    },
    {
      points: [{ x: 0.62, y: 0.14 }, { x: 0.68, y: 0.16 }, { x: 0.72, y: 0.21 }, { x: 0.76, y: 0.28 }],
      links: [[0, 1], [1, 2], [2, 3]],
    },
  ];

  function resize() {
    w = starsCanvas.width = constCanvas.width = window.innerWidth;
    h = starsCanvas.height = constCanvas.height = window.innerHeight;
  }

  function draw() {
    sctx.clearRect(0, 0, w, h);
    cctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.t += s.tw;
      const a = 0.28 + Math.sin(s.t) * 0.2;
      sctx.fillStyle = `rgba(225,240,255,${a})`;
      sctx.beginPath();
      sctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      sctx.fill();
    }

    for (const cst of constellations) {
      const nodes = cst.points.map((p) => ({ x: p.x * w, y: p.y * h }));
      for (const [a, b] of cst.links) {
        const p1 = nodes[a];
        const p2 = nodes[b];
        cctx.strokeStyle = "rgba(120,180,255,.24)";
        cctx.lineWidth = 0.85;
        cctx.beginPath();
        cctx.moveTo(p1.x, p1.y);
        cctx.lineTo(p2.x, p2.y);
        cctx.stroke();
      }
      for (const p of nodes) {
        cctx.fillStyle = "rgba(236,247,255,.88)";
        cctx.beginPath();
        cctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        cctx.fill();
      }
    }

    window.requestAnimationFrame(draw);
  }

  const revealTargets = document.querySelectorAll("h1, .hero, .blog-hero, .section, .sec, .timeline, .showcase");
  revealTargets.forEach((el) => el.classList.add("v2-reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("v2-in");
    });
  }, { threshold: 0.14 });
  revealTargets.forEach((el) => io.observe(el));

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    grid.style.transform = `translateY(${-y * 0.2}px)`;
    starsCanvas.style.transform = `translateY(${-y * 0.12}px)`;
    constCanvas.style.transform = `translateY(${-y * 0.06}px)`;
  }, { passive: true });

  window.addEventListener("resize", resize);
  resize();
  draw();
})();

