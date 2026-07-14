const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const slides = [...document.querySelectorAll(".slide")];
const dotsWrap = document.querySelector("[data-dots]");
const dialog = document.querySelector("[data-dialog]");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogBody = document.querySelector("[data-dialog-body]");
const dialogMeta = document.querySelector("[data-dialog-meta]");
const dialogKicker = document.querySelector("[data-dialog-kicker]");
const dialogLink = document.querySelector("[data-dialog-link]");
const closeDialog = document.querySelector("[data-close]");

let currentSlide = 0;

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
});

menuButton.addEventListener("click", () => {
  mobilePanel.classList.toggle("is-open");
});

mobilePanel.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => mobilePanel.classList.remove("is-open"));
});

slides.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `切換到第 ${index + 1} 張首圖`);
  dot.addEventListener("click", () => setSlide(index));
  dotsWrap.appendChild(dot);
});

const dots = [...dotsWrap.querySelectorAll("button")];

function setSlide(index) {
  slides[currentSlide].classList.remove("is-active");
  dots[currentSlide].classList.remove("is-active");
  currentSlide = index;
  slides[currentSlide].classList.add("is-active");
  dots[currentSlide].classList.add("is-active");
}

setSlide(0);
setInterval(() => setSlide((currentSlide + 1) % slides.length), 6200);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

document.querySelectorAll("[data-detail]").forEach((node) => {
  node.addEventListener("click", () => openDetail(node.dataset.detail));
});

function openDetail(payload) {
  const [title = "內容詳情", body = "", meta = ""] = payload.split("|");
  const [kicker, cleanTitle] = title.includes("｜") ? title.split("｜") : ["DETAIL", title];
  dialogKicker.textContent = kicker;
  dialogTitle.textContent = cleanTitle;
  dialogBody.textContent = body;
  dialogMeta.textContent = meta;
  const match = meta.match(/https?:\/\/\S+/);
  if (match) {
    dialogLink.href = match[0];
    dialogLink.style.display = "inline-flex";
  } else {
    dialogLink.href = "#";
    dialogLink.style.display = "none";
  }
  if (typeof dialog.showModal === "function") dialog.showModal();
}

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) dialog.close();
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("click", () => item.classList.toggle("is-open"));
});

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("is-active", item === tab));
    document.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === target));
  });
});

const canvas = document.querySelector("[data-ink-flow]");
const ctx = canvas.getContext("2d");
const calligraphyStreams = [
  "因法而生以法為燈",
  "靜觀照見清明自在",
  "心若光明萬物生香",
  "道法自然上善若水",
  "覺而不迷照見本心",
  "在日常中修行"
];
const streams = [];
let width = 0;
let height = 0;
let lastTime = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeInkCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildInkStreams();
}

function buildInkStreams() {
  streams.length = 0;
  const count = Math.max(6, Math.floor(width / 180));
  for (let i = 0; i < count; i++) {
    const rightBias = i / Math.max(count - 1, 1);
    streams.push({
      text: calligraphyStreams[i % calligraphyStreams.length],
      x: width * (0.34 + rightBias * 0.62) + (Math.random() * 34 - 17),
      y: -Math.random() * height,
      speed: (reduceMotion ? 4 : 10) + Math.random() * (reduceMotion ? 4 : 12),
      size: 42 + Math.random() * 38,
      gap: 18 + Math.random() * 18,
      alpha: .2 + Math.random() * .18,
      blur: 4 + Math.random() * 10,
      sway: 8 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function drawInkFlow(time) {
  const delta = Math.min((time - lastTime) / 1000 || 0.016, 0.04);
  lastTime = time;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  streams.forEach((stream) => {
    const lineHeight = stream.size + stream.gap;
    const blockHeight = stream.text.length * lineHeight + height * .42;
    stream.y += stream.speed * delta;
    if (stream.y > lineHeight) stream.y -= blockHeight;

    const x = stream.x + Math.sin(time * 0.00032 + stream.phase) * stream.sway;
    ctx.font = `${stream.size}px "Noto Serif TC", "Songti TC", Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(255, 250, 242, .42)";
    ctx.shadowBlur = stream.blur;

    for (let repeat = -1; repeat < 3; repeat++) {
      const baseY = stream.y + repeat * blockHeight;
      for (let index = 0; index < stream.text.length; index++) {
        const y = baseY + index * lineHeight;
        if (y < -lineHeight || y > height + lineHeight) continue;
        const edgeFade = Math.min(1, Math.max(0, y / 160), Math.max(0, (height - y) / 180));
        const pulse = .82 + Math.sin(time * 0.0007 + index + stream.phase) * .18;
        ctx.fillStyle = `rgba(40, 37, 31, ${stream.alpha * edgeFade * pulse * .28})`;
        ctx.fillText(stream.text[index], x + 2, y + 2);
        ctx.fillStyle = `rgba(255, 250, 242, ${stream.alpha * edgeFade * pulse})`;
        ctx.fillText(stream.text[index], x, y);
      }
    }
  });

  ctx.restore();
  requestAnimationFrame(drawInkFlow);
}

resizeInkCanvas();
window.addEventListener("resize", resizeInkCanvas);

requestAnimationFrame(drawInkFlow);
