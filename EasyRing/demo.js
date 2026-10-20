// The landing page's demo: the wheel picks a format and the file card converts.
(() => {
  const stage = document.querySelector(".stage");
  if (!stage) return;
  const text = window.DEMO || { working: "Converting…", done: "Saved" };
  const SEGS = [
    ["JPG", "#FF4F7B"], ["PNG", "#FF8A3D"], ["WEBP", "#FFC23D"], ["HEIC", "#3EDC81"],
    ["PDF", "#2EC8F2"], ["DOCX", "#5B7CFF"], ["MP4", "#9A6BFF"], ["GIF", "#F05BE6"],
  ];
  const STEPS = [
    { name: "holiday", from: "HEIC", to: "JPG", size: "4.2 MB", out: "1.1 MB" },
    { name: "report", from: "PDF", to: "DOCX", size: "2.4 MB", out: "380 KB" },
    { name: "logo", from: "PNG", to: "WEBP", size: "860 KB", out: "210 KB" },
    { name: "clip", from: "MOV", to: "MP4", size: "120 MB", out: "18 MB" },
    { name: "scan", from: "JPG", to: "PDF", size: "3.1 MB", out: "640 KB" },
  ];

  // Draw the ring: 8 segments, labels, and a hub that names the pick.
  const svg = stage.querySelector(".wheel");
  const C = 200, R1 = 74, R2 = 172, GAP = 5, step = 360 / SEGS.length;
  const pt = (r, a) => `${(C + r * Math.cos((a * Math.PI) / 180)).toFixed(2)} ${(C + r * Math.sin((a * Math.PI) / 180)).toFixed(2)}`;
  const sector = (a0, a1) => {
    const p1 = ((GAP / 2 / R1) * 180) / Math.PI, p2 = ((GAP / 2 / R2) * 180) / Math.PI;
    return `M ${pt(R2, a0 + p2)} A ${R2} ${R2} 0 0 1 ${pt(R2, a1 - p2)} L ${pt(R1, a1 - p1)} A ${R1} ${R1} 0 0 0 ${pt(R1, a0 + p1)} Z`;
  };
  svg.innerHTML =
    `<circle cx="200" cy="200" r="190" class="guide"/>` +
    SEGS.map(([label, color], i) => {
      const mid = -90 + i * step, a0 = mid - step / 2, a1 = mid + step / 2;
      const [x, y] = pt(123, mid).split(" ");
      return `<g class="seg" data-i="${i}" style="--c:${color}">
        <path d="${sector(a0, a1)}"/>
        <text x="${x}" y="${(+y + 6).toFixed(2)}" text-anchor="middle">${label}</text>
      </g>`;
    }).join("") +
    `<circle cx="200" cy="200" r="62" class="hub"/><text x="200" y="208" text-anchor="middle" class="hub-label"></text>`;
  const segs = [...svg.querySelectorAll(".seg")];
  const hub = svg.querySelector(".hub-label");

  const card = stage.querySelector(".file");
  const $ = (sel) => card.querySelector(sel);
  const show = (s, ext, size, color) => {
    $(".ext").textContent = ext;
    $(".file-icon").style.setProperty("--c", color);
    $(".fname").textContent = `${s.name}.${ext.toLowerCase()}`;
    $(".fsize").textContent = size;
  };
  const colorOf = (ext) => (SEGS.find(([l]) => l === ext) || [, "#8b8b9a"])[1];
  const shift = stage.querySelector('kbd[data-key="shift"]');
  const hold = (on) => shift && shift.classList.toggle("on", on);
  const pick = (i) => {
    segs.forEach((g, k) => g.classList.toggle("on", k === i));
    hub.textContent = i < 0 ? "" : SEGS[i][0];
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let n = 0;
  const later = (ms, fn) => setTimeout(fn, ms);
  function cycle() {
    const s = STEPS[n++ % STEPS.length];
    const target = SEGS.findIndex(([l]) => l === s.to);
    card.className = "file";
    $(".fstate").textContent = "";
    show(s, s.from, s.size, colorOf(s.from));
    pick(-1);
    hold(false);
    // Every demo conversion uses the Convert wheel, opened by holding Shift.
    later(300, () => hold(true));
    later(700, () => pick(target));
    later(1500, () => {
      card.classList.add("working");
      $(".fstate").textContent = text.working;
    });
    later(2500, () => {
      card.classList.remove("working");
      card.classList.add("done");
      hold(false);
      show(s, s.to, s.out, SEGS[target][1]);
      $(".fstate").textContent = `✓ ${text.done}`;
    });
    later(4200, cycle);
  }
  if (reduce) {
    const s = STEPS[0], target = SEGS.findIndex(([l]) => l === s.to);
    show(s, s.to, s.out, SEGS[target][1]);
    pick(target);
    card.classList.add("done");
    $(".fstate").textContent = `✓ ${text.done}`;
  } else {
    cycle();
  }
})();
