#!/usr/bin/env python3
"""Static generator for the Lab Notes section of ikigaicollective.org.

Reads lab-notes/src/*.md (frontmatter: title/date/week, then `---`, then
Markdown), renders each to lab-notes/<slug>.html plus an archive index,
using the same palette/typography as the homepage. Requires pandoc.

Usage: python3 lab-notes/build.py   (run from the repo root)
"""
from __future__ import annotations

import re
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

STYLE = """
:root { --bg:#0a0a0a; --fg:#e8e6e3; --accent:#c4956a; --muted:#6b6560; --border:#2a2622; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Georgia','Times New Roman',serif; background:var(--bg); color:var(--fg); line-height:1.7; min-height:100vh; }
.container { max-width:720px; margin:0 auto; padding:4rem 2rem; }
h1 { font-size:2rem; font-weight:400; letter-spacing:0.02em; margin-bottom:0.5rem; }
.meta { color:var(--muted); font-size:0.95rem; margin-bottom:2.5rem; }
.meta .week { color:var(--accent); }
article p { margin-bottom:1.2rem; }
article strong { color:var(--accent); font-weight:normal; }
a { color:var(--accent); text-decoration:none; border-bottom:1px solid transparent; transition:border-color .2s; }
a:hover { border-bottom-color:var(--accent); }
.crumb { font-size:0.85rem; text-transform:uppercase; letter-spacing:0.15em; color:var(--muted); margin-bottom:2.5rem; display:block; }
.postlist { list-style:none; }
.postlist li { padding:1.1rem 0; border-bottom:1px solid var(--border); }
.postlist li:last-child { border-bottom:none; }
.postlist .d { color:var(--muted); font-size:0.9rem; margin-right:0.8rem; }
.footer { margin-top:4rem; padding-top:2rem; border-top:1px solid var(--border); color:var(--muted); font-size:0.85rem; }
.tagline { color:var(--accent); font-style:italic; margin-bottom:2.5rem; }
"""

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Ikigai Collective</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/jpeg" href="/ikigaicollective-logo.jpg">
<meta property="og:title" content="{title} — Ikigai Collective Lab Notes">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://ikigaicollective.org/cover.jpg">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<style>{style}</style>
</head>
<body>
<div class="container">
<a class="crumb" href="/lab-notes/">← Lab Notes · Ikigai Collective</a>
<h1>{title}</h1>
<p class="meta"><span class="week">Week {week}</span> · {pretty_date}</p>
<article>
{body}
</article>
<div class="footer">
<p>The open lab notebook of the <a href="/">Ikigai Collective</a> — Curiosity · Agency · Compassion.
Lab Night is every Thursday at 21:00 Rome time (CEST) on <a href="https://discord.gg/4rM6FqjVDE">our Discord</a>.
Content is <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p>
</div>
</div>
</body>
</html>
"""

INDEX = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lab Notes — Ikigai Collective</title>
<meta name="description" content="The open lab notebook of the Ikigai Collective: weekly notes from Lab Night.">
<link rel="icon" type="image/jpeg" href="/ikigaicollective-logo.jpg">
<meta property="og:title" content="Lab Notes — Ikigai Collective">
<meta property="og:description" content="The open lab notebook of the Ikigai Collective: weekly notes from Lab Night.">
<meta property="og:image" content="https://ikigaicollective.org/cover.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<style>{style}</style>
</head>
<body>
<div class="container">
<a class="crumb" href="/">← ikigaicollective.org</a>
<h1>Lab Notes</h1>
<p class="tagline">The open lab notebook: what we tried, what we learned, week by week.</p>
<ul class="postlist">
{items}
</ul>
<div class="footer">
<p>New notes appear after each Lab Night (Thursdays 21:00 Rome time (CEST), <a href="https://discord.gg/4rM6FqjVDE">Discord</a>).
Content is <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p>
</div>
</div>
</body>
</html>
"""


def parse(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    head, body = raw.split("\n---\n", 1)
    meta = dict(
        (k.strip(), v.strip())
        for k, v in (line.split(":", 1) for line in head.strip().splitlines())
    )
    meta["body_md"] = body.strip()
    meta["slug"] = path.stem
    return meta


def md_to_html(md: str) -> str:
    r = subprocess.run(
        ["pandoc", "-f", "markdown", "-t", "html", "--wrap=none"],
        input=md, capture_output=True, text=True, check=True,
    )
    return r.stdout.strip()


def pretty(d: str) -> str:
    return date.fromisoformat(d).strftime("%B %-d, %Y")


def first_sentence(md: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)
    text = re.sub(r"[*_#>]", "", text).strip()
    return text.split(". ")[0][:200] + "."


def main() -> None:
    posts = sorted((parse(p) for p in SRC.glob("*.md")), key=lambda m: m["date"])
    for m in posts:
        html = PAGE.format(
            title=m["title"], desc=first_sentence(m["body_md"]), style=STYLE,
            week=m["week"], pretty_date=pretty(m["date"]), body=md_to_html(m["body_md"]),
        )
        (ROOT / f"{m['slug']}.html").write_text(html, encoding="utf-8")
        print("built", m["slug"] + ".html")
    items = "\n".join(
        f'<li><span class="d">{pretty(m["date"])}</span> '
        f'<a href="/lab-notes/{m["slug"]}.html">{m["title"]}</a></li>'
        for m in reversed(posts)
    )
    (ROOT / "index.html").write_text(INDEX.format(style=STYLE, items=items), encoding="utf-8")
    print("built index.html with", len(posts), "posts")


if __name__ == "__main__":
    main()
