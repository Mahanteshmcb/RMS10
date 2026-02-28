const fetch = globalThis.fetch || require('node-fetch');
(async()=>{
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username:'reporter', password:'test123'})
    });
    console.log('status', res.status);
    const body = await res.text();
    console.log('body', body);
    // if we got a token, try hitting a protected endpoint
    try {
      const json = JSON.parse(body);
      if (json.token) {
        const token = json.token;
        const rep = await fetch('http://localhost:3000/api/reporting/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('report summary status', rep.status);
        console.log(await rep.text());
      }
    } catch (e) {
      // ignore parse failures
    }
  } catch(err) {
    console.error('error', err);
  }
})();
