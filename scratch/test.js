const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.log('Timeout or error:', e.message);
  }
  
  await browser.close();
})();
