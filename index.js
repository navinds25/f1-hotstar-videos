const puppeteer = require('puppeteer');
const fastify = require('fastify');
const app = fastify({
    logger: true
});

/* 
The function below scrapes hotstar for the f1 video urls, so we can avoid spoilers in the images and hotstar home page.
*/
async function fetchURLs() {
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
    return urls;
};

app.get('/', async (req, res) => {
    const baseURL = 'https://www.hotstar.com'
    const rawUrls = await fetchURLs();
    let content = '<html><body>';
    rawUrls.forEach(element => {
        const url = baseURL + element;
        console.log(url);
        content = content + '<a href="' + url + '">' + url + '</a><br/>';
    });
    const closeContent = '</body></html>';
    content = content + closeContent;
    console.log(content);
    res.type('text/html');
    res.send(content);
});

app.listen(3000, function (err, address) {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.info(`server listening on ${address}`)
});