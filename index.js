const puppeteer = require('puppeteer');
/* 
The function below scrapes hotstar for the f1 video urls, so we can avoid spoilers in the images and hotstar home page.
*/
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.hotstar.com/in/sports/formula-1', { 'timeout': 10000, 'waitUntil': 'domcontentloaded' });
    await page.waitForSelector('article', {
        timeout: 1000
    });
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
    const urls = await page.evaluate(() => {
        const $ = window.$;
        return $("article").children("a").map(function () { return $(this).attr('href') }).get();
    })
    await page.close();
    await browser.close();
    console.log(urls);
})();