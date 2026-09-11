/* ════════════════════════════════════════════════════════════════
   Spellcaster Animated Portfolio - JavaScript Controller
   GSAP ScrollTrigger + Canvas Frame Preloading & Rendering
   ════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════════════════
     CONFIG & CANVAS SETUP
  ══════════════════════════════════════════════════════ */
  const TOTAL = 240;
  const canvas  = document.getElementById("c");
  const ctx     = canvas.getContext("2d");

  function setCanvasSize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  setCanvasSize();
  window.addEventListener("resize", () => { 
    setCanvasSize(); 
    render(); 
  });

  /* ══════════════════════════════════════════════════════
     FRAME PATHS & PRELOADING
  ══════════════════════════════════════════════════════ */
  function frameSrc(i) {
    return "spellcaster_frames_compressed/frame_" + String(i + 1).padStart(6, "0") + ".jpg";
  }

  const images   = new Array(TOTAL);
  const imageSeq = { frame: 0 };

  const loaderEl = document.getElementById("loader");
  const fillEl   = document.getElementById("loader-fill");
  const pctEl    = document.getElementById("loader-pct");
  const hintEl   = document.getElementById("hint");

  let done = 0;

  for (let i = 0; i < TOTAL; i++) {
    const img = new Image();
    img.src = frameSrc(i);
    img.onload = img.onerror = () => {
      done++;
      const pct = Math.round((done / TOTAL) * 100);
      if (fillEl) fillEl.style.width = pct + "%";
      if (pctEl)  pctEl.textContent  = done + " / " + TOTAL;
      if (done === TOTAL) onAllLoaded();
    };
    images[i] = img;
  }

  /* ══════════════════════════════════════════════════════
     RENDER CANVAS (Cover mode)
  ══════════════════════════════════════════════════════ */
  function render() {
    const img = images[imageSeq.frame];
    if (!img) return;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const cw     = canvas.width,  ch = canvas.height;
    const ratio  = Math.max(cw / iw, ch / ih);
    const sx     = (cw - iw * ratio) / 2;
    const sy     = (ch - ih * ratio) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, iw, ih, sx, sy, iw * ratio, ih * ratio);
  }

  function onAllLoaded() {
    setTimeout(() => {
      if (loaderEl) loaderEl.classList.add("done");
      render();
      setTimeout(() => {
        if (hintEl) hintEl.classList.add("show");
      }, 600);
      setTimeout(initAnimation, 400);
    }, 300);
  }

  /* ══════════════════════════════════════════════════════
     GSAP SCROLLTRIGGER SYNC & NAV TRACKING
  ══════════════════════════════════════════════════════ */
  function initAnimation() {
    gsap.to(imageSeq, {
      frame: TOTAL - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        invalidateOnRefresh: true
      },
      onUpdate: render,
    });

    ScrollTrigger.refresh();
    render();

    let hintGone = false;
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;

      // Hide scroll hint on user scroll
      if (!hintGone && scrollY > 40) {
        if (hintEl) {
          hintEl.classList.remove("show");
          hintEl.classList.add("hide");
        }
        hintGone = true;
      }

      // Highlight active section link in Navbar
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        const id = sec.getAttribute("id");
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + id) {
              link.classList.add("active");
            }
          });
        }
      });
    }, { passive: true });
  }
});
