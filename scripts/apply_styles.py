import os

# 1. Update editorial-redesign.css
p1 = r"D:\Site.rosseti\src\editorial-redesign.css"
with open(p1, "r", encoding="utf-8") as f:
    c1 = f.read()

# Replace grayscale with cinematic contrast/rendering
c1 = c1.replace(
    ".pf-v2 .pf-hero-photo img { filter:grayscale(1) contrast(1.6) brightness(.9); object-position:52% 33%; }",
    ".pf-v2 .pf-hero-photo img { filter:contrast(1.08) brightness(1.02); object-position:52% 33%; }"
)
c1 = c1.replace(
    ".pf-v2 .pf-reel-card img { filter:grayscale(1) contrast(1.35); }",
    ".pf-v2 .pf-reel-card img { filter:contrast(1.04) brightness(1.02); }"
)
c1 = c1.replace(
    ".pf-v2 .pf-sport-image img { filter:grayscale(1) contrast(1.4); }",
    ".pf-v2 .pf-sport-image img { filter:contrast(1.04) brightness(1.02); }"
)
c1 = c1.replace(
    ".pf-v2 .pf-hero-photo img { filter:grayscale(1) contrast(1.35) brightness(1.18); opacity:.91; object-position:50% 42%; }",
    ".pf-v2 .pf-hero-photo img { filter:contrast(1.06) brightness(1.02); opacity:.95; object-position:50% 42%; }"
)

with open(p1, "w", encoding="utf-8") as f:
    f.write(c1)

print("Updated editorial-redesign.css!")

# 2. Update motion-design.css
p2 = r"D:\Site.rosseti\src\motion-design.css"
with open(p2, "r", encoding="utf-8") as f:
    c2 = f.read()

c2 = c2.replace(
"""/* Neymar-inspired chapter navigation: a few real monochrome images and interactive stories. */
.pf-v2 .pf-reel-card img,
.pf-v2 .pf-sport-image img,
.pf-v2 .pf-obi-paper img,
.pf-v2 .pf-modal-image,
.pf-v2 .pf-video video {
  filter: grayscale(1) contrast(1.23);
}
.pf-v2 .pf-reel-card:hover img,
.pf-v2 .pf-sport-image:hover img { filter: grayscale(1) contrast(1.4) brightness(1.12); }""",
"""/* Unified Design System: rich cinematic fidelity with subtle anamorphic contrast. */
.pf-v2 .pf-reel-card img,
.pf-v2 .pf-sport-image img,
.pf-v2 .pf-obi-paper img,
.pf-v2 .pf-modal-image,
.pf-v2 .pf-video video {
  filter: contrast(1.04) brightness(1.01);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
}
.pf-v2 .pf-reel-card:hover img,
.pf-v2 .pf-sport-image:hover img {
  filter: contrast(1.08) brightness(1.04);
  transform: scale(1.035);
}"""
)

# Append Telemetry and Unified Design Tokens
telemetry_css = """

/* =========================================================================
   UNIFIED DESIGN SYSTEM TOKENS & TELEMETRY HUD (Lando Norris + Igloo + Rossetti)
   ========================================================================= */
:root {
  --color--lime: #d2ff00;
  --color--lime-off: #b2c73a;
  --color--obsidian: #090a0c;
  --color--surface: #121417;
  --color--surface-elevated: #1a1d22;
  --color--teal-deep: #063c39;
  --color--teal-accent: #29645c;
  --color--bronze: #cda05e;
  --color--ice-blue: #b5d5ff;
  --color--terracotta: #d7432c;
  --color--white: #eae9e2;
  --color--dark-green: #282c20;
  --font--telemetry: 'IBM Plex Mono', ui-monospace, monospace;
}

.pf-telemetry-hud {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px 24px;
  background: rgba(9, 10, 12, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-block: 1px solid rgba(210, 255, 0, 0.25);
  padding: 14px 4vw;
  color: #e9e7e1;
  font-family: var(--font--telemetry);
  font-size: 11px;
  letter-spacing: 0.12em;
  z-index: 8;
  position: relative;
}

.pf-telemetry-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pf-telemetry-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color--lime);
  box-shadow: 0 0 10px var(--color--lime);
  animation: pfPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pfPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.pf-telemetry-label {
  color: #8b909d;
  font-weight: 500;
}

.pf-telemetry-value {
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.14em;
}

.pf-telemetry-item:nth-child(1) .pf-telemetry-value { color: var(--color--lime); }
.pf-telemetry-item:nth-child(2) .pf-telemetry-value { color: var(--color--ice-blue); }
.pf-telemetry-item:nth-child(3) .pf-telemetry-value { color: var(--color--bronze); }
.pf-telemetry-item:nth-child(4) .pf-telemetry-value { color: #fff; }

@media (max-width: 768px) {
  .pf-telemetry-hud {
    justify-content: flex-start;
    padding: 12px 18px;
    gap: 10px 18px;
  }
}
"""

if "pf-telemetry-hud" not in c2:
    c2 += telemetry_css

with open(p2, "w", encoding="utf-8") as f:
    f.write(c2)

print("Updated motion-design.css with Telemetry HUD and cinematic styles!")
