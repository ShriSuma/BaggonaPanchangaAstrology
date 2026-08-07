import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('React DevTools')) {
      console.log('PAGE LOG:', text);
    }
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://127.0.0.1:5173/');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking Kundli...');
  const tabs = await page.$$('nav button');
  if (tabs.length > 1) {
    await tabs[1].click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Clicking Muhurtha...');
  if (tabs.length > 2) {
    await tabs[2].click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Clicking Melapak...');
  if (tabs.length > 3) {
    await tabs[3].click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
})();
