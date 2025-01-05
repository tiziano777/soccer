const fs = require("fs");
const mongo = require('../../my_modules/utils_modules/mongo');
const { MongoClient } = require("mongodb");

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
    var projection = { _id: 0, id: 1 };
    var res=[];
    var cursor = await client.db(dbName[0]).collection(collection1).aggregate([
        {
            $match: {
                $or: [
                    {
                        "data": {
                            $not: {
                                $regex: /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/
                            }
                        }
                    },
                    {
                        "ora": {
                            $not: {
                                $regex: /^([01]\d|2[0-3]):([0-5]\d)$/
                            }
                        }
                    },
                    {
                        "home_id": {
                            $not: {
                                $regex: /^[a-zA-Z0-9]{6}$/
                            }
                        }
                    },
                    {
                        "away_id": {
                            $not: {
                                $regex: /^[a-zA-Z0-9]{6}$/
                            }
                        }
                    },
                    {
                        "home_team": '' 
                    },
                    {
                        "away_team": '' 
                    },
                    {"timestamp": {
                        $eq: null,
                        $eq: 0 
                        }
                    }
                ]
            }
        }
    ]).project(projection);
    await cursor.forEach(doc => res.push(doc.id));
    fs.writeFileSync("./palinsesto_ts_error_id.json",JSON.stringify(res));
    process.exit(0);

}

main();