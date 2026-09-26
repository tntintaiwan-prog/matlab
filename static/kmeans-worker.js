importScripts('kmeans-core.js');
self.onmessage = ({data}) => {
  try {
    const start = performance.now();
    const result = runKmeans(data);
    result.elapsed_ms = performance.now() - start;
    postMessage({type:'result',result});
  } catch(error) { postMessage({type:'error',text:error.message}); }
};
