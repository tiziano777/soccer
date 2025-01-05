//riempi con la media
function fill_avg(res,stat,h_a){
    var s=0;
    var k=res.length;
    for(var j=0;j<res.length;j++){
        if(res[j].stat.full_time[stat]!=undefined || res[j].stat.full_time[stat]>=0){
            s+=res[j].stat.full_time[stat][h_a];
        }
        else k--;
    }
    return s/k;
}


exports.fill_tiri=function(use_s,percentage,res,i,sum_tiri,h_a){
    if(sum_tiri==-1)return sum_tiri;
    if(use_s.indexOf("tiri")!=undefined && res[i].stat.full_time.tiri!=undefined )
    sum_tiri+=res[i].stat.full_time.tiri[h_a];
    else if(use_s.indexOf("tiri")!=-1 && res[i].stat.full_time.tiri==undefined && ( percentage["tiri"]>=85 || percentage["tiri"]==undefined)){
        var temp=fill_avg(res,"tiri",h_a);
        sum_tiri+=temp;
    }
    else if(use_s.indexOf("tiri")==-1 || percentage["tiri"]<85)sum_tiri=-1;
    return sum_tiri;
}
exports.fill_tiri_in_porta=function(use_s,percentage,res,i,sum_tiri_in_porta,h_a){
    if(sum_tiri_in_porta==-1)return sum_tiri_in_porta;
    if(use_s.indexOf("tiri_in_porta")!=undefined && res[i].stat.full_time.tiri_in_porta!=undefined )
    sum_tiri_in_porta+=res[i].stat.full_time.tiri_in_porta[h_a];
    else if(use_s.indexOf("tiri_in_porta")!=-1 && res[i].stat.full_time.tiri_in_porta==undefined && ( percentage["tiri_in_porta"]>=85 || percentage["tiri_in_porta"]==undefined)){
        var temp=fill_avg(res,"tiri_in_porta",h_a);
        sum_tiri_in_porta+=temp;
    }
    else if(use_s.indexOf("tiri_in_porta")!=-1 || percentage["tiri_in_porta"]<85)sum_tiri_in_porta=-1;
    return sum_tiri_in_porta;
}
exports.fill_tiri_fuori=function(use_s,percentage,res,i,sum_tiri_fuori,h_a){
    if(sum_tiri_fuori==-1)return sum_tiri_fuori
    if(use_s.indexOf("tiri_fuori")!=undefined && res[i].stat.full_time.tiri_fuori!=undefined)
    sum_tiri_fuori+=res[i].stat.full_time.tiri_fuori[h_a];
    else if(use_s.indexOf("tiri_fuori")!=-1 && res[i].stat.full_time.tiri_fuori==undefined && (percentage["tiri_fuori"]>=85 || percentage["tiri_fuori"]==undefined)){
        var temp=fill_avg(res,"tiri_fuori",h_a);
        sum_tiri_fuori+=temp;
    }
    else if(use_s.indexOf("tiri_fuori")==-1 || percentage["tiri_fuori"]<85)sum_tiri_fuori=-1;
    return sum_tiri_fuori;
}
exports.fill_tiri_bloccati=function(use_s,percentage,res,i,sum_tiri_bloccati,h_a){
    if(sum_tiri_bloccati==-1)return sum_tiri_bloccati;
    if(use_s.indexOf("tiri_fermati")!=undefined && res[i].stat.full_time.tiri_fermati!=undefined )
    sum_tiri_bloccati+=res[i].stat.full_time.tiri_fermati[h_a];
    else if(use_s.indexOf("tiri_fermati")!=-1 && res[i].stat.full_time.tiri_fermati==undefined && (percentage["tiri_fermati"]>=85 || percentage["tiri_fermati"]==undefined)){
        var temp=fill_avg(res,"tiri_fermati",h_a);
        sum_tiri_bloccati+=temp;
    }
    else if(use_s.indexOf("tiri_fermati")==-1 || percentage["tiri_fermati"]<85)sum_tiri_bloccati=-1;
    return sum_tiri_bloccati;
}
exports.fill_attacchi=function(use_s,percentage,res,i,sum_attacchi,h_a){
    if(sum_attacchi==-1)return sum_attacchi;
    if(use_s.indexOf("attacchi")!=undefined && res[i].stat.full_time.attacchi!=undefined )
    sum_attacchi+=res[i].stat.full_time.attacchi[h_a];
    else if(use_s.indexOf("attacchi")!=-1 && res[i].stat.full_time.attacchi==undefined && (percentage["attacchi"]>=85 || percentage["attacchi"]==undefined)){
        var temp=fill_avg(res,"attacchi",h_a);
        sum_attacchi+=temp;
    }
    else if(use_s.indexOf("attacchi")==-1 || percentage["attacchi"]<85)sum_attacchi=-1;
    return sum_attacchi;
}
exports.fill_attacchi_pericolosi=function(use_s,percentage,res,i,sum_attacchi_pericolosi,h_a){
    if(sum_attacchi_pericolosi==-1)return sum_attacchi_pericolosi;
    if(use_s.indexOf("attacchi_pericolosi")!=undefined && res[i].stat.full_time.attacchi_pericolosi!=undefined )
    sum_attacchi_pericolosi+=res[i].stat.full_time.attacchi_pericolosi[h_a];
    else if(use_s.indexOf("attacchi_pericolosi")!=-1 && res[i].stat.full_time.attacchi_pericolosi==undefined && (percentage["attacchi_pericolosi"]>=85 || percentage["attacchi_pericolosi"]==undefined)){
        var temp=fill_avg(res,"attacchi_pericolosi",h_a);
        sum_attacchi_pericolosi+=temp;
    }
    else if(use_s.indexOf("attacchi_pericolosi")==-1 || percentage["attacchi_pericolosi"]<85)sum_attacchi_pericolosi=-1;
    return sum_attacchi_pericolosi;
}
exports.fill_angoli=function(use_s,percentage,res,i,sum_angoli,h_a){
    if(sum_angoli==-1)return sum_angoli;
    if(use_s.indexOf("angoli")!=undefined && res[i].stat.full_time.angoli!=undefined )
    sum_angoli+=res[i].stat.full_time.angoli[h_a];
    else if(use_s.indexOf("angoli")!=-1 && res[i].stat.full_time.angoli==undefined && (percentage["angoli"]>=85 || percentage["amgoli"]==undefined)){
    var temp=fill_avg(res,"angoli",h_a);
    sum_angoli+=temp;
    }
    else if(use_s.indexOf("angoli")==-1 || percentage["angoli"]<85)sum_angoli=-1;
    return sum_angoli;
}
exports.fill_fuorigioco=function(use_s,percentage,res,i,sum_fuorigioco,h_a){
    if(sum_fuorigioco==-1)return sum_fuorigioco;
    if(use_s.indexOf("fuorigioco")!=undefined && res[i].stat.full_time.fuorigioco!=undefined)
    sum_fuorigioco+=res[i].stat.full_time.fuorigioco[h_a];
    else if(use_s.indexOf("fuorigioco")!=-1 && res[i].stat.full_time.fuorigioco==undefined && (percentage["fuorigioco"]>=85 || percentage["fuorigioco"]==undefined)){
    var temp=fill_avg(res,"fuorigioco",h_a);
    sum_fuorigioco+=temp;
    }
    else if(use_s.indexOf("fuorigioco")==-1 || percentage["fuorigioco"]<85)sum_fuorigioco=-1;
    return sum_fuorigioco;
}
exports.fill_parate=function(use_s,percentage,res,i,sum_parate,h_a){
    if(sum_parate==-1)return sum_parate;
    if(use_s.indexOf("parate")!=undefined && res[i].stat.full_time.parate!=undefined)
    sum_parate+=res[i].stat.full_time.parate[h_a];
    else if(use_s.indexOf("parate")!=-1 && res[i].stat.full_time.parate==undefined && (percentage["parate"]>=85 || percentage["parate"]==undefined)){
    var temp=fill_avg(res,"parate",h_a);
    sum_parate+=temp;
    }
    else if(use_s.indexOf("parate")==-1 || percentage["parate"]<85)sum_parate=-1;
    return sum_parate;
}
exports.fill_falli=function(use_s,percentage,res,i,sum_falli,h_a){
    if(sum_falli==-1)return sum_falli;
    if(use_s.indexOf("falli")!=undefined && res[i].stat.full_time.falli!=undefined)
    sum_falli+=res[i].stat.full_time.falli[h_a];
    else if(use_s.indexOf("falli")!=-1 && res[i].stat.full_time.falli==undefined && (percentage["falli"]>=85 || percentage["falli"]==undefined)){
    var temp=fill_avg(res,"falli",h_a);
    sum_falli+=temp;
    }
    else if(use_s.indexOf("falli")==-1 || percentage["falli"]<85)sum_falli=-1;
    return sum_falli;
}
exports.fill_contrasti=function(use_s,percentage,res,i,sum_contrasti,h_a){
    if(sum_contrasti==-1)return sum_contrasti;
    if(use_s.indexOf("contrasti")!=undefined && res[i].stat.full_time.contrasti>0)
    sum_contrasti+=res[i].stat.full_time.contrasti[h_a];
    else if(use_s.indexOf("contrasti")!=-1 && res[i].stat.full_time.contrasti==undefined && (parseFloat(percentage["contrasti"])>=85.0 || percentage["contrasti"]==undefined)){
    var temp=fill_avg(res,"contrasti",h_a);
    sum_contrasti+=temp;
    }
    else if(use_s.indexOf("contrasti")==-1 || parseFloat(percentage["contrasti"])<85)sum_contrasti=-1;
    return sum_contrasti;
}

exports.fill_passaggi_completati=function(use_s,percentage,res,i,sum_passaggi,h_a){
    
    if(sum_passaggi==-1)return sum_passaggi;
    if(use_s.indexOf("passaggi_completati")!=undefined && res[i].stat.full_time.passaggi_completati!=undefined)
    sum_passaggi+=res[i].stat.full_time.passaggi_completati[h_a];
    else if(use_s.indexOf("passaggi_completati")!=-1 && res[i].stat.full_time.passaggi_completati==undefined && (percentage["passaggi_completati"]>=85 || percentage["passaggi_completati"]==undefined)){
    var temp=fill_avg(res,"passaggi_completati",h_a);
    sum_passaggi+=temp;
    }
    else if(use_s.indexOf("passaggi_completati")==-1 || percentage["passaggi_completati"]<85)sum_passaggi=-1;
    
    return sum_passaggi;
}
exports.fill_passaggi_totali=function(use_s,percentage,res,i,passaggi_totali,h_a){
    if(passaggi_totali==-1)return passaggi_totali;
    if(use_s.indexOf("passaggi_totali")!=undefined && res[i].stat.full_time.passaggi_totali!=undefined)
    passaggi_totali+=res[i].stat.full_time.passaggi_totali[h_a];
    else if(use_s.indexOf("passaggi_totali")!=-1 && res[i].stat.full_time.passaggi_totali==undefined && (percentage["passaggi_totali"]>=85 || percentage["passaggi_totali"]==undefined)){
    var temp=fill_avg(res,"passaggi_totali",h_a);
    passaggi_totali+=temp;
    }
    else if(use_s.indexOf("passaggi_totali")==-1 || percentage["passaggi_totali"]<85)passaggi_totali=-1;
    return passaggi_totali;
}