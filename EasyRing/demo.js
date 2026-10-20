// The landing page's demo: a key opens its wheel (Shift: Convert, Command:
// Tools, Control: Apps), the wheel picks an action and the card shows the result.
// It cycles through the three wheels; clicking a key jumps to that wheel.
(() => {
  const stage = document.querySelector(".stage");
  if (!stage) return;
  const text = window.DEMO || {};
  const word = (w) => (text.words && text.words[w]) || w;
  const COLORS = ["#FF4F7B", "#FF8A3D", "#FFC23D", "#3EDC81", "#2EC8F2", "#5B7CFF", "#9A6BFF", "#F05BE6"];
  const WHEELS = {
    shift: {
      items: ["JPG", "PNG", "WEBP", "HEIC", "PDF", "DOCX", "MP4", "GIF"],
      steps: [
        { name: "holiday", ext: "HEIC", pick: "JPG", size: "4.2 MB", out: "1.1 MB" },
        { name: "report", ext: "PDF", pick: "DOCX", size: "2.4 MB", out: "380 KB" },
        { name: "clip", ext: "MOV", pick: "MP4", size: "120 MB", out: "18 MB" },
      ],
    },
    command: {
      items: ["Compress", "Resize", "Crop", "Rotate", "Flip", "Metadata", "Zip", "Rename"],
      steps: [
        { name: "photo", ext: "JPG", pick: "Compress", size: "4.2 MB", out: "1.3 MB" },
        { name: "banner", ext: "PNG", pick: "Crop", size: "2400×1200", out: "1200×1200" },
        { name: "photos", ext: "ZIP", from: "JPG", pick: "Zip", size: "12 files", out: "8.4 MB" },
      ],
    },
    control: {
      items: ["Browser", "Music", "Messages", "Terminal", "Mail", "Photos", "Notes", "Files"],
      steps: [{ app: true, pick: "Music" }, { app: true, pick: "Terminal" }],
    },
  };
  const ORDER = ["shift", "command", "control"];

  // The ring: 8 segments with labels, and a hub that names the pick.
  const svg = stage.querySelector(".wheel");
  const C = 200, R1 = 74, R2 = 172, GAP = 5, step = 360 / 8;
  const pt = (r, a) => [C + r * Math.cos((a * Math.PI) / 180), C + r * Math.sin((a * Math.PI) / 180)];
  const xy = (r, a) => pt(r, a).map((v) => v.toFixed(2)).join(" ");
  const sector = (a0, a1) => {
    const p1 = ((GAP / 2 / R1) * 180) / Math.PI, p2 = ((GAP / 2 / R2) * 180) / Math.PI;
    return `M ${xy(R2, a0 + p2)} A ${R2} ${R2} 0 0 1 ${xy(R2, a1 - p2)} L ${xy(R1, a1 - p1)} A ${R1} ${R1} 0 0 0 ${xy(R1, a0 + p1)} Z`;
  };
  svg.innerHTML =
    `<circle cx="200" cy="200" r="190" class="guide"/>` +
    COLORS.map((color, i) => {
      const mid = -90 + i * step;
      const [x, y] = pt(123, mid);
      return `<g class="seg" style="--c:${color}">
        <path d="${sector(mid - step / 2, mid + step / 2)}"/>
        <text x="${x.toFixed(2)}" y="${(y + 5).toFixed(2)}" text-anchor="middle"></text>
      </g>`;
    }).join("") +
    `<circle cx="200" cy="200" r="62" class="hub"/><text x="200" y="207" text-anchor="middle" class="hub-label"></text>`;
  const segs = [...svg.querySelectorAll(".seg")];
  const hub = svg.querySelector(".hub-label");
  const keys = [...document.querySelectorAll(".key")];

  const card = stage.querySelector(".file");
  const $ = (sel) => card.querySelector(sel);
  const show = (name, ext, size, color) => {
    $(".ext").textContent = ext;
    $(".file-icon").style.setProperty("--c", color);
    $(".fname").textContent = name;
    $(".fsize").textContent = size;
  };

  let wheel = null;
  const open = (id) => {
    wheel = id;
    WHEELS[id].items.forEach((label, i) => {
      const t = segs[i].querySelector("text");
      t.textContent = word(label);
      t.style.fontSize = word(label).length > 6 ? "13px" : "15px";
    });
    keys.forEach((k) => k.classList.toggle("on", k.dataset.wheel === id));
  };
  const pick = (i) => {
    segs.forEach((g, k) => g.classList.toggle("on", k === i));
    hub.textContent = i < 0 ? "" : word(WHEELS[wheel].items[i]);
    hub.style.fontSize = i >= 0 && word(WHEELS[wheel].items[i]).length > 6 ? "17px" : "24px";
  };

  // One step: start state, pick, working, result.
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  function play(s) {
    const i = WHEELS[wheel].items.indexOf(s.pick);
    const color = COLORS[i];
    card.className = "file";
    $(".fstate").textContent = "";
    pick(-1);
    if (s.app) show(word(s.pick), "APP", "", color);
    else show(`${s.name}.${(s.from || s.ext).toLowerCase()}`, s.from || s.ext, s.size, "#8b8b9a");
    later(500, () => pick(i));
    later(1300, () => {
      card.classList.add("working");
      $(".fstate").textContent = s.app ? text.opening : wheel === "shift" ? text.converting : text.working;
    });
    later(2300, () => {
      card.classList.remove("working");
      card.classList.add("done");
      if (s.app) $(".fstate").textContent = `✓ ${text.opened}`;
      else {
        const ext = wheel === "shift" ? s.pick : s.ext;
        show(`${s.name}.${ext.toLowerCase()}`, ext, s.out, color);
        $(".fstate").textContent = `✓ ${text.done}`;
      }
    });
  }

  // Each wheel plays its steps, then hands over to the next key.
  function run(id, n = 0) {
    timers.forEach(clearTimeout);
    timers = [];
    if (wheel !== id) open(id);
    play(WHEELS[id].steps[n]);
    const next = n + 1 < WHEELS[id].steps.length ? [id, n + 1] : [ORDER[(ORDER.indexOf(id) + 1) % ORDER.length], 0];
    later(3800, () => run(...next));
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  keys.forEach((k) =>
    k.addEventListener("click", () => {
      if (reduce) {
        open(k.dataset.wheel);
        pick(0);
      } else run(k.dataset.wheel);
    }),
  );
  if (reduce) {
    open("shift");
    const s = WHEELS.shift.steps[0];
    pick(0);
    show(`${s.name}.jpg`, "JPG", s.out, COLORS[0]);
    card.classList.add("done");
    $(".fstate").textContent = `✓ ${text.done}`;
  } else {
    run("shift");
  }
})();
