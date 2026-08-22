const https = require('https');

async function main() {
  return new Promise((resolve) => {
    const data = JSON.stringify({ name: 'worker1', pass: 'password123' });
    
    const req = https.request('https://bar-ops-system.onrender.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('Error:', error.message);
      resolve();
    });
    
    req.write(data);
    req.end();
  });
}

main();