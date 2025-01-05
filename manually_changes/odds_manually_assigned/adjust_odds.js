const mongo=require('../../my_modules/utils_modules/mongo');
const { MongoClient } = require("mongodb");

const DBurl='mongodb://localhost:27017';
const champLength=48;
// Database Name
const dbName =["calcio"];
// Database collection
const collection='calcio';
const collection1='palinsesto';
const client = new MongoClient(DBurl,{ useUnifiedTopology: true });

async function main(){
    await client.connect();
    //id to change
    var id="vXAgog9i";

    //findbyid match
    var match=await mongo.findById(client,id);
    match=match[0];
    var palinsesto=await mongo.findById_palinsesto(client,id);
    palinsesto=palinsesto[0];
    console.log('match da aggiornare:');
    console.log(match);
    
    //findbyid palnsesto
    console.log('palinsesto da aggiornare:');
    console.log(palinsesto);
    

    //insert odds changes match
    match.odds.home_win=2.37;
    match.odds.X=3.1;
    match.odds.away_win=2.87;
    /*match.odds.over=1.83;
    match.odds.under=1.85;
    match.odds.over_ht=1.21;
    match.odds.gg=1.53;
    match.odds.ng=2.28;*/
    //insert by changes palinsesto
    palinsesto.odds.home_win=2.37;
    palinsesto.odds.X=3.1;
    palinsesto.odds.away_win=2.87;
    /*palinsesto.odds.over=1.83;
    palinsesto.odds.under=1.85;
    palinsesto.odds.over_ht=1.21;
    palinsesto.odds.gg=1.53;
    palinsesto.odds.ng=2.28;*/

    //updateOne
    var match_updated=await mongo.updateFile(client,id,match);
    var palinsesto_updated=await mongo.updateFile_palinsesto(client,id,palinsesto);
    console.log('new match odds:');
    console.log(match_updated);
    console.log(palinsesto_updated);
    process.exit(0);
}

main();