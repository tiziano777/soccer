//LIBRERIE
const fs = require('fs');
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { MongoClient } = require("mongodb");

const ts = require('../../my_modules/utils_modules/timestamp');
const scrape = require('../../my_modules/scrape_modules/scrape.js');
const extract = require("../../my_modules/scrape_modules/extract_stat_scrape.js");
const mongo = require("../../my_modules/utils_modules/mongo.js");
const file = require('../../my_modules/utils_modules/file.js');

const baseError = require('../../my_modules/utils_modules/baseError.js');
const mail = require("../../my_modules/utils_modules/email.js");

//COSTANTI
const DBurl = 'mongodb://localhost:27017';
const champLength = 48;
const client = new MongoClient(DBurl, { useUnifiedTopology: true });

//FUNZIONI AUX

async function error_function(err) {
    console.log(err);
    fs.appendFileSync("./error_files/error_log.json", `,${JSON.stringify(err)}`);
    await mail.send(err);
}

function reset_dict(dict) {
    dict = {
        home_win: 0.0,
        X: 0.0,
        away_win: 0.0,
        under: 0.0,
        over: 0.0,
        gg: 0.0,
        ng: 0.0,
        over_ht: 0.0
    };
    return (dict);
}

////ESTRAZIONE MATCH
exports.extract_stat = async function (match) {
    //output
    var new_matches = [];
    //db conn
    await client.connect();

    var output = {
        id: '',
        details: {
            nazione: '',
            country_code: -1,
            campionato: '',
            id_champ: -1,
            round: -1,
            str_date: '',
            data: '',
            ora: '',
            timestamp: 0
        },
        home: '',
        away: '',
        home_id: '',
        away_id: '',
        result: '',
        home_goal: -1,
        away_goal: -1,
        winner_code: 0,
        gg_home: [],
        gg_away: [],
        ht_result: '',
        st_result: '',
        stat: {
            full_time: [],
            half_time: [],
            final_time: []
        },
        odds: {}
    };

    //BROWSER OPENING
    var browser = await scrape.browser_retry(puppeteer);
    await scrape.range_sleep(4000);
    var j = 0;
    //FOREACH ID EXTRACT STATS IF MATCH NOT ALREADY STORED
    do {
        output.id = match[j];

        // QUERY CONTROLLO COUNT IF(ID == 0)PROSEGUI
        var q = await mongo.findById(client, match[j]);

        if (q.length < 1) {

            //GOTO MATCH PAGE
            var url = `https://www.diretta.it/partita/${match[j]}/#/informazioni-partita/informazioni-partita`;
            const viewPort = { width: 550, height: 1700 };
            var page = await scrape.new_page(browser, scrape.randomUserAgent(), viewPort, url);

            /////////////////////////////////////////////////////////////////
            //LOAD HTML

            var jsonData = await page.evaluate(() => document.body.innerHTML);
            var $ = cheerio.load(jsonData);

            //////////////////////////////////////////////////////////////////
            //Accetta cookie se rischiesto:
            var cookie = '#onetrust-accept-btn-handler';
            if ($(cookie).length == 1) {
                var cookie_selector = "[id='onetrust-accept-btn-handler']";
                await scrape.click_on(page, cookie, cookie_selector);
            }
            //controlla se match e' finito
            if (extract.match_status($)) {
                //////////////////////////////////////////////////////////////
                //get details match (NAZIONE,ROUND,CAMPIONATO)
               
                //nazione,round,campionato
                try {
                    output = extract.get_details($, output);
                } catch {
                    await error_function(new baseError("function get_details ", match[j], j));
                    process.exit(1);
                }

                //CountryCode
                output.details.country_code = file.country_code(output.details.nazione);

                //DATA,ORA
                try {
                    output = extract.get_date_time($, output);
                } catch {
                    await error_function(new baseError("function get_date ", match[j], j));
                    process.exit(1);
                }
                //TIMESTAMP
                try {

                    output.details.timestamp=ts.get_match_timestamp(output.details);
                } catch {
                    await error_function(new baseError("function toTimeStamp", match[j], j));
                    process.exit(1);
                }
                

                //////////////////////////////////////////////////////////////
                //FINAL RESULT
                try {
                    output = extract.get_final_result($, output);
                } catch {
                    await error_function(new baseError("error function get_final_result ", match[j], j));
                    process.exit(1);
                }
                //restituisce minuto goal AWAY/HOME
                /*
                try {
                    var time_res = extract.time_goal_home_away($, output.gg_home, output.gg_away, output.result);
                    output.gg_home = time_res[0];
                    output.gg_away = time_res[1];
                } catch {
                    await error_function(new baseError("ERROR FUNCTION TIME_GOAL_HOME_AWAY ", match[j], j));
                    process.exit(1);
                }
                */
                //1ST and 2ND time result
                try {
                    var arr = ['', ''];
                    extract.get_time_results($, arr);
                } catch {
                    await error_function(new baseError("error function get_time_result ", match[j], j));
                    await scrape.close_page(page);
                    output = file.resetJsonOutput();
                    match.push(match[j]);
                    continue;
                }

                output.ht_result = arr[0];
                output.st_result = arr[1];

                //check validity goal time

                output = extract.check_minute_goal(output.result, output.gg_home, output.gg_away, output);

                //nome home/away team
                try {
                    extract.get_name_teams($, output);
                }
                catch {
                    await error_function(new baseError('home-away name changed selector', match[j], j));
                    process.exit(1);
                }
   

                ///////////////////////////////////////////////////////////////
                //STATISTICHE partita
                var arr1 = [];
                for (var k = 0; k < 3; k++) {
                    var stat_url = `https://www.diretta.it/partita/${match[j]}/#/informazioni-partita/statistiche-partite/${k}`;
                    var page1 = await scrape.new_page(browser, scrape.randomUserAgent(), viewPort, stat_url);
                    var jsonData1 = await page1.evaluate(() => document.body.innerHTML);
                    var $$ = cheerio.load(jsonData1);
                    arr1 = extract.take_stats($$, arr1, k);
                    
                    if (k == 0) output.stat.full_time = arr1;
                    if (k == 1) output.stat.half_time = arr1;
                    if (k == 2) output.stat.final_time = arr1;
                    await scrape.close_page(page1);
                }

                if (output.stat.final_time == undefined || output.stat.full_time == undefined || output.stat.half_time == undefined) {
                    console.log("error stats match ", match[j], j);
                    process.exit(1);
                }
                if (output.stat.final_time == {} || output.stat.full_time == {} || output.stat.half_time == {}) {
                    console.log("not stats ", match[j], j);
                    fs.appendFileSync("./error_files/notstats.txt", '"' + match[j] + '",\n');
                }

                //////////QUOTE PARTITA

                var o = await mongo.findById_palinsesto(client, match[j]);
                if (o.length == 0 || o.home_win == 0 || o.gg == 0 || o.over_ht == 0 || o.under == 0) {
                    var dict = reset_dict(dict);
                    var params = ["quote-1x2/finale", "over-under/finale", "over-under/1-tempo", "gol-no-gol/finale"];
                    var odds_url = `https://www.diretta.it/partita/${match[j]}/#/comparazione-quote/`;
                    try {
                        for (var k = 0; k < params.length; k++) {
                            var u=odds_url + params[k];
                            var page1 = await scrape.new_page(browser, scrape.randomUserAgent(), viewPort, u);
                            scrape.range_sleep(1000);
                            var jsonData1 = await page1.evaluate(() => document.body.innerHTML);
                            var $$ = cheerio.load(jsonData1);
                            await extract.extract_odds($$, dict, k, page1);
                            await scrape.close_page(page1);
                        }

                        if (dict.away_win == 0 || dict.home_win == 0 || dict.over_ht == 0 || dict.gg == 0 || dict.ng == 0 || dict.over == 0 || dict.under == 0 ||
                            isNaN(dict.away_win) || isNaN(dict.home_win) || isNaN(dict.over_ht) || isNaN(dict.gg) || isNaN(dict.ng) || isNaN(dict.over) || isNaN(dict.under) ||
                            dict.away_win == null || dict.home_win == null || dict.over_ht == null || dict.gg == null || dict.ng == null || dict.over == null || dict.under == null) {
                            console.log("no odds:" + dict.id);
                            var not_odds = fs.readFileSync("./error_files/not_odds.json");
                            not_odds = JSON.parse(not_odds);
                            not_odds.push(match[j]);
                            fs.writeFileSync("./error_files/not_odds.json", JSON.stringify(not_odds));
                        }
                    } catch {
                        console.log(dict);
                        scrape.range_sleep(5000);
                        console.log("no odds:" + dict);
                        var not_odds = fs.readFileSync("./error_files/not_odds.json");
                        not_odds = JSON.parse(not_odds);
                        not_odds.push(match[j]);
                        fs.writeFileSync("./error_files/not_odds.json", JSON.stringify(not_odds));
                    }
                    output.odds = dict;
                }
                else {
                    output.odds = o[0].odds;
                }
                //////////inserisci id_squadre,winner_code,num_goal
                
                try {
                    output = file.insert_ids(output);
                } catch (err) {
                    await error_function(new baseError("errore in insert_ids", match[j], j));
                    process.exit(1);
                }
                output = extract.winner_code(output);
                output = extract.num_goal(output);
                //effettuare controllo sugli id_squadra


                //////////SALVA RECORD
                if (extract.riempito(output) == false) {
                    output = extract.format_stat(output);
                    output = extract.check_negative_stat(output);
                    
                    console.log(output.id+JSON.stringify(output.details)+"\n"+ JSON.stringify(output.stat.full_time));
                    console.log(output.odds);

                    try {
                        //SALVA DB
                        await mongo.insert_match(client, output);
                        new_matches.push(output)
                    } catch (err) {
                        await error_function(new baseError("errore mongo_insert: " + err, match[j], j));
                        process.exit(1);
                    }
                }
            }
            await scrape.close_page(page);
            output = file.resetJsonOutput();
        }
        j++;
        //////////////////////////////////////////////////////////////////////

    } while (j < match.length);

    await browser.close();
    return new_matches;
}

