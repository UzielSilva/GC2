function Util(){}

Util.Canvas = function(gNode, bBox, margin) {
    this.gNode = gNode;
};

Util.creaCanvas = function(id, bBox, margin){
    if(!margin) margin = 5;
    
    if(!id)
        throw 'You need an id!';
        
    var svg = d3.select(id);
    
    if(!svg.select("g").empty()){
        var gNodeAnterior = svg.select("g");
        var gNode = svg
        .append("g")
        .attr("transform",gNodeAnterior.attr("transform"));
        return new Util.Canvas(gNode);
    }
        
    var scaleX = (svg.attr("width"))/((bBox.xMax - bBox.xMin)+2*margin);
    var scaleY = (svg.attr("height"))/((bBox.yMax - bBox.yMin)+2*margin);
    
    var scale = Math.min(scaleX,scaleY);
    
    var gNode = svg
        .append("g")
        .attr("transform","scale("+scale+")" +
              "translate("+ (margin - bBox.xMin) + "," + (margin - bBox.yMin) +")");
    return new Util.Canvas(gNode);
};

Util.traeCanvas = function(id,index){
    if(!index) index = 0;
    var svg = d3.select(id).selectAll('g')[index];
    return new Util.Canvas(svg);
};

Util.Canvas.prototype.limpia = function(){
    this.gNode.selectAll("*").remove();
};

Util.Canvas.prototype.dibujaLinea = function(v1, v2, color){
    var c = color;
    if(!c) c = "black";
    this.gNode.append("line")
        .attr("x1", v1.x)
        .attr("x2", v2.x)
        .attr("y1", v1.y)
        .attr("y2", v2.y)
        .attr("stroke-width", 2)
        .attr("stroke", c);
};

Util.Canvas.prototype.dibujaPunto = function(v){
    this.gNode.append("circle")
        .attr("cx", v.x)
        .attr("cy", v.y)
        .attr("r", 3)
        .style("fill", function(d) { return "blue"; });
    }

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
};

Util.generaObjetosAleatorios = function(number,xMax, yMax, xMin, yMin){
    var xM = (xMax?xMax:300),
        xm = (xMin?xMin:0),
        yM = (yMax?yMax:300),
        ym = (yMin?yMin:0);
    
    var ret = [];
    for (var i = 0; i < number; i++) {
        var x1 = Math.random()*xM + xm;
        var x2 = Math.random()*xM + xm;
        var y1 = Math.random()*yM + ym;
        var y2 = Math.random()*yM + ym;
        var obj = {guardias:[{x:x1,y:y1},
                           {x:x1,y:y2},
                           {x:x2,y:y1},
                           {x:x2,y:y2}]}
        obj.guardias.forEach(function(x){
            x.obj = obj;
        });
        ret.push(obj);

    }
    return ret;
};

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
};

Util.encuentraMaxMin = function(puntos){
    if(!puntos || puntos.length == 0)
        return null;
    var xMax = {x:-Infinity};
    var xMin = {x:Infinity};
    var yMax = {y:-Infinity};
    var yMin = {y:Infinity};
    puntos.forEach(function(punto){
        if(punto.x > xMax.x)
            xMax = punto;
        if(punto.x < xMin.x)
            xMin = punto;
        if(punto.y > yMax.y)
            yMax = punto;
        if(punto.y < yMin.y)
            yMin = punto;
    });
    return {xMax: xMax,
            xMin: xMin,
            yMax: yMax,
            yMin: yMin};
};

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
};

var sitios = Util.generaSitiosAleatorios(30);

sitios = [{"x":216.90658314619213,"y":10.721666808240116},{"x":51.448746607638896,"y":35.32439558766782},{"x":277.42113838903606,"y":37.46726056560874},{"x":184.66108844149858,"y":52.66084629110992},{"x":115.97882823552936,"y":54.66461798641831},{"x":182.64772247057408,"y":84.76214243564755},{"x":138.72098273131996,"y":97.47384439688176},{"x":93.88251907657832,"y":100.49496393185109},{"x":72.03605559188873,"y":116.63510855287313},{"x":223.73317235615104,"y":119.95015824213624},{"x":20.65724863205105,"y":129.97596350032836},{"x":248.49481775891036,"y":133.02989099174738},{"x":71.77141243591905,"y":161.85705405659974},{"x":260.8704331330955,"y":169.52452228870243},{"x":297.61132621206343,"y":175.91755657922477},{"x":258.1465487368405,"y":178.753450862132},{"x":184.85016825143248,"y":181.88565184827894},{"x":211.32299811579287,"y":184.44541019853204},{"x":212.07679433282465,"y":199.4007091736421},{"x":105.6665804469958,"y":200.59771912638098},{"x":29.361976543441415,"y":214.74431985989213},{"x":156.15423002745956,"y":229.70893657766283},{"x":88.86527137365192,"y":232.6802069786936},{"x":64.42478012759238,"y":235.41914576198906},{"x":241.04740375187248,"y":244.74663909059018},{"x":252.59429602883756,"y":279.43021771498024},{"x":286.10482171643525,"y":279.5632860157639},{"x":49.9006980098784,"y":279.95637729763985},{"x":291.2613699445501,"y":295.9438000107184},{"x":285.2916256757453,"y":297.19648661557585}];