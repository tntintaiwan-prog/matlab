# GitHub 一次設定，之後新增課程資料夾即可

## 第一次設定

1. 解壓縮 `github-project-ready.zip`，將**裡面的檔案與資料夾**放到 GitHub 儲存庫根目錄；不要再多包一層 `matlab-learning-site` 資料夾。
2. 確認 `.github/workflows/pages.yml` 已上傳。這是必要的自動發布設定；部分檔案瀏覽器會隱藏以點開頭的資料夾。
3. 在儲存庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。本版本不使用「Deploy from a branch」的 `/docs` 設定。
4. 在 **Actions → Publish learning outcomes → Run workflow** 選擇 `main` 執行一次。如果剛提交檔案已觸發工作，也可等待該次完成。
5. 工作完成後，在 Pages 或部署紀錄查看網站網址。

本套設定使用 `main` 分支；若儲存庫用其他名稱，請修改 `.github/workflows/pages.yml` 的 `branches`。儲存庫根目錄應直接看到 `build_static.py`、`requirements-pages.txt`、`lessons`、`templates`、`static`、`.github`。

## 新增完整課程

複製 `lessons/_template` 為 `lessons/002-topic`，修改裡面的設定、課程內容與互動程式。完成後在 GitHub 上傳整個資料夾並提交。

每個資料夾自動建立：

- 首頁課程卡片
- `/courses/2/` 內容頁（包含 MATLAB 與 Python 程式）
- `/courses/2/lab/` 互動頁
- 兩頁之間的返回與前往連結

内容可選 `content.md` 或 `report.docx`。互動頁使用自備的 `interactive.html`，或設定 `interactive: "kmeans"` 重用既有 K-means 實驗室。單獨新增 Word 不會憑空產生新主題的互動程式。

修改、增加或刪除課程後，每次提交 `main` 都會重新建置並部署。首頁與課程清單不需手動維護。

## 排除問題

- **新課程沒出現**：確認有 `lesson.json`、內容檔案、互動設定，且 `published` 是 `true`，資料夾名稱不是 `_` 開頭。
- **Actions 出現紅色錯誤**：打開 build 工作，查看指出的檔名；常見原因是 JSON 格式錯誤、課次重複、日期格式不正確或缺少互動 HTML。修正後重新提交。
- **deploy 權限或 Pages 錯誤**：確認 Pages 的 Source 已設為 GitHub Actions，且儲存庫方案允許 Pages。首次使用尚需帳號端設定；此交付尚未實際上傳到你的 GitHub。
- **互動頁空白**：請先用 `_template` 的單檔互動頁作參考，勿依賴未一起發布的腳本、CSS 或需登入的服務。

建置流程只上傳 `docs` 中的公開網頁，不會上傳管理帳號、資料庫或 `.env`。圖文內容與互動 HTML 會公開，請只放入打算公開的課程。

[GitHub 官方工作流程說明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
