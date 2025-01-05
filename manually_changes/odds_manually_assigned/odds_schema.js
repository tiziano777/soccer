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
}

main();