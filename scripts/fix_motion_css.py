import re

# 1. Neutralize broken hero absolute positions and 20vw font-sizes in motion-design.css
path_motion = r"D:\Site.rosseti\src\motion-design.css"
with open(path_motion, "r", encoding="utf-8") as f:
    motion = f.read()

# Replace the initial hero block in motion-design.css
old_motion_hero = """.pf-v2 .pf-hero-stage {
  height: 155svh;
  background: #090c0b;
  position: relative;
  --hero-progress: 0;
  --look-x: 0px;
  --look-y: 0px;
}
.pf-v2 .pf-hero-cinema {
  position: sticky;
  top: 0;
  height: 100svh;
  min-height: 650px;
  padding: 0 4vw;
  background: #080a09;
  color: #f4f5e9;
  overflow: hidden;
  isolation: isolate;
  clip-path: inset(
    0 calc(var(--hero-progress) * 2.5%) round calc(var(--hero-progress) * 32px)
  );
}
.pf-hero-image {
  position: absolute;
  right: 0;
  inset-block: 0;
  width: 65%;
  z-index: -3;
  transform: scale(calc(1 + var(--hero-progress) * 0.12))
    translateY(calc(var(--hero-progress) * -35px));
  transform-origin: 60% 40%;
}"""

new_motion_hero = """.pf-v2 .pf-hero-stage {
  height: auto !important;
  min-height: 90vh !important;
  display: flex !important;
  align-items: center !important;
  background: #090A0C !important;
  position: relative !important;
  padding: 120px 4vw 60px !important;
}
.pf-v2 .pf-hero-cinema {
  position: relative !important;
  top: auto !important;
  height: auto !important;
  min-height: auto !important;
  display: grid !important;
  grid-template-columns: 1.15fr 0.85fr !important;
  align-items: center !important;
  gap: 48px !important;
  width: 100% !important;
  max-width: 1360px !important;
  margin: 0 auto !important;
  padding: 0 !important;
  background: transparent !important;
  overflow: visible !important;
  clip-path: none !important;
}
.pf-hero-image {
  position: relative !important;
  right: auto !important;
  inset-block: auto !important;
  width: 100% !important;
  max-width: 460px !important;
  margin: 0 auto !important;
  z-index: 5 !important;
  transform: none !important;
}"""

if old_motion_hero in motion:
    motion = motion.replace(old_motion_hero, new_motion_hero)
    print("Replaced initial hero in motion-design.css!")
else:
    print("Could not match exact old_motion_hero snippet, checking regex...")

# Also fix .pf-v2 .pf-hero-title and .pf-v2 .pf-hero h1 in motion-design.css
old_title_block = """.pf-v2 .pf-hero-title {
  position: absolute;
  left: 4vw;
  top: 23%;
  margin: 0;
  pointer-events: none;
  transform: translateY(calc(var(--hero-progress) * -60px));
}
.pf-hero-intro {
  font-size: 9px;
  letter-spacing: 2px;
  color: #c5cdbd;
  display: block;
  margin-bottom: 22px;
  animation: pf-mask-in 0.8s both 0.1s;
}
.pf-v2 .pf-hero h1 {
  font-size: clamp(105px, 15vw, 240px);
  font-weight: 700;
  letter-spacing: -0.085em;
  line-height: 0.84;
  position: relative;
}
.pf-v2 .pf-hero h1 > span {
  margin: 0;
  display: block;
}"""

new_title_block = """.pf-v2 .pf-hero-title {
  position: static !important;
  left: auto !important;
  top: auto !important;
  margin: 0 !important;
  pointer-events: auto !important;
  transform: none !important;
  max-width: 680px !important;
}
.pf-hero-intro {
  font-size: 11px !important;
  letter-spacing: 2px !important;
  color: #D2FF00 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-bottom: 16px !important;
}
.pf-v2 .pf-hero h1 {
  font-size: clamp(38px, 4.8vw, 74px) !important;
  font-weight: 800 !important;
  letter-spacing: -0.035em !important;
  line-height: 1.05 !important;
  position: relative !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 12px !important;
  margin: 0 0 20px 0 !important;
}
.pf-v2 .pf-hero h1 > span {
  margin: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
}"""

if old_title_block in motion:
    motion = motion.replace(old_title_block, new_title_block)
    print("Replaced title block in motion-design.css!")

# Remove all font-size: 14vw, 17vw, 20vw from media queries in motion-design.css
motion = re.sub(r'font-size:\s*(?:1[2-9]|2\d)vw;', 'font-size: clamp(36px, 5vw, 68px) !important;', motion)
motion = re.sub(r'\.pf-v2 \.pf-hero-title\s*\{[^}]*position:\s*absolute;[^}]*\}', '.pf-v2 .pf-hero-title { position: static !important; }', motion)
motion = re.sub(r'\.pf-v2 \.pf-hero-image\s*\{[^}]*width:\s*\d+%;[^}]*\}', '.pf-v2 .pf-hero-image { position: relative !important; width: 100% !important; max-width: 460px !important; }', motion)

with open(path_motion, "w", encoding="utf-8") as f:
    f.write(motion)

print("Updated motion-design.css successfully!")
