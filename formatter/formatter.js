const fs = require('fs');
const mongo=require("../my_modules/utils_modules/mongo.js");

const {MongoClient}=require("mongodb");
const DBurl = 'mongodb://localhost:27017';
const client = new MongoClient(DBurl,{ useUnifiedTopology: true });

function convertToSeries(documents) {
  const series = {};
  // Itera su ciascun documento JSON nell'array
  documents.forEach((document, index) => {
    for (let key in document) {
      if (!series[key]) {
        series[key] = [];
      }
      series[key][index] = document[key];
    }
  });
  return series;
}

function flattenJSON(document) {
  const flattened = {};
  function flatten(obj, prefix = '') {
    if (typeof obj !== 'object' || Array.isArray(obj)) {
      flattened[prefix.slice(0, -1)] = obj;
      return;
    }
    for (let key in obj) {
      flatten(obj[key], prefix + key + '_');
    }
  }
  flatten(document);
  return flattened;
}

async function main(){
  await client.connect();
  process.exit(0);
}

main();