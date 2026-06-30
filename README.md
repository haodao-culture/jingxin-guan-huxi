# 靜心觀呼吸

昊道文化團隊內部閱讀用的靜態學習網站。內容依《關於淨念、靜心「觀」呼吸》原文整理，網站提供：

- 首頁總覽與章節索引
- 12 個主題章節
- 老師原文段落閱讀
- 修煉要點、練習提醒、觀照提問
- 搜尋與觀呼吸計時器

## 發布與權限提醒

目前文檔尚未確認是否可對外公開，因此此版本採低曝光設定：

- `index.html` 加上 `noindex, nofollow, noarchive`
- `robots.txt` 阻擋搜尋引擎爬取
- 原始 `.docx` 不納入 repo，也不提供公開下載

這些設定只能降低被搜尋到的機率，不能作為真正的存取權限控管。若 GitHub Pages 發布後是公開 URL，任何知道連結的人仍可開啟網站。

真正需要限制存取時，應使用 GitHub Enterprise Cloud 的 private Pages access control，或改用需要登入的內部發布平台。

## 本機預覽

直接開啟 `index.html`，或啟動本機靜態伺服器：

```bash
python3 -m http.server 4173
```

再開啟：

```text
http://127.0.0.1:4173/
```

## 更新內容

原始 Word 檔只保留在本機 `assets/guan-huxi-original.local.docx`，並由 `.gitignore` 排除。

重新抽取內容：

```bash
python3 scripts/build_content.py
```
