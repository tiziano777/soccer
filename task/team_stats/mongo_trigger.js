//LIBRERIE
const fs= require("fs");
const array=require('../../my_modules/utils_modules/array');
const utils=require('../../my_modules/utils_modules/file.js');
const trigger=require("./trigger_func.js");
const fill=require("./calcolatore_campi.js")
const mongo=require("../../my_modules/utils_modules/mongo.js");
const ts=require('../../my_modules/utils_modules/timestamp.js');

// Database Name
const dbName =["calcio"]; 
// Database collection
const collection='calcio';
const collection1='palinsesto';
const collection2='squadre';
const champLength=48;

//crea documento

//SIZEOF FUNZIONE AUX
function SizeOfObject( object ) {
    var objectList = [];
    var stack = [ object ];
    var bytes = 0;
    while ( stack.length ) {
        var value = stack.pop();
        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if(typeof value === 'object'&& objectList.indexOf( value ) === -1){
            objectList.push( value );
            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

var foglio={

    id_squadra:'',
    nome_squadra:'',
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
            precisione_passaggi:0.0
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
            i_salvataggi:0,  //i1=tiri_bloccati_dif_p90/(tiri_subiti_p90-tiri_fuori_contro_p90) *100
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

/* *********************************** */
//crea foglio squadre con le statistiche
exports.get_match_squadra=async function(client){
    
    var stat_report=fs.readFileSync("./1.main_files/stats_report.json");
    stat_report=JSON.parse(stat_report);
    console.log('started analisi campionato id=27...' );
    
    /* ************************************************************************ */
        //prendi campi statistici affidabili & statistiche incomplete
        //champ stat report 
        
        /*
        -use_s: contiene campi statistici usati sempre in ogni match di quel campionato
        -err_s: contiene campi statistici usati solo in parte per i match di quel campionato
        -percentage: tiene conto delle percentuali di riempimento dei campi statistici
        REGOLE:
        a)percentage.stat[i]>=85% ACCETTATA ---> si fa fill con la media
        b)percentage.stat[i]<85% ACCETTATA ---> non si terra' conto di quella statistica
        c)percentage.no_stat_match >= 15% NO FOGLIO SQUADRE ---> quel campionato non avra' un foglio delle squadre 
        d)percentage.no_stat_match < 15% SI FOGLIO SQUADRE ---> si fara' fill con tutti i campi autorizzati nei punti a/b
    */
    console.log('started analisi missing value campionato...');
    var s=stat_report[foglio.id_campionato];
    //percentage error stat
    var percentage=s.err_usage;
    //used stat 100% 
    var use_s=trigger.used_stat(foglio,s);
    //error stat name <100%
    var err_s=trigger.error_stat(s);

    //controllo consistenza info partite
    //if(percentage.no_stat_match>=15)break;

    console.log(use_s,err_s,percentage);
    console.log('fine analisi missing value.');
    console.log('estrazione match campionato current season...');
    var match=[];
    var id_squadre=[];
    match=await trigger.take_champ_match(27,match,client);
    //prendo id delle squadre 
    id_squadre=await trigger.take_team_ids(match,id_squadre);
    console.log('rilevate '+id_squadre.length+' squadre...' );
    console.log(id_squadre);
    //for i  [0-48)

    
    
    
    for (var id=8;id< id_squadre.length;id++) {
        console.log('start analisi squadra '+id_squadre[id]+'...');

        //FASE ESTRAZIONE MATCH I-ESIMA SQUADRA
        var res_home=[];
        var res_away=[];
        /* *********************************** */
        //prendo partite in casa 
        res_home=await trigger.take_home_match(id_squadre[id],res_home,client);
        /* *********************************** */
        //partite in trasferta
        res_away=await trigger.take_away_match(id_squadre[id],res_away,client);
        /* *********************************** */
        //ID,NOME,SEASON,ID_CHAMP
        foglio.id_squadra=id_squadre[id];
        foglio.nome_squadra=res_home[0].home;
        foglio.id_campionato=res_home[0].details.id_champ;
        //da fare: funzione_ranking_squadra,funzione_ranking_campionato

        //numero di partite
        foglio.count_match=res_home.length+res_away.length;  
        
        
///////////////////////////////////////////////////////////////////////
        //poi bisogna ottimizzarla..
        /********************************************************************/

        //MANIPOLAZIONE FOGLIO CON CAMPI STATISTICI DA RIEMPIRE
        foglio=trigger.aggiusta_foglio(foglio,use_s,err_s);
        
        //PARTITE HOME

        var n_goal_fatti=0,n_goal_subiti=0; 
        var sum_tiri=0,sum_tiri_porta=0,sum_tiri_fuori=0,sum_tiri_bloccati=0;
        var sum_tiri_subiti=0,sum_tiri_porta_subiti=0,sum_tiri_fuori_subiti=0,sum_tiri_bloccati_dif=0;
        var sum_attacchi=0,sum_attacchi_pericolosi=0,sum_attacchi_pericolosi_subiti=0,sum_attacchi_subiti=0;
        var sum_angoli=0,sum_fuorigioco=0,sum_parate=0;
        var sum_angoli_subiti=0,sum_fuorigioco_procurati=0,sum_parate_subite=0;
        var falli_commessi=0,falli_subiti=0,contrasti_effettuati=0,contrasti_subiti=0,cartellini_gialli=0;
        var possesso_palla=0,passaggi_concessi=0,sum_passaggi=0,passaggi_totali=0;

        for(var i=0;i<res_home.length;i++){
            //VITTORIE,PAREGGI,SCONFITTE:
            if(res_home[i].winner_code==1){foglio.vittorie=foglio.vittorie+1;foglio.punti=foglio.punti+3;}
            else if(res_home[i].winner_code==2)foglio.sconfitte=foglio.sconfitte+1;
            else if(res_home[i].winner_code==3){foglio.pareggi=foglio.pareggi+1;foglio.punti=foglio.punti+1;}
            else{console.log("errore winner_code,id_match "+res_home[i].id+" definire procedura di correzione e rientro!");}
            //riempire stats che sicuramente sono presenti nel campionato:
            /*************************************************************/
            //conta goal fatti/subiti
            n_goal_fatti+=res_home[i].home_goal;
            n_goal_subiti+=res_home[i].away_goal;
            //prendi stat sicure per ogni match:(vedi array err_s,use_s)

            //tiri effetuati
            sum_tiri=fill.fill_tiri(use_s,percentage,res_home,i,sum_tiri,'home');
            sum_tiri_porta=fill.fill_tiri_in_porta(use_s,percentage,res_home,i,sum_tiri_porta,'home');
            sum_tiri_fuori=fill.fill_tiri_fuori(use_s,percentage,res_home,i,sum_tiri_fuori,'home');
            sum_tiri_bloccati=fill.fill_tiri_bloccati(use_s,percentage,res_home,i,sum_tiri_bloccati,'home');
            //continua con subiti...
            sum_tiri_subiti=fill.fill_tiri(use_s,percentage,res_home,i,sum_tiri_subiti,'away');
            sum_tiri_porta_subiti=fill.fill_tiri_in_porta(use_s,percentage,res_home,i,sum_tiri_porta_subiti,'away');
            sum_tiri_fuori_subiti=fill.fill_tiri_fuori(use_s,percentage,res_home,i,sum_tiri_fuori_subiti,'away');
            sum_tiri_bloccati_dif=fill.fill_tiri_bloccati(use_s,percentage,res_home,i,sum_tiri_bloccati_dif,'away');

            //attacchi fatti/subiti
            sum_attacchi=fill.fill_attacchi(use_s,percentage,res_home,i,sum_attacchi,'home');
            sum_attacchi_subiti=fill.fill_attacchi(use_s,percentage,res_home,i,sum_attacchi_subiti,'away');
            sum_attacchi_pericolosi=fill.fill_attacchi_pericolosi(use_s,percentage,res_home,i,sum_attacchi_pericolosi,'home');
            sum_attacchi_pericolosi_subiti=fill.fill_attacchi_pericolosi(use_s,percentage,res_home,i,sum_attacchi_pericolosi_subiti,'away');

            //corner,fuorigioco,parate
            sum_angoli=fill.fill_angoli(use_s,percentage,res_home,i,sum_angoli,'home');
            sum_angoli_subiti=fill.fill_angoli(use_s,percentage,res_home,i,sum_angoli_subiti,'away');

            sum_fuorigioco=fill.fill_fuorigioco(use_s,percentage,res_home,i,sum_fuorigioco,"home");
            sum_fuorigioco_procurati=fill.fill_fuorigioco(use_s,percentage,res_home,i,sum_fuorigioco_procurati,"away");

            sum_parate=fill.fill_parate(use_s,percentage,res_home,i,sum_parate,"home");
            sum_parate_subite=fill.fill_parate(use_s,percentage,res_home,i,sum_parate_subite,"away");

            //falli,contrasti,cartellini
            falli_commessi=fill.fill_falli(use_s,percentage,res_home,i,falli_commessi,"home");
            falli_subiti=fill.fill_falli(use_s,percentage,res_home,i,falli_subiti,"away");

            contrasti_effettuati=fill.fill_contrasti(use_s,percentage,res_home,i,contrasti_effettuati,"home");
            contrasti_subiti=fill.fill_contrasti(use_s,percentage,res_home,i,contrasti_subiti,"away");

            //non necessita funzione aux
            try{cartellini_gialli+=res_home[i].stat.full_time.cartellini_gialli.home;}catch(err){}
            
            //fare controllo errore...
            possesso_palla+=res_home[i].stat.full_time.possesso_palla.home;

            sum_passaggi=fill.fill_passaggi_completati(use_s,percentage,res_home,i,sum_passaggi,"home");
            
            passaggi_concessi=fill.fill_passaggi_completati(use_s,percentage,res_home,i,passaggi_concessi,"away");
            passaggi_totali=fill.fill_passaggi_totali(use_s,percentage,res_home,i,passaggi_totali,"home");
             
        }
        //goal fatti/subiti
        foglio.home.attacco.goal_fatti=n_goal_fatti;
        foglio.home.attacco.goal_fatti_p90=parseFloat((n_goal_fatti/res_home.length).toFixed(2));
        foglio.home.difesa.goal_subiti=n_goal_subiti;
        foglio.home.difesa.goal_subiti_p90=parseFloat((n_goal_subiti/res_home.length).toFixed(2));
        //////////////////////////////////////////////////////////////////////////////////////////////////
        //shot offensive stat:
        if(sum_tiri!=-1)foglio.home.attacco.tiri_p90=parseFloat((sum_tiri/res_home.length).toFixed(2));
        if(sum_tiri_porta!=-1)foglio.home.attacco.tiri_in_porta_p90=parseFloat((sum_tiri_porta/res_home.length).toFixed(2));
        if(sum_tiri_fuori!=-1)foglio.home.attacco.tiri_fuori_p90=parseFloat((sum_tiri_fuori/res_home.length).toFixed(2));
        if(sum_tiri_bloccati!=-1)foglio.home.attacco.tiri_fermati_p90=parseFloat((sum_tiri_bloccati/res_home.length).toFixed(2));
        //shot defensive stat:
        if(sum_tiri_subiti!=-1)foglio.home.difesa.tiri_subiti_p90=parseFloat((sum_tiri_subiti/res_home.length).toFixed(2));
        if(sum_tiri_porta_subiti!=-1)foglio.home.difesa.tiri_in_porta_subiti_p90=parseFloat((sum_tiri_porta_subiti/res_home.length).toFixed(2));
        if(sum_tiri_fuori_subiti!=-1)foglio.home.difesa.tiri_fuori_subiti_p90=parseFloat((sum_tiri_fuori_subiti/res_home.length).toFixed(2));
        if(sum_tiri_bloccati_dif!=-1)foglio.home.difesa.tiri_bloccati_dif_p90=parseFloat((sum_tiri_bloccati_dif/res_home.length).toFixed(2));
        //attacchi offensive
        if(sum_attacchi!=-1)foglio.home.attacco.attacchi_p90=parseFloat((sum_attacchi/res_home.length).toFixed(2));
        if(sum_attacchi_pericolosi!=-1)foglio.home.attacco.attacchi_pericolosi_p90=parseFloat((sum_attacchi_pericolosi/res_home.length).toFixed(2));
        //attacchi subiti
        if(sum_attacchi_subiti!=-1)foglio.home.difesa.attacchi_subiti_p90=parseFloat((sum_attacchi_subiti/res_home.length).toFixed(2));
        if(sum_attacchi_pericolosi_subiti!=-1)foglio.home.difesa.attacchi_pericolosi_subiti_p90=parseFloat((sum_attacchi_pericolosi_subiti/res_home.length).toFixed(2));
        //angoli,fuorigioco,parate effettuati
        if(sum_angoli!=-1)foglio.home.attacco.corner_p90=parseFloat((sum_angoli/res_home.length).toFixed(2));
        if(sum_fuorigioco!=-1)foglio.home.attacco.fuorigioco_p90=parseFloat((sum_fuorigioco/res_home.length).toFixed(2));
        if(sum_parate!=-1)foglio.home.difesa.parate_p90=parseFloat((sum_parate/res_home.length).toFixed(2));
        //angoli,fuorigioco,parate subite
        if(sum_angoli_subiti!=-1)foglio.home.difesa.corner_concessi_p90=parseFloat((sum_angoli_subiti/res_home.length).toFixed(2));
        if(sum_fuorigioco_procurati)foglio.home.difesa.fuorigioco_procurati_p90=parseFloat((sum_fuorigioco_procurati/res_home.length).toFixed(2));
        if(sum_parate_subite)foglio.home.attacco.parate_subite_p90=parseFloat((sum_parate_subite/res_home.length).toFixed(2));
        //falli.contrasti,cartellini
        if(falli_subiti!=-1)foglio.home.attacco.falli_subiti_p90=parseFloat((falli_subiti/res_home.length).toFixed(2));
        if(falli_commessi!=-1)foglio.home.difesa.falli_commessi_p90=parseFloat((falli_commessi/res_home.length).toFixed(2));
        if(cartellini_gialli!=-1)foglio.home.difesa.cartellini_gialli_p90=parseFloat((cartellini_gialli/res_home.length).toFixed(2));
        if(contrasti_effettuati!=-1)foglio.home.difesa.contrasti_p90=parseFloat((contrasti_effettuati/res_home.length).toFixed(2));
        if(contrasti_subiti!=-1)foglio.home.difesa.contrasti_subiti_p90=parseFloat((contrasti_subiti/res_home.length).toFixed(2));
        //passaggi concessi
        if(passaggi_concessi!=-1)foglio.home.difesa.passaggi_concessi_p90=parseFloat((passaggi_concessi/res_home.length).toFixed(2));
        //indici offensivi
        if(sum_tiri!=-1)foglio.home.attacco.i_conversione_gg=parseFloat((n_goal_fatti/sum_tiri).toFixed(2));
        if(sum_attacchi!= -1 && sum_attacchi_pericolosi!=-1)foglio.home.attacco.i_pericolosita_azioni=parseFloat((sum_attacchi_pericolosi/sum_attacchi).toFixed(2));
        if(sum_tiri_porta!=-1 && sum_tiri!=-1)foglio.home.attacco.i_precisione_tiri=parseFloat((sum_tiri_porta/sum_tiri).toFixed(2));
        if(sum_attacchi_pericolosi!=-1)foglio.home.attacco.i_realizzazione_offensiva=parseFloat((n_goal_fatti/sum_attacchi_pericolosi).toFixed(2));
        //costruzione
        if(possesso_palla!=-1)foglio.home.costruzione.possesso_palla_p90=parseFloat((possesso_palla/res_home.length).toFixed(2));
        if(sum_passaggi!=-1)foglio.home.costruzione.passaggi_completati_p90=parseFloat((sum_passaggi/res_home.length).toFixed(2));
        if(passaggi_totali!=-1)foglio.home.costruzione.passaggi_p90=parseFloat((passaggi_totali/res_home.length).toFixed(2));
        //indici difensivi
        if(foglio.home.difesa.fuorigioco_procurati_p90!=undefined && foglio.home.difesa.contrasti_p90 !=undefined && foglio.home.difesa.parate_p90 !=undefined && foglio.home.difesa.tiri_bloccati_dif_p90!=undefined &&
            foglio.home.difesa.attacchi_pericolosi_subiti_p90!=-undefined && foglio.home.difesa.tiri_in_porta_subiti_p90 !=-undefined && foglio.home.difesa.contrasti_subiti_p90 !=-undefined && foglio.home.difesa.corner_concessi_p90 )

        foglio.home.difesa.i_efficienza_difensiva=parseFloat(
            (
                (
                    foglio.home.difesa.fuorigioco_procurati_p90 +
                    foglio.home.difesa.contrasti_p90 +
                    foglio.home.difesa.parate_p90 +
                    foglio.home.difesa.tiri_bloccati_dif_p90
                )
                /
                (
                    foglio.home.difesa.attacchi_pericolosi_subiti_p90 +
                    foglio.home.difesa.tiri_in_porta_subiti_p90 +
                    foglio.home.difesa.contrasti_subiti_p90 +
                    foglio.home.difesa.corner_concessi_p90
                )
            ).toFixed(2)
        );    
            
            
        if(foglio.home.difesa.parate_p90!=undefined && foglio.home.difesa.tiri_in_porta_subiti_p90!=undefined)
        foglio.home.difesa.i_parate=parseFloat((foglio.home.difesa.parate_p90/foglio.home.difesa.tiri_in_porta_subiti_p90).toFixed(2)); 
        
        if(foglio.home.costruzione.possesso_palla_p90!=undefined && foglio.home.difesa.i_salvataggi!=undefined && foglio.home.difesa.i_efficienza_difensiva!=undefined && foglio.home.difesa.i_parate!=undefined)
        foglio.home.difesa.i_resistenza_difensiva=parseFloat((
                ((foglio.home.costruzione.possesso_palla_p90/100)+
                foglio.home.difesa.i_salvataggi+
                foglio.home.difesa.i_efficienza_difensiva+
                foglio.home.difesa.i_parate)/4
            ).toFixed(2)
        );
        
        if(foglio.home.difesa.tiri_bloccati_dif_p90!=undefined && foglio.home.difesa.tiri_subiti_p90!=undefined && foglio.home.difesa.tiri_fuori_subiti_p90!=undefined)
        foglio.home.difesa.i_salvataggi=parseFloat((
            foglio.home.difesa.tiri_bloccati_dif_p90 / (foglio.home.difesa.tiri_subiti_p90-foglio.home.difesa.tiri_fuori_subiti_p90)
        ).toFixed(2));

        if(foglio.home.costruzione.passaggi_completati_p90!=undefined && foglio.home.costruzione.passaggi_p90!=undefined)
        foglio.home.costruzione.precisione_passaggi=parseFloat((foglio.home.costruzione.passaggi_completati_p90/foglio.home.costruzione.passaggi_p90).toFixed(2));

        //CHECK NEGATIVE STATS

        /***************************************** */
        //reset var
        n_goal_fatti=0,n_goal_subiti=0;
        sum_tiri=0,sum_tiri_porta=0,sum_tiri_fuori=0,sum_tiri_bloccati=0;
        sum_tiri_subiti=0,sum_tiri_porta_subiti=0,sum_tiri_fuori_subiti=0,sum_tiri_bloccati_dif=0;
        sum_attacchi=0,sum_attacchi_pericolosi=0,sum_attacchi_pericolosi_subiti=0,sum_attacchi_subiti=0;
        sum_angoli=0,sum_fuorigioco=0,sum_parate=0,sum_angoli_subiti=0,sum_fuorigioco_procurati=0,sum_parate_subite=0;
        falli_commessi=0,falli_subiti=0,contrasti_effettuati=0,contrasti_subiti=0,cartellini_gialli=0;
        possesso_palla=0,passaggi_concessi=0,sum_passaggi=0,passaggi_totali=0;
        /********************************************************************/

        //PARTITE AWAY
        for(var i=0;i<res_away.length;i++){
            console.log(res_away[i].stat.full_time.contrasti);
            //VITTORIE,PAREGGI,SCONFITTE:
            if(res_away[i].winner_code==2){foglio.vittorie=foglio.vittorie+1;   foglio.punti=foglio.punti+3;}
            else if(res_away[i].winner_code==1)foglio.sconfitte=foglio.sconfitte+1;
            else if(res_away[i].winner_code==3){foglio.pareggi=foglio.pareggi+1;    foglio.punti=foglio.punti+1;}
            else{console.log("errore winner_code,id_match "+res_away[i].id+" definire procedura di correzione e rientro!");}
            //riempire stats che sicuramente sono presenti nel campionato:
            /*************************************************************/
            //conta goal fatti/subiti
            n_goal_subiti+=res_away[i].home_goal;
            n_goal_fatti+=res_away[i].away_goal;

            //tiri effetuati
            sum_tiri=fill.fill_tiri(use_s,percentage,res_away,i,sum_tiri,'away');
            sum_tiri_porta=fill.fill_tiri_in_porta(use_s,percentage,res_away,i,sum_tiri_porta,'away');
            sum_tiri_fuori=fill.fill_tiri_fuori(use_s,percentage,res_away,i,sum_tiri_fuori,'away');
            sum_tiri_bloccati=fill.fill_tiri_bloccati(use_s,percentage,res_away,i,sum_tiri_bloccati,'away');
            //continua con subiti...
            sum_tiri_subiti=fill.fill_tiri(use_s,percentage,res_away,i,sum_tiri_subiti,'home');
            sum_tiri_porta_subiti=fill.fill_tiri_in_porta(use_s,percentage,res_away,i,sum_tiri_porta_subiti,'home');
            sum_tiri_fuori_subiti=fill.fill_tiri_fuori(use_s,percentage,res_away,i,sum_tiri_fuori_subiti,'home');
            sum_tiri_bloccati_dif=fill.fill_tiri_bloccati(use_s,percentage,res_away,i,sum_tiri_bloccati_dif,'home');

            //attacchi fatti/subiti
            sum_attacchi=fill.fill_attacchi(use_s,percentage,res_away,i,sum_attacchi,'away');
            sum_attacchi_subiti=fill.fill_attacchi(use_s,percentage,res_away,i,sum_attacchi_subiti,'home');
            sum_attacchi_pericolosi=fill.fill_attacchi_pericolosi(use_s,percentage,res_away,i,sum_attacchi_pericolosi,'away');
            sum_attacchi_pericolosi_subiti=fill.fill_attacchi_pericolosi(use_s,percentage,res_away,i,sum_attacchi_pericolosi_subiti,'home');

            //corner,fuorigioco,parate
            sum_angoli=fill.fill_angoli(use_s,percentage,res_away,i,sum_angoli,'away');
            sum_angoli_subiti=fill.fill_angoli(use_s,percentage,res_away,i,sum_angoli_subiti,'home');

            sum_fuorigioco=fill.fill_fuorigioco(use_s,percentage,res_away,i,sum_fuorigioco,"away");
            sum_fuorigioco_procurati=fill.fill_fuorigioco(use_s,percentage,res_away,i,sum_fuorigioco_procurati,"home");

            sum_parate=fill.fill_parate(use_s,percentage,res_away,i,sum_parate,"away");
            sum_parate_subite=fill.fill_parate(use_s,percentage,res_away,i,sum_parate_subite,"home");

            //falli,contrasti,cartellini
            falli_commessi=fill.fill_falli(use_s,percentage,res_away,i,falli_commessi,"away");
            falli_subiti=fill.fill_falli(use_s,percentage,res_away,i,falli_subiti,"home");

            contrasti_effettuati=fill.fill_contrasti(use_s,percentage,res_away,i,contrasti_effettuati,"away");
            contrasti_subiti=fill.fill_contrasti(use_s,percentage,res_away,i,contrasti_subiti,"home");

            //non necessita funzione aux
            try{cartellini_gialli+=res_away[i].stat.full_time.cartellini_gialli.away;}catch(err){}
            //fare controllo errore...
            possesso_palla+=res_away[i].stat.full_time.possesso_palla.away;

            sum_passaggi=fill.fill_passaggi_completati(use_s,percentage,res_away,i,sum_passaggi,"away");
            passaggi_concessi=fill.fill_passaggi_completati(use_s,percentage,res_away,i,passaggi_concessi,"home");
            passaggi_totali=fill.fill_passaggi_totali(use_s,percentage,res_away,i,passaggi_totali,"away");
        }
        console.log('esco dal ciclo');
        foglio.away.attacco.goal_fatti=n_goal_fatti;
        foglio.away.attacco.goal_fatti_p90=parseFloat((n_goal_fatti/res_away.length).toFixed(2));
        foglio.away.difesa.goal_subiti=n_goal_subiti;
        foglio.away.difesa.goal_subiti_p90=parseFloat((n_goal_subiti/res_away.length).toFixed(2));
        //shot offensive stat:
        if(sum_tiri!=-1)foglio.away.attacco.tiri_p90=parseFloat((sum_tiri/res_away.length).toFixed(2));
        if(sum_tiri_porta!=-1)foglio.away.attacco.tiri_in_porta_p90=parseFloat((sum_tiri_porta/res_away.length).toFixed(2));
        if(sum_tiri_fuori!=-1)foglio.away.attacco.tiri_fuori_p90=parseFloat((sum_tiri_fuori/res_away.length).toFixed(2));
        if(sum_tiri_bloccati!=-1)foglio.away.attacco.tiri_fermati_p90=parseFloat((sum_tiri_bloccati/res_away.length).toFixed(2));
        //shot defensive stat:
        if(sum_tiri_subiti!=-1)foglio.away.difesa.tiri_subiti_p90=parseFloat((sum_tiri_subiti/res_away.length).toFixed(2));
        if(sum_tiri_porta_subiti!=-1)foglio.away.difesa.tiri_in_porta_subiti_p90=parseFloat((sum_tiri_porta_subiti/res_away.length).toFixed(2));
        if(sum_tiri_fuori_subiti!=-1)foglio.away.difesa.tiri_fuori_subiti_p90=parseFloat((sum_tiri_fuori_subiti/res_away.length).toFixed(2));
        if(sum_tiri_bloccati_dif!=-1)foglio.away.difesa.tiri_bloccati_dif_p90=parseFloat((sum_tiri_bloccati_dif/res_away.length).toFixed(2));
        //attacchi offensive
        if(sum_attacchi!=-1)foglio.away.attacco.attacchi_p90=parseFloat((sum_attacchi/res_away.length).toFixed(2));
        if(sum_attacchi_pericolosi!=-1)foglio.away.attacco.attacchi_pericolosi_p90=parseFloat((sum_attacchi_pericolosi/res_away.length).toFixed(2));
        //attacchi subiti
        if(sum_attacchi_subiti!=-1)foglio.away.difesa.attacchi_subiti_p90=parseFloat((sum_attacchi_subiti/res_away.length).toFixed(2));
        if(sum_attacchi_pericolosi_subiti!=-1)foglio.away.difesa.attacchi_pericolosi_subiti_p90=parseFloat((sum_attacchi_pericolosi_subiti/res_away.length).toFixed(2));
        //angoli,fuorigioco,parate effettuate
        if(sum_angoli!=-1)foglio.away.attacco.corner_p90=parseFloat((sum_angoli/res_away.length).toFixed(2));
        if(sum_fuorigioco!=-1)foglio.away.attacco.fuorigioco_p90=parseFloat((sum_fuorigioco/res_away.length).toFixed(2));
        if(sum_parate!=-1)foglio.away.difesa.parate_p90=parseFloat((sum_parate/res_away.length).toFixed(2));
        //angoli,fuorigioco,parate subite
        if(sum_angoli_subiti!=-1)foglio.away.difesa.corner_concessi_p90=parseFloat((sum_angoli_subiti/res_away.length).toFixed(2));
        if(sum_fuorigioco_procurati!=-1)foglio.away.difesa.fuorigioco_procurati_p90=parseFloat((sum_fuorigioco_procurati/res_away.length).toFixed(2));
        if(sum_parate_subite!=-1)foglio.away.attacco.parate_subite_p90=parseFloat((sum_parate_subite/res_away.length).toFixed(2));
        //falli.contrasti,cartellini
        if(falli_subiti!=-1)foglio.away.attacco.falli_subiti_p90=parseFloat((falli_subiti/res_away.length).toFixed(2));
        if(falli_commessi!=-1)foglio.away.difesa.falli_commessi_p90=parseFloat((falli_commessi/res_away.length).toFixed(2));
        if(cartellini_gialli!=-1)foglio.away.difesa.cartellini_gialli_p90=parseFloat((cartellini_gialli/res_away.length).toFixed(2));
        if(contrasti_effettuati!=1)foglio.away.difesa.contrasti_p90=parseFloat((contrasti_effettuati/res_away.length).toFixed(2));
        if(contrasti_subiti!=-1)foglio.away.difesa.contrasti_subiti_p90=parseFloat((contrasti_subiti/res_away.length).toFixed(2));
        //passaggi completati
        if(passaggi_concessi!=-1)foglio.away.difesa.passaggi_concessi_p90=parseFloat((passaggi_concessi/res_away.length).toFixed(2));
        //indici offensivi
        if(sum_tiri!=-1)foglio.away.attacco.i_conversione_gg=parseFloat((n_goal_fatti/sum_tiri).toFixed(2));
        if(sum_attacchi_pericolosi!=-1 && sum_attacchi!=-1)foglio.away.attacco.i_pericolosita_azioni=parseFloat((sum_attacchi_pericolosi/sum_attacchi).toFixed(2));
        if(sum_tiri_porta!=-1 && sum_tiri!=-1)foglio.away.attacco.i_precisione_tiri=parseFloat((sum_tiri_porta/sum_tiri).toFixed(2));
        if(sum_attacchi_pericolosi!=-1)foglio.away.attacco.i_realizzazione_offensiva=parseFloat((n_goal_fatti/sum_attacchi_pericolosi).toFixed(2));
        //costruzione
        if(possesso_palla!=-1)foglio.away.costruzione.possesso_palla_p90=parseFloat((possesso_palla/res_away.length).toFixed(2));
        if(sum_passaggi!=-1)foglio.away.costruzione.passaggi_completati_p90=parseFloat((sum_passaggi/res_away.length).toFixed(2));
        if(passaggi_totali!=-1)foglio.away.costruzione.passaggi_p90=parseFloat((passaggi_totali/res_away.length).toFixed(2));
        //indici difensivi
        if(foglio.away.difesa.fuorigioco_procurati_p90!=undefined && foglio.away.difesa.contrasti_p90 !=undefined && foglio.away.difesa.parate_p90 !=undefined && foglio.away.difesa.tiri_bloccati_dif_p90!=undefined &&
            foglio.away.difesa.attacchi_pericolosi_subiti_p90!=-undefined && foglio.away.difesa.tiri_in_porta_subiti_p90 !=-undefined && foglio.away.difesa.contrasti_subiti_p90 !=-undefined && foglio.away.difesa.corner_concessi_p90 )
        
        foglio.away.difesa.i_efficienza_difensiva=parseFloat(
            (
                (
                    foglio.away.difesa.fuorigioco_procurati_p90 +
                    foglio.away.difesa.contrasti_p90 +
                    foglio.away.difesa.parate_p90 +
                    foglio.away.difesa.tiri_bloccati_dif_p90
                )
                /
                (
                    foglio.away.difesa.attacchi_pericolosi_subiti_p90 +
                    foglio.away.difesa.tiri_in_porta_subiti_p90 +
                    foglio.away.difesa.contrasti_subiti_p90 +
                    foglio.away.difesa.corner_concessi_p90
                )
            ).toFixed(2)
        );

        if(foglio.away.difesa.parate_p90!=undefined && foglio.away.difesa.tiri_in_porta_subiti_p90!=undefined)
        foglio.away.difesa.i_parate=parseFloat((foglio.away.difesa.parate_p90/foglio.away.difesa.tiri_in_porta_subiti_p90).toFixed(2)); 
        
        if(foglio.home.costruzione.possesso_palla_p90!=undefined && foglio.home.difesa.i_salvataggi!=undefined && foglio.home.difesa.i_efficienza_difensiva!=undefined && foglio.home.difesa.i_parate!=undefined)
        foglio.away.difesa.i_resistenza_difensiva=parseFloat((
            ((foglio.away.costruzione.possesso_palla_p90/100)+
            foglio.away.difesa.i_salvataggi+
            foglio.away.difesa.i_efficienza_difensiva+
            foglio.away.difesa.i_parate)/4
        ).toFixed(2)
        );
        
        if(foglio.away.difesa.tiri_bloccati_dif_p90!=undefined && foglio.away.difesa.tiri_subiti_p90!=undefined && foglio.away.difesa.tiri_fuori_subiti_p90!=undefined)
        foglio.away.difesa.i_salvataggi=parseFloat((
            foglio.away.difesa.tiri_bloccati_dif_p90 / (foglio.away.difesa.tiri_subiti_p90-foglio.away.difesa.tiri_fuori_subiti_p90)
        ).toFixed(2));

        if(foglio.away.costruzione.passaggi_completati_p90!=undefined && foglio.away.costruzione.passaggi_p90!=undefined)
        foglio.away.costruzione.precisione_passaggi=parseFloat((foglio.away.costruzione.passaggi_completati_p90/foglio.away.costruzione.passaggi_p90).toFixed(2));
        
        //da finire!!
                /*
                salva_foglio_squadre (1 statistica per volta)
                aggiorna foglio squadre*
                ricava indici ogni volta senno salvali o senno vedi tu,meglio de no, richiama piu volte le funzioni, se le riesco a fa O(n)~~O(1) per input stimati piccolini
                infine fare test d' potesi degli indici
                */
        
        //delete foglio.away['costruzione'];
        //fs.appendFileSync("./serie_a.json",JSON.stringify(foglio)+',');
        console.log(foglio);
        foglio=trigger.reset_foglio(foglio);
        
        process.exit(0);
        
        
    }
}

//*******************************************************************************************************************************//
//UPDATE FOGLI SQUADRE

exports.update_stats=async function(arr,client){
    
    for(var i=0;i<arr.length;i++){
        var home=arr[i].home_id;
        var away=arr[i].away_id;
        //if(not current season)open new foglio!!

        //query sulle due squadre del match i-esimo
        var r1=await trigger.take_foglio(client,home,"home");
        var r2=await trigger.take_foglio(client,away,"away");

        //update stats: Input(foglio,match,se devo prendere home/away squadra)
        await trigger.update_stats(client,r1,arr[i],"home");
        await trigger.update_stats(client,r2,arr[i],"away");
        
    }
}



/*****************************************************************************************************************/
/*PERFORM STAT REPORT
    questa funzione calcola un file dove sono salvate,
    per ogni campionato,
    le statistiche che possono essere contenute nei match  
*/

//METODO AUX: 
async function adjust_stat(match,N){
    
    //inizializza err_usage con le chiavi e setta value a zero
    for(var j=0;j<N.err_stats.length;j++){
        //gestisti mancanza di cartellini nel match
        if(N.err_stats[j]=="cartellini_rossi" ||  N.err_stats[j]=="cartellini_gialli")continue; 
        var key=N.err_stats[j]; //prendo chiave
        N.err_usage[key]=0; //setto a zero 
    }
    N.err_usage["no_stat_match"]=0; //campo informativo aggintivo per capire quanti match non hanno stats

    //scorri match del campionato per salvare la % di utilizzo delle err_stats
    var arr_err_stats=Object.keys(N.err_usage); //salvo le key delle stat non omogenee
    for(var i=0;i<match.length;i++){
        //caso not_stats
        if(Object.keys(match[i].stat.full_time)==0){N.err_usage.no_stat_match++;continue;}
        //caso normale in cui match ha stats salvate
        for(var j=0;j<arr_err_stats.length;j++){

            //caso not_stat,non e' processabile
            if(arr_err_stats[j]=="no_stat_match")continue;

            //caso match riporta quella stats non omogenea
            if(Object.keys(match[i].stat.full_time).includes(arr_err_stats[j]))
            N.err_usage[arr_err_stats[j]]=N.err_usage[arr_err_stats[j]]+1; //aggiungo 1 se statistica compare
        }  
    }
    //una volta finito di contare il numero di match in cui compaiono le stat non omogenee,trasformo il valore in %
    var dim=match.length;
    //if(N.err_usage.no_stat_match!=0)console.log("tot_count: "+dim+" n_match_no_stats: "+N.err_usage.no_stat_match+" champ_id: "+match[0].details.id_champ); 
    for(var j=0;j<arr_err_stats.length;j++){
        N.err_usage[arr_err_stats[j]]=parseFloat((N.err_usage[arr_err_stats[j]]/dim)*100).toFixed(2);
    }
}

exports.perform_stats_report = async function (client) {
    console.log('stat report started...');
    var file = [];
    var N;
    var projection = { _id: 0, id: 1, "details.id_champ": 1, "stat.full_time": 1 };
    var match = [];

    for (var champ = 0; champ < champLength; champ++) {

        //prendo match
        match = [];
        var year=new Date().getFullYear();
        var dates = ts.solveSeasons(year);
        var cursor = await client.db(dbName[0]).collection(collection).find(
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

        await cursor.forEach(doc => match.push(doc));
        
        if (match.length == 0) continue;
        //dichiaro unita' dati, struttura di appoggio per ogni campionato
        //NOTA:per accuratezza di gestione bisognerebbe calcolare % di utilizzo di ogni err_stats nei match e importanza di quella statistica.
        N = {
            id: match[0].details.id_champ,
            use_stats: [],
            err_stats: [],
            num_stats: [],
            err_usage: {},
        };

        for (var i = 0; i < match.length; i++) {
            //gestione caso not_stats
            if (Object.keys(match[i].stat.full_time).length == 0) continue;

            //passo base,unita dati vuota
            if (N.num_stats.length == 0) {
                N.num_stats.push(Object.keys(match[i].stat.full_time).length);
                await Object.keys(match[i].stat.full_time).forEach(doc => N.use_stats.push(doc));
            }
            //passi iterativi
            if (!N.num_stats.includes(Object.keys(match[i].stat.full_time).length)) {
                //aggiungo nuova dimensione
                N.num_stats.push(Object.keys(match[i].stat.full_time).length);

                var diff = array.left_difference(Object.keys(match[i].stat.full_time), N.use_stats);

                if (diff.length != 0) {
                    await diff.forEach(doc => { if (!N.err_stats.includes(doc)) N.err_stats.push(doc); });
                    await diff.forEach(doc => { if (!N.use_stats.includes(doc)) N.use_stats.push(doc); });
                }
                else {
                    diff = array.left_difference(N.use_stats, Object.keys(match[i].stat.full_time));
                    if (diff.length != 0) {
                        await diff.forEach(doc => { if (!N.err_stats.includes(doc)) N.err_stats.push(doc); });
                        await diff.forEach(doc => { if (!N.use_stats.includes(doc)) N.use_stats.push(doc); });
                    }
                }

            }
        }
        //save N 
        adjust_stat(match, N);
        file.push(N);
    }
    fs.writeFileSync('./1.main_files/stats_report.json', JSON.stringify(file));
    console.log('stat report completed');
}
/*****************************************************************************************************************/