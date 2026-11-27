(() => {
  const defaultVibe = {
    name: "FESTIVAL EVENT",
    color: "#ff5100"
  };

  function applyVibe(name = defaultVibe.name, color = defaultVibe.color) {
    if (typeof color !== "string" || !/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color)) {
      throw new TypeError("Vibe color must be a 3- or 6-digit hex color.");
    }

    const safeName = String(name).trim();
    if (!safeName) throw new TypeError("Vibe name cannot be empty.");
    const normalizedColor = color.length === 4
      ? `#${color.slice(1).split("").map(character => character + character).join("")}`
      : color;

    document.documentElement.style.setProperty("--vibe-color", normalizedColor);
    document.documentElement.style.setProperty("--red", normalizedColor);
    document.documentElement.style.setProperty("--pink", normalizedColor);
    document.getElementById("vibeName")?.replaceChildren(document.createTextNode(safeName));

    let theme = document.getElementById("vibe-theme-overrides");
    if (!theme) {
      theme = document.createElement("style");
      theme.id = "vibe-theme-overrides";
      document.head.append(theme);
    }
    theme.textContent = `
      .brand-icon,.live-dot:before,.eyebrow,.welcome h1 em,.welcome-orb,
      .side-title span,.mini-stat b,.text-btn,.loader-mark,.load-line i,
      .badge,.comment-content b,.post-profile-link:hover b,.comment-profile-link:hover b,
      .action.liked,.toast,.gate-stars,.feed-gate:before {
        color:${normalizedColor};
      }
      .live-dot:before {
        background-color:${normalizedColor};
        box-shadow:0 0 15px ${normalizedColor};
      }
      .loader-mark,.welcome-orb { background:transparent; box-shadow:none; }
      .brand-icon,.loader-mark,.welcome-orb { text-shadow:0 0 18px ${normalizedColor}; }
      .nav.active,.track-item.active,.react:hover,.comment-react:hover,
      .comment-react-count:hover { color:${normalizedColor}; border-color:${normalizedColor}88; }
      .nav.active,.track-item.active { background:${normalizedColor}20; }
      .admin-btn,.primary-btn,.player-controls .play-btn {
        background:linear-gradient(100deg,${normalizedColor},${normalizedColor}bb);
        box-shadow:0 0 22px ${normalizedColor}35;
      }
      .action.liked,.post-video-player,.video-play-toggle,.video-seek {
        border-color:${normalizedColor}88;
      }
      .post-video-player { box-shadow:0 0 16px ${normalizedColor}24; }
      .video-controls { background:linear-gradient(100deg,#07111d,${normalizedColor}18); }
      .video-play-toggle { border-color:${normalizedColor}; color:#e4f5ff; box-shadow:0 0 10px ${normalizedColor}77; }
      .video-seek { background:linear-gradient(90deg,${normalizedColor} 0 var(--progress,0%),#1b3145 var(--progress,0%) 100%); }
      .video-seek::-webkit-slider-thumb,.video-seek::-moz-range-thumb { background:${normalizedColor}; }
      .video-progress-star { text-shadow:0 0 5px #fff,0 0 10px ${normalizedColor},0 0 17px ${normalizedColor}; }
      .comment-react:hover,.comment-react-count:hover { background:${normalizedColor}20; }
      .stars { background-image:radial-gradient(${normalizedColor} 1px,transparent 1px); }
      body { background-image:radial-gradient(ellipse at 70% 0%,${normalizedColor}22 0%,transparent 38%); }
      .topbar { border-color:${normalizedColor}33; }
      .post-video-player .video-tool:hover { border-color:${normalizedColor}; }
    `;
  }

  window.applyVibe = applyVibe;
  applyVibe();
})();
