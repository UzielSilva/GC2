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

Util.generaRangosAleatorios = function(number,xMax, yMax, xMin, yMin){
    var xM = (xMax?xMax:300),
        xm = (xMin?xMin:0),
        yM = (yMax?yMax:300),
        ym = (yMin?yMin:0);
    
    var ret = [];
    for (var i = 0; i < number; i++) { 
        var v1 = Math.random()*xM + xm,
            v2 = Math.random()*yM + ym;
        ret.push([Math.min(v1,v2), Math.max(v1,v2)]);
    }
    return ret;
}

// poligono := [{x, y},...], el poligono debe ser convexo, los vértices ordenados.
// punto : {x, y}

Util.prototype.enPoligono = function(poligono, punto){
    var orientacion = function(a,b,c){
        return Math.asin(((b.x - a.x)*(c.y - b.y) - (b.y - a.y)*(c.x - b.x))/
                     (Math.sqrt(Math.pow(b.x - a.x,2) + Math.pow(b.y - a.y,2))*
                     Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
    };
    var izqDer;
    if(orientacion(poligono[poligono.length - 1], poligono[0], punto) > 0)
        izqDer = function(a){return a > 0};
    else
        izqDer = function(a){return a < 0};
    for(var i = 0; i < poligono.length - 1; i++){
        if(!izqDer(orientacion(poligono[i], poligono[i+1], punto))) return false;
    }
    return true;
}

var sitios = Util.generaSitiosAleatorios(30);