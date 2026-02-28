(async ()=>{
  try {
    const res = await fetch('http://localhost:3000/health');
    console.log('health status', res.status);
    console.log(await res.text());
  } catch(e){console.error('err',e)}
})();
