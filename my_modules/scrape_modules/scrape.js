//FUNZIONI SCRAPE

const { throws } = require("assert");

async function range_sleep(time) {
    await sleep(time * (Math.random() * (1.500 - 0.500) + 0.500).toFixed(3));
}

//metodo click

exports.perform_season = function () {
    //var current_year=String(new Date().getFullYear());
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth();
    var currentYear = currentDate.getFullYear();
    var currentSeasonStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    var currentSeasonEndYear = currentSeasonStartYear + 1;
    var currentSeason = currentSeasonStartYear + "/" + currentSeasonEndYear;
    return String(currentSeason);
}



exports.click_on = async function (page, selector, click_selector) {
    await range_sleep(1000);
    try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(click_selector, { delay: 3 });
        //await page.waitForNavigation();

    } catch {
        /*await page.close();
        await page.goto(url);*/
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(click_selector, { delay: 3 });
        //await page.waitForNavigation();

    }
}
//NAVIGATION FUNCTION:
async function browser_retry(puppeteer) {
    try {
        var browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,

            //args:[{"--user-agent":}],

        });
        return browser;
    } catch (err) {
        console.log(err);
        await range_sleep(3000);
        return browser_retry(puppeteer);
    }
}

exports.browser_retry = async function (puppeteer) {
    return browser_retry(puppeteer);
}

/////////////////////////////
async function new_page(browser, user, view, url) {
    var page;
    try {
        var page = await browser.newPage();
        await page.setUserAgent(user);
        await page.setViewport(view);
        await page.goto(url);
        await page.setDefaultNavigationTimeout(10000);
        await range_sleep(2000);
        return page;
    } catch (err) {
        console.log(err);
        await range_sleep(3000);
        return new_page(browser, user, view, url);
    }
}
exports.new_page = async function (browser, user, view, url) {
    return new_page(browser, user, view, url);
}
//////////////////////////////
async function close_page(page) {
    try {
        await page.close();
    } catch (err) {
        await range_sleep(1000);
        await close_page(page);
    }
}

exports.close_page = async function (page) {
    await close_page(page);
}



//controllo esattezza selettore
exports.estVuoto = function (selector) {
    if (selector == '') {
        console.log("errore selettore html,possibile cambiamento tag del sito web");
        return true;
    }
    return false;
}
//TEMPI DI ATTESA METODO RANGE_SLEEP
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));

}

exports.range_sleep = async function (time) {
    await sleep(time * (Math.random() * (1.500 - 0.500) + 0.500).toFixed(3));
}

//CHANGE USER-AGENT

exports.randomUserAgent = function () {
    var i = Math.floor(Math.random() * (5 + 1));

    var array = [
        'Mozilla / 5.0 CK = {} (Windows NT 6.1; WOW64; Trident / 7.0; rv: 11.0) come Gecko',
        'Mozilla / 5.0 (Windows NT 10.0; Win64; x64) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 74.0.3729.169 Safari / 537.36',
        'Mozilla / 5.0 (Windows NT 10.0; Win64; x64) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 64.0.3282.140 Safari / 537.36 Edge / 18.17763',
        'Mozilla / 5.0 (Windows NT 6.1; Win64; x64) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 60.0.3112.90 Safari / 537.36',
        'Mozilla / 5.0 (Windows NT 10.0) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 72.0.3626.121 Safari / 537.36',
        'Mozilla / 5.0 (iPhone; CPU iPhone OS 13_3_1 come Mac OS X) AppleWebKit / 605.1.15 (KHTML, come Gecko) Versione / 13.0.5 Mobile / 15E148 Safari / 604.1',
        'Mozilla / 5.0 (Windows NT 6.1; WOW64; rv: 54.0) Gecko / 20100101 Firefox / 54.0',
        'Mozilla / 5.0 (Windows NT 10.0; WOW64) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 72.0.3626.121 Safari / 537.36',
        'Mozilla / 5.0 (X11; CrOS x86_64 13099.110.0) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 84.0.4147.136 Safari / 537.36',
        'Mozilla / 5.0 (X11; CrOS x86_64 13099.102.0) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 84.0.4147.127 Safari / 537.36',
        'Mozilla / 5.0 (X11; CrOS x86_64 11895.118.0) AppleWebKit / 537.36 (KHTML, come Gecko) Chrome / 74.0.3729.159 Safari / 537.36'
    ];
    return array[i];
}
