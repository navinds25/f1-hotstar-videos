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
    // content is to create basic links so it's easy to click on.
    let content = '<html><body>';
    for (index in rawUrls) {
        console.log(`element: ${rawUrls[index]}`);
        const element = rawUrls[index];
        // below filters out urls without reply in it, to avoid spoilers from url names.
        if (element.includes("replay")) {
            const url = baseURL + element;
            content = content + '<a href="' + url + '">' + url + '</a><br/>';
        } else {
            continue;
        }

    }
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