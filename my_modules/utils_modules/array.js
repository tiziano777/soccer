//GENERALI


//METODO ARRAY SHUFFLE
exports.shuffle= function(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

//PER PROGETTO DIRETTA.IT

//DATA CLEANING ID_MATCH

exports.elimina_char=function (arr){
    for(var i=0;i<arr.length;i++){
        arr[i]=arr[i].slice(3,11);
    }
    return arr;
}

function elimina_vuoti (arr){
    var i=0;
    do{
        if(arr[i]=='' || arr[i]==undefined || arr[i]==null){
            arr.splice(i,1);
        }
        else i++;
    }while(i<arr.length);
    return arr;
}

function elimina_elementi_range(i,j,arr){
    var output=[];
    for(var k=0;k<i;k++){
        output[k]=arr[k];
    }
    for(var k=j;k<arr.length;k++){
        output[k]=arr[k];
    }
    arr=output;
    return arr;
}


//FZ ARRAY CHE RIMUOVE DUPLICATI ARRAY ORDINATO
function elimina_doppi (i,j,arr){
    var output=[];
    for(var k=0;k<i+1;k++){
        output[k]=arr[k];
    }
    for(var k=j;k<arr.length;k++){
        output[k]=arr[k];
    }
    arr=output;
    return arr;
}

exports.clean_array_sorted=function (arr) {
    var i=0;
    do{
        if(arr[i]==arr[i+1]){
            var j=i+2;
            while(arr[i]==arr[j])j++; 
            arr=elimina_doppi(i,j,arr);
            i=j-1;
        }
        i++;
    }while(i<arr.length-1);
    arr=elimina_vuoti(arr);
    return arr;
};

exports.left_difference=function(arr1,arr2){
    return arr1.filter(x => !arr2.includes(x));
}
exports.differenza_simmetrica=function(arr1,arr2){
    return arr1.filter(x => !arr2.includes(x)).concat(arr2.filter(x => !arr1.includes(x)));
}
/////////////////////////////////////////////////////