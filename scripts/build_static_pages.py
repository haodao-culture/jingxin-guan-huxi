from __future__ import annotations

import json
import shutil
from pathlib import Path
from urllib.parse import urljoin


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content-data.js"
BASE_URL = "https://haodao-culture.github.io/jingxin-guan-huxi/"
COMPLETION_CHIME_SRC = "assets/completion-chime.wav"


def load_content() -> dict:
    raw = CONTENT.read_text(encoding="utf-8").strip()
    prefix = "window.BREATH_CONTENT = "
    if not raw.startswith(prefix) or not raw.endswith(";"):
        raise ValueError("content-data.js format is not recognized")
    return json.loads(raw.removeprefix(prefix).removesuffix(";"))


def esc(value: object) -> str:
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#039;")
    )


def compact(value: str, limit: int = 150) -> str:
    text = " ".join(value.split())
    return text if len(text) <= limit else text[: limit - 1] + "…"


def chapter_path(chapter: dict) -> str:
    return f"chapters/{chapter['id']}/"


def head(title: str, description: str, css_path: str, favicon_path: str, canonical: str, og_type: str) -> str:
    image_url = urljoin(BASE_URL, "assets/hero-breath-room.jpg")
    return f"""<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(title)}</title>
    <meta name="description" content="{esc(description)}">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(description)}">
    <meta property="og:type" content="{esc(og_type)}">
    <meta property="og:url" content="{esc(canonical)}">
    <meta property="og:image" content="{esc(image_url)}">
    <link rel="canonical" href="{esc(canonical)}">
    <link rel="icon" href="{esc(favicon_path)}" type="image/svg+xml">
    <link rel="stylesheet" href="{esc(css_path)}">
  </head>"""


def header(base: str) -> str:
    return f"""    <a class="skip-link" href="#main">跳到內容</a>
    <header class="site-header" id="top">
      <a class="brand" href="{base}">靜心觀呼吸</a>
      <nav class="site-nav" aria-label="主要導覽">
        <a href="{base}#overview">總覽</a>
        <a href="{base}#/practice-mode">練習</a>
        <a href="{base}#chapters">章節</a>
      </nav>
    </header>"""


def footer() -> str:
    return """    <footer class="site-footer">
      <p>基於《關於淨念、靜心「觀」呼吸》整理。</p>
      <p>以觀呼吸學習與練習為主軸，導讀僅作章節索引與修煉提示。</p>
    </footer>"""


def grouped_chapters(data: dict) -> list[tuple[dict, list[dict]]]:
    groups = []
    for part in data["parts"]:
        chapters = [chapter for chapter in data["chapters"] if chapter["part"] == part["id"]]
        if chapters:
            groups.append((part, chapters))
    return groups


def chapter_cards(data: dict, base: str = "") -> str:
    blocks = []
    for part, chapters in grouped_chapters(data):
        cards = "\n".join(
            f"""              <a class="chapter-card" href="{base}{chapter_path(chapter)}">
                <span class="chapter-number">CHAPTER {chapter['number']:02d}</span>
                <h4>{esc(chapter['title'])}</h4>
                <p>{esc(chapter['subtitle'])}</p>
              </a>"""
            for chapter in chapters
        )
        blocks.append(
            f"""        <section class="part-block">
          <h3>{esc(part['id'])} · {esc(part['title'])}</h3>
          <div class="chapter-grid">
{cards}
          </div>
        </section>"""
        )
    return "\n".join(blocks)


def home_main(data: dict) -> str:
    return f"""    <main id="main" class="app-shell">
      <section class="hero" aria-label="靜心觀呼吸">
        <div class="hero-inner">
          <p class="eyebrow">HAODAO CULTURE · STUDY NOTES</p>
          <h1>靜心觀呼吸</h1>
          <p class="hero-copy">「除了這一念，別無他念。」以學習觀呼吸為主軸，整理出基本功、日常收心、心法效益與深入觀照。</p>
          <div class="hero-actions">
            <a class="button" href="#chapters">開始閱讀</a>
            <a class="button" href="#/practice-mode">進入練習</a>
          </div>
        </div>
      </section>

      <section class="section" id="overview">
        <div class="container">
          <div class="section-header">
            <h2>建立一條清楚的觀呼吸修煉路徑</h2>
            <p>這份網站把原文拆成四個部分、十二個主題章節。每章保留原文段落，再附上修煉要點與觀照提問，讓團隊可以反覆閱讀、練習、分享心得。</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card"><strong>{esc(data['stats']['parts'])}</strong><span>大部分</span></div>
            <div class="stat-card"><strong>{esc(data['stats']['chapters'])}</strong><span>主題章節</span></div>
            <div class="stat-card"><strong>{esc(data['stats']['paragraphs'])}</strong><span>原文段落</span></div>
            <div class="stat-card"><strong>{esc(data['stats']['days'])}</strong><span>百日基本功</span></div>
          </div>
        </div>
      </section>

      <section class="section tint">
        <div class="container">
          <div class="info-grid">
            <article class="info-card">
              <h3>原文主軸</h3>
              <p>目前觀呼吸，以降低意念作用，提升「覺、觀、明」的內修心法之能力為方向主軸。</p>
            </article>
            <article class="info-card">
              <h3>閱讀方式</h3>
              <p>可以先從總覽掌握全貌，再依章節逐段閱讀原文；每章附有修煉要點與觀照提問，方便反覆對照練習。</p>
              <div class="download-actions">
                <a class="button primary" href="#chapters">進入章節</a>
                <a class="button secondary" href="#chapters">逐章閱讀</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section" id="practice">
        <div class="container">
          <div class="section-header">
            <h2>練習引導</h2>
            <p>「眼睛八分閉兩分開，不要完全閉著眼睛。」念頭起來時，一覺察，收心回到「觀」呼吸。</p>
          </div>
          <div class="practice-layout">
            <div class="practice-panel">
              <h3>觀呼吸基本提醒</h3>
              <p>不必數息，不用管呼吸的長短，快慢也不用管它，只是「觀」呼吸就可以。安全狀態下，用 3 分鐘、5 分鐘、10 分鐘都可以。</p>
              <ul class="takeaway-list">
                <li>不要去對任何呼吸有論述、解讀、批判、延伸、運用。</li>
                <li>身體自然會去調整到它自然的氣息。</li>
                <li>當意識跑出來的時候，收心回到「觀」呼吸。</li>
              </ul>
              <div class="download-actions">
                <a class="button primary" href="#/practice-mode">開始一次練習</a>
              </div>
            </div>
            <div class="timer-panel">
              <div class="timer-ring" id="timerRing">
                <div class="timer-core">
                  <span class="timer-time" id="timerTime">03:00</span>
                  <span class="timer-label" id="timerLabel">觀呼吸</span>
                </div>
              </div>
              <div class="timer-actions">
                <button class="button" data-minutes="3" type="button">3 分</button>
                <button class="button" data-minutes="5" type="button">5 分</button>
                <button class="button" data-minutes="10" type="button">10 分</button>
                <button class="button" id="timerToggle" type="button">開始</button>
              </div>
              <audio id="completionChime" preload="auto" src="{COMPLETION_CHIME_SRC}"></audio>
              <p class="sr-only" id="timerStatus" role="status"></p>
            </div>
          </div>
        </div>
      </section>

      <section class="section tint" id="chapters">
        <div class="container">
          <div class="section-header">
            <h2>逐章閱讀</h2>
            <p>每章用一段原文作為章首引文，並保留完整段落。搜尋可直接找章名、要點與原文。</p>
          </div>
          <div class="search-row">
            <input id="chapterSearch" type="search" placeholder="搜尋章節、原文或關鍵詞" autocomplete="off">
            <button class="button secondary" id="clearSearch" type="button">清除</button>
          </div>
          <div class="chapter-list" id="chapterList">
{chapter_cards(data)}
          </div>
        </div>
      </section>
    </main>"""


def render_index(data: dict) -> str:
    title = "靜心觀呼吸｜昊道文化學習筆記"
    description = "靜心觀呼吸學習網站，系統化呈現觀呼吸心法、日常練習與逐章閱讀。"
    return "\n".join(
        [
            head(title, description, "styles.css", "assets/favicon.svg", BASE_URL, "website"),
            "  <body>",
            header("./"),
            home_main(data),
            footer(),
            "",
            '    <script src="content-data.js"></script>',
            '    <script src="app.js"></script>',
            "  </body>",
            "</html>",
            "",
        ]
    )


def render_chapter(data: dict, chapter: dict) -> str:
    chapters = data["chapters"]
    index = chapters.index(chapter)
    previous = chapters[index - 1] if index > 0 else None
    next_chapter = chapters[index + 1] if index < len(chapters) - 1 else None
    description = compact(chapter["quote"])
    canonical = urljoin(BASE_URL, chapter_path(chapter))
    paragraphs = "\n".join(
        f'            <p class="source-paragraph">{esc(paragraph)}</p>' for paragraph in chapter["paragraphs"]
    )
    takeaways = "\n".join(f"                <li>{esc(item)}</li>" for item in chapter["takeaways"])
    questions = "\n".join(f"                <li>{esc(item)}</li>" for item in chapter["questions"])
    previous_link = (
        f'<a class="button" href="../{previous["id"]}/">上一章</a>'
        if previous
        else '<a class="button" href="../../#chapters">回到總覽</a>'
    )
    next_link = (
        f'<a class="button" href="../{next_chapter["id"]}/">下一章</a>'
        if next_chapter
        else '<a class="button" href="../../#chapters">回到總覽</a>'
    )

    main = f"""    <main id="main" class="app-shell">
      <section class="chapter-hero">
        <div class="container">
          <p class="eyebrow">{esc(chapter['part'])} · CHAPTER {chapter['number']:02d}</p>
          <h1>{esc(chapter['title'])}</h1>
          <blockquote>{esc(chapter['quote'])}</blockquote>
          <div class="chapter-actions">
            <a class="button" href="../../#chapters">章節目錄</a>
            <a class="button" href="../../#/practice-mode">開始練習</a>
          </div>
        </div>
      </section>

      <section class="chapter-body">
        <div class="container reader-layout">
          <aside class="chapter-aside">
            <section class="quote-panel">
              <h3>修煉要點</h3>
              <ul class="takeaway-list">
{takeaways}
              </ul>
            </section>
            <section class="question-panel">
              <h3>練習提醒</h3>
              <p>{esc(chapter['practice'])}</p>
            </section>
            <section class="question-panel">
              <h3>觀照提問</h3>
              <ul class="question-list">
{questions}
              </ul>
            </section>
          </aside>

          <article class="reader-block">
            <h3>原文段落</h3>
{paragraphs}
            <nav class="chapter-pager" aria-label="章節切換">
              {previous_link}
              {next_link}
            </nav>
          </article>
        </div>
      </section>
    </main>"""

    return "\n".join(
        [
            head(
                f"{chapter['title']}｜靜心觀呼吸",
                description,
                "../../styles.css",
                "../../assets/favicon.svg",
                canonical,
                "article",
            ),
            "  <body>",
            header("../../"),
            main,
            footer(),
            "  </body>",
            "</html>",
            "",
        ]
    )


def main() -> None:
    data = load_content()
    (ROOT / "index.html").write_text(render_index(data), encoding="utf-8")

    chapters_root = ROOT / "chapters"
    if chapters_root.exists():
        shutil.rmtree(chapters_root)
    for chapter in data["chapters"]:
        target = chapters_root / chapter["id"]
        target.mkdir(parents=True, exist_ok=True)
        (target / "index.html").write_text(render_chapter(data, chapter), encoding="utf-8")

    print(f"Wrote index.html and {len(data['chapters'])} chapter pages")


if __name__ == "__main__":
    main()
