/* Shared behaviour for every page. Each block is wrapped in an IIFE and guarded
   by element presence, so a page runs only the features it actually has. */

// Scroll reveal — index/ch fade siblings in with a stagger (.visible);
// coaching reveals each element once with a bottom rootMargin (.in-view).
(() => {
  const els = document.querySelectorAll(".js-reveal");
  if (!els.length) return;

  if (document.body.classList.contains("page-coaching")) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = entry.target.parentElement.querySelectorAll(
          ".js-reveal:not(.visible)",
        );
        siblings.forEach((el, idx) =>
          setTimeout(() => el.classList.add("visible"), idx * 100),
        );
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );
  els.forEach((el) => observer.observe(el));
})();

// Carousel — 4 slides, 3.5s auto-advance, manual control pauses for 8s.
(() => {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-slide");
  const dots = carousel.querySelectorAll(".carousel-dot");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  let current = 0;
  let autoTimer;
  let pauseTimer;

  function goTo(idx) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }
  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 3500);
  }
  function pauseThenResume() {
    clearInterval(autoTimer);
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(startAuto, 8000);
  }

  prevBtn.addEventListener("click", () => {
    goTo(current - 1);
    pauseThenResume();
  });
  nextBtn.addEventListener("click", () => {
    goTo(current + 1);
    pauseThenResume();
  });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(parseInt(dot.dataset.idx, 10));
      pauseThenResume();
    });
  });
  startAuto();
})();

// Nav chrome (index/ch) — tint the fixed nav to match the section under it.
(() => {
  const nav = document.querySelector("nav");
  const sections = document.querySelectorAll("[data-bg]");
  if (!nav || !sections.length) return;

  function updateChrome() {
    let currentBg = "red";
    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 40 && rect.bottom > 40) currentBg = sec.dataset.bg;
    });
    nav.classList.remove("on-red", "on-light", "on-dark");
    if (currentBg === "red") nav.classList.add("on-red");
    else if (currentBg === "dark") nav.classList.add("on-dark");
    else nav.classList.add("on-light");
  }
  window.addEventListener("scroll", updateChrome, { passive: true });
  window.addEventListener("resize", updateChrome);
  updateChrome();
})();

// Floating contacts + WeChat popover (index/ch).
(() => {
  const floating = document.getElementById("floatingContacts");
  if (floating) setTimeout(() => floating.classList.add("visible"), 2800);

  const fcWechat = document.getElementById("fcWechat");
  if (!fcWechat) return;
  fcWechat.addEventListener("click", (e) => {
    e.stopPropagation();
    fcWechat.classList.toggle("active");
  });
  document.addEventListener("click", () => fcWechat.classList.remove("active"));
})();

// Nav scrolled state (coaching) — solid bar after half a viewport.
(() => {
  const topNav = document.getElementById("topNav");
  if (!topNav) return;
  function updateNav() {
    topNav.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.5);
  }
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();
})();

// Mobile drawer (index/coaching).
(() => {
  const mobileDrawer = document.getElementById("mobileDrawer");
  if (!mobileDrawer) return;
  const navMenuBtn = document.getElementById("navMenuBtn");
  const mdClose = document.getElementById("mdClose");

  const open = () => {
    mobileDrawer.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    mobileDrawer.classList.remove("open");
    document.body.style.overflow = "";
  };

  if (navMenuBtn) navMenuBtn.addEventListener("click", open);
  if (mdClose) mdClose.addEventListener("click", close);
  document
    .querySelectorAll(".md-nav-item, .mobile-drawer .md-link")
    .forEach((link) => link.addEventListener("click", close));
})();

// Contact / coaching forms — AJAX submit to Formspree, localized status text.
(() => {
  const status = document.getElementById("formStatus");
  if (!status) return;

  const zh = (document.documentElement.lang || "en").toLowerCase().startsWith("zh");
  const T = zh
    ? {
        pick: "请至少选择一项您希望获得的帮助。",
        pickFocus: "请至少选择三项您希望改进的方面。",
        rate: "请在五个方面都为自己打分。",
        sending: "正在发送…",
        success: "感谢——我已收到您的信息，将在 48 小时内与您联系。",
        error: "发送失败。请直接邮件联系：communications@zhenaixiao.com",
        network: "网络错误。请直接邮件联系：communications@zhenaixiao.com",
      }
    : {
        pick: "Please select at least one option for what you're looking for.",
        pickFocus: "Please choose at least three things you'd like to work on.",
        rate: "Please rate yourself on all five.",
        sending: "Sending…",
        success: "Thanks — message received. I'll be in touch within 48 hours.",
        error:
          "Something went wrong. Please email me directly at communications@zhenaixiao.com.",
        network:
          "Network error. Please email me directly at communications@zhenaixiao.com.",
      };

  async function submit(form, validate) {
    if (validate) {
      const error = validate(form);
      if (error) {
        status.textContent = error;
        status.className = "form-status error";
        return;
      }
    }

    status.textContent = T.sending;
    status.className = "form-status";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        status.textContent = form.dataset.success || T.success;
        status.className = "form-status success";
      } else {
        let msg = T.error;
        if (!zh) {
          const json = await res.json().catch(() => ({}));
          msg = json.error || T.error;
        }
        status.textContent = msg;
        status.className = "form-status error";
      }
    } catch (err) {
      status.textContent = T.network;
      status.className = "form-status error";
    }
  }

  const countChecked = (form, name) =>
    form.querySelectorAll(`input[name="${name}"]:checked`).length;

  const contactForm = document.getElementById("contactForm");
  if (contactForm)
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submit(contactForm, (f) => (countChecked(f, "help[]") > 0 ? null : T.pick));
    });

  const coachForm = document.getElementById("coachForm");
  if (coachForm)
    coachForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submit(coachForm, (f) => (countChecked(f, "focus[]") >= 3 ? null : T.pickFocus));
    });

  const RATE_GROUPS = [
    "rate_confidence",
    "rate_clarity",
    "rate_presence",
    "rate_image",
    "rate_online",
  ];
  const auditForm = document.getElementById("auditForm");
  if (auditForm)
    auditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submit(auditForm, (f) =>
        RATE_GROUPS.every((g) => f.querySelector(`input[name="${g}"]:checked`))
          ? null
          : T.rate,
      );
    });
})();
