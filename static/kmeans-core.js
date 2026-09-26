/* Deterministic k-means++ and Lloyd iterations; no external runtime. */
(function (root) {
  function runKmeans({number = 1000, k = 5, seed = 23, max_iter = 100} = {}) {
    for (const [name, value, lo, hi] of [['number',number,50,5000],['k',k,1,10],['seed',seed,0,999999],['max_iter',max_iter,1,100]]) {
      if (!Number.isInteger(value) || value < lo || value > hi) throw new Error(`${name} 必須是 ${lo} 到 ${hi} 的整數`);
    }
    let state = seed >>> 0;
    function random() {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    const X = Array.from({length:number}, () => {
      const radius = Math.sqrt(-2 * Math.log(1 - random())), angle = 2 * Math.PI * random();
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    });
    const distance = (a,b) => (a[0]-b[0])**2 + (a[1]-b[1])**2;
    const Ctrs = [X[Math.floor(random()*number)].slice()];
    const nearest = new Float64Array(number).fill(Infinity);
    while (Ctrs.length < k) {
      let total = 0;
      for (let i=0;i<number;i++) { nearest[i] = Math.min(nearest[i],distance(X[i],Ctrs.at(-1))); total += nearest[i]; }
      let target = random()*total, index = number-1;
      for (let i=0;i<number;i++) { target -= nearest[i]; if (target < 0) {index=i;break;} }
      Ctrs.push(X[index].slice());
    }
    function snapshot() {
      const Idx = new Array(number), counts = new Array(k).fill(0), SumD = new Array(k).fill(0);
      for (let i=0;i<number;i++) {
        let group=0, best=Infinity;
        for (let j=0;j<k;j++) { const d=distance(X[i],Ctrs[j]); if(d<best){best=d;group=j;} }
        Idx[i]=group+1; counts[group]++; SumD[group]+=best;
      }
      return {Idx,counts,SumD,Ctrs:Ctrs.map(c=>c.slice()),inertia:SumD.reduce((a,b)=>a+b,0)};
    }
    const frames=[snapshot()]; let converged=false;
    for(let step=0;step<max_iter;step++) {
      const previous=frames.at(-1), sums=Array.from({length:k},()=>[0,0]);
      for(let i=0;i<number;i++){const g=previous.Idx[i]-1;sums[g][0]+=X[i][0];sums[g][1]+=X[i][1];}
      for(let g=0;g<k;g++) if(previous.counts[g]) Ctrs[g]=sums[g].map(v=>v/previous.counts[g]);
      const frame=snapshot(); frames.push(frame);
      if(frame.Idx.every((v,i)=>v===previous.Idx[i])) {converged=true;break;}
    }
    return {X,frames,iterations:frames.length-1,converged,parameters:{number,k,seed,max_iter}};
  }
  if(typeof module !== 'undefined' && module.exports) module.exports={runKmeans};
  else root.runKmeans=runKmeans;
})(globalThis);
