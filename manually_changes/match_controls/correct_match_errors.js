const fs = require("fs");
const mongo = require('../../my_modules/utils_modules/mongo');
const { MongoClient } = require("mongodb");
const ts = require('../../my_modules/utils_modules/timestamp');


const DBurl = 'mongodb://localhost:27017';
const champLength = 48;
// Database Name
const dbName = ["calcio"];
// Database collection
const collection = 'calcio';
const collection1 = 'palinsesto';
const client = new MongoClient(DBurl, { useUnifiedTopology: true });

async function main() {
    await client.connect();

    var res=[];

    var cursor= await client.db(dbName[0]).collection(collection).find({
        $or: [
          {
            "stat.full_time": {},
            "stat.half_time": { $ne: {} },
            "stat.final_time": { $ne: {} }
          }/*,
          {
            "stat.full_time": { $ne: {} },
            "stat.half_time": {},
            "stat.final_time": { $ne: {} }
          },
          {
            "stat.full_time": { $ne: {} },
            "stat.half_time": { $ne: {} },
            "stat.final_time": {}
          }*/
        ]
    }).project({_id:0,id:1});
    await cursor.forEach(doc => res.push(doc.id));
    console.log(res.length);

    for(var i=0;i<ids.length;i++){
        var match= await mongo.findById(client,ids[i]);
        match=match[0];
        print(match.stat.full_time);
        print('init changes');
        //POSSESSO PALLA AVG
        match.stat.full_time.possesso_palla.home=(match.stat.half_time.possesso_palla.home+match.stat.half_time.possesso_palla.home)/2;
        match.stat.full_time.possesso_palla.away=(match.stat.half_time.possesso_palla.away+match.stat.half_time.possesso_palla.away)/2;
        // Cartellini rossi
        if(match.stat.half_time.cartellini_rossi.home != undefined && match.stat.final_time.cartellini_rossi.home == undefined){
            match.stat.full_time.cartellini_rossi.home=match.stat.half_time.cartellini_rossi.home
        }
        if(match.stat.half_time.cartellini_rossi.home == undefined && match.stat.final_time.cartellini_rossi.home != undefined){
            match.stat.full_time.cartellini_rossi.home=match.stat.final_time.cartellini_rossi.home
        }
        if(match.stat.half_time.cartellini_rossi.home != undefined && match.stat.final_time.cartellini_rossi.home != undefined){
            match.stat.full_time.cartellini_rossi.home=match.stat.final_time.cartellini_rossi.home+match.stat.final_time.cartellini_rossi.home
        }

        if(match.stat.half_time.cartellini_rossi.away != undefined && match.stat.final_time.cartellini_rossi.away == undefined){
            match.stat.full_time.cartellini_rossi.away=match.stat.half_time.cartellini_rossi.away
        }
        if(match.stat.half_time.cartellini_rossi.away == undefined && match.stat.final_time.cartellini_rossi.away != undefined){
            match.stat.full_time.cartellini_rossi.away=match.stat.final_time.cartellini_rossi.away
        }
        if(match.stat.half_time.cartellini_rossi.away != undefined && match.stat.final_time.cartellini_rossi.away != undefined){
            match.stat.full_time.cartellini_rossi.away=match.stat.final_time.cartellini_rossi.away+match.stat.final_time.cartellini_rossi.away
        }
        
    }
    //fs.writeFileSync("./match_stat_error_id.json",JSON.stringify(res));
    process.exit(0);
}

/*
async function main() {
    client.connect();
    var ids= fs.readFileSync('./match_error_id.json');
    ids=JSON.parse(ids);
    for(var i=0;i<ids.length;i++){
        var match= await mongo.findById(client,ids[i]);
        await mongo.deleteById(client,match[0]);
    }
    process.exit(0);
}
*/
main();
/*
full_time: {
    possesso_palla: { home: 51, away: 49 },
    tiri: { home: 9, away: 7 },
    tiri_in_porta: { home: 3, away: 3 },
    tiri_fuori: { home: 6, away: 4 },
    punizioni: { home: 18, away: 15 },
    angoli: { home: 4, away: 5 },
    rimesse_laterali: { home: 18, away: 25 },
    parate: { home: 1, away: 2 },
    cartellini_rossi: { home: 1, away: 0 },
    cartellini_gialli: { home: 3, away: 3 },
    attacchi: { home: 75, away: 87 },
    attacchi_pericolosi: { home: 32, away: 47 }
  },
  half_time: {},
  final_time: {
    possesso_palla: { home: 51, away: 49 },
    tiri: { home: 9, away: 7 },
    tiri_in_porta: { home: 3, away: 3 },
    tiri_fuori: { home: 6, away: 4 },
    punizioni: { home: 18, away: 15 },
    angoli: { home: 4, away: 5 },
    rimesse_laterali: { home: 18, away: 25 },
    parate: { home: 1, away: 2 },
    cartellini_rossi: { home: 1, away: 0 },
    cartellini_gialli: { home: 1, away: 2 },
    attacchi: { home: 75, away: 87 },
    attacchi_pericolosi: { home: 32, away: 47 }
  }
*/