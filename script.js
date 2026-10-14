// ===== Efek cahaya & kursor mengikuti mouse =====
const root = document.documentElement;
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener("mousemove", (e) => {
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
document.querySelectorAll("a, .chips li, .theme-toggle").forEach((el) => {
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

// ===== Ombak: dipicu tombol kecil di bawah, berjalan 10 detik lalu kembali normal =====
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
  }

  btn.addEventListener("click", () => {
    if (tide.classList.contains("run")) return;
    btn.disabled = true;
    btn.classList.add("busy");
    tide.classList.add("run");
    timer = setTimeout(finish, 10400); // cadangan bila animationend tidak terpanggil
  });

  sheet.addEventListener("animationend", (e) => {
    if (e.animationName === "tide-rise") finish();
  });
})();
