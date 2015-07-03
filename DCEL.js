function DCEL() {
    this.vertices = [];
    this.aristas = [];
    this.celdas = [];
}

DCEL.prototype.Celda = function (halfEdge) {
    this.halfEdge = halfEdge;
};

DCEL.prototype.Vertice = function (coords, halfEdge) {
    this.coords = coords;
    this.halfEdge = halfEdge;
};

DCEL.prototype.HalfEdge = function (vertice, celda, par, sig) {
    this.vertice = vertice;
    this.celda = celda;
    this.par = par;
    if(sig)
        this.sig = sig;
    else
        this.sig = this;
};

DCEL.prototype.dibujar = function(id, boundingBox, expand, clipBoundingBox, anotherDrawings){
    var margin = 5;
    var bBox = boundingBox;
    var xMin, xMax, yMin, yMax;
    this.vertices.sort(function(a, b){return a.coords.x-b.coords.x});
    xMin = this.vertices[0].coords.x;
    xMax = this.vertices[this.vertices.length - 1].coords.x;
    this.vertices.sort(function(a, b){return a.coords.y-b.coords.y});
    yMin = this.vertices[0].coords.y;
    yMax = this.vertices[this.vertices.length - 1].coords.y;
    if(!bBox){
        bBox = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
    }
    if(expand){
        if(xMin < bBox.xMin)
            bBox.xMin = xMin;
        if(yMin < bBox.yMin)
            bBox.yMin = yMin;
        if(xMax > bBox.xMax)
            bBox.xMax = xMax;
        if(yMax > bBox.yMax)
            bBox.yMax = yMax;
    }
    
    var canvas = Util.creaCanvas(id, bBox, margin);
    
    this.vertices.forEach(function(vert) {
        var he = vert.halfEdge;
        if(he){
            do{
                var v = he.par.vertice;
                if(v){
                    canvas.dibujaLinea(vert.coords, v.coords);
                } else {
                    if(clipBoundingBox && typeof clipBoundingBox == "function"){
                        var v2 = clipBoundingBox(he.par,canvas,bBox);
                        canvas.dibujaLinea(vert.coords,v2);
                    }
                }
                he = he.par.sig;
            }while(he != vert.halfEdge); 
        }
    });

    var circles = canvas.gNode.selectAll("circle")
                      .data(this.vertices)
                      .enter()
                      .append("circle")

    var circleAttributes = circles
                        .attr("cx", function (d) { return d.coords.x; })
                        .attr("cy", function (d) { return d.coords.y; })
                        .attr("r", 3)
                        .style("fill", function(d) { return "red"; });
    if(anotherDrawings)
        anotherDrawings(canvas);
};