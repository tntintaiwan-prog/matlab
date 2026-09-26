# MATLAB 學習成果網站

一堂課一個資料夾。把課程資料夾加入 GitHub，GitHub Actions 會自動建立首頁卡片、內容頁與互動頁，再發布至 GitHub Pages。不需要後台、管理帳號或資料庫。

## 新增一堂課

複製 `lessons/_template`，改名為 `lessons/002-your-topic`。範本是可運作的正弦波課程示例，不會自動列為正式課程。

```text
lessons/
  001-kmeans/             現有第一堂課
  002-your-topic/         你的下一堂課
    lesson.json          標題、日期、摘要、互動設定
    content.md           課程內容（可改用 report.docx）
    matlab.m             MATLAB 程式，可省略
    python.py            Python 程式，可省略
    interactive.html     自訂互動網頁，包含 HTML、CSS、JavaScript
    assets/              內容頁使用的 PNG、JPG、GIF、WebP 圖片，可省略
```

1. 修改 `lesson.json` 的標題、日期與摘要。
2. 編輯 `content.md`，或移除它並加入 Word 報告 `report.docx`。兩者擇一。
3. 放入這堂課的 `matlab.m`、`python.py`，網站只展示內容，不會執行這兩個檔案。
4. 修改 `interactive.html`，加入這堂課的 JavaScript 互動程式。
5. 將整個資料夾提交到 GitHub 的 `main` 分支。首次部署請先依 [GITHUB_PAGES.md](GITHUB_PAGES.md) 設定。

系統自動連接內容页與互動頁，無須手改首頁、連結或課程清單。資料夾名稱開頭的三位數是課次，同一課次不能重複。`001` 已使用，下一堂請從 `002` 開始。

## 課程設定

```json
{
  "title": "課程標題",
  "date": "2026-09-30",
  "summary": "首頁卡片摘要",
  "author": "作者姓名",
  "class_name": "班級",
  "published": true,
  "interactive": "custom",
  "experiment_title": "互動頁標題"
}
```

- `interactive: "custom"`：使用同一資料夾的 `interactive.html`，缺少時停止建置並提示檔名。
- `interactive: "kmeans"`：使用已內建的 K-means 互動實驗室，不需另外放 `interactive.html`。僅適合 K-means 相關課程。
- `published: false`：暫不發布；資料夾名稱以 `_` 開頭也會略過。
- 修改或刪除課程後，提交即可更新或移除頁面。建置失敗時不部署，原先成功部署的網站不變。

上傳 Word 並不會自動產生新的演算法或翻譯 MATLAB。互動程式需隨課程一起準備；之後可把報告交給助手，請它製作完整課程資料夾。

## 檔案注意事項

Markdown 可用標題、清單、表格、程式區塊与圖片，圖片寫法為 `![說明](assets/圖片.png)`。Word 會擷取一般段落、內嵌圖片與表格；複雜版面、註解、頁首頁尾及浮動圖形不保證保留。程式建議用 Consolas 字型並保留換行。

自訂互動頁以獨立 iframe 顯示。請使用包含 CSS 和 JavaScript 的單一 `interactive.html`，如同範本，不依賴外部套件或相對路徑資源。互動頁不能操作父頁或讀取父頁儲存資料；允許自身腳本與檔案下載。這讓不同課程的樣式和程式互不干擾。

## 本機預覽

```powershell
python -m pip install -r requirements-pages.txt
python preview_local.py
```

瀏覽 `http://127.0.0.1:8000/`。修改檔案後重新啟動預覽，或執行 `python build_static.py` 再重新整理。

`python build_static.py` 產生公開 `docs` 與 `github-pages-ready.zip`；`python package_project.py` 產生含自動發布流程的 `github-project-ready.zip`。第一次放到 GitHub 請用後者。

原有本機資料庫與舊設定檔不再使用，也不會包含在 GitHub 原始碼部署包中。
