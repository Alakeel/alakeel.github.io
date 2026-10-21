// The landing page's demo: a link is pasted, EasyDownload recognises it, and
// the file downloads into the Library. Three examples take turns.
(() => {
  const screen = document.querySelector(".screen");
  if (!screen) return;
  const text = window.DEMO || {};
  const EXAMPLES = [
    { url: "https://cdn.example.com/videos/beach-sunset.mp4", name: "beach-sunset.mp4", ext: "MP4", size: "48 MB", tint: "#ffd7a8" },
    { url: "https://podcasts.example.org/ep12/interview.mp3", name: "interview.mp3", ext: "MP3", size: "32 MB", tint: "#c9f0ff" },
    { url: "https://files.example.net/2026/annual-report.pdf", name: "annual-report.pdf", ext: "PDF", size: "4.1 MB", tint: "#d6ff3a" },
  ];
  const $ = (sel) => screen.querySelector(sel);
  const field = $(".field"), url = $(".url"), hint = $(".hint"), cta = $(".cta");
  const job = $(".job"), thumb = $(".thumb"), jobName = $(".job-meta strong"), jobInfo = $(".job-meta span"), bar = $(".bar b");
  const toast = $(".toast"), toastText = $(".toast span");
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));

  function reset() {
    url.textContent = "";
    field.classList.remove("ok");
    hint.className = "hint";
    hint.textContent = text.hint;
    job.className = "job";
    toast.classList.remove("show");
    bar.style.setProperty("--p", "0%");
  }

  function play(e) {
    reset();
    // Type the link in.
    for (let i = 1; i <= e.url.length; i++) later(300 + i * 22, () => (url.textContent = e.url.slice(0, i)));
    const typed = 300 + e.url.length * 22;
    later(typed + 150, () => {
      field.classList.add("ok");
      hint.className = "hint ok";
      hint.textContent = `✓ ${text.found.replace("{host}", new URL(e.url).host)}`;
    });
    later(typed + 700, () => cta.classList.add("press"));
    later(typed + 850, () => {
      cta.classList.remove("press");
      thumb.textContent = e.ext;
      thumb.style.setProperty("--tint", e.tint);
      jobName.textContent = e.name;
      jobInfo.textContent = `${e.ext} · ${e.size}`;
      job.classList.add("show");
    });
    for (let p = 0; p <= 100; p += 10) {
      later(typed + 1000 + p * 18, () => {
        bar.style.setProperty("--p", `${p}%`);
        jobInfo.textContent = p < 100 ? `${e.ext} · ${p}% · 3.2 MB/s` : `${e.ext} · ${e.size}`;
      });
    }
    later(typed + 2900, () => {
      job.classList.add("done");
      toastText.textContent = text.ready.replace("{name}", e.name);
      toast.classList.add("show");
    });
  }

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const e = EXAMPLES[0];
    url.textContent = e.url;
    field.classList.add("ok");
    hint.className = "hint ok";
    hint.textContent = `✓ ${text.found.replace("{host}", new URL(e.url).host)}`;
    thumb.textContent = e.ext;
    jobName.textContent = e.name;
    jobInfo.textContent = `${e.ext} · ${e.size}`;
    bar.style.setProperty("--p", "100%");
    job.classList.add("show", "done");
    return;
  }
  let n = 0;
  const loop = () => {
    timers.forEach(clearTimeout);
    timers = [];
    play(EXAMPLES[n++ % EXAMPLES.length]);
    later(6500, loop);
  };
  loop();
})();
