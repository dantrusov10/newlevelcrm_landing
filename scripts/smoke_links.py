#!/usr/bin/env python3
import argparse
import re
import sys
import urllib.request
from pathlib import Path


PAGES = [
    "blog.html",
    "blog-post.html",
    "help.html",
    "personal-data-offer.html",
    "partners.html",
    "roadmap.html",
]

REQUIRED_ABSOLUTE_LINKS = [
    "/#features",
    "/#ai",
    "/#pricing",
    "/#compare",
    "/#news",
    "/#contact",
]

ALLOWED_LOCAL_ANCHORS = {
    "help.html": {"#admin", "#manager", "#reglament", "#faq-admin", "#faq-manager", "#onboarding"},
    "personal-data-offer.html": {"#consent-text", "#operator-details", "#withdraw"},
    "blog.html": {"#"},
    "blog-post.html": {"#"},
}


def read_local(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def read_live(base_url: str, page: str) -> str:
    url = f"{base_url.rstrip('/')}/{page}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def hrefs(html: str):
    return re.findall(r'href="([^"]+)"', html)


def check_page(page: str, html: str):
    errors = []
    links = hrefs(html)
    links_set = set(links)

    # Header/footer must contain links to main sections using absolute anchors.
    for link in REQUIRED_ABSOLUTE_LINKS:
        if link not in links_set:
            errors.append(f"missing required link: {link}")

    # Forbid local section anchors except explicit in-page TOC anchors.
    allowed = ALLOWED_LOCAL_ANCHORS.get(page, set())
    for link in links:
        if link.startswith("#") and link not in allowed:
            errors.append(f"forbidden local anchor: {link}")

    return errors


def main():
    parser = argparse.ArgumentParser(description="Smoke-test nav/footer links for NewLevel landing pages.")
    parser.add_argument("--root", default=".", help="Path to project root with html files.")
    parser.add_argument("--live-base", help="Optional live base URL, e.g. https://nwlvl.ru")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    total_errors = 0

    print("== Local files ==")
    for page in PAGES:
        file_path = root / page
        if not file_path.exists():
            print(f"[FAIL] {page}: file not found")
            total_errors += 1
            continue
        errors = check_page(page, read_local(file_path))
        if errors:
            print(f"[FAIL] {page}")
            for e in errors:
                print(f"  - {e}")
            total_errors += len(errors)
        else:
            print(f"[OK]   {page}")

    if args.live_base:
        print("\n== Live pages ==")
        for page in PAGES:
            try:
                html = read_live(args.live_base, page)
                errors = check_page(page, html)
                if errors:
                    print(f"[FAIL] {args.live_base.rstrip('/')}/{page}")
                    for e in errors:
                        print(f"  - {e}")
                    total_errors += len(errors)
                else:
                    print(f"[OK]   {args.live_base.rstrip('/')}/{page}")
            except Exception as e:
                print(f"[FAIL] {args.live_base.rstrip('/')}/{page}: {e}")
                total_errors += 1

    if total_errors:
        print(f"\nSmoke test failed: {total_errors} issue(s)")
        sys.exit(1)

    print("\nSmoke test passed")


if __name__ == "__main__":
    main()
