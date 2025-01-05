const mongo=require("../../my_modules/utils_modules/mongo.js");
const array=require('../../my_modules/utils_modules/array.js');
const stats=require("../extractor/extract_stat.js");
const ts=require("../../my_modules/utils_modules/timestamp.js");
const { exit } = require("process");

function reset_pal(f){
    f={
        id:'',
        champ:'',
        nazione:'',
        id_champ:-1,
        data:'',
        ora:'',
        timestamp:0,
        home_team:'',
        away_team:'',
        home_id:'',
        away_id:'',
        odds:{
            home_win:0.0,
            X:0.0,
            away_win:0.0,
            under:0.0,
            over:0.0,
            gg:0.0,
            ng:0.0,
            over_ht:0.0
        }
    };
    return f;
}
var f={
    id:'',
    champ:'',
    nazione:'',
    id_champ:-1,
    data:'',
    ora:'',
    timestamp:'',
    home_team:'',
    away_team:'',
    home_id:'',
    away_id:'',
    odds:{
        home_win:0.0,
        X:0.0,
        away_win:0.0,
        under:0.0,
        over:0.0,
        gg:0.0,
        ng:0.0,
        over_ht:0.0
    }
};
//////////////////////////////////////////////////////////////
exports.error_odds=async function (client,year){
    //trovo match con quote errate
    var res=await mongo.find_odds_error_id(client,year);
    console.log("match odds error: "+res.length);
    //elimino match con quote errate
    for(var i=0;i<res.length;i++){
        var r=await mongo.deleteById(client,{id:res[i]});
        if(r==null){console.log("errore deleting "+res[i]);exit(0);}
        r=await mongo.deleteById_palinsesto(client,{id:res[i]});
        if(r==null){console.log("errore deleting "+res[i]);exit(0);}
        
    }
    //riestraggo match con quote errate nella speranza le salvi bene
    await stats.extract_stat(res);
    await perform_mToPal(client);
}
//////////////////////////////////////////////////////////////////////////////////////
exports.error_pal_and_match_odds_correct=async function(client){

    //elimino da palinsesto partite che non sono presenti nei match
    //await palinsesto_not_in_match(client);
    //risalvo match su palinsesto
    await perform_mToPal(client);

}
////////////////////////////////////////////////////////////////////////////////////////////////
async function perform_mToPal(client){

    var arr_pal=await mongo.findIds_palinsesto(client);
    var arr_match=await mongo.findIds(client);

    var arr=array.left_difference(arr_match,arr_pal);
    console.log("lunghezza array for MtoP "+arr.length);
    var match;
    var count=0;
    for(var i=0;i<arr.length;i++){
        match=await mongo.findById(client,arr[i]);
        if(match.length==1 && match!=[] && arr_pal.indexOf(match[0]._id)==-1){
            f.id=match[0].id;
            f.champ=match[0].details.campionato;
            f.id_champ=match[0].details.id_champ;
            f.nazione=match[0].details.nazione;
            f.timestamp=match[0].details.timestamp;
            f.data=match[0].details.data;
            f.ora=match[0].details.ora;
            f.home_team=match[0].home;
            f.away_team=match[0].away;
            f.home_id=match[0].home_id;
            f.away_id=match[0].away_id;
            f.odds.home_win=match[0].odds.home_win;
            f.odds.X=match[0].odds.X;
            f.odds.away_win=match[0].odds.away_win;
            f.odds.gg=match[0].odds.gg;
            f.odds.ng=match[0].odds.ng;
            f.odds.over=match[0].odds.over;
            f.odds.under=match[0].odds.under;
            f.odds.over_ht=match[0].odds.over_ht;
            
            await mongo.insert_match_palinsesto(client,f);
            count++;
            f=reset_pal(f);
        }
        else console.log("errore a id "+arr[i]);
    }
    console.log("correctly saved "+count+' matches');
}

async function palinsesto_not_in_match(client){
    var arr_pal=await mongo.findIds_palinsesto(client);
    var arr_match=await mongo.findIds(client);

    var arr=array.left_difference(arr_pal,arr_match);
    console.log("lunghezza array for deleting_palinsesto "+arr.length);
    for(var i=0;i<arr.length;i++){
        var match=await mongo.findById_palinsesto(client,arr[i]);
        console.log(match);
        if(match.length!=0){
        var k=await mongo.deleteById_palinsesto(client,{"id":match[0].id});
        if(k!=null)console.log("eliminato correttamente "+k.id);
        }
        else console.log("errore "+arr[i]);
    }
}





