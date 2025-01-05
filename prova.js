
const cheerio=require("cheerio");
const puppeteer=require("puppeteer");
const {MongoClient}=require("mongodb");
const fs=require("fs");
//const cron = require('node-cron');
//const express = require('express');
const ts=require('./my_modules/utils_modules/timestamp')
const trigger=require('./task/team_stats/mongo_trigger.js');
const scrape = require("./my_modules/scrape_modules/scrape.js");
const scrape2 = require("./my_modules/scrape_modules/extract_stat_scrape.js");
const file=require("./my_modules/utils_modules/file.js");
const array=require("./my_modules/utils_modules/array.js");
const mongo=require("./my_modules/utils_modules/mongo.js");
const baseError = require('./my_modules/utils_modules/baseError.js');
const mail=require("./my_modules/utils_modules/email.js");
const stats=require("./task/extractor/extract_stat.js");
const func_id = require("./task/extractor/current_season_ids.js");
const pal=require("./task/palinsesto/palinsesto.js");
const correct_pal=require("./task/palinsesto/correct_palinsesto.js");

const { exit } = require("process");
const { match } = require("assert");
//COSTANTI
const DBurl='mongodb://localhost:27017';
const champLength=48;
// Database Name
const dbName =["calcio"];
// Database collection
const collection='calcio';
const collection1='palinsesto';
const client = new MongoClient(DBurl,{ useUnifiedTopology: true });


const apply = f => x => f(x);
const flip = f => y => x => f(x) (y);
const createSet = xs => new Set(xs);
const filter = f => xs => xs.filter(apply(f));
// left difference
const differencel = xs => ys => {
    const zs = createSet(ys);
        return filter(x => zs.has(x)
    ? false
    : true
    ) (xs);
};
function generateRandomString(iLen) {
    var sRnd = '';
    var sChrs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    for (var i = 0; i < iLen; i++) {
      var randomPoz = Math.floor(Math.random() * sChrs.length);
      sRnd += sChrs.substring(randomPoz, randomPoz + 1);
    }
    return sRnd;
}

function odds_fill(dict){
    if(dict.home_win==0.0  || dict.X==0.0 || dict.away_win==0.0 || dict.under==0 || dict.over==0.0 || dict.gg==0.0 || dict.ng==0.0 || dict.over_ht==0.0)
        return false;
    else return true;
}
function findDuplicateValues(obj) {
    var values = Object.values(obj);
    var duplicates = values.filter(function(item, index){
        return values.indexOf(item) != index;
    });
    return duplicates;
}

function findDuplicateIdChamp(obj) {
    var values = Object.values(obj).map(function(element) {
        return element._id;
    });
    var duplicates = values.filter(function(item, index){
        return values.indexOf(item, index + 1) !== -1;
    });
    return duplicates;
}

function reset_dict(dict){
    dict={
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

async function error_function(err){
    await mail.send(err);
}

function checkDateFormat(dateString) {
    // pattern regex per il formato gg/mm/yyyy
    const pattern = /^\d{2}\/\d{2}\/\d{4}$/;
    
    // verifica se la stringa soddisfa il pattern regex
    return pattern.test(dateString);
}

async function main(){
    await client.connect();
    await trigger.perform_stats_report(client);
    process.exit(0);
}

/*
async function main(){
        
    const { spawn } = require('child_process');
    //comando
    const child = spawn('node stampa.js', ['~\demo_puppeteer'], {shell: true});
    //quando stampa
    child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    });
    //on error
    child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    });
    //on close
    child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    });

    
}
*/
/*
async function main() {
    await client.connect();
    await correct_pal.error_pal_and_match_odds_correct(client);

}
*/
/*
//FOGLIO SQUADRE 
async function main() {
    console.log('current seasons 2023 and 2023/2024')
    console.log(ts.solveSeasons());
    console.log('last seasons 2022 and 2022/2023')
    //console.log(ts.)

    // trova errori odds campionati 2022 e 2021/2022
    //trova errori odds campionati 2021 e 2020/2021
}
*/
main();

// ********************************************************************************************************************************
//FUNZIONI GESTIONE ERRORE 
/*
async function main(){
    await client.connect();
    var ids=fs.readFileSync("./time_errors.json");
    ids=JSON.parse(ids);
    for(var i=0;i<ids.length;i++){ 
        var id=ids[i];
        await mongo.deleteById(client,{id:id});
    }
    await stats.extract_stat(ids);
    exit(0);
}
main();
*/


//db.calcio.find({str_date: {$where: "this.str_date.length<10"}}, {_id:1})
//CHECK MINUTE GOAL
/*
function check_minute_goal(result,home,away,id){
        result=result.split("-"); 
        var r=parseInt(result[0])+parseInt(result[1]);
        if(r==(home.length+away.length))return null;
        else return id;
    }
async function main(){
    result=[]
    await client.connect()
    var ids=await mongo.findIds(client);
    for(var i=0;i<ids.length;i++){
        var id=ids[i];
        var match=await mongo.findById(client,id);
        result.push(check_minute_goal(match[0].result,match[0].gg_home,match[0].gg_away,id));
    }
    fs.writeFileSync("./integrity.json",JSON.stringify(result));
    exit(0);
}
main();
*/
/*
async function rewrite(){
    var a=fs.readFileSync("./integrity.json");
    a=JSON.parse(a);
    var b=[];
    for(var i=0;i<a.length;i++){
        if(a[i]!=null)b.push(a[i]);
    }
    fs.writeFileSync("mancanti.json",JSON.stringify(b));
    exit(0);
}
rewrite();
*/

