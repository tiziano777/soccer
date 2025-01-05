const fs = require("fs");
const mongo = require('../../my_modules/utils_modules/mongo.js');
const { MongoClient } = require("mongodb");
const correct_pal=require("../../task/palinsesto/correct_palinsesto.js");
const { palinsesto } = require("../../task/palinsesto/palinsesto.js");

const DBurl = 'mongodb://localhost:27017';
const champLength = 48;
const client = new MongoClient(DBurl, { useUnifiedTopology: true });

async function main(){
    await client.connect();
    
}

main();