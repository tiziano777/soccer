const fs = require("fs");

exports.insert_palinsesto_id_champ = function (f, nazione) {

    //salva id_campionato
    var k = 0;
    var arr1 = fs.readFileSync("./1.main_files/id_campionati.json");
    arr1 = JSON.parse(arr1);
    arr1 = arr1.id_campionati;
    try {
        do {
            if (nazione == arr1[k].nazione && f.champ == arr1[k].campionato) {
                f.id_champ = arr1[k]._id;
            }
            k++;
        } while (k < arr1.length || f.id_champ == -1);
    }
    catch (err) { console.log(JSON.stringify(f), nazione); throw err; }
    return f.id_champ;
}

exports.insert_palinsesto_id_squadre = function (f) {

    //salva id_squadre

    k = 0;
    arr1 = fs.readFileSync("./1.main_files/id_squadre.json");
    arr1 = JSON.parse(arr1);
    var arr2 = arr1.squadre;

    if (arr2[f.home_team] != undefined && arr2[f.home_team] != "") {
        f.home_id = arr2[f.home_team];
    }
    if (arr2[f.away_team] != undefined && arr2[f.home_team] != "") {
        f.away_id = arr2[f.away_team];
    }

    if (f.home_id == '' || f.away_id == '') {
        var id_squadre = fs.readFileSync("./1.main_files/squadre.json");
        id_squadre = JSON.parse(id_squadre);
        id_squadre = id_squadre.squadre;

        var obj = fs.readFileSync("./1.main_files/id_squadre.json");
        obj = JSON.parse(obj);
        obj = obj.squadre;

        if (obj[f.home_team] == undefined) {
            id_squadre.push(f.home_team);
            id_squadre.sort();
            obj[f.home_team] = generateRandomString(6);
            f.home_id = obj[f.home_team];

        }
        if (obj[f.away_team] == undefined) {
            id_squadre.push(f.away_team);
            id_squadre.sort();
            obj[f.away_team] = generateRandomString(6);
            f.away_id = obj[f.away_team];
        }
        fs.writeFileSync("./1.main_files/squadre.json", `{"squadre":${JSON.stringify(id_squadre)}}`);
        fs.writeFileSync("./1.main_files/id_squadre.json", `{"squadre":${JSON.stringify(obj)}}`);

    }

    return f;
}

exports.country_code = function (nazione) {
    var country = fs.readFileSync("./1.main_files/country_code.json");
    country = JSON.parse(country);
    return country[nazione];
}

/////////////////////////////////////////////////

function generateRandomString(iLen) {
    var sRnd = '';
    var sChrs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    for (var i = 0; i < iLen; i++) {
        var randomPoz = Math.floor(Math.random() * sChrs.length);
        sRnd += sChrs.substring(randomPoz, randomPoz + 1);
    }
    return sRnd;
}

function add_id(output, squadre, h_a) {
    var new_id;
    while (1) {
        new_id = generateRandomString(6);
        var s = fs.readFileSync("./1.main_files/squadre.json");
        s = JSON.parse(s);
        s = s.squadre;

        var values = Object.values(s);
        if (values.indexOf(new_id) == -1) break;
    }
    squadre[output[h_a]] = new_id;
    var output_key = `${h_a}_id`
    output[output_key] = squadre[output[h_a]];
    console.log("add new id: " + new_id + " for: " + output[h_a]);
    fs.writeFileSync("./CHANGED.txt", new_id);

    //aggiornamento file

    s.push(output[h_a]);
    s.sort();
    fs.writeFileSync("./1.main_files/squadre.json", `{"squadre":${JSON.stringify(s)}}`);

    fs.writeFileSync("./1.main_files/id_squadre.json", `{"squadre":${JSON.stringify(squadre)}}`);
}

exports.insert_ids = function (output) {
    //salva id_campionato
    var k = 0;
    var arr1 = fs.readFileSync("./1.main_files/id_campionati.json");
    arr1 = JSON.parse(arr1);
    arr1 = arr1.id_campionati;
    try {
        do {
            if (output.details.nazione == arr1[k].nazione) {
                if (output.details.campionato == arr1[k].campionato) {
                    output.details.id_champ = arr1[k]._id;
                }
            }
            k++;
        } while (k < arr1.length || output.details.id_champ == -1);
    }
    catch (err) { console.log(err + "\n possibile cambiamento nome di un campionato"+output.details.nazione + " " + output.details.campionato); throw err; }

    //salva id_squadre

    k = 0;
    arr1 = fs.readFileSync("./1.main_files/id_squadre.json");
    arr1 = JSON.parse(arr1);
    var arr1 = arr1.squadre;

    if (arr1[output.home] != undefined && arr1[output.home] != "") {
        output.home_id = arr1[output.home];
    }
    else {
        add_id(output, arr1, "home");
    }
    if (arr1[output.away] != undefined && arr1[output.home] != "") {
        output.away_id = arr1[output.away];
    }
    else {
        add_id(output, arr1, "away");
    }
    return output;
};

//elimina file
exports.delete_file = async function (fs, filePath) {
    //var filePath = './removeME'; 
    await fs.unlink(filePath);
}

//////////////////////////////////////////////////////

exports.resetJsonOutput = function (output) {
    output = {
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
    return output;
}