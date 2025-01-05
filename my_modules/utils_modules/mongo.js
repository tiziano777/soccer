//LIBRERIE
const fs= require("fs");
const { exit } = require("process");
const ts=require("./timestamp.js");
const file=require("./file.js");
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName =["calcio"]; 
// Database collection
const collection='calcio';
const collection1='palinsesto';

//FUNZIONI COLLECTION CALCIO

exports.insert_match= async function(client,match){
  await client.db(dbName[0]).collection(collection).insertOne(match);
}

exports.findById= async function(client,id){
  var res=[];
  var cursor=await client.db(dbName[0]).collection(collection).find({"id":id});
  if(cursor!=null){
    await cursor.forEach(doc => res.push(doc));
    return res;
  }
  return [];
}

exports.findByChamp=async function(client,id){
  var res=[];
  var cursor=await client.db(dbName[0]).collection(collection).find({"details.id_champ":id});
  await cursor.forEach(doc => res.push(doc));
  return res;
}

exports.findIds=async function(client){
  var res=[];
  var projection = { _id: 0, id: 1 };
  var cursor=await client.db(dbName[0]).collection(collection).find({}).project(projection);
  await cursor.forEach(doc => res.push(doc.id));
  return res;
}


exports.deleteById= async function(client,obj){
  if(obj==null)return null;
  var res=await client.db(dbName[0]).collection(collection).deleteMany(obj);
  if(res!=null)return res;
  return null;
}

exports.updateFile=async function(client,id,obj){
  if(obj==null || id==null)return null;
  query=Object({"id":id});
  var val={ $set: Object(obj) };
  var res=await client.db(dbName[0]).collection(collection).updateOne(query,val);
  if(res==null){
    console.log("error update doc");
    return null;
  }
  return res;
}

exports.maxRound=async function(client,f){
  if(f==null)return null;
  var year=new Date().getFullYear();
  var dates=ts.solveSeasons(year);
  var projection={_id:0,"details.round":1};
  var res1=[];
  var cursor = await client.db(dbName[0]).collection(collection).find({
    $and: [
      { "details.campionato": f.champ },
      {
        $or: [{
          $and: [
            { "details.timestamp": { $gte: dates[0] } },
            { "details.timestamp": { $lte: dates[1] } },
          ],
        },
        {
          $and: [
            { "details.timestamp": { $gte: dates[2] } },
            { "details.timestamp": { $lte: dates[3] } },
          ],
        },
        ],
      },
    ],
  }).project(projection).sort({"details.round":-1}).limit(1);

  if(await cursor.count()>0){
    await cursor.forEach(doc =>res1.push(doc));
    return res1[0];
  }
  return [];
}

exports.remove_duplicate=async function(client){
  //prendo tutti id
  var res=[];
  var projection = { _id: 0, id: 1 };
  var cursor=await client.db(dbName[0]).collection(collection).find({}).project(projection);
  await cursor.forEach(doc => res.push(doc.id));
  res.sort();
  var j;
  var k=0;
  for(var i=0;i<res.length-1;i++){
    j=i+1;
    if(res[i]==res[j]){
        await client.db(dbName[0]).collection(collection).deleteOne({"id":res[j]});
        console.log("eliminato"+k+"  "+res[j]);
        k++;
    }
  }

}

exports.find_odds_error_id=async function(client,year){
  var res=[];
  var projection = { _id: 0, id: 1 };
  var dates=ts.solveSeasons(year)
  var cursor = await client
  .db(dbName[0])
  .collection(collection)
  .find({
    $and: [
      {
        $or: [
          { "odds.home_win": 0 },
          { "odds.over_ht": 0 },
          { "odds.gg": 0 },
          { "odds.over": 0 },
        ],
      },
      {
        $or: [
          {
            $and: [
              { "details.timestamp": { $gte: dates[0] } },
              { "details.timestamp": { $lte: dates[1] } },
            ],
          },
          {
            $and: [
              { "details.timestamp": { $gte: dates[2] } },
              { "details.timestamp": { $lte: dates[3] } },
            ],
          },
        ],
      },
    ],
  }).project(projection);

  await cursor.forEach(doc => res.push(doc.id));
  return res;

}

exports.find_current_season_matches=async function(client,id_champ){
  var res=[];
  var year=new Date().getFullYear();
  var dates=ts.solveSeasons(year);
  var cursor=await client.db(dbName[0]).collection(collection).find(
    {$and:[
      {"details.id_champ":id_champ},
      {
        $or: [
          {
            $and: [
              { "details.timestamp": { $gte: dates[0] } },
              { "details.timestamp": { $lte: dates[1] } },
            ],
          },
          {
            $and: [
              { "details.timestamp": { $gte: dates[2] } },
              { "details.timestamp": { $lte: dates[3] } },
            ],
          },
        ],
      },
    ]}
  );

  await cursor.forEach(doc => res.push(doc));
  return res;
}

//FUNZIONI COLLECTION PALINSESTO

//query per id,restituisce doc (find)
//insert
exports.insert_match_palinsesto= async function(client,match){
  await client.db(dbName[0]).collection(collection1).insertOne(match);
}

exports.findById_palinsesto= async function(client,id){
  query=Object({"id":id});
  var res=await client.db(dbName[0]).collection(collection1).findOne(query);
  if(res!=null)return Array(res);
  return [];
}
exports.findIds_season_palinsesto=async function(client,year){
  var res=[];
  var projection = { _id: 0, id: 1 };
  var dates=ts.solveSeasons(year);
  var cursor=await client.db(dbName[0]).collection(collection1).find(
    {
      $or: [
        {
          $and: [
            { "details.timestamp": { $gte: dates[0] } },
            { "details.timestamp": { $lte: dates[1] } },
          ],
        },
        {
          $and: [
            { "details.timestamp": { $gte: dates[2] } },
            { "details.timestamp": { $lte: dates[3] } },
          ],
        },
      ],
    }, 
  ).project(projection);
  await cursor.forEach(doc => res.push(doc.id));
  return res;
}

exports.findIds_palinsesto=async function(client){
  var res=[];
  var projection = { _id: 0, id: 1 };
  var cursor=await client.db(dbName[0]).collection(collection1).find({}).project(projection);
  await cursor.forEach(doc => res.push(doc.id));
  return res;
}

exports.updateFile_palinsesto=async function(client,id,obj){
  if(obj==null || id==null)return null;
  query=Object({"id":id});
  var val={ $set: Object(obj) };
  var res=await client.db(dbName[0]).collection(collection1).updateOne(query,val);
  if(res==null){
    console.log("error update doc");
    return null;
  }
  return res;
}
//funzione che controlla consistenza dei dati,restituisce array di id
/*
exports.find_error_season_ids=async function(client){
  var res=[];
  var projection = { _id: 0, id: 1 };
  var cursor=await client.db(dbName[0]).collection(collection).find({"details.season":""}).project(projection);
  await cursor.forEach(doc => res.push(doc.id));
  return res;
}
*/
exports.remove_duplicate_palinsesto=async function(client){
  //prendo tutti id
  var res=[];
  var projection = { _id: 0, id: 1 };
  var cursor=await client.db(dbName[0]).collection(collection1).find({}).project(projection);
  await cursor.forEach(doc => res.push(doc.id));
  res.sort();
  var j;
  var k=0;
  
  for(var i=0;i<res.length-1;i++){
    j=i+1;
    if(res[i]==res[j]){
        await client.db(dbName[0]).collection(collection1).deleteOne({"id":res[j]});
        console.log("eliminato"+k+"  "+res[j]);
        k++;
    }
  }
}

exports.find_odds_error_id_palinsesto=async function(client){
  var res=[];
  var projection = { _id: 0, id: 1 };

  var cursor=await client.db(dbName[0]).collection(collection1).find(
    {"$or":[{"odds.home_win":0},{"odds.over_ht":0},{"odds.gg":0},{"odds.over":0}]}
  ).project(projection);
    
  await cursor.forEach(doc => res.push(doc.id));
  console.log(res.length);
  exit(0);
  return res;

}

exports.deleteById_palinsesto= async function(client,obj){
  if(obj==null)return null;
  var res=await client.db(dbName[0]).collection(collection1).deleteMany(obj);
  if(res!=null)return res;
  return null;
}