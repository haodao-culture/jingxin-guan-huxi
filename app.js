(function () {
  const data = window.BREATH_CONTENT;
  const main = document.querySelector("#main");
  const PRACTICE_STORAGE_KEY = "haodaoBreathPracticeRecords";
  const COMPLETION_CHIME_SRC = "assets/completion-chime.wav";
  const PRACTICE_STATES = [
    { value: "clear", label: "清明" },
    { value: "scattered", label: "散亂" },
    { value: "drowsy", label: "昏沉" },
    { value: "emotional", label: "情緒起伏" },
  ];
  const RETURN_STATES = [
    { value: "yes", label: "有" },
    { value: "partial", label: "部分" },
    { value: "no", label: "沒有" },
  ];

  const state = {
    timerSeconds: 180,
    timerRemaining: 180,
    timerTotal: 180,
    timerHandle: null,
    timerCompleted: false,
    audioContext: null,
    resetConfirmHandle: null,
    selectedRecordKey: null,
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
    return `chapters/${chapter.id}/`;
  }

  function todayKey() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function dateKeyFromDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function formatShortDate(key) {
    const date = parseDateKey(key);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function optionLabel(options, value) {
    return options.find((option) => option.value === value)?.label || "未記錄";
  }

  function clampMinutes(value, fallback) {
    const number = Number.parseInt(value, 10);
    if (Number.isNaN(number)) return fallback;
    return Math.min(120, Math.max(1, number));
  }

  function latestRecordKey(records) {
    return Object.keys(records).sort().at(-1) || null;
  }

  function renderRadioGroup(name, options, selected) {
    return options.map((option) => `
      <label class="choice-pill">
        <input type="radio" name="${name}" value="${option.value}" ${selected === option.value ? "checked" : ""}>
        <span>${option.label}</span>
      </label>
    `).join("");
  }

  function loadPracticeRecords() {
    try {
      return JSON.parse(localStorage.getItem(PRACTICE_STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function savePracticeRecords(records) {
    localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(records));
  }

  function getPracticeStats(records) {
    const keys = Object.keys(records).sort();
    const today = todayKey();
    let cursor = parseDateKey(today);
    let streak = 0;

    while (records[dateKeyFromDate(cursor)]) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    return {
      days: keys.length,
      minutes: keys.reduce((sum, key) => sum + Number(records[key].minutes || 0), 0),
      streak,
      firstDate: keys[0] || today,
    };
  }

  function groupedChapters(chapters) {
    return data.parts.map((part) => ({
      ...part,
      chapters: chapters.filter((chapter) => chapter.part === part.id),
    })).filter((part) => part.chapters.length > 0);
  }

  function renderHome() {
    stopTimer();
    state.timerTotal = 180;
    state.timerRemaining = 180;
    state.timerCompleted = false;
    main.innerHTML = `
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
              <audio id="completionChime" preload="auto" src="${COMPLETION_CHIME_SRC}"></audio>
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
    state.timerCompleted = false;
    updateTimerView();
    updateMinuteInputs(Math.round(seconds / 60));
  }

  function toggleTimer() {
    if (state.timerHandle) {
      stopTimer();
      announceTimer("計時暫停");
      updateTimerView();
      return;
    }
    prepareCompletionAudio();
    document.querySelector("#timerToggle").textContent = "暫停";
    document.querySelector("#timerLabel").textContent = "回到觀呼吸";
    announceTimer("計時開始");
    state.timerHandle = window.setInterval(() => {
      state.timerRemaining = Math.max(0, state.timerRemaining - 1);
      updateTimerView();
      if (state.timerRemaining === 0) {
        stopTimer();
        state.timerCompleted = true;
        document.querySelector("#timerLabel").textContent = "練習完成";
        announceTimer("練習完成");
        playCompletionChime();
        updatePracticeStatus();
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

  function updateMinuteInputs(minutes) {
    const customMinutes = document.querySelector("#customMinutes");
    const practiceMinutes = document.querySelector("#actualPracticeMinutes");
    if (customMinutes) customMinutes.value = minutes;
    if (practiceMinutes) practiceMinutes.value = minutes;
  }

  function announceTimer(message) {
    const status = document.querySelector("#timerStatus");
    if (status) status.textContent = message;
  }

  function getAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!state.audioContext) state.audioContext = new AudioContext();
    return state.audioContext;
  }

  function prepareCompletionAudio() {
    const audio = document.querySelector("#completionChime");
    if (audio) audio.load();
    const context = getAudioContext();
    if (context?.state === "suspended") {
      context.resume().catch(() => {});
    }
  }

  function playCompletionChime() {
    const audio = document.querySelector("#completionChime");
    if (audio) {
      audio.currentTime = 0;
      const result = audio.play();
      if (result?.catch) result.catch(() => playOscillatorChime());
      return;
    }
    playOscillatorChime();
  }

  function playOscillatorChime() {
    const context = getAudioContext();
    if (!context) return;

    const play = () => {
      const now = context.currentTime;
      const gain = context.createGain();
      const first = context.createOscillator();
      const second = context.createOscillator();

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
      gain.connect(context.destination);

      first.type = "sine";
      first.frequency.setValueAtTime(660, now);
      first.connect(gain);
      first.start(now);
      first.stop(now + 0.7);

      second.type = "sine";
      second.frequency.setValueAtTime(880, now + 0.48);
      second.connect(gain);
      second.start(now + 0.48);
      second.stop(now + 1.35);
    };

    if (context.state === "suspended") {
      context.resume().then(play).catch(() => {});
      return;
    }
    play();
  }

  function renderPracticeMode() {
    const records = loadPracticeRecords();
    const stats = getPracticeStats(records);
    const todayRecord = records[todayKey()];
    state.selectedRecordKey = todayRecord ? todayKey() : latestRecordKey(records);
    const selectedMinutes = clampMinutes(todayRecord?.minutes, Math.round(state.timerTotal / 60));

    main.innerHTML = `
      <section class="chapter-hero practice-mode-hero">
        <div class="container">
          <p class="eyebrow">PRACTICE MODE</p>
          <h1>開始觀呼吸</h1>
          <blockquote>不必數息，不用管呼吸的長短，快慢也不用管它，只是「觀」呼吸就可以。</blockquote>
          <div class="chapter-actions">
            <a class="button" href="#/">回到總覽</a>
            <a class="button" href="#chapters">章節目錄</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container practice-mode-layout">
          <div class="timer-panel practice-focus">
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
            <div class="custom-timer">
              <label for="customMinutes">自訂分鐘</label>
              <input id="customMinutes" type="number" min="1" max="120" inputmode="numeric" value="${selectedMinutes}">
              <button class="button" id="applyCustomMinutes" type="button">設定</button>
            </div>
            <audio id="completionChime" preload="auto" src="${COMPLETION_CHIME_SRC}"></audio>
            <p class="sr-only" id="timerStatus" role="status"></p>
          </div>

          <aside class="practice-record-card">
            <h2>今日紀錄</h2>
            <p>練習完成後，記下實際分鐘、狀態與一句心得。紀錄只保存在這台裝置，不需要登入。</p>
            <div class="record-stats">
              <div><strong id="practiceDays">${stats.days}</strong><span>已記錄天數</span></div>
              <div><strong id="practiceTotalMinutes">${stats.minutes}</strong><span>累計分鐘</span></div>
              <div><strong id="practiceStreak">${stats.streak}</strong><span>連續天數</span></div>
            </div>
            <label class="note-label" for="actualPracticeMinutes">實際練習分鐘</label>
            <input class="minute-input" id="actualPracticeMinutes" type="number" min="1" max="120" inputmode="numeric" value="${selectedMinutes}">
            <fieldset class="choice-group">
              <legend>今天狀態</legend>
              <div class="choice-row">${renderRadioGroup("practiceState", PRACTICE_STATES, todayRecord?.state || "")}</div>
            </fieldset>
            <fieldset class="choice-group">
              <legend>是否有回到觀呼吸</legend>
              <div class="choice-row">${renderRadioGroup("returnedToBreath", RETURN_STATES, todayRecord?.returnedToBreath || "")}</div>
            </fieldset>
            <label class="note-label" for="practiceNote">今日心得</label>
            <textarea id="practiceNote" rows="5" placeholder="例如：今天念頭很多，但有覺察到並回到觀呼吸。">${escapeHtml(todayRecord?.note || "")}</textarea>
            <button class="button primary" id="savePracticeRecord" type="button">${todayRecord ? "更新今日紀錄" : "完成今日練習"}</button>
            <p class="record-status" id="recordStatus">${todayRecord ? `今天已記錄 ${todayRecord.minutes} 分鐘。` : "完成練習後，按下按鈕記錄今天。"}</p>
          </aside>
        </div>
      </section>

      <section class="section tint">
        <div class="container">
          <div class="section-header">
            <h2>百日基本功</h2>
            <div class="section-copy">
              <p>從第一次記錄開始，連續看見一百天的練習軌跡。每一格只代表一件事：今天有沒有回到「觀」呼吸。</p>
              <button class="button secondary reset-button" id="resetPracticeRecords" type="button">重新開始百日紀錄</button>
            </div>
          </div>
          <div class="hundred-grid" id="hundredGrid"></div>
          <article class="record-detail-card" id="recordDetail"></article>
        </div>
      </section>
    `;

    bindPracticeMode();
    renderHundredGrid(records);
    renderRecordDetail(records, state.selectedRecordKey);
    updateTimerView();
  }

  function bindPracticeMode() {
    document.querySelectorAll("[data-minutes]").forEach((button) => {
      button.addEventListener("click", () => setTimer(Number(button.dataset.minutes) * 60));
    });
    document.querySelector("#timerToggle").addEventListener("click", toggleTimer);
    document.querySelector("#applyCustomMinutes").addEventListener("click", applyCustomMinutes);
    document.querySelector("#customMinutes").addEventListener("change", applyCustomMinutes);
    document.querySelector("#actualPracticeMinutes").addEventListener("change", (event) => {
      event.target.value = clampMinutes(event.target.value, Math.round(state.timerTotal / 60));
    });
    document.querySelector("#savePracticeRecord").addEventListener("click", saveTodayPractice);
    document.querySelector("#resetPracticeRecords").addEventListener("click", resetPracticeRecords);
  }

  function applyCustomMinutes() {
    const input = document.querySelector("#customMinutes");
    const minutes = clampMinutes(input.value, Math.round(state.timerTotal / 60));
    setTimer(minutes * 60);
  }

  function saveTodayPractice() {
    const records = loadPracticeRecords();
    const key = todayKey();
    const note = document.querySelector("#practiceNote").value.trim();
    const minutes = clampMinutes(document.querySelector("#actualPracticeMinutes").value, Math.round(state.timerTotal / 60));
    const existing = records[key] || {};
    records[key] = {
      ...existing,
      date: key,
      minutes,
      state: document.querySelector("input[name='practiceState']:checked")?.value || "",
      returnedToBreath: document.querySelector("input[name='returnedToBreath']:checked")?.value || "",
      note,
      createdAt: existing.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    savePracticeRecords(records);
    state.selectedRecordKey = key;
    updatePracticeRecordView(records);
    document.querySelector("#recordStatus").textContent = `已記錄今天 ${minutes} 分鐘。`;
    document.querySelector("#savePracticeRecord").textContent = "更新今日紀錄";
  }

  function updatePracticeStatus() {
    const status = document.querySelector("#recordStatus");
    if (!status) return;
    status.textContent = "練習完成，可以記錄今天。";
  }

  function updatePracticeRecordView(records) {
    const stats = getPracticeStats(records);
    document.querySelector("#practiceDays").textContent = stats.days;
    document.querySelector("#practiceTotalMinutes").textContent = stats.minutes;
    document.querySelector("#practiceStreak").textContent = stats.streak;
    renderHundredGrid(records);
    renderRecordDetail(records, state.selectedRecordKey);
  }

  function resetPracticeRecords() {
    const resetButton = document.querySelector("#resetPracticeRecords");
    const status = document.querySelector("#recordStatus");

    if (resetButton?.dataset.confirm !== "true") {
      if (state.resetConfirmHandle) window.clearTimeout(state.resetConfirmHandle);
      resetButton.dataset.confirm = "true";
      resetButton.textContent = "確認重置";
      resetButton.classList.add("is-confirming");
      if (status) status.textContent = "再按一次「確認重置」，才會清除這台裝置上的百日紀錄。";
      state.resetConfirmHandle = window.setTimeout(() => {
        resetButton.dataset.confirm = "false";
        resetButton.textContent = "重新開始百日紀錄";
        resetButton.classList.remove("is-confirming");
      }, 8000);
      return;
    }

    localStorage.removeItem(PRACTICE_STORAGE_KEY);
    const note = document.querySelector("#practiceNote");
    const saveButton = document.querySelector("#savePracticeRecord");

    if (state.resetConfirmHandle) window.clearTimeout(state.resetConfirmHandle);
    if (resetButton) {
      resetButton.dataset.confirm = "false";
      resetButton.textContent = "重新開始百日紀錄";
      resetButton.classList.remove("is-confirming");
    }
    if (note) note.value = "";
    if (status) status.textContent = "百日紀錄已重置，可以重新開始。";
    if (saveButton) saveButton.textContent = "完成今日練習";
    state.selectedRecordKey = null;
    updatePracticeRecordView({});
  }

  function renderHundredGrid(records) {
    const grid = document.querySelector("#hundredGrid");
    if (!grid) return;
    const stats = getPracticeStats(records);
    const startDate = parseDateKey(stats.firstDate);
    const today = todayKey();

    grid.innerHTML = Array.from({ length: 100 }, (_, index) => {
      const key = dateKeyFromDate(addDays(startDate, index));
      const record = records[key];
      const classes = ["day-cell"];
      if (record) classes.push("done");
      if (key === today) classes.push("today");
      if (key === state.selectedRecordKey) classes.push("selected");
      return `
        <button class="${classes.join(" ")}" data-date="${key}" ${record ? "" : "disabled"} type="button" title="${escapeHtml(key)}${record ? ` · ${record.minutes} 分鐘` : ""}">
          <span>第 ${index + 1} 天</span>
          <strong>${formatShortDate(key)}</strong>
        </button>
      `;
    }).join("");
    grid.querySelectorAll(".day-cell.done").forEach((cell) => {
      cell.addEventListener("click", () => {
        state.selectedRecordKey = cell.dataset.date;
        renderRecordDetail(loadPracticeRecords(), state.selectedRecordKey);
        grid.querySelectorAll(".day-cell").forEach((item) => item.classList.remove("selected"));
        cell.classList.add("selected");
      });
    });
  }

  function renderRecordDetail(records, key) {
    const detail = document.querySelector("#recordDetail");
    if (!detail) return;
    const record = key ? records[key] : null;
    if (!record) {
      detail.innerHTML = `
        <h3>練習日誌</h3>
        <p>完成今日練習後，或點選已亮起的日期，就能在這裡回看紀錄。</p>
      `;
      return;
    }

    detail.innerHTML = `
      <h3>${key === todayKey() ? "今日練習日誌" : "練習日誌"}</h3>
      <dl class="record-detail-list">
        <div><dt>日期</dt><dd>${escapeHtml(key)}</dd></div>
        <div><dt>練習分鐘</dt><dd>${escapeHtml(record.minutes || "未記錄")} 分鐘</dd></div>
        <div><dt>今天狀態</dt><dd>${optionLabel(PRACTICE_STATES, record.state)}</dd></div>
        <div><dt>回到觀呼吸</dt><dd>${optionLabel(RETURN_STATES, record.returnedToBreath)}</dd></div>
      </dl>
      <p class="record-note">${record.note ? escapeHtml(record.note) : "這一天沒有留下心得。"}</p>
      ${key === todayKey() ? `<p class="record-hint">今天的紀錄可以在上方「今日紀錄」更新。</p>` : ""}
    `;
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
            <a class="button" href="#/practice-mode">開始練習</a>
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
    if (hash === "#/practice-mode") {
      stopTimer();
      state.timerRemaining = state.timerTotal;
      state.timerCompleted = false;
      renderPracticeMode();
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
