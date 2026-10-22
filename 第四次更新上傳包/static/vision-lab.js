import {gestureName, winner} from './vision-rules.mjs';
const $ = id => document.getElementById(id);
const app=$('vision-app'), video=$('vision-video'), canvas=$('vision-canvas'), ctx=canvas.getContext('2d');
let mode=app.dataset.extension==='true'?'image':'video', stream=null, model=null, image=null;
let generation=0, animation=0, round=0, busy=false, lastFrame=-1, lastTick=0, stable=null, stableSince=0, seen=0;
let scores={player:0,computer:0,draw:0};
const names=['石頭','布','剪刀'];
const say=text=>{$('vision-status').textContent=text;};
function score(){ $('game-score').textContent=`你 ${scores.player} 勝 · 電腦 ${scores.computer} 勝 · 平手 ${scores.draw} 次`; }
function stop(){
  generation++; cancelAnimationFrame(animation); clearInterval(round); round=0;
  stream?.getTracks().forEach(t=>t.stop()); stream=null;
  video.pause(); video.srcObject=null; model?.close(); model=null;
  stable=null; stableSince=0; seen=0; busy=false;
  $('camera-start').disabled=false; $('camera-stop').disabled=true; $('play-round').disabled=true;
  $('game-result').textContent='回合尚未開始。';
}
function clear(){ctx.clearRect(0,0,canvas.width,canvas.height);$('vision-result').textContent='尚無偵測結果';}
function failure(error){
  stop();
  const messages={NotAllowedError:'攝影機權限未開啟。請在網址列允許攝影機，再重試。',NotFoundError:'找不到攝影機，請連接裝置。',NotReadableError:'攝影機可能正被其他程式使用，請關閉後重試。'};
  say(messages[error.name] || '無法啟動偵測。請確認網路可下載模型，並使用新版 Chrome、Edge 或 Safari 後重試。');
}
async function createModel(kind){
  const mp=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');
  const files=await mp.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
  if(kind==='game') return mp.GestureRecognizer.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'},runningMode:'VIDEO',numHands:2});
  return mp.FaceDetector.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'},runningMode:kind==='image'?'IMAGE':'VIDEO',minDetectionConfidence:Number($('confidence').value)});
}
function draw(source,result,mirror=false){
  const w=source.videoWidth || source.width, h=source.videoHeight || source.height;
  if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.save(); if(mirror){ctx.translate(w,0);ctx.scale(-1,1);} ctx.drawImage(source,0,0,w,h);ctx.restore();
  ctx.strokeStyle='#ff5959';ctx.lineWidth=Math.max(2,w/250);ctx.font=`${Math.max(15,w/40)}px sans-serif`;
  for(const d of result.detections || []){
    const b=d.boundingBox, x=mirror?w-b.originX-b.width:b.originX;
    ctx.strokeRect(x,b.originY,b.width,b.height);
    const label=`人臉 ${Math.round(d.categories[0].score*100)}%`;
    ctx.fillStyle='#8b1522';ctx.fillRect(x,Math.max(0,b.originY-28),145,28);
    ctx.fillStyle='white';ctx.fillText(label,x+4,Math.max(22,b.originY-7));
  }
  for(const hand of result.landmarks || []) for(const p of hand){ctx.beginPath();ctx.arc((mirror?1-p.x:p.x)*w,p.y*h,4,0,2*Math.PI);ctx.fillStyle='#9bf1b5';ctx.fill();}
}
function frame(now){
  if(!stream || !model) return;
  try{
    if(video.readyState>=2 && video.currentTime!==lastFrame && now-lastTick>=100){
      lastFrame=video.currentTime;lastTick=now;
      const result=mode==='game'?model.recognizeForVideo(video,now):model.detectForVideo(video,now);
      draw(video,result,true);
      if(mode==='game'){
        const hand=gestureName(result);
        if(hand!==stable){stable=hand;stableSince=now;} seen=now;
        $('vision-result').textContent=hand?`目前手勢：${hand}`:'請以一隻手清楚比出剪刀、石頭或布';
      }else $('vision-result').textContent=`偵測到 ${result.detections.length} 張人臉`;
    }
    animation=requestAnimationFrame(frame);
  }catch(error){failure(error);}
}
$('camera-start').addEventListener('click',async()=>{
  if(busy || stream) return;
  stop(); const token=generation; busy=true;$('camera-start').disabled=true;$('camera-stop').disabled=false;
  say('正在載入模型，首次使用可能需要較久…');
  try{
    if(!isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('HTTPS required');
    const loaded=await createModel(mode);
    if(token!==generation){loaded.close();return;}model=loaded;
    const camera=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
    if(token!==generation){camera.getTracks().forEach(t=>t.stop());return;}
    stream=camera;video.srcObject=stream;await video.play();if(token!==generation)return;
    busy=false;lastFrame=-1;lastTick=0;$('play-round').disabled=mode!=='game';
    say('攝影機已啟用，影像僅在此裝置處理。');animation=requestAnimationFrame(frame);
    for(const track of stream.getVideoTracks())track.addEventListener('ended',()=>{stop();say('攝影機已中斷，請重新啟用。');});
  }catch(error){if(token===generation)failure(error);}
});
$('camera-stop').addEventListener('click',()=>{stop();clear();say('攝影機已停止並釋放。');});
async function detectImage(){
  if(!image)return;
  stop();const token=generation;busy=true;say('正在載入模型並偵測圖片…');
  try{
    const loaded=await createModel('image');if(token!==generation){loaded.close();return;}model=loaded;
    const result=model.detect(image);draw(image,result);$('vision-result').textContent=`偵測到 ${result.detections.length} 張人臉`;
    say('偵測完成。調整門檻可比較結果。');busy=false;
  }catch(error){if(token===generation)failure(error);}
}
$('image-file').addEventListener('change',async event=>{
  stop();image=null;clear();const token=generation,file=event.target.files[0];if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){say('請選擇不超過 10 MB 的 JPG、PNG 或 WebP 圖片。');event.target.value='';return;}
  say('正在讀取圖片…');const url=URL.createObjectURL(file);
  try{
    const original=new Image();original.src=url;await original.decode();if(token!==generation)return;
    const scale=Math.min(1,1280/Math.max(original.width,original.height));
    image=document.createElement('canvas');image.width=Math.max(1,Math.round(original.width*scale));image.height=Math.max(1,Math.round(original.height*scale));image.getContext('2d').drawImage(original,0,0,image.width,image.height);
    await detectImage();
  }catch(error){if(token===generation){say('圖片讀取失敗，請換一張圖片。');}}
  finally{URL.revokeObjectURL(url);}
});
$('clear-image').addEventListener('click',()=>{stop();image=null;$('image-file').value='';clear();say('圖片已清除。');});
$('sample-image').addEventListener('click',async()=>{
  stop();image=null;clear();const token=generation;
  try{const sample=$('sample-source');await sample.decode();if(token!==generation)return;image=sample;await detectImage();}
  catch(error){if(token===generation)say('範例圖片讀取失敗，請自行選擇圖片。');}
});
$('confidence').addEventListener('input',()=>{$('confidence-value').value=Number($('confidence').value).toFixed(2);});
$('confidence').addEventListener('change',async()=>{
  if(mode==='image'){await detectImage();return;}
  if(model && mode==='video'){try{await model.setOptions({minDetectionConfidence:Number($('confidence').value)});}catch(error){failure(error);}}
});
$('vision-mode')?.addEventListener('change',event=>{
  stop();image=null;$('image-file').value='';mode=event.target.value;clear();
  $('image-controls').hidden=mode!=='image';$('camera-controls').hidden=mode==='image';$('face-controls').hidden=mode==='game';$('game-controls').hidden=mode!=='game';
  say(mode==='image'?'請選擇圖片開始。':'啟用攝影機，將一隻手放在畫面中。');
});
$('play-round').addEventListener('click',()=>{
  if(!stream || round)return;
  const random=new Uint32Array(1);crypto.getRandomValues(random);const computer=names[random[0]%3];
  const deadline=performance.now()+3000;$('play-round').disabled=true;
  $('game-result').textContent='倒數 3 秒，請準備手勢…';
  round=setInterval(()=>{
    const now=performance.now(),left=Math.ceil((deadline-now)/1000);
    if(left>0){$('game-result').textContent=`倒數 ${left} 秒，保持手勢…`;return;}
    clearInterval(round);round=0;$('play-round').disabled=false;
    if(!stable || now-seen>400 || now-stableSince<500){$('game-result').textContent='未取得穩定手勢，本回合不計分，請再試一次。';return;}
    const outcome=winner(stable,computer);scores[outcome]++;score();
    $('game-result').textContent=`你出${stable}，電腦出${computer}。${outcome==='draw'?'平手！':outcome==='player'?'你贏了！':'電腦獲勝！'}`;
  },100);
});
$('reset-score').addEventListener('click',()=>{clearInterval(round);round=0;scores={player:0,computer:0,draw:0};score();$('play-round').disabled=!stream;$('game-result').textContent='分數已歸零。';});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();say('已暫停。回到頁面後請重新啟用攝影機或選擇圖片。');}});
window.addEventListener('pagehide',stop);

