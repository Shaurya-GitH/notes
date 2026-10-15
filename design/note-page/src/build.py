"""Assemble the note-page prototype from a real Quartz build.

Usage: python3 -I build.py <quartz-build-dir> <content-dir> <out-dir>
"""
import html as H
import json
import os
import posixpath
import re
import shutil
import sys
import urllib.parse

QB, CONTENT, OUT = sys.argv[1:4]
HERE = os.path.dirname(os.path.abspath(__file__))
SHOWCASE = ["Security/TLS", "Docker/Introduction", "Spring/Introduction"]
LIVE = "https://shaurya-gith.github.io/notes/"

index = json.load(open(os.path.join(QB, "static/contentIndex.json"), encoding="utf-8"))


def clean(text):
    return re.sub(r"\s+", " ", text).strip()


# ---------- trimmed content index ----------
mini = {}
for slug, d in index.items():
    dirs = posixpath.dirname(d.get("filePath", "")).split("/") if "/" in d.get("filePath", "") else []
    body = clean(d.get("content", ""))
    mini[slug] = {
        "title": d["title"],
        "links": d.get("links", []),
        "content": body[:1800],
        "excerpt": body[:260] + ("…" if len(body) > 260 else ""),
        "folder": " / ".join(dirs),
        "folderParts": dirs,
    }


# ---------- backlink context from the markdown source ----------
def strip_md(s):
    s = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", lambda m: posixpath.basename(m.group(1)), s)
    s = re.sub(r"[*_`>#]|\$\$?", "", s)
    s = re.sub(r"^\s*([-+]|\d+\.)\s+", "", s)
    s = re.sub(r"\[!\w+\]\s*", "", s)
    return clean(s)


def context_for(src_slug, target_slug):
    path = os.path.join(CONTENT, index[src_slug]["filePath"])
    target_name = posixpath.basename(index[target_slug]["filePath"])[:-3] if target_slug in index else posixpath.basename(target_slug)
    for line in open(path, encoding="utf-8"):
        for m in re.finditer(r"\[\[([^\]]+)\]\]", line):
            name = m.group(1).split("|")[0].split("#")[0]
            if posixpath.basename(name).lower() == target_name.lower():
                text = strip_md(line)
                shown = m.group(1).split("|")[-1]
                shown = posixpath.basename(shown) if "|" not in m.group(1) else shown
                text = text[:220] + ("…" if len(text) > 220 else "")
                if text.strip(" .") == posixpath.basename(shown).strip():
                    return ""  # the line is only the link itself, e.g. a folder's list of notes
                esc = H.escape(text)
                return esc.replace(H.escape(shown), f"<mark>{H.escape(shown)}</mark>", 1)
    return ""


# ---------- page fragments ----------
def resolve(page_slug, href):
    if href.startswith(("http", "#", "mailto:")):
        return None
    base = posixpath.dirname(page_slug)
    return posixpath.normpath(posixpath.join(base, href)).lstrip("./").rstrip("/") or ""


def page_parts(slug):
    raw = open(os.path.join(QB, slug + ".html"), encoding="utf-8").read()
    body = raw[raw.index("<body") : raw.index("</body>")]
    body = re.sub(r"<script[\s\S]*?</script>", "", body)

    def fix_a(m):
        tag = m.group(0)
        href = re.search(r'href="([^"]*)"', tag)
        if not href:
            return tag
        target = resolve(slug, H.unescape(href.group(1)))
        if target is None:
            return tag
        if 'class="internal' in tag and "data-slug" not in tag and 'role="anchor"' not in tag:
            tag = tag.replace("<a ", f'<a data-slug="{H.escape(target)}" ', 1)
        live = LIVE + (target + "/" if target and target in folders else target)
        return tag.replace(href.group(0), f'href="{H.escape(live)}"')

    body = re.sub(r"<a [^>]*>", fix_a, body)
    body = re.sub(r'src="\.\./Assets/([^"]+)"', lambda m: f'src="assets/{m.group(1)}"', body)
    c = body.index('<div class="center">')
    r = body.index('<div class="right sidebar">')
    f = body.index("<footer")
    center, right = body[c:r], body[r:f]

    # backlinks: add the folder and the sentence that links here (proposed Backlinks.tsx enhancement)
    def bl(m):
        a = m.group(0)
        s = re.search(r'data-slug="([^"]+)"', a).group(1)
        folder = H.escape(mini.get(s, {}).get("folder", ""))
        ctx = context_for(s, slug) if s in index else ""
        a = re.sub(r'(<a [^>]*>)', rf'\1<span class="backlink-folder">{folder}</span>', a, count=1)
        return a + (f'<p class="backlink-context">{ctx}</p>' if ctx else "")

    right = re.sub(r'<a [^>]*class="internal"[^>]*>[^<]*</a>', bl, right)
    return body, center, right


folders = {posixpath.dirname(s) for s in index if "/" in s}
shell, *_ = page_parts(SHOWCASE[0])
pages = {s: page_parts(s)[1:] for s in SHOWCASE}
# the visible first page must carry the processed centre and rail too
c0, r0 = shell.index('<div class="center">'), shell.index("<footer")
shell = shell[:c0] + "".join(pages[SHOWCASE[0]]) + shell[r0:]

# swap the shell's footer for the portfolio one (quartz.layout.ts change)
footer = (
    '<footer><p>Notes by Shaurya Mehta. Built with Quartz.</p><ul>'
    '<li><a href="https://github.com/Shaurya-GitH" target="_blank" rel="noopener">GitHub</a></li>'
    f'<li><a href="{LIVE}" target="_blank" rel="noopener">Home</a></li></ul></footer>'
)
shell = re.sub(r"<footer[\s\S]*?</footer>", footer, shell)
shell = shell.replace('<div class="global-graph-outer">', '<div class="global-graph-outer" role="dialog" aria-modal="true" aria-label="Graph of all notes">')

templates = "".join(
    f'<template id="page-{s.replace("/", "__")}">{c}{r}</template>' for s, (c, r) in pages.items()
)

branch = open(os.path.join(HERE, "branch.svg"), encoding="utf-8").read()
branch_uri = "data:image/svg+xml," + urllib.parse.quote(branch, safe=" =:/,")
quartz_css = open(os.path.join(QB, "index.css"), encoding="utf-8").read()
katex_css = open(os.path.join(HERE, "katex.css"), encoding="utf-8").read()
custom_css = open(os.path.join(HERE, "custom.css"), encoding="utf-8").read().replace("__BRANCH__", branch_uri)
js = open(os.path.join(HERE, "proto.js"), encoding="utf-8").read()

fonts = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600'
    "&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap\">"
)
page = (
    "<title>Starry Notes Reader</title>"
    + fonts
    + f"<style>{katex_css}</style><style>{quartz_css}</style><style>{custom_css}</style>"
    + shell[shell.index(">") + 1 :].replace('<div id="quartz-root"', '<div id="quartz-root"', 1)
    + templates
    + '<script type="application/json" id="content-index">' + json.dumps(mini, ensure_ascii=False).replace("</", "<\\/") + "</script>"
    + f'<script type="application/json" id="showcase">{json.dumps(SHOWCASE)}</script>'
    + '<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>'
    + f"<script>{js}</script>"
)
os.makedirs(os.path.join(OUT, "assets"), exist_ok=True)
for m in set(re.findall(r'src="assets/([^"]+)"', page)):
    shutil.copy(os.path.join(QB, "Assets", m), os.path.join(OUT, "assets", m))
open(os.path.join(OUT, "starry-notes-reader.html"), "w", encoding="utf-8").write(page)
print("bytes", len(page), "assets", os.listdir(os.path.join(OUT, "assets")))
