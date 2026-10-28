/* A fixed-answer typing trainer. It does not interpret or execute MATLAB. */
(function () {
'use strict';
const segments = [
 {title:'初始化與偵測器', weight:10, goals:['清空命令視窗與工作區。','使用第 1 台攝影機；Dld 使用大型 RetinaFace 網路。','Mld 為 Haar 偵測器，MergeThreshold 設為 5。'], code:`clc;
clear;
cam = webcam(1);
Dld = faceDetector('large-network');
Mld = vision.CascadeObjectDetector();
Threshold = 5;
Mld.MergeThreshold = Threshold;`},
 {title:'視窗與停止按鈕', weight:20, goals:['標題固定使用「班級／學號／姓名 | 雙演算法人臉偵測」。','建立停止按鈕；寫入與初始化的鍵名必須相同。'], code:`fig = figure('Name','班級／學號／姓名 | 雙演算法人臉偵測','NumberTitle','off');
stopBtn = uicontrol('Style','pushbutton', ...
    'String','停止偵測', ...
    'Position',[20 20 100 40], ...
    'FontSize',12, ...
    'Callback',@(src,event)setappdata(fig,'stopFlag',true));
setappdata(fig,'stopFlag',false);`},
 {title:'迴圈與影像擷取', weight:15, goals:['以 try 包住偵測迴圈。','視窗存在時持續執行；按停止時 break。','擷取並左右翻轉同一張畫面，存於 image。'], code:`try
    while ishandle(fig)
        if getappdata(fig,'stopFlag')
            break;
        end
        image = fliplr(snapshot(cam));`},
 {title:'雙演算法與人臉框', weight:20, goals:['RetinaFace 使用 detect，Haar 使用 step。','先保留原影像，僅在框非空時加標記。','本練習 RetinaFace 紅框，Haar 綠框；實際依監評指定。'], code:`        [bboxes,scores] = detect(Dld,image);
        Dld_image = image;
        if ~isempty(bboxes)
            Dld_image = insertObjectAnnotation(image,'rectangle', ...
                bboxes,'Detected','FontSize',20,'Color','red', ...
                'LineWidth',5,'TextColor','white');
        end
        bbox = step(Mld,image);
        Mld_image = image;
        if ~isempty(bbox)
            Mld_image = insertObjectAnnotation(image,'rectangle', ...
                bbox,'Detected','FontSize',20,'Color','green', ...
                'LineWidth',5,'TextColor','white');
        end`},
 {title:'左右畫面與計數', weight:25, goals:['左側 RetinaFace，右側 Haar，明確顯示演算法名稱。','以框矩陣列數計算人臉數，沒有框時顯示 0。','只在 Haar 標示 MergeThreshold。'], code:`        subplot(1,2,1,'Parent',fig);
        imshow(Dld_image);
        title(['RetinaFace 人臉數量：' num2str(size(bboxes,1))]);
        xlabel('深度學習 / RetinaFace');
        subplot(1,2,2,'Parent',fig);
        imshow(Mld_image);
        title(['Haar 人臉數量：' num2str(size(bbox,1))]);
        xlabel(['Haar / MergeThreshold = ' num2str(Threshold)]);`},
 {title:'更新、結束與清理', weight:10, goals:['drawnow 更新畫面並處理按鈕事件。','正確關閉 while、try/catch 結構。','正常停止及例外時皆清除 cam；例外仍重新拋出。'], code:`        drawnow;
    end
catch ME
    clear cam;
    if isgraphics(fig)
        close(fig);
    end
    rethrow(ME);
end
clear cam;
if isgraphics(fig)
    close(fig);
end
disp('程式結束');`}
];
const fullCode = segments.map(s=>s.code).join('\n\n');
const library = [
 ['clc','clc','清空命令視窗。'],['clear','clear cam','移除變數；clear cam 釋放攝影機。'],['webcam','cam = webcam(1)','連接指定攝影機。'],['snapshot','image = snapshot(cam)','擷取一張攝影機影像。'],['fliplr','B = fliplr(A)','左右翻轉陣列或影像。'],
 ['faceDetector',"Dld = faceDetector('large-network')",'建立 RetinaFace 人臉偵測器。'],['vision.CascadeObjectDetector','Mld = vision.CascadeObjectDetector()','建立 Haar 級聯人臉偵測器。'],['detect','[bboxes,scores] = detect(Dld,image)','取得 RetinaFace 人臉框及信心分數。'],['step','bbox = step(Mld,image)','取得 Haar 偵測框。'],['figure',"fig = figure('Name',...)",'建立圖形視窗。'],['uicontrol',"uicontrol('Style','pushbutton',...)",'建立按鈕或其他控制元件。'],['setappdata',"setappdata(fig,'stopFlag',false)",'儲存視窗附加資料。'],['getappdata',"getappdata(fig,'stopFlag')",'讀取視窗附加資料。'],['ishandle','ishandle(fig)','判斷圖形控制代碼是否存在。'],['isgraphics','isgraphics(fig)','判斷是否為有效圖形物件。'],['isempty','isempty(bboxes)','判斷是否為空陣列。'],['insertObjectAnnotation',"insertObjectAnnotation(image,'rectangle',bboxes,'Detected',...)",'在影像加上方框與文字。'],['insertShape',"insertShape(image,'Rectangle',bboxes)",'在影像加入形狀；此練習答案使用 insertObjectAnnotation。'],['subplot',"subplot(1,2,1,'Parent',fig)",'建立或選取子圖區域。'],['imshow','imshow(image)','顯示影像。'],['title','title(text)','設定目前圖軸標題。'],['xlabel','xlabel(text)','設定目前圖軸下方標籤。'],['num2str','num2str(value)','把數值轉為字元。'],['size','size(bboxes,1)','取得第 1 維大小，即框的列數。'],['drawnow','drawnow','更新圖形並處理事件。'],['close','close(fig)','關閉指定視窗。'],['disp',"disp('程式結束')",'輸出訊息。'],['rethrow','rethrow(ME)','重新拋出已捕捉的例外。'],
 ['while','while condition','條件成立時重複執行；以 end 結束。'],['if','if condition','條件判斷；以 end 結束。'],['break','break','離開最內層迴圈。'],['try','try','開始例外處理區塊。'],['catch','catch ME','接收例外物件。'],['end','end','結束 if、while 或 try/catch 區塊。'],['true','true','邏輯真。'],['false','false','邏輯假。'],
 ['MergeThreshold','Mld.MergeThreshold = Threshold','Haar 合併門檻，預設 4；不是 RetinaFace 信心門檻。'],['Name',"'Name','視窗名稱'",'figure 的視窗名稱屬性。'],['NumberTitle',"'NumberTitle','off'",'關閉視窗標題的編號。'],['Style',"'Style','pushbutton'",'控制元件類型。'],['String',"'String','停止偵測'",'按鈕文字。'],['Position',"'Position',[20 20 100 40]",'左下角位置、寬、高。'],['FontSize',"'FontSize',12",'文字大小。'],['Callback',"'Callback',@(src,event)...",'按鈕回呼函式。'],['Color',"'Color','red'",'框線顏色。'],['LineWidth',"'LineWidth',5",'框線寬度。'],['TextColor',"'TextColor','white'",'標記文字顏色。'],['Parent',"'Parent',fig",'指定父視窗。']
];
// Tokenize without changing string contents or case; comments and layout are ignored.
function lex(source) {
 const out=[]; let i=0,line=1,previous='',matrixDepth=0;
 while(i<source.length){
  const c=source[i];
  if(c==='\n'){line++;i++;continue;}
  if(/\s/.test(c)){i++;continue;}
  if(source.startsWith('%{',i) && source.slice(source.lastIndexOf('\n',i-1)+1,i).trim()===''){
   const finish=source.indexOf('%}',i+2); const end=finish<0?source.length:finish+2;
   line+=(source.slice(i,end).match(/\n/g)||[]).length;i=end;continue;
  }
  if(c==='%'){while(i<source.length&&source[i]!=='\n')i++;continue;}
  if(source.startsWith('...',i)){while(i<source.length&&source[i]!=='\n')i++;continue;}
  if(c===';'&&matrixDepth===0){i++;continue;}
  const start=i, atLine=line;
  const transpose=c==="'" && /[\w)\]}']$/.test(previous) && i>0 && !/\s/.test(source[i-1]);
  if((c==="'"&&!transpose)||c==='"'){
   i++;while(i<source.length){if(source[i]==='\n')line++;if(source[i]===c){if(source[i+1]===c){i+=2;continue;}i++;break;}i++;}
  }else if(/[A-Za-z_]/.test(c)){i++;while(i<source.length&&/[\w]/.test(source[i]))i++;}
  else if(/[0-9]/.test(c)){i++;while(i<source.length&&/[\d.]/.test(source[i]))i++;}
  else if(['==','~=','<=','>=','&&','||','.*','./','.^'].includes(source.slice(i,i+2)))i+=2;
  else i++;
  const value=source.slice(start,i);if(value==='[')matrixDepth++;if(value===']')matrixDepth=Math.max(0,matrixDepth-1);out.push({value,line:atLine});previous=value;
 }
 return out;
}
function compare(actual, expected) {
 const a=lex(actual), b=lex(expected), n=a.length,m=b.length;
 if(n>3500||actual.length>70000)return {score:0,differences:[{type:'limit',line:1,actual:'輸入過長',expected:'請將輸入控制於 70,000 字內。'}],distance:m,total:m};
 const rows=Array.from({length:n+1},()=>new Uint16Array(m+1));
 for(let i=0;i<=n;i++)rows[i][0]=i;for(let j=0;j<=m;j++)rows[0][j]=j;
 for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(a[i-1].value===b[j-1].value?0:1));
 let i=n,j=m,differences=[];
 while(i||j){
  if(i&&j&&a[i-1].value===b[j-1].value){i--;j--;}
  else if(i&&j&&rows[i][j]===rows[i-1][j-1]+1){differences.push({type:'replace',line:a[i-1].line,actual:a[i-1].value,expected:b[j-1].value});i--;j--;}
  else if(j&&rows[i][j]===rows[i][j-1]+1){differences.push({type:'missing',line:a[i-1]?.line||1,actual:'（缺少）',expected:b[j-1].value});j--;}
  else {differences.push({type:'extra',line:a[i-1].line,actual:a[i-1].value,expected:'（不需要）'});i--;}
 }
 return {score:Math.max(0,Math.min(rows[n][m]?99:100,Math.round((1-rows[n][m]/Math.max(m,n,1))*100))),differences:differences.reverse(),distance:rows[n][m],total:m};
}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function highlight(source){
 const pattern=/(%[^\n]*|'(?:[^'\n]|'')*'|"(?:[^"\n]|"")*"|\b(?:if|else|elseif|end|while|for|break|try|catch|function|return|true|false)\b|\b\d+(?:\.\d+)?\b)/g;
 let out='',last=0;for(const match of source.matchAll(pattern)){out+=escapeHTML(source.slice(last,match.index));const word=match[0],type=word[0]==='%'?'comment':/^['"]/.test(word)?'string':/^\d/.test(word)?'number':'keyword';out+=`<span class="tok-${type}">${escapeHTML(word)}</span>`;last=match.index+word.length;}return out+escapeHTML(source.slice(last))+'\n';
}
// Expose the pure checker for offline regression tests, without needing a browser.
if(typeof module!=='undefined'&&module.exports){module.exports={segments,fullCode,lex,compare,highlight,library};return;}
const $=id=>document.getElementById(id), KEY='matlab-final-trainer-v1';
const blank=()=>({version:1,sections:segments.map(()=>({draft:'',streak:0,attempts:0,mistake:false,assisted:false,graded:false})),history:[],checks:[],exam:null});
function validState(s){return s&&s.version===1&&Array.isArray(s.sections)&&s.sections.length===6&&s.sections.every(x=>x&&typeof x.draft==='string'&&x.draft.length<=70000&&Number.isInteger(x.streak)&&x.streak>=0&&x.streak<=2&&Number.isInteger(x.attempts)&&x.attempts>=0&&typeof x.mistake==='boolean'&&typeof x.assisted==='boolean'&&typeof x.graded==='boolean')&&Array.isArray(s.history)&&s.history.length<=30&&s.history.every(x=>x&&typeof x.date==='string'&&Number.isFinite(x.score)&&Array.isArray(x.sections)&&x.sections.length===6&&x.sections.every(v=>Number.isFinite(v)&&v>=0&&v<=100))&&Array.isArray(s.checks)&&s.checks.every(x=>typeof x==='boolean')&&(!s.exam||(typeof s.exam.draft==='string'&&s.exam.draft.length<=70000&&Number.isFinite(s.exam.start)&&s.exam.start>0&&s.exam.start<=Date.now()&&typeof s.exam.submitted==='boolean'));}
let state=blank(),storageOK=true;
try{const saved=localStorage.getItem(KEY);if(saved){const parsed=JSON.parse(saved);if(validState(parsed))state=parsed;else $('storage-status').textContent='舊紀錄格式不相容，已開啟新的練習。';}}catch(e){storageOK=false;}
let mode=state.exam&&!state.exam.submitted?'exam':'study',selected=0,completion=[],completionIndex=0,completionStart=0,rendering=false;
const editor=$('code-input');
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;$('storage-status').textContent='草稿與進度已儲存於此瀏覽器。';}catch(e){storageOK=false;$('storage-status').textContent='此瀏覽器目前無法保存資料，請用下方「匯出進度」備份；關閉頁面後可能遺失。';}}
function closeCompletion(){$('completion-popup').hidden=true;editor.removeAttribute('aria-activedescendant');completion=[];}
function syncEditor(){
 $('code-highlight').querySelector('code').innerHTML=highlight(editor.value);
 $('line-numbers').textContent=Array.from({length:editor.value.split('\n').length},(_,i)=>i+1).join('\n');
 $('code-highlight').scrollTop=editor.scrollTop;$('code-highlight').scrollLeft=editor.scrollLeft;$('line-numbers').scrollTop=editor.scrollTop;
}
function storeDraft(){if(mode==='exam'){if(state.exam&&!state.exam.submitted)state.exam.draft=editor.value;}else state.sections[selected].draft=editor.value;persist();}
function assisted(){if(mode!=='exam'){state.sections[selected].assisted=true;persist();}}
function refreshStats(){const count=state.sections.filter(s=>s.streak>=2).length;$('mastery-count').textContent=`${count} / 6`;$('mastery-progress').value=count;
 $('history').innerHTML=state.history.length?state.history.slice().reverse().map(h=>`<div class="history-item"><strong>${escapeHTML(h.score)}% 默寫符合率</strong> · ${escapeHTML(new Date(h.date).toLocaleString('zh-TW'))}<br>各段：${h.sections.map((v,i)=>`${i+1} 段 ${v}%`).join(' · ')}</div>`).join(''):'<p>還沒有完整測驗紀錄。先從分段練習開始吧。</p>';
}
function renderSidebar(){
 const list=$('segment-list');list.innerHTML='';
 if(mode==='exam'){list.innerHTML='<div class="side-note"><strong>完整默寫挑戰</strong><p>初始化 → 控制視窗 → 影像迴圈 → 人臉框 → 顯示 → 結束清理。</p><p>倒數持續計時，重新整理不會重設。測驗時可自由打字，不提供自動完成提示。</p><p>各段權重：10 / 20 / 15 / 20 / 25 / 10，僅用於默寫評分。</p></div>';return;}
 segments.forEach((s,i)=>{const p=state.sections[i];if(mode==='mistakes'&&!p.mistake)return;const btn=document.createElement('button');btn.className=i===selected?'selected':'';btn.innerHTML=`<span>${String(i+1).padStart(2,'0')} ${escapeHTML(s.title)}</span><small>${p.streak>=2?'✓ 已背熟':`${p.streak} / 2 次無提示全對`} · ${p.attempts} 次檢查${p.mistake?' · 待複習':''}</small>`;btn.setAttribute('aria-current',i===selected?'step':'false');btn.onclick=()=>{storeDraft();selected=i;render();};list.append(btn);});
 if(mode==='mistakes'&&!state.sections.some(s=>s.mistake))list.innerHTML='<div class="empty-note">目前沒有錯題。可回分段默寫繼續練習。</div>';
}
function render(){
 rendering=true;closeCompletion();refreshStats();renderSidebar();
 document.querySelectorAll('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===mode));b.disabled=!!(state.exam&&!state.exam.submitted&&b.dataset.mode!=='exam');});
 const isExam=mode==='exam',active=isExam&&state.exam&&!state.exam.submitted;
 $('exam-controls').hidden=!isExam;$('reference').hidden=isExam;$('timer').hidden=!active;
 $('new-round').hidden=isExam;$('hint-button').hidden=isExam;$('check-code').hidden=isExam;$('submit-exam').hidden=!active;$('submit-exam').textContent='交卷評分';$('cancel-submit').hidden=true;
 $('autocomplete-toggle').disabled=isExam;$('autocomplete-toggle').checked=mode==='study';
 $('reference').open=mode==='study';$('feedback').hidden=true;
 $('start-exam').hidden=!!active;$('start-exam').textContent=state.exam?.submitted?'重新開始 60 分鐘測驗':'開始完整測驗';
 $('mode-label').textContent=({study:'READ & UNDERSTAND',recall:'RECALL WITHOUT LOOKING',mistakes:'REVIEW YOUR MISTAKES',exam:'60 MINUTE CHALLENGE'})[mode];
 $('task-title').textContent=isExam?'完整程式默寫':`${String(selected+1).padStart(2,'0')} / ${segments[selected].title}`;
 $('task-prompt').textContent=isExam?'將六段程式按順序寫成完整程式，計時結束會自動交卷。':mode==='study'?'先閱讀流程與答案，再切到分段默寫。學習模式的練習不計入背熟次數。':'依下列條件默寫。兩個獨立回合無提示全對，才記為已背熟。';
 $('task-goals').innerHTML=isExam?'':segments[selected].goals.map(g=>`<li>${escapeHTML(g)}</li>`).join('');
 $('reference-code').textContent=isExam?'':segments[selected].code;
 editor.value=isExam?(state.exam?.draft||''):state.sections[selected].draft;editor.disabled=isExam&&!active;
 $('editor-label').textContent=isExam?'｜完整測驗':'｜練習草稿';
 if(mode==='study')state.sections[selected].assisted=true;
 $('exam-state').textContent=active?'測驗進行中，草稿持續保存。':state.exam?.submitted?'上一次測驗已交卷。可查看下方評分，或重新開始。':'按開始後才會啟動倒數。';
 if(mode==='mistakes'&&!state.sections.some(s=>s.mistake)){$('editor-area').hidden=true;document.querySelector('.trainer-actions').hidden=true;$('reference').hidden=true;$('task-goals').innerHTML='';$('task-prompt').textContent='目前沒有待複習的段落。';}else{$('editor-area').hidden=false;document.querySelector('.trainer-actions').hidden=false;}
 syncEditor();rendering=false;persist();
 if(isExam&&state.exam?.submitted)showExamResult(false);
 tick();
}
function differenceHTML(d){const why=d.type==='missing'?'缺少內容':d.type==='extra'?'多出內容':d.type==='limit'?'輸入限制':d.actual.toLowerCase()===d.expected.toLowerCase()?'大小寫不同':'與練習答案不同';return `<div class="difference"><strong>你的第 ${d.line} 行 · ${why}</strong><br>輸入：<code>${escapeHTML(d.actual)}</code><br>參考：<code class="expected">${escapeHTML(d.expected)}</code></div>`;}
function checkSection(hintOnly=false){
 if(mode==='exam')return;storeDraft();const p=state.sections[selected],result=compare(editor.value,segments[selected].code);
 if(hintOnly){assisted();$('feedback').innerHTML='<h3>下一個差異</h3><p>本回合已標記為輔助練習。</p>'+(result.differences[0]?differenceHTML(result.differences[0]):'<p>目前與參考答案一致。</p>');}
 else {
  const eligible=!p.graded&&!p.assisted&&mode!=='study';
  if(!p.graded){p.attempts++;p.graded=true;if(result.score===100&&!result.differences.length){p.mistake=false;if(eligible)p.streak=Math.min(2,p.streak+1);}else{p.mistake=true;p.streak=0;}}
  let note=result.differences.length?'請依下方差異修正，再清空重新默寫。':eligible?'這次獨立默寫完全正確，已計入背熟次數。':'目前與練習答案一致。此回合曾參考答案／提示或已評分，不增加背熟次數。';
  $('feedback').innerHTML=`<h3><span class="score">${result.score}%</span> 默寫符合率</h3><p>${note}</p><p>此段進度：${p.streak} / 2。每回合只計分一次；按「清空並重新默寫」開始新回合。</p>${result.differences.slice(0,30).map(differenceHTML).join('')}${result.differences.length>30?'<p>先顯示前 30 個差異；修正後再檢查。</p>':''}`;
 }
 $('feedback').hidden=false;refreshStats();renderSidebar();persist();
}
function showExamResult(record=true){
 const exam=state.exam;if(!exam)return;
 const whole=lex(exam.draft), target=segments.flatMap((s,index)=>lex(s.code).map(t=>({...t,index})));
 // Align the whole program once, retaining the expected section for weighted scores.
 const n=whole.length,m=target.length, errors=segments.map(()=>0),totals=segments.map(s=>lex(s.code).length);
 if(n>3500||exam.draft.length>70000)errors.fill(9999);
 else {const dp=Array.from({length:n+1},()=>new Uint16Array(m+1));for(let i=0;i<=n;i++)dp[i][0]=i;for(let j=0;j<=m;j++)dp[0][j]=j;for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(whole[i-1].value===target[j-1].value?0:1));let i=n,j=m;while(i||j){if(i&&j&&whole[i-1].value===target[j-1].value){i--;j--;}else{errors[target[Math.max(0,j-1)]?.index||0]++;if(i&&j&&dp[i][j]===dp[i-1][j-1]+1){i--;j--;}else if(j&&dp[i][j]===dp[i][j-1]+1)j--;else i--;}}}
 const scores=totals.map((n,i)=>Math.max(0,Math.min(errors[i]?99:100,Math.round((1-errors[i]/n)*100)))), score=Math.min(errors.some(Boolean)?99:100,Math.round(scores.reduce((sum,s,i)=>sum+s*segments[i].weight/100,0)));
 if(record){state.history.push({date:new Date().toISOString(),score,sections:scores});state.history=state.history.slice(-30);scores.forEach((s,i)=>{if(s<100)state.sections[i].mistake=true;});persist();refreshStats();}
 const result=compare(exam.draft,fullCode);
 $('feedback').innerHTML=`<h3><span class="score">${score}%</span> 完整默寫符合率</h3><p>這是參考答案的加權符合率，不能換算成正式實機考試成績。完整測驗不增加分段背熟次數。</p><ul>${scores.map((s,i)=>`<li>${i+1}. ${escapeHTML(segments[i].title)}：${s}%（權重 ${segments[i].weight}%）</li>`).join('')}</ul>${result.differences.length?result.differences.slice(0,30).map(differenceHTML).join(''):'<p>完整程式與練習答案一致。</p>'}<details><summary>交卷後檢視完整練習答案</summary><pre>${escapeHTML(fullCode)}</pre></details>`;
 $('feedback').hidden=false;
}
function finishExam(){if(!state.exam||state.exam.submitted)return;state.exam.draft=editor.value;state.exam.submitted=true;persist();render();showExamResult(true);}
function tick(){if(mode!=='exam'||!state.exam||state.exam.submitted)return;const remaining=Math.max(0,3600000-(Date.now()-state.exam.start));const secs=Math.ceil(remaining/1000);$('timer').textContent=`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;$('timer').classList.toggle('urgent',secs<=300);if(!remaining)finishExam();}
function updateCompletion(force=false){
 if(mode==='exam'||!$('autocomplete-toggle').checked){closeCompletion();return;}
 const pos=editor.selectionStart;if(pos!==editor.selectionEnd){closeCompletion();return;}
 const before=editor.value.slice(0,pos),match=before.match(/[A-Za-z_][\w.]*$/),prefix=match?.[0]||'';
 if(!prefix&&!force){closeCompletion();return;}
 completionStart=pos-prefix.length;
 // Avoid suggesting functions while writing comments; properties inside quotes are allowed.
 if(before.slice(before.lastIndexOf('\n')+1).trimStart().startsWith('%')){closeCompletion();return;}
 let searchPrefix=prefix;
 if(prefix.includes('.')&&!prefix.startsWith('vision.')){searchPrefix=prefix.split('.').pop();completionStart=pos-searchPrefix.length;}
 const variables=['cam','Dld','Mld','Threshold','fig','stopBtn','image','bboxes','scores','Dld_image','bbox','Mld_image'].map(name=>[name,name,'練習程式中的變數；拼字及大小寫需一致。']);
 completion=[...library,...variables].filter(row=>row[0].toLowerCase().startsWith(searchPrefix.toLowerCase())&&row[0]!==searchPrefix).slice(0,7);
 if(!completion.length){closeCompletion();return;}completionIndex=0;assisted();drawCompletion();
 const lines=before.split('\n'),top=Math.max(36,Math.min(235,14+lines.length*23-editor.scrollTop));$('completion-popup').style.top=top+'px';
}
function drawCompletion(){
 $('completion-list').innerHTML=completion.map((row,i)=>`<button type="button" role="option" id="completion-${i}" aria-selected="${i===completionIndex}" data-completion="${i}">${escapeHTML(row[0])}</button>`).join('');
 $('completion-help').textContent=completion[completionIndex][1]+'\n'+completion[completionIndex][2];$('completion-popup').hidden=false;editor.setAttribute('aria-activedescendant',`completion-${completionIndex}`);
}
function acceptCompletion(){const chosen=completion[completionIndex];if(!chosen)return;const tail=editor.value.slice(editor.selectionStart).match(/^\w*/)[0];editor.setRangeText(chosen[0],completionStart,editor.selectionStart+tail.length,'end');closeCompletion();syncEditor();storeDraft();editor.focus();}
editor.addEventListener('input',()=>{if(editor.value.length>70000)editor.value=editor.value.slice(0,70000);syncEditor();storeDraft();updateCompletion();});
editor.addEventListener('scroll',()=>{syncEditor();closeCompletion();});
editor.addEventListener('click',()=>closeCompletion());
editor.addEventListener('keydown',e=>{
 if(e.isComposing)return;
 if((e.ctrlKey||e.metaKey)&&e.code==='Space'){e.preventDefault();updateCompletion(true);return;}
 if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();if(mode!=='exam')checkSection();return;}
 if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&completion.length){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();completionIndex=(completionIndex+(e.key==='ArrowDown'?1:-1)+completion.length)%completion.length;drawCompletion();return;}if(e.key==='Tab'){e.preventDefault();acceptCompletion();return;}if(e.key==='Escape'){e.preventDefault();closeCompletion();return;}}
 if(e.key==='Tab'){e.preventDefault();editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');syncEditor();storeDraft();closeCompletion();}
 if(e.key==='Enter'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();const start=editor.selectionStart,line=editor.value.slice(0,start).split('\n').pop(),indent=line.match(/^\s*/)[0],extra=/^\s*(if|while|for|try|catch|else|elseif|function)\b/.test(line)?'    ':'';editor.setRangeText('\n'+indent+extra,start,editor.selectionEnd,'end');closeCompletion();syncEditor();storeDraft();}
});
$('completion-list').addEventListener('mousedown',e=>{const b=e.target.closest('[data-completion]');if(b){e.preventDefault();completionIndex=Number(b.dataset.completion);acceptCompletion();}});
document.addEventListener('mousedown',e=>{if(!e.target.closest('.editor-wrap'))closeCompletion();});
$('autocomplete-toggle').onchange=()=>{closeCompletion();if($('autocomplete-toggle').checked)assisted();};
$('reference').addEventListener('toggle',()=>{if(!rendering&&$('reference').open)assisted();});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{storeDraft();mode=b.dataset.mode;if(mode==='mistakes'){const first=state.sections.findIndex(s=>s.mistake);if(first>=0)selected=first;}render();});
$('check-code').onclick=()=>checkSection();$('hint-button').onclick=()=>checkSection(true);
$('new-round').onclick=()=>{if(editor.value&&!confirm('清空這一段草稿，開始新的默寫回合？已取得的熟練度會保留。'))return;state.sections[selected].draft='';state.sections[selected].assisted=mode==='study';state.sections[selected].graded=false;render();editor.focus();};
$('start-exam').onclick=()=>{if(state.exam?.submitted&&!confirm('開始新測驗？上一份交卷程式將被取代，歷史分數仍保留。'))return;state.exam={draft:'',start:Date.now(),submitted:false};persist();render();editor.focus();};
$('submit-exam').onclick=()=>{if(!$('cancel-submit').hidden){finishExam();return;}$('submit-exam').textContent='確認交卷並停止編輯';$('cancel-submit').hidden=false;};
$('cancel-submit').onclick=()=>{$('cancel-submit').hidden=true;$('submit-exam').textContent='交卷評分';editor.focus();};
const checklist=['攝影機持續擷取同一畫面，兩種演算法同時顯示。','視窗含班級／學號／姓名，兩側標示演算法名稱。','依監評指定框色，無人臉時兩側顯示 0。','紙本多人臉圖由攝影機拍攝；正確框住實際人臉。','至少調整兩次 MergeThreshold，記錄正確／漏檢／誤檢數。','停止按鈕、關閉視窗正常結束，釋放攝影機。','依要求完成程式註解，並於 MATLAB 驗證後存成 .mlx。'];
function renderChecks(){$('acceptance').innerHTML='';checklist.forEach((text,i)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!!state.checks[i];input.onchange=()=>{state.checks=checklist.map((_,n)=>n===i?input.checked:!!state.checks[n]);persist();};label.append(input,document.createTextNode(text));$('acceptance').append(label);});}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download-code').onclick=()=>{if(state.exam&&!state.exam.submitted){alert('完整測驗進行中，交卷後才能下載答案。');return;}assisted();download('% 練習參考答案，未在實體 MATLAB 與攝影機驗證。\n% 身分標題與框色請依考試要求修改。\n'+fullCode+'\n','final_practice.m','text/plain;charset=utf-8');};
$('export-progress').onclick=()=>{storeDraft();download(JSON.stringify(state,null,2),'matlab-practice-progress.json','application/json');};
$('import-progress').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1500000)throw Error('檔案過大');const parsed=JSON.parse(await file.text());if(!validState(parsed))throw Error('進度格式不相容');if(!confirm('匯入會取代目前的全部練習紀錄，是否繼續？'))return;state=parsed;mode=state.exam&&!state.exam.submitted?'exam':'recall';persist();renderChecks();render();}catch(err){alert('無法匯入：'+err.message);}finally{e.target.value='';}};
let resetArmed=false;
$('reset-progress').onclick=()=>{if(!resetArmed){resetArmed=true;$('reset-progress').textContent='再次點選，清除全部紀錄（無法復原）';setTimeout(()=>{resetArmed=false;$('reset-progress').textContent='清除全部練習紀錄';},6000);return;}state=blank();mode='study';selected=0;resetArmed=false;$('reset-progress').textContent='清除全部練習紀錄';persist();renderChecks();render();};
window.addEventListener('beforeunload',()=>storeDraft());
window.addEventListener('pageshow',()=>tick());
renderChecks();render();setInterval(tick,1000);
})();
