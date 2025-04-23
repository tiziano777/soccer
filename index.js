//const { spawn } = require('child_process');
//const cron = require('node-cron');
//const express = require('express');
const fs=require("fs");
const { MongoClient } = require("mongodb");
const mongo = require("./my_modules/utils_modules/mongo.js");
const ids = require("./task/extractor/current_season_ids.js");
const old_ids= require("./task/extractor/old_season_ids.js")
const stats = require("./task/extractor/extract_stat.js");
const pal = require("./task/palinsesto/palinsesto.js");
const correct_pal=require("./task/palinsesto/correct_palinsesto.js");


//COSTANTI
const DBurl = 'mongodb://localhost:27017';
const champLength = 48;
// CONNESSIONE MONGODB
const client = new MongoClient(DBurl, { useUnifiedTopology: true });

async function main() {
    await client.connect();
    
    // 1)FIND ALL PALINSESTO MATCHES:
    var r2=[];
    
    r2.concat(await mongo.findIds_palinsesto(client));
    
    // 2) CARICA MANCANTI SE CE NE SONO
    /*
    var mancanti=fs.readFileSync('./log/mancanti_log.json');
    mancanti=JSON.parse(mancanti);
    for (var i=0;i<mancanti.length;i++){
        await mongo.deleteById(client,{id:mancanti[i]})
    } 
    */

    //from oldest to recent palinsesto file
    r2 = r2.reverse();  // ottimizzare facendo query degli id dei match e facendo left difference!

    //ESTRAZIONE NUOVI MATCH GIORNALIERI PARTENDO DAL PALINSESTO PREMATCH
    var new_matches = [];
    new_matches = await stats.extract_stat(r2);

    //ESTRARRE ID DALLA PAGINA "risultati" in caso ci fossimo persi qualcosa dai palinsesti
    var id = await ids.get_id_match();

    new_matches.concat(await stats.extract_stat(id));
    console.log('nuovi match: ', new_matches.length);


    //AGGIORNA PALINSESTO CON PARTITE DELLA SEZIONE  "CALENDARIO"
    await correct_pal.error_pal_and_match_odds_correct(client);


    await pal.palinsesto();

    process.exit(0);
}

main();