//PALINSESTO FUNCTIONS:

async function range_sleep(time) {  
    await sleep(time*(Math.random() * (1.500- 0.500) + 0.500).toFixed(3));  
}

exports.match_post=function(elem,f){
    var date=new Date();
    var clock=elem.eq(1).text();
    clock=clock.split(".");
    var day=clock[0];
    var month=clock[1];
    
    if(date.getDate()==parseInt(day) && (date.getMonth()+1)==parseInt(month)){
        var ora=clock[2];
        var regex =/[a-zA-Z]/;
        return regex.test(ora);
    }
}

exports.today_match=function(elem,f){
    var date=new Date();
    var clock=elem.eq(2).text();
    clock=clock.split(".");
    var day=clock[0];
    var month=clock[1];

    if(date.getDate()==parseInt(day) && (date.getMonth()+1)==parseInt(month)){
        var ora=clock[2];
        ora=ora.replace(/[a-zA-Z\s]/g, '');
        ora=ora.split(":");
        var hh=parseInt(ora[0]);
        var mm=ora[1];
        if((date.getHours()+1)<=hh){
            f.ora=String(hh+":"+mm);
            f.data=day+"/"+month;
            return true;
        }
    }
    return false;
}

exports.take_season=function($){
    var season=$('.heading__info').text();
    return season;
}

exports.insert_palinsesto_nazione=function($){
    var res=$('.breadcrumb__link');
    res=res.text().slice(6);
    try{
    res=res.toLowerCase();
    }catch(err){return '';}
    return res;
}

exports.insert_palinsesto_id=function(match,f,j){
    var id=match.eq(j).attr('id');
    id=id.split("_");
    id=id[2];
    f.id=id;
}

exports.reset_palinsesto_file=function(f){
    f={
        id:'',
        champ:'',
        nazione:'',
        id_champ:0,
        data:'',
        ora:'',
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
exports.get_name_team_palinsesto=function(elem,f){
    f.home_team=elem.eq(3).text();
    f.home_team=f.home_team.toLowerCase();
    f.away_team=elem.eq(4).text();
    f.away_team=f.away_team.toLowerCase();
    f.home_team=f.home_team.replace(/[^a-z ]?/g,"");
    f.away_team=f.away_team.replace(/[^a-z ]?/g,"");
}
