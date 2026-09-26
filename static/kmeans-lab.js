(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const $ = id => document.getElementById(id);
  const form = $('lab-form');
  if (!form) return;
  const colors = ['#d6384a', '#2867cf', '#16825c', '#b08100', '#aa36ba', '#008c99', '#d26816', '#7454bf', '#824a36', '#4c6475'];
  let worker = null, timeout = null, animation = null, result = null, busy = false;
  const status = text => { $('lab-status').textContent = text; };
  function pause() {
    clearInterval(animation); animation = null;
    $('lab-play').textContent = '播放過程';
  }
  function setBusy(value) {
    busy = value;
    form.querySelectorAll('input').forEach(input => { input.disabled = value; });
    $('lab-run').disabled = value;
    $('lab-reset').disabled = value;
    $('lab-stop').disabled = !value;
    $('lab-run').textContent = value ? '執行中…' : '開始分群';
    form.setAttribute('aria-busy', String(value));
  }
  function dispose() {
    if (worker) worker.terminate();
    worker = null; clearTimeout(timeout); setBusy(false);
  }
  function fail(text) {
    dispose(); status(text + ' 可以按「開始分群」重試。');
  }
  function createWorker() {
    worker = new Worker(new URL('kmeans-worker.js', scriptURL));
    worker.onmessage = ({data}) => {
      if (data.type === 'status') status(data.text);
      if (data.type === 'error') {
        console.error(data.text);
        fail('分群計算失敗：' + data.text);
      }
      if (data.type === 'result') {
        clearTimeout(timeout); setBusy(false);
        result = data.result;
        $('lab-export').hidden = true;
        $('lab-results').hidden = false;
        $('lab-step').max = result.iterations;
        $('lab-step').value = result.iterations;
        const p = result.parameters;
        $('lab-result-params').textContent = `本次結果：${p.number.toLocaleString()} 個點 · K = ${p.k} · 種子 ${p.seed} · 迭代上限 ${p.max_iter}`;
        status(`分群完成（${result.elapsed_ms.toFixed(1)} ms），共 ${result.iterations} 次迭代。${result.converged ? '群別已穩定。' : '已達迭代上限，尚未收斂；可提高上限再試。'}`);
        draw();
      }
    };
    worker.onerror = event => {
      event.preventDefault();
      fail('無法啟動分群，請確認瀏覽器支援 Web Worker。');
    };
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    const parameters = Object.fromEntries(new FormData(form).entries());
    for (const key of Object.keys(parameters)) parameters[key] = Number(parameters[key]);
    pause(); setBusy(true); status('正在計算分群…');
    try {
      if (!worker) createWorker();
      timeout = setTimeout(() => fail('計算時間過長，已停止此次執行。'), 30000);
      worker.postMessage(parameters);
    } catch (error) {
      console.error(error); fail('瀏覽器無法建立背景運算程序。');
    }
  });
  $('lab-stop').addEventListener('click', () => {
    dispose(); status('已停止。調整參數後可重新執行。');
  });
  $('lab-reset').addEventListener('click', () => {
    form.reset(); pause(); status('已還原課堂參數，按「開始分群」產生新結果。');
  });
  form.addEventListener('input', () => {
    if (result) status('參數已變更，下方仍是上次結果；按「開始分群」更新。');
  });
  $('lab-step').addEventListener('input', () => { pause(); draw(); });
  $('lab-play').addEventListener('click', () => {
    if (!result) return;
    if (animation) { pause(); return; }
    if (Number($('lab-step').value) >= result.iterations) $('lab-step').value = 0;
    draw(); $('lab-play').textContent = '暫停播放';
    animation = setInterval(() => {
      const next = Number($('lab-step').value) + 1;
      if (next > result.iterations) { pause(); return; }
      $('lab-step').value = next; draw();
      if (next === result.iterations) pause();
    }, 650);
  });
  function plot(canvas, frame, clustered) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(240, rect.width), height = width * 0.75;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
    const pad = {left: 42, right: 18, top: 18, bottom: 35};
    const size = Math.min(width - pad.left - pad.right, height - pad.top - pad.bottom);
    const left = pad.left + (width - pad.left - pad.right - size) / 2;
    const top = pad.top;
    let limit = 1;
    for (const point of result.X) limit = Math.max(limit, Math.abs(point[0]), Math.abs(point[1]));
    limit = Math.ceil(limit);
    const x = value => left + (value + limit) / (2 * limit) * size;
    const y = value => top + size - (value + limit) / (2 * limit) * size;
    ctx.font = '11px system-ui'; ctx.textAlign = 'center';
    for (let tick = -limit; tick <= limit; tick += Math.max(1, Math.ceil(limit / 3))) {
      ctx.strokeStyle = '#e7edf2'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(x(tick), top); ctx.lineTo(x(tick), top + size);
      ctx.moveTo(left, y(tick)); ctx.lineTo(left + size, y(tick)); ctx.stroke();
      ctx.fillStyle = '#597185'; ctx.fillText(tick, x(tick), top + size + 17);
      ctx.fillText(tick, left - 18, y(tick) + 4);
    }
    ctx.strokeStyle = '#8fa6b5'; ctx.strokeRect(left, top, size, size);
    ctx.globalAlpha = 0.72;
    result.X.forEach((point, i) => {
      ctx.fillStyle = clustered ? colors[frame.Idx[i] - 1] : '#273c4b';
      ctx.beginPath(); ctx.arc(x(point[0]), y(point[1]), result.X.length > 2000 ? 1.5 : 2.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (clustered) frame.Ctrs.forEach((point, index) => {
      const px = x(point[0]), py = y(point[1]);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
      const cross = () => { ctx.beginPath(); ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5); ctx.moveTo(px - 5, py + 5); ctx.lineTo(px + 5, py - 5); ctx.stroke(); };
      cross(); ctx.strokeStyle = '#10263c'; ctx.lineWidth = 2.5; cross();
      ctx.fillStyle = '#10263c'; ctx.font = 'bold 12px system-ui';
      ctx.fillText(index + 1, px + 12, py - 9);
    });
  }
  function draw() {
    if (!result) return;
    const step = Number($('lab-step').value), frame = result.frames[step];
    $('lab-export').hidden = true;
    $('lab-step-label').value = `${step} / ${result.iterations}`;
    $('lab-iteration').textContent = `${step} / ${result.iterations}`;
    $('lab-sse').textContent = frame.inertia.toFixed(2);
    $('lab-convergence').textContent = step < result.iterations ? '回看迭代中' : result.converged ? '已收斂' : '達上限，未收斂';
    plot($('lab-original'), frame, false); plot($('lab-clusters'), frame, true);
    $('lab-cluster-table').replaceChildren(...frame.Ctrs.map((center, i) => {
      const row = document.createElement('tr');
      [`群 ${i + 1}`, frame.counts[i], center[0].toFixed(4), center[1].toFixed(4), frame.SumD[i].toFixed(2)].forEach((value, column) => {
        const cell = document.createElement(column === 0 ? 'th' : 'td');
        cell.textContent = value;
        if (column === 0) { cell.scope = 'row'; cell.className = `cluster-${i + 1}`; }
        row.append(cell);
      });
      return row;
    }));
  }
  $('lab-csv').addEventListener('click', () => {
    if (!result) return;
    const step = Number($('lab-step').value), frame = result.frames[step], p = result.parameters;
    const rows = ['x,y,cluster,centroid_x,centroid_y,step,seed,k'];
    result.X.forEach((point, i) => {
      const group = frame.Idx[i];
      rows.push([...point, group, ...frame.Ctrs[group - 1], step, p.seed, p.k].join(','));
    });
    const csv = rows.join('\n');
    $('lab-csv-preview').value = csv;
    $('lab-export').hidden = false;
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = `kmeans-k${p.k}-seed${p.seed}-step${step}.csv`;
    a.hidden = true; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  });
  new ResizeObserver(() => { if (result) draw(); }).observe($('lab-results'));
})();
