const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('https://theslasho.com/', { waitUntil: 'networkidle2' });
  
  // Wait a bit for animations
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'slasho_top.png' });
  
  // Scroll down a bit
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'slasho_mid.png' });
  
  await browser.close();
})();
