const fs = require("fs");
const mongo = require('../../my_modules/utils_modules/mongo');
const { MongoClient } = require("mongodb");

const DBurl = 'mongodb://localhost:27017';
const champLength = 48;
// Database Name
const dbName = ["calcio"];
// Database collection
const collection = 'calcio';
const client = new MongoClient(DBurl, { useUnifiedTopology: true });

var schema = {
    id: '',
    details: {
        nazione: '',
        country_code: -1,
        campionato: '',
        id_champ: -1,
        round: -1,
        str_date: '',
        data: '',
        ora: '',
        timestamp: 0
    },
    home: '',
    away: '',
    home_id: '',
    away_id: '',
    result: '',
    home_goal: -1,
    away_goal: -1,
    winner_code: 0,
    ht_result: '',
    st_result: '',
    stat: {
        full_time: [],
        half_time: [],
        final_time: []
    },
    odds: {}
};
async function main() {
    await client.connect();
    var projection = { _id: 0, id: 1 };
    var res=[];
    var cursor = await client.db(dbName[0]).collection(collection).aggregate([
        {
            $match: {
                $or: [
                    {
                        "details.data": {
                            $not: {
                                $regex: /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/
                            }
                        }
                    },
                    {
                        "details.ora": {
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
                    {
                        "home_goal": -1 
                    },
                    {
                        "away_goal": -1
                    },
                    {
                        "result": {
                            $not: {
                                $regex: /^[0-9]+-[0-9]+$/
                            }
                        }
                    },
                    {
                        "details.timestamp": {
                            $eq: null,
                            $eq: 0 
                        }
                    },
                    {
                        "stat.full_time.tiri_": { 
                        $exists: true 
                        }
                    },
                    {
                        "stat.full_time.parate_":{
                            $exists: true
                        }
                    },
                    {
                        "stat.full_time.attacchi_":{
                            $exists: true
                        }
                    },
                    {
                        "stat.full_time.punizioni_":{
                            $exists: true
                        }
                    },
                    {
                        "stat.full_time.fuorigioco_":{
                            $exists: true
                        }
                    }
                                        
                ]
            }
        }
    ]).project(projection);
    await cursor.forEach(doc => res.push(doc.id));
    console.log(res.length);
    fs.writeFileSync("./match_error_id.json",JSON.stringify(res));
    process.exit(0);

}

main();