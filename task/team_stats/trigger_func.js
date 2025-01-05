//LIBRERIE
const fs= require("fs");
const { exit } = require("process");
const array=require('../../my_modules/utils_modules/array');
const trigger=require("./trigger_func.js");
const scrape=require("../../my_modules/scrape_modules/scrape.js")
const mongo=require("../../my_modules/utils_modules/mongo.js");
const file=require("../../my_modules/utils_modules/file.js");
const ts=require("../../my_modules/utils_modules/timestamp");
// Database Name
const dbName ="calcio"; //calcio li ha tutti, test solo quelli 2020
// Database collection
const collection='calcio';
const collection1='palinsesto';
const collection2='squadre';
const champLength=48;

exports.take_foglio=async function(client,id,h_a){

    var res=[];
    var q=`${h_a}_id`;
    var cursor=await client.db(dbName).collection(collection2).find(
        {"$and":[
        {q:id},
        {"$or":[
            {"details.season":scrape.perform_season()},//current season
            {"details.season":String(new Date().getFullYear())}
        ]}
    ]});
    if(cursor!=null){
    await cursor.forEach(doc => res.push(doc));
    return res[0];
    }
    return [];
}

exports.update_stats=async function(client,foglio,match,h_a){  //RETURN:UPDATED FOGLIO
    console.log("foglio prima:"+foglio);

    foglio.count_match+=1;
    //aggiorna classifica home
    if(h_a=="home" && match.winner_code==1){foglio.vittorie++;foglio.punti+=3;}
    else if(h_a=="home" && match.winner_code==2)foglio.sconfitte++;
    else if(h_a=="home" && match.winner_code==3){foglio.pareggi++;foglio.punti+=1;}
    //aggiorna classifica away
    else if(h_a=="away" && match.winner_code==2){foglio.vittorie++;foglio.punti+=3;}
    else if(h_a=="away" && match.winner_code==1)foglio.sconfitte++;
    else if(h_a=="away" && match.winner_code==3){foglio.pareggi++;foglio.punti+=1;}

    //aggiorna goal fatti
    var g=`${h_a}_goal`;
    foglio[h_a].attacco.goal_fatti+=match[g];
    //goal fatti p90
    foglio[h_a].attacco.goal_fatti_p90=((foglio[h_a].attacco.goal_fatti_p90 * Math.max(1,(foglio.count_match-1)))+match[g])/foglio.count_match;

    //aggiorna goal subiti
    if(h_a=='home')g=`away_goal`; else g="home_goal";
    foglio[h_a].difesa.goal_subiti+=match[g];
    //gg subiti p90
    foglio[h_a].difesa.goal_subiti_p90=((foglio[h_a].difesa.goal_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match[g])/foglio.count_match;

    //aggiorna i tiri
    if(foglio[h_a].attacco.tiri_p90!=undefined)foglio[h_a].attacco.tiri_p90=((foglio[h_a].attacco.tiri_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri[h_a])/foglio.count_match;
    if(foglio[h_a].attacco.tiri_in_porta_p90!=undefined)foglio[h_a].attacco.tiri_in_porta_p90=((foglio[h_a].attacco.tiri_in_porta_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri_in_porta[h_a])/foglio.count_match;
    if(foglio[h_a].attacco.tiri_fuori_p90!=undefined)foglio[h_a].attacco.tiri_fuori_p90=((foglio[h_a].attacco.tiri_fuori_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri_fuori[h_a])/foglio.count_match;
    if(foglio[h_a].attacco.tiri_fermati_p90!=undefined)foglio[h_a].attacco.tiri_fermati_p90=((foglio[h_a].attacco.tiri_fermati_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri_fermati[h_a])/foglio.count_match;

    //crea variabile difesa,per campi difensivi del match
    var dif;
    if(h_a=='home')dif=`away`; else dif="home";

    //aggiorna tiri subiti
    if(foglio[h_a].difesa.tiri_subiti_p90!=undefined)foglio[h_a].difesa.tiri_subiti_p90=((foglio[h_a].difesa.tiri_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri[dif])/foglio.count_match;
    if(foglio[h_a].difesa.tiri_in_porta_subiti_p90!=undefined)foglio[h_a].difesa.tiri_in_porta_subiti_p90=((foglio[h_a].difesa.tiri_in_porta_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri_in_porta[dif])/foglio.count_match;
    if(foglio[h_a].difesa.tiri_fuori_subiti_p90!=undefined)foglio[h_a].difesa.tiri_fuori_subiti_p90=((foglio[h_a].difesa.tiri_fuori_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri_fuori[dif])/foglio.count_match;
    if(foglio[h_a].difesa.tiri_bloccati_dif_p90!=undefined)foglio[h_a].difesa.tiri_bloccati_dif_p90=((foglio[h_a].difesa.tiri_bloccati_dif_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.tiri_fermati[dif])/foglio.count_match;

    //aggiorna attacchi fatti
    if(foglio[h_a].attacco.attacchi_p90!=undefined)foglio[h_a].attacco.attacchi_p90=((foglio[h_a].attacco.attacchi_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.attacchi[h_a])/foglio.count_match;
    if(foglio[h_a].attacco.attacchi_pericolosi_p90!=undefined)foglio[h_a].attacco.attacchi_pericolosi_p90=((foglio[h_a].attacco.attacchi_pericolosi_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.attacchi_pericolosi[h_a])/foglio.count_match;
    
    //aggiorna attacchi subiti
    if(foglio[h_a].difesa.attacchi_subiti_p90!=undefined)foglio[h_a].difesa.attacchi_subiti_p90=((foglio[h_a].difesa.attacchi_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.attacchi[dif])/foglio.count_match;
    if(foglio[h_a].difesa.attacchi_pericolosi_subiti_p90!=undefined)foglio[h_a].difesa.attacchi_pericolosi_subiti_p90=((foglio[h_a].difesa.attacchi_pericolosi_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.attacchi_pericolosi[dif])/foglio.count_match;

    //corner A/D
    if(foglio[h_a].attacco.corner_p90!=undefined)foglio[h_a].attacco.corner_p90=((foglio[h_a].attacco.corner_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.angoli[h_a])/foglio.count_match;
    if(foglio[h_a].difesa.corner_concessi_p90!=undefined)foglio[h_a].difesa.corner_concessi_p90=((foglio[h_a].difesa.corner_concessi_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.angoli[dif])/foglio.count_match;
    
    //fuorigioco A/D
    if(foglio[h_a].attacco.fuorigioco_p90!=undefined)foglio[h_a].attacco.fuorigioco_p90=((foglio[h_a].attacco.fuorigioco_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.fuorigioco[h_a])/foglio.count_match;
    if(foglio[h_a].difesa.fuorigioco_procurati_p90!=undefined)foglio[h_a].difesa.fuorigioco_procurati_p90=((foglio[h_a].difesa.fuorigioco_procurati_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.fuorigioco[dif])/foglio.count_match;

    //parate A/D
    if(foglio[h_a].attacco.parate_subite_p90!=undefined)foglio[h_a].attacco.parate_subite_p90=((foglio[h_a].attacco.parate_subite_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.parate[dif])/foglio.count_match;
    if(foglio[h_a].difesa.parate_p90!=undefined)foglio[h_a].difesa.parate_p90=((foglio[h_a].difesa.parate_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.parate[h_a])/foglio.count_match;

    //falli A/D
    if(foglio[h_a].attacco.attacco!=undefined)foglio[h_a].attacco.falli_subiti_p90=((foglio[h_a].attacco.falli_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.falli[dif])/foglio.count_match;
    if(foglio[h_a].difesa.falli_commessi_p90!=undefined)foglio[h_a].difesa.falli_commessi_p90=((foglio[h_a].difesa.falli_commessi_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.falli[h_a])/foglio.count_match;
    
    //cartellini,contrasti,passaggi_concessi
    if(foglio[h_a].difesa.cartellini_gialli_p90!=undefined)foglio[h_a].difesa.cartellini_gialli_p90=((foglio[h_a].difesa.cartellini_gialli_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.cartellini_gialli[h_a])/foglio.count_match;
    if(foglio[h_a].difesa.contrasti_p90!=undefined)foglio[h_a].difesa.contrasti_p90=((foglio[h_a].difesa.contrasti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.contrasti[h_a])/foglio.count_match;
    if(foglio[h_a].difesa.contrasti_subiti_p90!=undefined)foglio[h_a].difesa.contrasti_subiti_p90=((foglio[h_a].difesa.contrasti_subiti_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.contrasti[dif])/foglio.count_match;
    if(foglio[h_a].difesa.passaggi_concessi_p90!=undefined)foglio[h_a].difesa.passaggi_concessi_p90=((foglio[h_a].difesa.passaggi_concessi_p90 * Math.max(1,(foglio.count_match-1)))+match.stat.full_time.passaggi[dif])/foglio.count_match;

    /*INDICI DIFENSIVI
        i_salvataggi:0,  //i1=tiri_bloccati_dif_p90/(tiri_subiti_p90-tiri_fuori_contro_p90) *100
        i_parate:0,  //i2=parate_p90/tiri_in_porta_subiti_p90 *100
        i_efficienza_difensiva:0,  // (fuorigioco_procurati_p90+contrasti_p90+parate_p90+tiri_bloccati_dif_p90)/(attacchi_pericolosi_subiti_p90+tiri_in_porta_subiti_p90+contrasti_subiti_p90+corner_concessi_p90)
        i_resistenza_difensiva:0, //[(possesso_palla_p90/100)+(i_salvataggi/100)+(i_efficienza_difensiva)+(i_parate/100)]/4
    */
    if(foglio[h_a].difesa.i_salvataggi!=undefined)foglio[h_a].difesa.i_salvataggi=((foglio[h_a].difesa.tiri_bloccati_p90)/(foglio[h_a].difesa.tiri_subiti_p90-foglio[h_a].difesa.tiri_fuori_subiti_p90))*100
    if(foglio[h_a].difesa.i_parate!=undefined)foglio[h_a].difesa.i_parate=((foglio[h_a].difesa.parate_p90)/(foglio[h_a].difesa.tiri_in_porta_subiti_p90))*100
    if(foglio[h_a].difesa.i_efficienza_difensiva!=undefined)foglio[h_a].difesa.i_efficienza_difensiva=((foglio[h_a].difesa.fuorigioco_procurati_p90+foglio[h_a].difesa.contrasti_p90+foglio[h_a].difesa.parate_p90+foglio[h_a].difesa.tiri_bloccati_dif_p90)/(foglio[h_a].difesa.attacchi_pericolosi_subiti_p90+foglio[h_a].difesa.tiri_in_porta_subiti_p90+foglio[h_a].difesa.contrasti_subiti_p90+foglio[h_a].difesa.corner_concessi_p90))*100
    if(foglio[h_a].difesa.i_resistenza_difensiva!=undefined)foglio[h_a].difesa.i_resistenza_difensiva=(foglio[h_a].costruzione.possesso_palla_p90+foglio[h_a].difesa.i_salvataggi+foglio[h_a].difesa.i_efficienza_difensiva+foglio[h_a].difesa.i_parate)/400
    
    /*INDICI OFFENSIVI
        i_conversione_gg:0,  //i1=gg/tiri
        i_precisione_tiri:0, //i2=tiri_in_porta/tiri
        i_pericolosita_azioni:0,   //i3=attacchi_pericolosi/attacchi
        i_realizzazione_offensiva:0, //i4=gg/attacchi_pericolosi
    */

    /*
    costruzione:{
                passaggi_p90:0,   //non su tutti i match principali (bisognera' fare un algoritmo "adattivo")
                passaggi_completati_p90:0,      //non su tutti i match principali (bisognera' fare un algoritmo "adattivo")
                possesso_palla_p90:0,
                precisione_passaggi:0   //non su tutti i match principali (bisognera' fare un algoritmo "adattivo")
            }
    */

    return;
}

exports.take_champ_match=async function(champ,match,client){
    var year=new Date().getFullYear();
    var dates=ts.solveSingleSeason(champ,year);
    var cursor=await client.db(dbName[0]).collection(collection).find(
        {
            $and: [
                { "details.id_champ": champ },
                {
                    $or: [
                        {
                            $and: [
                                { "details.timestamp": { $gte: dates[0] } },
                                { "details.timestamp": { $lte: dates[1] } },
                            ],
                        },
                        {
                            $and: [
                                { "details.timestamp": { $gte: dates[2] } },
                                { "details.timestamp": { $lte: dates[3] } },
                            ],
                        },
                    ],
                },
            ]
        }
    );

    //if(maxround>=10 || 0....)
    await cursor.forEach(doc => match.push(doc));
    return match;
}

exports.take_team_ids=async function(match,id_squadre){
    await match.forEach(doc => id_squadre.push(doc.home_id));  
    id_squadre.sort();
    id_squadre=array.clean_array_sorted(id_squadre);
    return id_squadre;
}
exports.take_home_match=async function(id,res_home,client){
    var cursor0=await client.db(dbName).collection(collection).find(
        {"$and":[
            {"home_id":id},
            {"$or":[
                {"details.season":String(new Date().getFullYear())},
                {"details.season":scrape.perform_season()}
                ]}
            //{"details.id_champ":27}
        ]});
    await cursor0.forEach(doc => res_home.push(doc));
    return res_home;
}

exports.take_away_match=async function(id,res_away,client){
    var cursor1=await client.db(dbName).collection(collection).find(
        {"$and":[
            {"away_id":id},
            {"$or":[
                {"details.season":String(new Date().getFullYear())},
                {"details.season":scrape.perform_season()}
                ]}
            //{"details.id_champ":27}
            
        ]});
    await cursor1.forEach(doc => res_away.push(doc));
    return res_away;
}

exports.used_stat=function(foglio,s){
    if(s.id!=foglio.id_campionato){console.log("errore:incongruenza stat_report - foglio_squadra champ_id non allineati,trovare soluzione scalabile!");exit(1);}
    var use_s=array.left_difference(s.use_stats,s.err_stats);
    if(!use_s.includes("cartellini_rossi"))use_s.push("cartellini_rossi");
    if(!use_s.includes("cartellini_gialli"))use_s.push("cartellini_gialli");
    return use_s;
}
exports.error_stat=function(s){
    var err_s=s.err_stats;
    var del_cart=err_s.indexOf("cartellini_rossi");
    if(del_cart!=-1)err_s.splice(del_cart,1);
    del_cart=err_s.indexOf("cartellini_gialli");
    if(del_cart!=-1)err_s.splice(del_cart,1);
    return err_s;
}

exports.aggiusta_foglio=function(foglio,use_s,err_s){
   
    if(use_s.indexOf("possesso_palla")==-1){
        delete foglio.home.costruzione["possesso_palla_p90"];
        delete foglio.away.costruzione["possesso_palla_p90"];

        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];

    }
    if(use_s.indexOf("tiri")==-1){
        delete foglio.home.attacco["tiri_p90"];
        delete foglio.home.difesa["tiri_subiti_p90"];
        delete foglio.away.attacco["tiri_p90"];
        delete foglio.away.difesa["tiri_subiti_p90"];

        delete foglio.home.attacco["i_conversione_gg"];
        delete foglio.away.attacco["i_conversione_gg"];
        delete foglio.home.attacco["i_precisione_tiri"];
        delete foglio.away.attacco["i_precisione_tiri"];

        delete foglio.home.difesa["i_salvataggi"];
        delete foglio.away.difesa["i_salvataggi"];
        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
    }
    if(use_s.indexOf("tiri_in_porta")==-1){
        delete foglio.home.attacco["tiri_in_porta_p90"];
        delete foglio.home.difesa["tiri_in_porta_subiti_p90"];
        delete foglio.away.attacco["tiri_in_porta_p90"];
        delete foglio.away.difesa["tiri_in_porta_subiti_p90"];

        delete foglio.home.difesa["i_parate"];
        delete foglio.away.difesa["i_parate"];

        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
        
        delete foglio.home.o["i_precisione_tiri"];
        delete foglio.away.attacco["i_precisione_tiri"];

        delete foglio.home.difesa["i_efficienza_difensiva"];
        delete foglio.away.difesa["i_efficienza_difensiva"]; 
        
    }
    if(use_s.indexOf("tiri_fuori")==-1){
        delete foglio.home.attacco["tiri_fuori_p90"];
        delete foglio.home.difesa["tiri_fuori_subiti_p90"];
        delete foglio.away.attacco["tiri_fuori_p90"];
        delete foglio.away.difesa["tiri_fuori_subiti_p90"];
        
        delete foglio.home.attacco["i_salvataggi"];
        delete foglio.away.attacco["i_salvataggi"];
        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
        
    }
    if(use_s.indexOf("tiri_fermati")==-1){
        delete foglio.home.attacco["tiri_fermati_p90"];
        delete foglio.home.difesa["tiri_bloccati_p90"];
        delete foglio.away.attacco["tiri_fermati_p90"];
        delete foglio.away.difesa["tiri_bloccati_p90"];
        
        delete foglio.home.difesa["i_salvataggi"];
        delete foglio.away.difesa["i_salvataggi"];
        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
        delete foglio.home.difesa["i_efficienza_difensiva"];
        delete foglio.away.difesa["i_efficienza_difensiva"]; 
        
    }
    if(use_s.indexOf("falli")==-1){
        delete foglio.home.attacco["falli_subiti_p90"];
        delete foglio.home.difesa["falli_commessi_p90"];
        delete foglio.away.attacco["falli_subiti_p90"];
        delete foglio.away.difesa["falli_commessi_p90"];

        delete foglio.home.difesa["i_efficienza_difensiva"];
        delete foglio.away.difesa["i_efficienza_difensiva"]; 

        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
    }
    if(use_s.indexOf("angoli")==-1){
        delete foglio.home.attacco["corner_p90"];
        delete foglio.home.difesa["corner_concessi_p90"];
        delete foglio.away.attacco["corner_p90"];
        delete foglio.away.difesa["corner_concessi_p90"];
    }
    if(use_s.indexOf("fuorigioco")==-1){
        delete foglio.home.attacco["fuorigioco_p90"];
        delete foglio.home.difesa["fuorigioco_procurati_p90"];
        delete foglio.away.attacco["fuorigioco_p90"];
        delete foglio.away.difesa["fuorigioco_procurati_p90"];

        delete foglio.home.difesa["i_efficienza_difensiva"];
        delete foglio.away.difesa["i_efficienza_difensiva"]; 
        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
    }
    if(use_s.indexOf("parate")==-1){
        delete foglio.home.difesa["parate_p90"];
        delete foglio.home.attacco["parate_subite_p90"];
        delete foglio.away.attacco["parate_subite_p90"];
        delete foglio.away.difesa["parate_p90"];

        delete foglio.home.difesa["i_parate"];
        delete foglio.away.difesa["i_parate"];

        delete foglio.home.difesa["i_efficienza_difensiva"];
        delete foglio.away.difesa["i_efficienza_difensiva"]; 

        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
        
    }
    if(use_s.indexOf("contasti")==-1){
        delete foglio.home.difesa["contrasti_p90"];
        delete foglio.home.difesa["contrasti_subiti_p90"];
        delete foglio.away.difesa["contrasti_subiti_p90"];
        delete foglio.away.difesa["contrasti_p90"];

        delete foglio.home.difesa["i_efficienza_difensiva"];
        delete foglio.away.difesa["i_efficienza_difensiva"]; 

        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
    }
    if(use_s.indexOf("passaggi_totali")==-1){
        delete foglio.home.costruzione["passaggi_p90"];
        delete foglio.away.costruzione["passaggi_p90"];
        delete foglio.away.costruzione["precisione_passaggi"];
        delete foglio.home.costruzione["precisione_passaggi"];
    }
    if(use_s.indexOf("passaggi_completati")==-1){
        delete foglio.home.costruzione["passaggi_completati_p90"];
        delete foglio.away.costruzione["passaggi_completati_p90"];

        delete foglio.home.costruzione["precisione_passaggi"];
        delete foglio.away.costruzione["precisione_passaggi"];
    }
    if(use_s.indexOf("attacchi")==-1){
        delete foglio.home.attacco["attacchi_p90"];
        delete foglio.home.difesa["attacchi_subiti_p90"];
        delete foglio.away.attacco["attacchi_p90"];
        delete foglio.away.difesa["attacchi_subiti_p90"];

        delete foglio.away.attacco["i_pericolosita_azioni"];
        delete foglio.home.attacco["i_pericolosita_azioni"];
 
    }
    if(use_s.indexOf("attacchi_pericolosi")==-1){
        delete foglio.home.attacco["attacchi_pericolosi_p90"];
        delete foglio.home.difesa["attacchi_pericolosi_subiti_p90"];
        delete foglio.away.attacco["attacchi_pericolosi_p90"];
        delete foglio.away.difesa["attacchi_pericolosi_subiti_p90"];

        delete foglio.home.attacco["i_realizzazione_offensiva"];
        delete foglio.home.attacco["i_realizzazione_offensiva"];

        delete foglio.away.attacco["i_pericolosita_azioni"];
        delete foglio.home.attacco["i_pericolosita_azioni"];

        delete foglio.home.difesa["i_efficienza_difensiva"];
        delete foglio.away.difesa["i_efficienza_difensiva"];
        
        delete foglio.home.difesa["i_resistenza_difensiva"];
        delete foglio.away.difesa["i_resistenza_difensiva"];
    }
    return foglio;
}

exports.reset_foglio=function(foglio){
    foglio={
    
        id_squadra:'',
        nome_squadra:'',
        season:'',
        count_match:0,
        ranking_squadra:0,
        id_campionato:0,
        ranking_campionato:0,
        vittorie:0,
        pareggi:0,
        sconfitte:0,
        punti:0,
        home:{
            attacco:{
                goal_fatti:0,
                goal_fatti_p90:0,
    
                tiri_p90:0,
                tiri_in_porta_p90:0,
                tiri_fuori_p90:0,
                tiri_fermati_p90:0,
    
                attacchi_p90:0,
                attacchi_pericolosi_p90:0,
    
                corner_p90:0,
                fuorigioco_p90:0,
                parate_subite_p90:0,
    
                falli_subiti_p90:0,
                 //TESTARE VEROSIMIGLIANZA INDICI
                i_conversione_gg:0,  //i1=gg/tiri *100
                i_precisione_tiri:0, //i2=tiri_in_porta/tiri *100
                i_pericolosita_azioni:0,   //i3=attacchi_pericolosi/attacchi *100
                i_realizzazione_offensiva:0, //i4=gg/attacchi_pericolosi *100
            },
            difesa:{
                goal_subiti:0,
                goal_subiti_p90:0,
    
                tiri_subiti_p90:0,
                tiri_in_porta_subiti_p90:0,
                tiri_bloccati_dif_p90:0,  //in opposite form
                tiri_fuori_subiti_p90:0,
    
                attacchi_subiti_p90:0,
                attacchi_pericolosi_subiti_p90:0,
    
                corner_concessi_p90:0,
                fuorigioco_procurati_p90:0,
                parate_p90:0,
                falli_commessi_p90:0,
                cartellini_gialli_p90:0,
                contrasti_p90:0,
                contrasti_subiti_p90:0,
                passaggi_concessi_p90:0,   //percentuale
                 //TESTARE VEROSIMIGLIANZA INDICI
                i_salvataggi:0,  //i1=tiri_bloccati_dif_p90/(tiri_subiti_p90-tiri_fuori_contro_p90) *100
                i_parate:0,  //i2=parate_p90/tiri_in_porta_subiti_p90 *100
                //PESARE GLI ATTRIBUTI??
                i_efficienza_difensiva:0,  // (fuorigioco_procurati_p90+contrasti_p90+parate_p90+tiri_bloccati_dif_p90)/(attacchi_pericolosi_subiti_p90+tiri_in_porta_subiti_p90+contrasti_subiti_p90+corner_concessi_p90)
                i_resistenza_difensiva:0, //[(possesso_palla_p90/100)+(i_salvataggi/100)+(i_efficienza_difensiva)+(i_parate/100)]/4
                },
            costruzione:{
                passaggi_p90:0,
                passaggi_completati_p90:0,
                possesso_palla_p90:0,
                precisione_passaggi:0
            }
        },
        away:{
            attacco:{
                goal_fatti:0,
                goal_fatti_p90:0,
    
                tiri_p90:0,
                tiri_in_porta_p90:0,
                tiri_fuori_p90:0,
                tiri_fermati_p90:0,
    
                attacchi_p90:0,
                attacchi_pericolosi_p90:0,
    
                corner_p90:0,
                fuorigioco_p90:0,
                parate_subite_p90:0,
                falli_subiti_p90:0,
                //TESTARE VEROSIMIGLIANZA INDICI
                i_conversione_gg:0,  //i1=gg/tiri
                i_precisione_tiri:0, //i2=tiri_in_porta/tiri
                i_pericolosita_azioni:0,   //i3=attacchi_pericolosi/attacchi
                i_realizzazione_offensiva:0, //i4=gg/attacchi_pericolosi
            },
            difesa:{
                goal_subiti:0,
                goal_subiti_p90:0,
    
                tiri_subiti_p90:0,
                tiri_in_porta_subiti_p90:0,
                tiri_bloccati_dif_p90:0,
                tiri_fuori_subiti_p90:0,
    
                attacchi_subiti_p90:0,
                attacchi_pericolosi_subiti_p90:0,
    
                corner_concessi_p90:0,
                fuorigioco_procurati_p90:0,
                parate_p90:0,
                falli_commessi_p90:0,
                cartellini_gialli_p90:0,
                contrasti_p90:0,
                contrasti_subiti_p90:0,
                passaggi_concessi_p90:0,   //percentuale
                //PESARE GLI ATTRIBUTI??
                //TESTARE VEROSIMIGLIANZA INDICI
                i_salvataggi:0,  //i1=tiri_bloccati_dif_p90/(tiri_subiti_p90-tiri_fuori_subiti_p90) *100
                i_parate:0,  //i2=parate_p90/tiri_in_porta_subiti_p90 *100
                i_efficienza_difensiva:0,  // (fuorigioco_procurati_p90+contrasti_p90+parate_p90+tiri_bloccati_dif_p90)/(attacchi_pericolosi_subiti_p90+tiri_in_porta_subiti_p90+contrasti_subiti_p90+corner_concessi_p90)
                i_resistenza_difensiva:0, //[(possesso_palla_p90/100)+(i_salvataggi/100)+(i_efficienza_difensiva)+(i_parate/100)]/4
                },
            costruzione:{
                passaggi_p90:0,   //non su tutti i match principali (bisognera' fare un algoritmo "adattivo")
                passaggi_completati_p90:0,      //non su tutti i match principali (bisognera' fare un algoritmo "adattivo")
                possesso_palla_p90:0,
                precisione_passaggi:0   //non su tutti i match principali (bisognera' fare un algoritmo "adattivo")
            }
        }
    
    };
    return foglio;
}