const cheerio=require("cheerio");
const puppeteer=require("puppeteer");
const {MongoClient}=require("mongodb");
const fs=require("fs");

const array=require('../../my_modules/utils_modules/array');
const scrape=require('../../my_modules/scrape_modules/scrape.js');
const extract=require("../../my_modules/scrape_modules/extract_stat_scrape.js");
const mongo=require("../../my_modules/utils_modules/mongo.js");
//COSTANTI
const DBurl='mongodb://localhost:27017';
const champLength=48;
const client = new MongoClient(DBurl,{ useUnifiedTopology: true });

///MODIFICARE CON SEASON CHE SI VUOLE ESTRARRE:
const selector1='2019-2020';
const selector2='2020';


async function get_id_match(){

    await client.connect();
    var new_id=[];
    var old_id=[];
    var mancanti=[];

    //CREA ARRAY CAMPIONATI
    var champ=fs.readFileSync("./1.main_files/campionati.json");
    champ=JSON.parse(champ);
    champ=champ.href;

    //OPEN BROWSER
    var browser=await scrape.browser_retry(puppeteer);

    //QUERY FIND ALL IDS****************************
    old_id=await mongo.findIds(client);
    console.log("lunghezza array old_id: "+old_id.length);
    //********************************************** */
    var i=0;
    var first_iteration=1; 
    do{
        //QUERY CAMPIONATO 
        var text=champ[i];
        text=text.split("/");
        text=text[3]; //text contiene nome champ
        if(text.indexOf("-")!=-1)text=text.replace("-"," ");
        if(text.indexOf("-")!=-1)text=text.replace("-"," ");
        f.champ=text;
        champ[i]=champ[i].slice(0,-1);
        
        // SETTING NAVIGATION OPTIONS
        const viewPort={width:809,height:9000};
        
        

        url1=`https://www.diretta.it${champ[i]}-${selector1}/risultati/`;
        url2=`https://www.diretta.it${champ[i]}-${selector2}/risultati/`;

        //***************************************** 
    
        page=await scrape.new_page(browser,scrape.randomUserAgent(),viewPort,url);
        await scrape.range_sleep(1500);

        var jsonData=await page.evaluate(() => document.body.innerHTML);
        var $=cheerio.load(jsonData);

        //accetta cookie prima iterazione:
        if(first_iteration==1){//onetrust-accept-btn-handler
            var cookie='#onetrust-accept-btn-handler';
            var cookie_selector="[id='onetrust-accept-btn-handler']";
            await scrape.click_on(page,cookie,cookie_selector);
            first_iteration=0;
        }

        //ESPANDE LA PAGINA CON TUTTI I MATCH DEL CAMPIONATO
    
        await extract.get_full_match(page);
        await scrape.range_sleep(500);

        //ESTRAZIONE ID i-ESIMO CAMPIONATO
        jsonData = await page.evaluate(() => document.body.innerHTML);

        jsonData = String(jsonData);
        const re = /([A]{2}[÷]([a-zA-Z0-9]{8})[¬])/g;
        var found = jsonData.match(re);

        //FILTRAGGIO ID NON ESTRATTI
        //cleanup
        if(found!=null){
            found = array.elimina_char(found);
            found.sort();
            found = array.clean_array_sorted(found);

            //Ho tutti gli ID di un campionato in found[]
            //filtering
            new_id = new_id.concat(found);
        }
        console.log("dim. attuale: " + new_id.length + " saved " + i + "/47");

        await scrape.close_page(page);
        await scrape.range_sleep(2000);
        //LOOP ROUTINE
        i++; 
    }while(i<48);//champ.length
           
    await browser.close();

    //SALVA SU FILE ARRAY DEGLI ID_ PER ESTRARRE STATS
    mancanti=array.left_difference(new_id,old_id);
    var log={'data':new Date(),'new_match':mancanti.length};
    var lg=fs.readFileSync("./log/log_id_file.json");
    lg.push(log);
    fs.writeFileSync("./log/log_id_file.json",JSON.stringify(lg));
    console.log("dimensione log_file: "+mancanti.length);

    mancanti=array.shuffle(mancanti);
    fs.writeFileSync("./log/mancanti_log.json",JSON.stringify(mancanti));
    
    return mancanti;
}

get_id_match();