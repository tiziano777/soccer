//get timestamp by a data,ora field
exports.get_match_timestamp= function(f) {
    var day = parseInt(f.data.slice(0, 2));
    var month = parseInt(f.data.slice(3, 5)) - 1; // Sottrai 1 perché i mesi vanno da 0 a 11
    var year= parseInt(f.data.slice(6,))
    //ora
    var oraArray = f.ora.split(":");
    var hour = parseInt(oraArray[0]);
    var minute = parseInt(oraArray[1]);

    return new Date(year, month , day, hour, minute).getTime() / 1000;
}

exports.get_match_timestamp_palinsesto= function(f,season) {
    //data 
    var day = parseInt(f.data.slice(0, 2));
    var month = parseInt(f.data.slice(3, 5)) - 1; // Sottrai 1 perché i mesi vanno da 0 a 11
    //ora
    var oraArray = f.ora.split(":");
    var hour = parseInt(oraArray[0]);
    var minute = parseInt(oraArray[1]);
    //season
    var year1;
    var year2;
    if (season.includes("/")) {
        var stagioneArray = season.split("/");
        year1 = parseInt(stagioneArray[0]);
        year2 = parseInt(stagioneArray[1]);
    } else {
        year1 = parseInt(season);
        f.data=f.data+'/'+season;
        return new Date(year1, month , day, hour, minute).getTime() / 1000;
    }
    var year;
    // Se la data è prima del 30 giugno, considera l'anno successivo, senno anno corrente.
    if (month < 5 || (month === 5 && day <= 30)) {year= year2;} else {year= year1;}
    f.data=f.data+'/'+String(year);
    return new Date(year, month , day, hour, minute).getTime() / 1000;
}



//FUNZIONI AUX PER SEASON

function timestampSeasonStart(year) {
    return Math.floor(new Date(year, 7, 1).getTime() / 1000);// 1° agosto
}
function timestampSeasonEnd(year) {
    return Math.floor(new Date(year + 1, 5, 30).getTime() / 1000); // 30 giugno
}
function getYearStartEndTimestamp(year) {
    const firstDayTimestamp = Math.floor(new Date(year, 0, 1).getTime() / 1000);
    const lastDayTimestamp = Math.floor(new Date(year, 11, 31).getTime() / 1000);
    return [firstDayTimestamp, lastDayTimestamp];
}

//////////////////////////////////////

exports.solveSeasons=function solveSeasons(year) {
    var start_end = [];
    start_end = getYearStartEndTimestamp(year);
    start_end.push(timestampSeasonStart(year));
    start_end.push(timestampSeasonEnd(year));

    return start_end;
}
exports.solveSingleSeason = function (id_champ,year) {
    var start_end = [];
    var single_year_season_champ_id = [0, 16, 17, 18, 24, 26, 31, 36, 29, 40, 42, 45];
    if (single_year_season_champ_id.includes(id_champ)) {
        start_end = getYearStartEndTimestamp(year);
    }
    else {
        start_end.push(timestampSeasonStart(year));
        start_end.push(timestampSeasonEnd(year));
    }

    return start_end;
}

exports.solveOldSeasonsByTimestamp=function (timestamp){
    var date= new Date(timestamp * 1000);
    const year = date.getFullYear();
    var start1=Math.floor(new Date(year, 7, 1).getTime() / 1000);//partenza 1° agosto anno x   (non si gioca a luglio)
    var end1=Math.floor(new Date(year + 1, 5, 30).getTime() / 1000); // fine 30 giugno anno (x+1) (non si gioca a luglio)
    var firstDayTimestamp = Math.floor(new Date(year, 0, 1).getTime() / 1000);
    var lastDayTimestamp = Math.floor(new Date(year, 11, 31).getTime() / 1000);
    return [start1,end1,firstDayTimestamp,lastDayTimestamp];
}

exports.solveOldSingleSeasonByTimestamp=function(timestamp,id_champ){
    var date= new Date(timestamp * 1000);
    const year = date.getFullYear();
    var res=[];
    single_year_season_champ_id = [0, 16, 17, 18, 24, 26, 31, 36, 29, 40, 42, 45];
    if (single_year_season_champ_id.includes(id_champ)) {
        res.push(Math.floor(new Date(year, 0, 1).getTime() / 1000));
        res.push(Math.floor(new Date(year, 11, 31).getTime() / 1000));
    }
    else {
        res.push(Math.floor(new Date(year, 7, 1).getTime() / 1000));//partenza 1° agosto anno x   (non si gioca a luglio)
        res.push(Math.floor(new Date(year + 1, 5, 30).getTime() / 1000)); // fine 30 giugno anno (x+1) (non si gioca a luglio)
    }
    return res;
}

exports.solveStringSeason= function(id_champ,timestamp){
    var single_year_season_champ_id = [0, 16, 17, 18, 24, 26, 31, 36, 29,39, 40, 42, 45];
    var date=new Date(timestamp*1000)
    var year=date.getFullYear();
    var month=date.getMonth()

    if (single_year_season_champ_id.includes(id_champ)) {
        return String(year);
    }
    else {
        if (month>=6){ // da agosto a dicembre: (current_year, current_year+1)
            return String(year)+'/'+String(year+1);
        }
        else{ // da gennaio a luglio: (current_year-1, current_year)
            return String(year-1)+'/'+String(year);
        }
    }
}