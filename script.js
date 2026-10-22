// ===== Efek cahaya & kursor mengikuti mouse =====
const root = document.documentElement;
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener("pointermove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  document.body.classList.add("mouse-active");
  root.style.setProperty("--mx", mouseX + "px");
  root.style.setProperty("--my", mouseY + "px");
  dot.style.left = mouseX + "px";
  dot.style.top = mouseY + "px";
});

document.addEventListener("mouseleave", () => document.body.classList.remove("mouse-active"));

// Cincin kursor bergerak halus mengikuti mouse
function animateRing() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  ring.style.left = ringX + "px";
  ring.style.top = ringY + "px";
  requestAnimationFrame(animateRing);
}
animateRing();

// Membesar saat mouse di atas elemen yang bisa diklik
document.querySelectorAll("a, .chips li, .theme-toggle, .wave-btn, .hat-drag").forEach((el) => {
  el.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
  el.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
});

// ===== Animasi muncul saat di-scroll + bar keahlian =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll(".skill").forEach((skill) => {
        skill.querySelector(".bar i").style.width = skill.dataset.level + "%";
      });
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ===== Efek mengetik: muncul, terhapus, muncul lagi =====
(function typewriter() {
  const el = document.getElementById("typed");
  if (!el) return;
  const text = "Rekayasa Perangkat Lunak";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) { el.textContent = text; return; }

  let i = 0;
  let deleting = false;

  function tick() {
    el.textContent = text.slice(0, i);
    let delay = deleting ? 45 : 95;

    if (!deleting && i === text.length) {
      deleting = true;
      delay = 1600;          // jeda setelah selesai mengetik
    } else if (deleting && i === 0) {
      deleting = false;
      delay = 500;           // jeda sebelum mengetik lagi
    } else {
      i += deleting ? -1 : 1;
    }
    setTimeout(tick, delay);
  }
  el.textContent = "";
  tick();
})();

// ===== Menu aktif sesuai bagian yang sedang dilihat =====
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-link");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
      // Di HP: geser bilah menu supaya menu aktif terlihat
      const nav = document.querySelector(".nav");
      const active = nav && nav.querySelector(".active");
      if (active && nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2, behavior: "smooth" });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => navObserver.observe(s));

// ===== Tahun otomatis di footer =====
document.getElementById("year").textContent = new Date().getFullYear();


// ===== Tema terang / gelap =====
(function theme() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const html = document.documentElement;

  function apply(t) {
    html.setAttribute("data-theme", t);
    btn.setAttribute("aria-pressed", t === "dark");
    btn.setAttribute("title", t === "dark" ? "Pindah ke tema terang" : "Pindah ke tema gelap");
  }
  apply(html.getAttribute("data-theme") || "light");

  btn.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

// ===== Orbit: kartu & huruf bergeser halus mengikuti mouse =====
(function orbitParallax() {
  const orbit = document.querySelector(".orbit");
  if (!orbit || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = orbit.querySelectorAll("[data-depth]");

  window.addEventListener("mousemove", (e) => {
    const r = orbit.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    items.forEach((el) => {
      const d = parseFloat(el.dataset.depth);
      el.style.translate = (-dx * d).toFixed(1) + "px " + (-dy * d).toFixed(1) + "px";
    });
  });
})();

// ===== Ombak: dipicu tombol kecil di bawah, naik pelan, diam 10 detik menutupi layar, lalu surut =====
(function wave() {
  const btn = document.getElementById("waveBtn");
  const tide = document.getElementById("tide");
  if (!btn || !tide) return;
  const sheet = tide.querySelector(".tide-sheet");
  let timer;

  function finish() {
    clearTimeout(timer);
    tide.classList.remove("run");
    btn.disabled = false;
    btn.classList.remove("busy");
    tide.dispatchEvent(new Event("tideend"));
  }

  btn.addEventListener("click", () => {
    if (tide.classList.contains("run")) return;
    btn.disabled = true;
    btn.classList.add("busy");
    tide.classList.add("run");
    timer = setTimeout(finish, 20400); // cadangan bila animationend tidak terpanggil
  });

  sheet.addEventListener("animationend", (e) => {
    if (e.animationName === "tide-cycle") finish();
  });
})();

// ===== Topi di ombak: bisa ditarik ke mana saja, saat dilepas kembali ke tempat semula =====
(function hatDrag() {
  const hat = document.getElementById("hatDrag");
  const tide = document.getElementById("tide");
  if (!hat || !tide) return;
  const parent = hat.parentElement; // posisi asal topi (ikut ombak)

  let active = false, pid = null, raf = 0, tiltTimer;
  let grabX = 0, grabY = 0, lastX = 0, lastY = 0, prevX = 0, tilt = 0, w = 0, h = 0;

  // Topi menempel di kursor, bebas ke mana saja; posisi asal terus bergerak mengikuti ombak
  function place() {
    const p = parent.getBoundingClientRect();
    const left = Math.min(Math.max(lastX - grabX, -w * 0.6), document.documentElement.clientWidth - w * 0.4);
    const top = Math.min(Math.max(lastY - grabY, -h * 0.6), window.innerHeight - h * 0.4);
    hat.style.translate = (left - p.left) + "px " + (top - p.top) + "px";
  }
  function loop() {
    if (!active) return;
    place();
    raf = requestAnimationFrame(loop);
  }

  hat.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const r = hat.getBoundingClientRect();
    w = r.width; h = r.height;
    grabX = e.clientX - r.left; grabY = e.clientY - r.top;
    lastX = prevX = e.clientX; lastY = e.clientY;
    const cs = getComputedStyle(hat);
    hat.style.translate = cs.translate === "none" ? "0px 0px" : cs.translate; // bekukan posisi saat ini
    hat.style.rotate = cs.rotate === "none" ? "0deg" : cs.rotate;
    tilt = 0; active = true; pid = e.pointerId;
    hat.classList.add("dragging");
    try { hat.setPointerCapture(pid); } catch (_) {}
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  });

  hat.addEventListener("pointermove", (e) => {
    if (!active || e.pointerId !== pid) return;
    lastX = e.clientX; lastY = e.clientY;
    // Topi miring mengikuti arah tarikan
    const dx = e.clientX - prevX; prevX = e.clientX;
    tilt += (Math.max(-28, Math.min(28, dx * 1.6)) - tilt) * 0.25;
    hat.style.rotate = tilt + "deg";
    clearTimeout(tiltTimer);
    tiltTimer = setTimeout(() => { tilt = 0; hat.style.rotate = "0deg"; }, 90);
  });

  function release(e) {
    if (!active || (e && e.pointerId !== undefined && e.pointerId !== pid)) return;
    active = false;
    cancelAnimationFrame(raf);
    clearTimeout(tiltTimer);
    hat.classList.remove("dragging");
    hat.style.translate = "0px 0px"; // kembali ke tempat semula (pegas)
    hat.style.rotate = "0deg";
    try { hat.releasePointerCapture(pid); } catch (_) {}
  }
  hat.addEventListener("pointerup", release);
  hat.addEventListener("pointercancel", release);
  hat.addEventListener("lostpointercapture", release);
  hat.addEventListener("dragstart", (e) => e.preventDefault());

  // Ombak selesai: topi disetel ulang untuk ombak berikutnya
  tide.addEventListener("tideend", () => {
    active = false;
    cancelAnimationFrame(raf);
    hat.classList.remove("dragging");
    hat.style.translate = "";
    hat.style.rotate = "";
  });
})();
