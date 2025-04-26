//FUNZIONI SCRAPE PROGETTO DIRETTA.IT
//FUNZIONI EXTRACT_STAT
const scrape = require("./scrape.js");


//TAKE ODDS
exports.extract_odds = async function ($, dict, k, page) {
    if (k == 0) {
        var val = $(".ui-table__row");
        for (var i = 0; i < val.length; i++) {
            var row = val.eq(i).children();
            var h = row.eq(1).text();
            var x = row.eq(2).text();
            var a = row.eq(3).text();
            if (row.eq(1).attr('class') != "oddsCell__noOddsCell" && row.eq(2).attr('class') != "oddsCell__noOddsCell") {
                dict.home_win = parseFloat(h);
                dict.X = parseFloat(x);
                dict.away_win = parseFloat(a);
                break;
            }
        }
    }
    else if (k == 1) {
        var val = $(".ui-table__row");
        for (var i = 0; i < val.length; i++) {
            var row = val.eq(i).children();
            var odd = parseFloat(row.eq(1).text());
            var o = row.eq(2).text();
            var u = row.eq(3).text();
            if (odd == 2.5 && row.eq(2).attr('class') != "oddsCell__noOddsCell") {
                dict.over = parseFloat(o);
                dict.under = parseFloat(u);
                break;
            }
        }
    }
    else if (k == 2) {
        var val = $(".ui-table__row");
        for (var i = 0; i < val.length; i++) {
            var row = val.eq(i).children();
            var odd = parseFloat(row.eq(1).text());
            var o = row.eq(2).text();
            if (odd == 0.5 && row.eq(2).attr('class') != "oddsCell__noOddsCell") {
                dict.over_ht = parseFloat(o);
                break;
            }
        }
    }
    else if (k == 3) {
        var val = $(".ui-table__row");
        for (var i = 0; i < val.length; i++) {
            var row = val.eq(i).children();
            var gg = row.eq(1).text();
            var ng = row.eq(2).text();
            if (row.eq(2).attr('class') != "oddsCell__noOddsCell") {
                dict.gg = parseFloat(gg);
                dict.ng = parseFloat(ng);
                break;
            }
        }
    }


}



////////////////////////////////////////////////////

exports.check_error = function (match) {
    if (
        match.id == '' || match.details.nazione == '' || match.details.campionato == '' || match.details.round == -1 ||
        match.details.str_date == '' || match.details.data == '' || match[j].details.ora == '' || match.details.timestamp == 0 || match[j].details.id_champ == -1 || match.home == '' ||
        match.away == '' || match.result == '' || match.ht_result == '' || match.st_result == '' || match.odds == {} ||
        match.home_id == '' || match.away_id == ''
    ) {
        return true;
    }
    return false;
}


exports.riempito = function (output) {
    var confronto = {
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
    if (output == confronto) return true;
    return false;
}

/////////////////////////////////////////////////////////

//check validity minute goal

/*
exports.check_minute_goal = function (result, home, away, output) {
    result = result.split("-");
    var r = parseInt(result[0]) + parseInt(result[1]);
    if (r == (home.length + away.length)) return output;
    output.gg_home = [];
    output.gg_away = [];
    return output;
}
*/

exports.num_goal = function (output) {
    var string_result = output.result;
    string_result = string_result.split("-");
    output.home_goal = parseInt(string_result[0]);
    output.away_goal = parseInt(string_result[1]);
    return output;
}

exports.winner_code = function (output) {

    var string_result = output.result;
    string_result = string_result.split("-");

    if (parseInt(string_result[0]) == parseInt(string_result[1])) {
        output.winner_code = 3;
    }
    else if (string_result[0] > string_result[1]) {
        output.winner_code = 1;
    }
    else if (string_result[0] < string_result[1]) {
        output.winner_code = 2;
    }
    else {
        console.log("error in winner_code");
    }

    return output;

}

exports.check_negative_stat = function (output) {

    if (output.stat != { "full_time": {}, "half_time": {}, "final_time": {} }) {
        var key_arr = Object.keys(output.stat.half_time);
        for (var k = 0; k < key_arr.length; k++) {

            if (output.stat.half_time[key_arr[k]].home < 0) {
                output.stat.half_time[key_arr[k]].home = Math.abs(output.stat.half_time[key_arr[k]].home);
            }
            if (output.stat.half_time[key_arr[k]].away < 0) {
                output.stat.half_time[key_arr[k]].away = Math.abs(output.stat.half_time[key_arr[k]].away);
            }
        }
        key_arr = Object.keys(output.stat.final_time);
        for (var k = 0; k < key_arr.length; k++) {
            if (output.stat.final_time[key_arr[k]].home < 0) {
                output.stat.final_time[key_arr[k]].home = Math.abs(output.stat.final_time[key_arr[k]].home);
            }
            if (output.stat.final_time[key_arr[k]].away < 0) {
                output.stat.final_time[key_arr[k]].away = Math.abs(output.stat.final_time[key_arr[k]].away);
            }
        }
        key_arr = Object.keys(output.stat.full_time);
        for (var k = 0; k < key_arr.length; k++) {
            if (output.stat.full_time[key_arr[k]].home < 0) {
                output.stat.full_time[key_arr[k]].home = Math.abs(output.stat.full_time[key_arr[k]].home);
            }
            if (output.stat.full_time[key_arr[k]].away < 0) {
                output.stat.full_time[key_arr[k]].away = Math.abs(output.stat.full_time[key_arr[k]].away);
            }
        }
    }
    return output;
}

exports.format_stat = function (text) {
    var statistiche = {
        full_time: {},
        half_time: {},
        final_time: {}
    };

    // Helper function to process stat names
    function processStatName(name) {
        // Convert to lowercase, trim, and remove accents
        name = String(name)
            .toLowerCase()
            .trimEnd()
            .normalize('NFD')  // Decompose combined characters
            .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
            .replace(/'/g, '_')  // Replace apostrophes with underscores
            .replace(/ /g, '_');  // Replace spaces with underscores

        // Special cases
        if (name == "calci_d_angolo") name = "angoli";
        else if (name == 'possesso_palla') {
            return { name, isPercentage: true };
        }

        return { name, isPercentage: false };
    }

    // Process each time period
    ['full_time', 'half_time', 'final_time'].forEach(timePeriod => {
        for (var i = 0; i < text.stat[timePeriod].length; i++) {
            var { name, isPercentage } = processStatName(text.stat[timePeriod][i].name);

            // Handle percentage fields
            if (isPercentage) {
                text.stat[timePeriod][i].home = text.stat[timePeriod][i].home.replace("%", "");
                text.stat[timePeriod][i].away = text.stat[timePeriod][i].away.replace("%", "");
            }

            if (name == 'xgot') {
                statistiche[timePeriod][name] = {
                    "home": parseFloat(text.stat[timePeriod][i].home),
                    "away": parseFloat(text.stat[timePeriod][i].away)
                };
            }
            else if (name == 'xg') {
                statistiche[timePeriod][name] = {
                    "home": parseFloat(text.stat[timePeriod][i].home),
                    "away": parseFloat(text.stat[timePeriod][i].away)
                };
            }
            else if (name == 'xa') {
                statistiche[timePeriod][name] = {
                    "home": parseFloat(text.stat[timePeriod][i].home),
                    "away": parseFloat(text.stat[timePeriod][i].away)
                };
            }

            else {
                statistiche[timePeriod][name] = {
                    "home": parseInt(text.stat[timePeriod][i].home),
                    "away": parseInt(text.stat[timePeriod][i].away)
                };
            }
        }
    });

    text.stat = statistiche;
    return text;
};

//get name teams

exports.get_name_teams = function ($, output) {
    var team = $('.participant__participantName.participant__overflow');
    output.home = team.eq(0).text();
    output.away = team.eq(2).text();
    output.away = output.away.toLowerCase();
    output.home = output.home.toLowerCase();
    output.home = output.home.replace(/[^a-z ]?/g, "");
    output.away = output.away.replace(/[^a-z ]?/g, "");
    return output;
}

///////////////////////////////////////////////////////////

//get final result
exports.get_final_result = function ($, output) {
    var selector = $('.detailScore__wrapper');
    if (!estVuoto(selector)) {
        output.result = selector.text();
        output.result = output.result.replace(/[^0-9\-]/g, "");
        if (output.result.charAt(2) === '-') {
            output.result = output.result.slice(0, 4);
        } else {
            output.result = output.result.slice(0, 3);
        }
    }
    return output;
}

////////////////////////////////////////////////////////////////////

//get_details match
exports.get_details = function ($, output) {
    //get details match
    var details = $('.wcl-overline_rOFfd.wcl-scores-overline-03_0pkdl');
    if (!(details.eq(1).text() == '')) {
        //nazione
        details_nazione = details.eq(1).text();
        output.details.nazione = details_nazione.replace(':', '').toLowerCase();

        //campionato
        details = details.eq(2).text();
        try {

            if (output.details.nazione == "australia") {
                str = details.split("-");
                details_campionato = str[0] + " " + str[1]
                details_campionato = details_campionato.toLowerCase().trim()

            }
            else {
                str = details.split("-");
                details_campionato = str[0]
                details_campionato = details_campionato.toLowerCase().trim()
            }
            campionato = details_campionato

            if (campionato.indexOf(".") != -1) {
                output.details.campionato = campionato.replace(".", '');
            }
            else output.details.campionato = campionato;

        } catch (err) {
            console.log('Error in perform details.campionato.')
        }
        //round
        try {
            str = details.split("-");
            output.details.round = str[str.length - 1].match(/Giornata [0-9]+/g).toLocaleString();
            output.details.round = parseInt((output.details.round).replace('Giornata ', ''));
        }
        catch (err) {
            output.details.round = 0;
        }
    }

    return output;
}

//////////////////////////////////////////////////////////////////////

//estrazione data,ora
exports.get_date_time = function ($, output) {
    var details = $('.duelParticipant__startTime');
    if (!estVuoto(details)) {
        details = $('.duelParticipant__startTime').text();
        output.details.str_date = details.replace(".", "/").replace(".", "/");
        details = output.details.str_date.split(" ");
        output.details.data = details[0];
        output.details.ora = details[1];
    }
    return output;
}

/////////////////////////////////////////////////////////////////////

//controllo stato partita:
exports.match_status = function ($) {
    try {
        var selector = $(".detailScore__status");
    } catch (err) {
        console.log("errore match status  " + err);
        process.exit(0);
    }
    //console.log(selector.text());

    if (selector.text() == 'Finale') {
        return true;
    }
    return false;
}

//////////////////////////////////////prende statistiche partita

function estVuoto(selector) {
    if (selector == '') {
        return true;
    }
    return false;
}

exports.take_stats = function ($, arr, temp) {
    arr = [];
    var name;
    var home;
    var away;

    var stat = $('.stat__row');
    if (estVuoto(stat)) { stat = $('.wcl-row_OFViZ'); }
    else { console.log('SELETTORE STATS CAMBIATO O STATS NON DISPONIBILI'); }

    if (!estVuoto(stat)) {
        for (let i = 0; i < stat.length; i++) {
            const stat1 = stat.eq(i).children();
            const res = stat1.eq(0).children();
    
            const homeText = res.eq(0).text();
            const awayText = res.eq(2).text();
            const nameText = res.eq(1).text();
    
            const homeVal = parseFloat(homeText);
            const awayVal = parseFloat(awayText);
    
            let nameLower = nameText.toLowerCase();
            let metricName;
    
            // Ordine specifico per evitare match errati (xg è contenuto in xgot)
            if (nameLower.includes("xgot")) {
                metricName = "xgot";
            } else if (nameLower.includes("xg")) {
                metricName = "xg";
            } else if (nameLower.includes("xa")) {
                metricName = "xa";
            }
    
            if (metricName) {
                arr.push({
                    name: metricName,
                    home: homeVal,
                    away: awayVal
                });
            } else {
                // Caso generico: manteniamo il nome originale
                arr.push({
                    name: nameText,
                    home: homeText,
                    away: awayText
                });
            }
        }
    }
    
    else { console.log('not stats'); return []; }
    return arr;
}

/////////////////////////////////////////////////////////

//extract result 1st and 2nd time
exports.get_time_results = function ($, arr) {
    var time = $('.wclHeaderSection--summary.wcl-headerSection_5507A.wcl-text_F6xdz.wcl-spaceBetween_WGy1W')
    if (!estVuoto(time.text())) {
        for (var i = 0; i < time.length; i++) {
            if (i == 0) {
                var time1 = time.eq(i).children().eq(1);
                arr[0] = arr[0] + time1.text();
                arr[0] = arr[0].replace("\n", '');
                arr[0] = arr[0].replace("\n", '');
                arr[0] = arr[0].replace(" ", '');
                arr[0] = arr[0].replace('\n', '');
                arr[0] = arr[0].replace(" ", '');
            }
            else {
                var time1 = time.eq(i).children().eq(1);
                arr[1] = arr[1] + time1.text();
                arr[1] = arr[1].replace("\n", '');
                arr[1] = arr[1].replace("\n", '');
                arr[1] = arr[1].replace(" ", '');
                arr[1] = arr[1].replace(" ", '');
                arr[1] = arr[1].replace('\n', '');
                arr[1] = arr[1].replace(" ", '');
            }
        }
    }
    else console.log(time);
}


//extract array with minute_goal
function verificaLunghezza(array) {
    return array.some(function (elemento) {
        return (elemento.length > 5 || elemento.indexOf("-") != -1);
    });
}
function rimuoviDuplicati(array) {
    let r = [];
    array.forEach(function (elemento) {
        if (r.indexOf(elemento) === -1) r.push(elemento);
    });
    return r;
}
exports.time_goal_home_away = function ($, home, away, res) {
    home = [];
    away = [];
    var goal = $('svg[data-testid="wcl-icon-soccer"]');
    goal = goal.filter((_, el) => !$(el).hasClass('footballOwnGoal-ico')).slice(1);
    var owngoal = $('svg.footballOwnGoal-ico');

    if (goal != '') {
        for (var i = 0; i < goal.length; i++) {
            var time = goal.eq(i).closest('.smv__incident').find('.smv__timeBox').text(); //.parent()
            time = time.replace("'", "");

            if (goal.eq(i).closest('.smv__homeParticipant').length > 0) {
                home.push(time);
            }
            else if (goal.eq(i).closest('.smv__awayParticipant').length > 0) {
                away.push(time);
            }
        }
    }
    if (owngoal != '' && owngoal.length > 0) {
        for (var i = 0; i < owngoal.length; i++) {
            var time = owngoal.eq(i).closest('.smv__incident').find('.smv__timeBox').text(); //.parent()
            time = time.replace("'", "");

            if (owngoal.eq(i).closest('.smv__homeParticipant').length > 0) {
                home.push(time);
            }
            else if (owngoal.eq(i).closest('.smv__awayParticipant').length > 0) {
                away.push(time);
            }
        }
    }
    //CHECK
    var abort = verificaLunghezza(home);
    if (abort) { console.log("errore su questo id"); process.exit(1); }
    abort = verificaLunghezza(away);
    if (abort) { console.log("errore su questo id"); process.exit(1); }
    home = rimuoviDuplicati(home);
    away = rimuoviDuplicati(away);

    for (var i = 0; i < away.length; i++) {
        if (away[i][2] == '+') {
            if (parseInt(away[i].slice(0, 2)) > 50) {
                var temp = parseInt(away[i].slice(0, 2));
                away[i] = String(parseInt(away[i].slice(3,)) + temp);
            }
        }
        if (away[i].length > 5) away.splice(i, 1);
    }
    for (var i = 0; i < home.length; i++) {
        if (home[i][2] == '+') {
            if (parseInt(home[i].slice(0, 2)) > 50) {
                var temp = parseInt(home[i].slice(0, 2));
                home[i] = String(parseInt(home[i].slice(3,)) + temp);
            }
        }
        if (home[i].length > 5) away.splice(i, 1);
    }

    return [home, away];
}

//ESPANDE PAGINA MATCH CAMPIONATO

exports.get_full_match = async function (page) {
    var fatto = false;
    var patience = 8
    do {
        await scrape.range_sleep(1500);
        try {
            await page.waitForSelector('.event__more.event__more--static', { visible: true, timeout: 10000 }); 
        } catch (err) { }
        await scrape.range_sleep(500);
        try {
            await page.click('a[class="event__more event__more--static"]', { delay: 7 });
        } catch (err) {
            fatto = true;
        }
        await scrape.range_sleep(500);
        patience--;
    } while (fatto == false && patience > 0);
}