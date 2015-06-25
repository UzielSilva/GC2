function Util(){}

Util.generaSitiosAleatorios = function(number,xMax, yMax, xMin, yMin){
    var xM = (xMax?xMax:300),
        xm = (xMin?xMin:0),
        yM = (yMax?yMax:300),
        ym = (yMin?yMin:0);
    
    var ret = [];
    for (var i = 0; i < number; i++) { 
        ret.push({x:Math.random()*xM + xm,y:Math.random()*yM + ym});
    }
    return ret;
}

var sitios = Util.generaSitiosAleatorios(30);