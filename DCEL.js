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
    
    this.bBox = bBox;
    
    if(!id)
        throw 'You need an id!'
        
    var svg = d3.select(id);
        
    var scaleX = (svg.attr("width")-0)/((bBox.xMax - bBox.xMin)+2*margin);
    var scaleY = (svg.attr("height")-0)/((bBox.yMax - bBox.yMin)+2*margin);
    
    var scale = Math.min(scaleX,scaleY);
    
    var canvas = svg
        .append("g")
        .attr("transform","scale("+scale+")")
    
    this.drawLine = function(v1, v2){
        canvas.append("line")
            .attr("x1", v1.x - bBox.xMin + margin)
            .attr("x2", v2.x - bBox.xMin + margin)
            .attr("y1", v1.y - bBox.yMin + margin)
            .attr("y2", v2.y - bBox.yMin + margin)
            .attr("stroke-width", 2)
            .attr("stroke", "black");
    }
    
    this.drawPoint = function(v){
        canvas.append("circle")
            .attr("cx", v.x - bBox.xMin + margin)
            .attr("cy", v.y - bBox.yMin + margin)
            .attr("r", 3)
            .style("fill", function(d) { return "blue"; });
    }
    var lib = this;
    this.vertices.forEach(function(vert) {
        var he = vert.halfEdge;
        if(he){
            do{
                var v = he.par.vertice;
                if(v){
                    lib.drawLine(vert.coords, v.coords);
                } else {
                    if(clipBoundingBox && typeof clipBoundingBox == "function"){
                        var v2 = clipBoundingBox(he.par,lib);
                        lib.drawLine(vert.coords,v2);
                    }
                }
                he = he.par.sig;
            }while(he != vert.halfEdge); 
        }
    });

    var circles = canvas.selectAll("circle")
                      .data(this.vertices)
                      .enter()
                      .append("circle")

    var circleAttributes = circles
                        .attr("cx", function (d) { return d.coords.x - bBox.xMin + margin; })
                        .attr("cy", function (d) { return d.coords.y - bBox.yMin + margin; })
                        .attr("r", 3)
                        .style("fill", function(d) { return "red"; });
    if(anotherDrawings)
        anotherDrawings(this);
};