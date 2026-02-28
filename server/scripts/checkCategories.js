(async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'owner1', password: 'password123' }),
    });
    const loginData = await loginRes.json();
    console.log('loginData', loginData);
    const token = loginData.token;
    const catRes = await fetch('http://localhost:3000/api/pos/categories', {
      headers: { Authorization: 'Bearer ' + token, 'x-restaurant-id': 3 },
    });
    console.log('categories status', catRes.status);
    console.log(await catRes.text());
  } catch (e) {
    console.error('error', e);
  }
})();
