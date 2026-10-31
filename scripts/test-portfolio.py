"""Browser regression for the portfolio reading path."""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5174/"
data = json.loads((root / "src/data/portfolio.json").read_text(encoding="utf-8"))
results = []
def check(label, condition):
    assert condition, label
    results.append(label)
    print("PASS", label, flush=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    response = page.goto(base, wait_until="domcontentloaded")
    page.wait_for_selector("#inicio")
    check("Portfolio loads", response.status == 200 and "João Gouvêa" in page.title())
    check("Hero fills the viewport", page.locator("#inicio").evaluate("e => e.getBoundingClientRect().height >= innerHeight"))
    check("Fullscreen portrait photo loads", page.locator(".pf-hero-image img").evaluate("e => e.complete && e.naturalWidth >= 1200 && e.currentSrc.includes('joao-janela-pb.webp')"))
    check("Full resolution GameDev source loads", page.locator(".pf-real-portrait img").evaluate("e => e.complete && e.naturalHeight >= 4000"))
    check("No image dialog or click target", page.locator("dialog,.pf-pointer,.pf-reel-card button,.pf-sport-image button").count() == 0)
    check("Projects grouped in visible cards", page.locator(".pf-project-group-heading").count() == 2 and page.locator(".pf-project-card").count() == 4 and page.locator(".pf-project-tabs").count() == 0)
    check("Four game cards visible", page.locator(".pf-game").count() == 4)
    check("ItalianWhey records stay inside its project card", page.locator(".pf-project-card-italian .pf-italian-gallery figure").count() == 6)
    check("Game scene HUD appears only on recreated scenes", page.locator(".pf-game-hud").count() == 2)
    check("Full Frequência Morta cover is fitted in frame", page.locator(".pf-game-image-frequencia-morta img").evaluate("e => getComputedStyle(e).objectFit === 'contain'"))
    ratios = page.locator(".pf-game-image").evaluate_all("els => els.map(e => Math.round(e.getBoundingClientRect().width / e.getBoundingClientRect().height * 100) / 100)")
    check("Game image frames share aspect ratio", len(set(ratios)) == 1 and 1.7 <= ratios[0] <= 1.85)
    check("Timeline events retained", page.locator(".pf-history-item").count() == len(data["achievements"]))
    check("Tunnel has visible depth layers", page.locator(".pf-tunnel i").count() == 9)
    check("Timeline has no buggy floating overlay", page.locator(".pf-tunnel-hud").count() == 0)
    check("Timeline labels have readable spacing", page.locator(".pf-year h3 small").first.evaluate("e => parseFloat(getComputedStyle(e).letterSpacing) >= 0"))
    reel = page.locator(".pf-reel-card .pf-photo img")
    check("Reel uses childhood, serve, and drawing in order", [reel.nth(i).get_attribute("src").split("/")[-1] for i in range(3)] == ["joao-infancia-futsal.webp", "joao-saque.webp", "desenho-olhos.webp"])
    check("Childhood photo and drawing are shown whole", all(reel.nth(i).evaluate("e => getComputedStyle(e).objectFit === 'contain'") for i in (0, 2)))
    page.locator("#trajetoria").evaluate("e => scrollTo({top:e.offsetTop + 700,behavior:'instant'})")
    page.wait_for_timeout(400)
    check("Tunnel advances on scroll", page.locator("#trajetoria").evaluate("e => Number(e.style.getPropertyValue('--tunnel-progress')) > 0"))
    check("FECART remains muted and looping", page.locator("video").evaluate("v => v.muted && v.loop && v.autoplay && !v.controls"))
    check("OBI result retained", "7.000" in page.locator("#certificados").inner_text() and page.locator("#certificados img").count() == 1)
    for width, height in [(390, 844), (320, 740), (768, 1024)]:
        page.set_viewport_size({"width": width, "height": height})
        page.evaluate("scrollTo({top:0,behavior:'instant'})")
        check(f"No horizontal overflow at {width}px", page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    check("No browser errors", not errors)
    browser.close()
(root / "docs/qa/overhaul-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
