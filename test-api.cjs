const http = require('http');
http.get('http://localhost:3000/api/cms', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log("Has businessServices:", !!json.businessServices);
    if (json.businessServices) {
      console.log("Count:", json.businessServices.length);
    }
  });
});


