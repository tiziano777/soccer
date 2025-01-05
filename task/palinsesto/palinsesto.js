const cheerio=require("cheerio");
const puppeteer=require("puppeteer");
const fs=require("fs");
const {MongoClient}=require("mongodb");

const file=require("../../my_modules/utils_modules/file.js");

const ts=require("../../my_modules/utils_modules/timestamp.js");
const scrape=require('../../my_modules/scrape_modules/scrape.js');
const ps=require("../../my_modules/scrape_modules/palinsesto_scrape.js");
const extract=require("../../my_modules/scrape_modules/extract_stat_scrape.js");
const mongo=require("../../my_modules/utils_modules/mongo.js");


//COSTANTI
const DBurl='mongodb://localhost:27017';
const champLength=48;
const client = new MongoClient(DBurl,{ useUnifiedTopology: true });
const viewPort={width:809,height:9000};

//funzioni aux
function reset_dict(){
    var dict={
        home_win:0.0,
        X:0.0,
        away_win:0.0,
        under:0.0,
        over:0.0,
        gg:0.0,
        ng:0.0,
        over_ht:0.0
    };
    return dict;
}

exports.palinsesto=async function (){
    client.connect();
    var champ=fs.readFileSync("./1.main_files/campionati.json");
    champ=JSON.parse(champ);
    champ=champ.href;
    ////*** */
    var i=0;
    //**** */
    var first_iteration=1; 
    var f={
        id:'',
        champ:'',
        nazione:'',
        id_champ:-1,
        timestamp:0,
        data:'',
        ora:'',
        home_team:'',
        away_team:'',
        home_id:'',
        away_id:'',
        odds:{
            home_win:0.0,
            X:0.0,
            away_win:0.0,
            under:0.0,
            over:0.0,
            gg:0.0,
            ng:0.0,
            over_ht:0.0
        }
    };
    //OPEN BROWSER
    var browser=await scrape.browser_retry(puppeteer);

    var arr=[];
    
    do{
        //QUERY CAMPIONATO 
        var text=String(champ[i]);
        text=text.split("/");
        text=text[3]; //text contiene nome champ
        if(text.includes("-")!=-1)text=text.replace("-"," ");
        if(text.includes("-")!=-1)text=text.replace("-"," ");
        f.champ=text;
        champ[i]=String(champ[i]).slice(0,-1);
        var url=`https://www.diretta.it${champ[i]}/calendario`;

        console.log(url);

        // SETTING NAVIGATION OPTIONS
        var page=await scrape.new_page(browser,scrape.randomUserAgent(),viewPort,url);

        await scrape.range_sleep(1000);

        //accetta cookie prima iterazione:
        if(first_iteration==1){
            var cookie='#onetrust-accept-btn-handler';
            var cookie_selector="[id='onetrust-accept-btn-handler']";
            await scrape.click_on(page,cookie,cookie_selector);
            first_iteration=0;
        }

        //carica html
        var jsonData=await page.evaluate(() => document.body.innerHTML);
        var $=cheerio.load(jsonData);
        //***estrazione palinsesto***//

        var tab=$('.sportName.soccer');
        var j=0;
        var match=tab.children();
        //trova primo match

        if(match.eq(1).attr('class')=='event__round event__round--static')j=2;
        else j=1;

        var not_found=$("#no-match-found");
        if(not_found==''){
            var nazione=ps.insert_palinsesto_nazione($);
            var id_champ=file.insert_palinsesto_id_champ(f,nazione);
            var champ1=f.champ;
            //scorri match e prendi id partite odierne,filtra per data,(salva squadre,id_squadre,id_match,data,ora)
            while((match.eq(j).attr('class')!="event__round event__round--static" || match.eq(j).attr('class')!="event__match event__match--static event__match--scheduled event__match--twoLine") && nazione!=''){
                var elem=match.eq(j).children();
                //match posticipato:
                if(ps.match_post(elem,f)){j++; continue;}
                //prendi data,ora,home e away team
                if(ps.today_match(elem,f) && not_found==''){
                    //nomi team
                    ps.get_name_team_palinsesto(elem,f);
                    //insert nazione, id_squadre, champ, season, ts
                    f.nazione=nazione;
                    f.id_champ=id_champ;
                    f.champ=champ1;
                    season=ps.take_season($);
                    f.timestamp=ts.get_match_timestamp_palinsesto(f,season);
                    f=file.insert_palinsesto_id_squadre(f);
                    //prendi id_match
                    ps.insert_palinsesto_id(match,f,j);
                    arr.push(f);
                    f=ps.reset_palinsesto_file(f);
                }
                else{break;}
                j++;
            }

        }

        await scrape.close_page(page);
        console.log("champ "+i+"/47 nuovi match: "+arr.length);
        i++;
    }while(i<champ.length);

    //salva quote

    i=0;
    while(i<arr.length){
        var dict={}
        dict=reset_dict();
        var odds_url=`https://www.diretta.it/partita/${arr[i].id}/#/comparazione-quote/`;
        var params=["quote-1x2/finale","over-under/finale","over-under/1-tempo","gol-no-gol/finale"];
        try{ 
            for(var k=0;k<params.length;k++){ 
                var page1=await scrape.new_page(browser,scrape.randomUserAgent(),viewPort,(odds_url+params[k]));
                var jsonData1=await page1.evaluate(() => document.body.innerHTML);
                
                var $$=cheerio.load(jsonData1);
                await extract.extract_odds($$,dict,k);//
                await scrape.close_page(page1);
            } 
                 
            if(dict.away_win==0 || dict.home_win==0 || dict.over_ht==0 || dict.gg==0 || dict.ng==0 || dict.over==0 || dict.under==0 ||
                isNaN(dict.away_win) || isNaN(dict.home_win) || isNaN(dict.over_ht) || isNaN(dict.gg) || isNaN(dict.ng) || isNaN(dict.over) || isNaN(dict.under) ||
                dict.away_win==null || dict.home_win==null || dict.over_ht==null || dict.gg==null || dict.ng==null || dict.over==null || dict.under==null){
                        console.log("no odds partita: "+i);
                        var not_odds=fs.readFileSync("./error_files/not_odds.json");
                        not_odds=JSON.parse(not_odds);
                        not_odds.push(arr[i].id);
                        fs.writeFileSync("./error_files/not_odds.json",JSON.stringify(not_odds));
            }
        }catch{
            await scrape.range_sleep(5000);
            console.log("no odds partita: "+arr[i].id);
            var not_odds=fs.readFileSync("./error_files/not_odds.json");
            not_odds=JSON.parse(not_odds);
            not_odds.push(arr[i].id);
            fs.writeFileSync("./error_files/not_odds.json",JSON.stringify(not_odds));
        }  
        arr[i].odds=dict;
        i++;
    }

    //salva palinsesto
    for(var k=0;k<arr.length;k++){
        var q=await mongo.findById_palinsesto(client,arr[k].id);
        if(q.length<1){
            await mongo.insert_match_palinsesto(client,arr[k]);
        }
    }
    console.log("salvati "+arr.length+" elementi");
    await browser.close();
}