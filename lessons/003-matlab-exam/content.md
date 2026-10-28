# 人臉偵測期末練習

根據提供的期末試題照片與 deeplearning.docx 整理。先理解流程，再分六段默寫，最後進行 60 分鐘完整測驗。互動頁自動保存草稿、分段熟練度與最近測驗紀錄於目前瀏覽器，可匯出紀錄備份。

## 開始練習

點選上方「開始背程式與測驗」，依序完成初始化、控制視窗、影像迴圈、人臉偵測、結果顯示、結束清理。每段兩次獨立、未查看提示且完全正確的練習後，標示為已背熟。

## 原稿需要修正

| 原稿 | 修正與原因 |
| --- | --- |
| stopFlage | 改為 stopFlag，初始化、按鈕與迴圈必須讀寫相同鍵名。 |
| RetinaFance | 改為 RetinaFace，顯示文字拼字錯誤。 |
| Hear Like Feature | 改為 Haar-like features，註解拼字錯誤。 |
| Wecom、Packagea、及時、減查 | 分別改為 Webcam、Packages、即時、檢查。 |
| MergeThreshold 範圍 0 至 10 | 官方未限定上限為 10；預設 4。提高通常減少誤檢，也可能增加漏檢。 |
| RetinaFace 標示相同 Threshold | 原稿僅把此值設定到 Haar，不應說成 RetinaFace 的門檻。 |
| 視窗標題缺身分資料 | 實際應填入班級、學號與姓名；練習使用固定文字「班級／學號／姓名」。 |

## 練習版的範圍

練習答案保留原稿變數，補上停止旗標、空偵測處理、演算法名稱、身分標題與例外清理。左邊 RetinaFace 紅框、右邊 Haar 綠框只是練習設定，考試依監評指定顏色修改。

這是固定參考答案的詞元比對，不是 MATLAB 編譯器。空白、換行、行尾分號、一般註解、續行符號和字串外的縮排不計入拼字差異；字串、大小寫、變數與邏輯符號會檢查。合法的等效 MATLAB 寫法可能與此練習答案不同，提示只代表「與練習答案不同」，不能據此判定無法執行。

本網站不執行 MATLAB、不啟用攝影機、不模擬真實人臉偵測結果。完整測驗的分數是默寫符合率，不是試題正式的 100 分驗收成績；實體攝影機、模型、框色及紙本多人臉測試需在 MATLAB 現場驗證。

## 實機驗收

正式試題配分為攝影機 5 分、人臉偵測 55 分、紙本測試與參數調整 30 分、操作與程式品質 10 分，80 分及格。必須使用同一攝影機畫面、正確顯示兩種演算法與 0 人臉數、正常停止及釋放資源，並至少調整兩次 MergeThreshold、記錄正確偵測與漏檢及誤檢。驗收數量和框色以監評公布為準。

課前練習可使用本網站；正式考試依試題規定離線、自行建立 .mlx 並從零撰寫。

## 官方資料

- [Haar CascadeObjectDetector 與 MergeThreshold](https://www.mathworks.com/help/vision/ref/vision.cascadeobjectdetector-system-object.html)
- [RetinaFace faceDetector](https://www.mathworks.com/help/vision/ref/facedetector.html)
- [RetinaFace detect 的信心門檻](https://www.mathworks.com/help/vision/ref/facedetector.detect.html)
