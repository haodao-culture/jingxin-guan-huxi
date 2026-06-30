(function () {
  const data = window.BREATH_CONTENT;
  const main = document.querySelector("#main");

  const state = {
    timerSeconds: 180,
    timerRemaining: 180,
    timerTotal: 180,
    timerHandle: null,
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function chapterHref(chapter) {
    return `#/chapter/${chapter.id}`;
  }

  function groupedChapters(chapters) {
    return data.parts.map((part) => ({
      ...part,
      chapters: chapters.filter((chapter) => chapter.part === part.id),
    })).filter((part) => part.chapters.length > 0);
  }

  function renderHome() {
    stopTimer();
    main.innerHTML = `
      <section class="hero" aria-label="靜心觀呼吸">
        <div class="hero-inner">
          <p class="eyebrow">HAODAO CULTURE · STUDY NOTES</p>
          <h1>靜心觀呼吸</h1>
          <p class="hero-copy">「除了這一念，別無他念。」以學習觀呼吸為主軸，整理出基本功、日常收心、心法效益與深入觀照。</p>
          <div class="hero-actions">
            <a class="button" href="#chapters">開始閱讀</a>
            <a class="button" href="#practice">進入練習</a>
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
            <div class="stat-card"><strong>${data.stats.parts}</strong><span>大部分</span></div>
            <div class="stat-card"><strong>${data.stats.chapters}</strong><span>主題章節</span></div>
            <div class="stat-card"><strong>${data.stats.paragraphs}</strong><span>原文段落</span></div>
            <div class="stat-card"><strong>${data.stats.days}</strong><span>百日基本功</span></div>
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
            </div>
            <div class="timer-panel" aria-live="polite">
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
          <div class="chapter-list" id="chapterList"></div>
        </div>
      </section>
    `;
    renderChapterList(data.chapters);
    bindHome();
  }

  function renderChapterList(chapters) {
    const chapterList = document.querySelector("#chapterList");
    if (!chapters.length) {
      chapterList.innerHTML = `<p class="no-results">沒有符合的章節。</p>`;
      return;
    }

    chapterList.innerHTML = groupedChapters(chapters)
      .map((part) => `
        <section class="part-block">
          <h3>${escapeHtml(part.id)} · ${escapeHtml(part.title)}</h3>
          <div class="chapter-grid">
            ${part.chapters.map((chapter) => `
              <a class="chapter-card" href="${chapterHref(chapter)}">
                <span class="chapter-number">CHAPTER ${String(chapter.number).padStart(2, "0")}</span>
                <h4>${escapeHtml(chapter.title)}</h4>
                <p>${escapeHtml(chapter.subtitle)}</p>
              </a>
            `).join("")}
          </div>
        </section>
      `).join("");
  }

  function bindHome() {
    document.querySelector("#chapterSearch").addEventListener("input", (event) => {
      const keyword = event.target.value.trim().toLowerCase();
      if (!keyword) {
        renderChapterList(data.chapters);
        return;
      }
      const filtered = data.chapters.filter((chapter) => {
        const body = [
          chapter.title,
          chapter.subtitle,
          chapter.quote,
          chapter.takeaways.join(" "),
          chapter.paragraphs.join(" "),
        ].join(" ").toLowerCase();
        return body.includes(keyword);
      });
      renderChapterList(filtered);
    });

    document.querySelector("#clearSearch").addEventListener("click", () => {
      const input = document.querySelector("#chapterSearch");
      input.value = "";
      renderChapterList(data.chapters);
      input.focus();
    });

    document.querySelectorAll("[data-minutes]").forEach((button) => {
      button.addEventListener("click", () => setTimer(Number(button.dataset.minutes) * 60));
    });
    document.querySelector("#timerToggle").addEventListener("click", toggleTimer);
    updateTimerView();
  }

  function setTimer(seconds) {
    stopTimer();
    state.timerSeconds = seconds;
    state.timerTotal = seconds;
    state.timerRemaining = seconds;
    updateTimerView();
  }

  function toggleTimer() {
    if (state.timerHandle) {
      stopTimer();
      updateTimerView();
      return;
    }
    document.querySelector("#timerToggle").textContent = "暫停";
    document.querySelector("#timerLabel").textContent = "回到觀呼吸";
    state.timerHandle = window.setInterval(() => {
      state.timerRemaining = Math.max(0, state.timerRemaining - 1);
      updateTimerView();
      if (state.timerRemaining === 0) {
        stopTimer();
        document.querySelector("#timerLabel").textContent = "練習完成";
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerHandle) {
      window.clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function updateTimerView() {
    const time = document.querySelector("#timerTime");
    const ring = document.querySelector("#timerRing");
    const toggle = document.querySelector("#timerToggle");
    const label = document.querySelector("#timerLabel");
    if (!time || !ring || !toggle || !label) return;

    const minutes = Math.floor(state.timerRemaining / 60);
    const seconds = state.timerRemaining % 60;
    const progress = 100 - (state.timerRemaining / state.timerTotal) * 100;
    time.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    ring.style.setProperty("--progress", `${progress}%`);
    toggle.textContent = state.timerHandle ? "暫停" : "開始";
    if (!state.timerHandle && state.timerRemaining > 0) {
      label.textContent = "觀呼吸";
    }
  }

  function renderChapter(id) {
    stopTimer();
    const chapter = data.chapters.find((item) => item.id === id) || data.chapters[0];
    const index = data.chapters.indexOf(chapter);
    const previous = data.chapters[index - 1];
    const next = data.chapters[index + 1];

    main.innerHTML = `
      <section class="chapter-hero">
        <div class="container">
          <p class="eyebrow">${escapeHtml(chapter.part)} · CHAPTER ${String(chapter.number).padStart(2, "0")}</p>
          <h1>${escapeHtml(chapter.title)}</h1>
          <blockquote>${escapeHtml(chapter.quote)}</blockquote>
          <div class="chapter-actions">
            <a class="button" href="#/">回到總覽</a>
            <a class="button" href="#chapters">章節目錄</a>
          </div>
        </div>
      </section>

      <section class="chapter-body">
        <div class="container reader-layout">
          <aside class="chapter-aside">
            <section class="quote-panel">
              <h3>修煉要點</h3>
              <ul class="takeaway-list">
                ${chapter.takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </section>
            <section class="question-panel">
              <h3>練習提醒</h3>
              <p>${escapeHtml(chapter.practice)}</p>
            </section>
            <section class="question-panel">
              <h3>觀照提問</h3>
              <ul class="question-list">
                ${chapter.questions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </section>
          </aside>

          <article class="reader-block">
            <h3>原文段落</h3>
            ${chapter.paragraphs.map((paragraph) => `<p class="source-paragraph">${escapeHtml(paragraph)}</p>`).join("")}
            <nav class="chapter-pager" aria-label="章節切換">
              ${previous ? `<a class="button" href="${chapterHref(previous)}">上一章</a>` : `<a class="button" href="#/">回到總覽</a>`}
              ${next ? `<a class="button" href="${chapterHref(next)}">下一章</a>` : `<a class="button" href="#/">回到總覽</a>`}
            </nav>
          </article>
        </div>
      </section>
    `;
  }

  function route() {
    const hash = window.location.hash || "#/";
    const match = hash.match(/^#\/chapter\/(ch\d{2})$/);
    if (match) {
      renderChapter(match[1]);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    renderHome();
    if (hash !== "#/" && document.querySelector(hash.replace("#/", "#"))) {
      document.querySelector(hash.replace("#/", "#")).scrollIntoView();
    }
  }

  window.addEventListener("hashchange", route);
  route();
})();
