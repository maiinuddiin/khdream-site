fetch('http://localhost:3000/api/cms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // no token to simulate missing token? Wait, POST requires admin token!
  },
  body: JSON.stringify({
    general: {},
    businessServices: [
      { id: 'test1', name: 'Test Service', status: 'active' }
    ]
  })
}).then(r => r.text()).then(console.log);
