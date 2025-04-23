const cheerio = require("cheerio");  
const puppeteer = require("puppeteer");  
const fs = require("fs");  
const { MongoClient } = require("mongodb");  

const array = require('../../my_modules/utils_modules/array');  
const scrape = require('../../my_modules/scrape_modules/scrape.js');  
const extract = require("../../my_modules/scrape_modules/extract_stat_scrape.js");  
const mongo = require("../../my_modules/utils_modules/mongo.js");  

// COSTANTI  
const DBurl = 'mongodb://localhost:27017';  
const champLength = 48;  
const client = new MongoClient(DBurl, { useUnifiedTopology: true });  

// MODIFICARE CON SEASON CHE SI VUOLE ESTRARRE:  
const selector1 = '2023-2024';  
const selector2 = '2024';  

exports.get_id_match = async function () {  
    await client.connect();  

    var new_id = [];  
    var old_id = [];  
    var mancanti = [];  

    // CREA ARRAY CAMPIONATI  
    var champ = fs.readFileSync("./1.main_files/campionati.json");  
    champ = JSON.parse(champ);  
    champ = champ.href;  

    // OPEN BROWSER  
    var browser = await scrape.browser_retry(puppeteer);  

    // QUERY FIND ALL IDS******************************  
    old_id = await mongo.findIds(client);  
    console.log("Lunghezza array old_id: " + old_id.length);  
    // ********************************************** */  

    var i = 0;  
    var first_iteration = 1;  
    do {  
        // QUERY CAMPIONATO   
        var text = String(champ[i]);  
        text = text.split("/");  
        text = text[3]; // text contiene nome champ  
        if (text.indexOf("-") !== -1) text = text.replace("-", " ");  
        if (text.indexOf("-") !== -1) text = text.replace("-", " ");  
        champ[i] = String(champ[i]).slice(0, -1);  

        // SETTING NAVIGATION OPTIONS  
        var url1 = `https://www.diretta.it${champ[i]}-${selector1}/risultati/`;  
        var url2 = `https://www.diretta.it${champ[i]}-${selector2}/risultati/`;  

        const viewPort = { width: 809, height: 9000 };  
        await scrape.range_sleep(500);  

        try {  
            // Prova prima con url1  
            page = await scrape.new_page(browser, scrape.randomUserAgent(), viewPort, url1);  
            
            // Verifica se la pagina ha restituito un errore 404  
            const response = await page.goto(url1, { timeout: 30000 });  
            if (response && response.status() === 404) {  
                // Se url1 non è valido, prova con url2  
                page = await scrape.new_page(browser, scrape.randomUserAgent(), viewPort, url2);  
                if (!page) throw new Error("Impossibile accedere alla pagina");  
            }  
        } catch (error) {  
            console.log(`Errore durante accesso a ${url1}: `, error.message);  
            // Prova con url2  
            page = await scrape.new_page(browser, scrape.randomUserAgent(), viewPort, url2);  
        }  

        // Accetta cookie  
        if (first_iteration === 1) {  
            var cookie = '#onetrust-accept-btn-handler';  
            var cookie_selector = "[id='onetrust-accept-btn-handler']";  
            await scrape.click_on(page, cookie, cookie_selector);  
            first_iteration = 0;  
        }  

        // Estrai i dati  
        await extract.get_full_match(page);  
        await scrape.range_sleep(500);  

        // Estrazione ID del campionato corrente  
        var jsonData = await page.evaluate(() => document.body.innerHTML);  
        jsonData = String(jsonData);  
        const re = /([A]{2}[÷]([a-zA-Z0-9]{8})[¬])/g;  
        var found = jsonData.match(re);  

        // Filtraggio ID non estratti  
        if (found !== null) {  
            found = array.elimina_char(found);  
            found.sort();  
            found = array.clean_array_sorted(found);  

            new_id = new_id.concat(found);  
        }  
        console.log("Dimensione attuale: " + new_id.length + " salvati " + i + "/" + 47);  

        await scrape.close_page(page);  
        await scrape.range_sleep(2000);  

        i++;  
    } while (i < 48); // champ.length  
    await browser.close();  

    // SALVA SU FILE ARRAY DEGLI ID_MANCANTI PER ESTRARRE STATS, E AGGIORNA FILE DI LOG  
    mancanti = array.left_difference(new_id, old_id);  
    var log = { 'data': new Date(), 'new_match': mancanti.length };  
    var lg = fs.readFileSync("./log/log_id_file.json");  
    lg = JSON.parse(lg);  
    lg.push(log);  
    fs.writeFileSync("./log/log_id_file.json", JSON.stringify(lg));  
    console.log("Dimensione log_file: " + mancanti.length);  

    mancanti = array.shuffle(mancanti);  
    fs.writeFileSync("./log/mancanti_log.json", JSON.stringify(mancanti));  

    return mancanti;  
}  