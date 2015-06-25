function Delaunay(sitios) {
    this.sitiosFaltantes = [];
    var v = this;
    sitios.forEach(function(p){
        v.sitiosFaltantes.push(p);
    });
    this.triangulacion = new DCEL();
}

// triangulo := {a,b,c}
// punto := {x,y}

Delaunay.prototype.enCirculo = function(triangulo, punto){
    if(punto.externo)
        return false;
    var angulo = function(a,b,c) {
        return Math.acos(((a.x - b.x)*(c.x - b.x) + (a.y - b.y)*(c.y - b.y))/
                         (Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2))*
                         Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
    };
    return angulo(triangulo.a, triangulo.b, triangulo.c) 
            < angulo(triangulo.a, punto, triangulo.c);
};

Delaunay.prototype.construirTrianguloInicial = function() {
    this.sitiosFaltantes.sort(function(a,b){ return a.x - b.x });
    var xMin = this.sitiosFaltantes[0].x;
    var xMax = this.sitiosFaltantes[this.sitiosFaltantes.length - 1].x;
    this.sitiosFaltantes.sort(function(a,b){ return a.y - b.y });
    var yMin = this.sitiosFaltantes[0].y;
    var yMax = this.sitiosFaltantes[this.sitiosFaltantes.length - 1].y;
    xMin -= 10;
    yMin -= 10;
    xMax += 10;
    yMax += 10;
    
    var va = new this.triangulacion.Vertice({x:xMin, y:yMin, externo:true});
    var vb = new this.triangulacion.Vertice({x:xMin, y:2*yMax - yMin, externo:true});
    var vc = new this.triangulacion.Vertice({x:2*xMax - xMin, y:yMin, externo:true});
    this.triangulacion.vertices.push(va);
    this.triangulacion.vertices.push(vb);
    this.triangulacion.vertices.push(vc);

    var celda = new this.triangulacion.Celda();
    this.triangulacion.celdas.push(celda);
    
    var ha1 = new this.triangulacion.HalfEdge(va);
    var ha2 = new this.triangulacion.HalfEdge(vb);
    this.triangulacion.aristas.push(ha1);
    this.triangulacion.aristas.push(ha2);
    va.halfEdge = ha1;
    ha1.par = ha2;
    ha2.par = ha1;
    ha1.celda = celda;
    
    var hb1 = new this.triangulacion.HalfEdge(vb);
    var hb2 = new this.triangulacion.HalfEdge(vc);
    this.triangulacion.aristas.push(hb1);
    this.triangulacion.aristas.push(hb2);
    vb.halfEdge = hb1;
    hb1.par = hb2;
    hb2.par = hb1;
    hb1.celda = celda;
    
    var hc1 = new this.triangulacion.HalfEdge(vc);
    var hc2 = new this.triangulacion.HalfEdge(va);
    this.triangulacion.aristas.push(hc1);
    this.triangulacion.aristas.push(hc2);
    vc.halfEdge = hc1;
    hc1.par = hc2;
    hc2.par = hc1;
    hc1.celda = celda;
    
    ha1.sig = hb1;
    hb1.sig = hc1;
    hc1.sig = ha1;
    
    ha2.sig = hc2;
    hc2.sig = hb2;
    hb2.sig = ha2;
    
    celda.halfEdge = ha1;
    celda.sitios = [];
    
    this.sitiosFaltantes.forEach(function(sitio){
        sitio.triangulo = 
            {ha:ha1,
            hb:hb1,
            hc:hc1};
        celda.sitios.push(sitio);
    });
    
};

  // a y c son los puntos conectados

Delaunay.prototype.intercambiarArista = function(a,b,c,d){
    
    var angulo = function(a,b,c) {
        var r = Math.asin(((b.x - a.x)*(c.y - b.y) - (b.y - a.y)*(c.x - b.x))/
                         (Math.sqrt(Math.pow(b.x - a.x,2) + Math.pow(b.y - a.y,2))*
                         Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
        
        var s = Math.acos(((a.x - b.x)*(c.x - b.x) + (a.y - b.y)*(c.y - b.y))/
                         (Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2))*
                         Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
        if(r < 0)
            s = 2*Math.PI - s;
        return s;
    };
    
    var x = a.halfEdge;
    var y = c.halfEdge;
    while(x.par.sig.par.vertice != c)
        x = x.par.sig;
    while(y.par.sig.par.vertice != a)
        y = y.par.sig;
    var tempX = x.par.sig;
    var tempY = y.par.sig;
    
    x.par.sig = x.par.sig.par.sig;
    y.par.sig = y.par.sig.par.sig;
    
    tempX.vertice = b;
    tempX.sig = y.par;
    tempX.celda = y.par.celda;
    y.par.sig.celda = y.par.celda;
    y.par.sig.sig = tempX;
    
    tempY.vertice = d;
    tempY.sig = x.par;
    tempY.celda = x.par.celda;
    x.par.sig.celda = x.par.celda;
    x.par.sig.sig = tempY;
    
    var tcb = {ha: x, hb: x.sig, hc: x.sig.sig};
    var tcc = {ha: y, hb: y.sig, hc: y.sig.sig};
    
    x.par.celda.sitios.forEach(function(sitio){
        var ang = angulo(d,b,sitio);
        if(ang < Math.PI)
            sitio.triangulo = tcc;
        else
            sitio.triangulo = tcb;
    });

    y.par.celda.sitios.forEach(function(sitio){
        var ang = angulo(d,b,sitio);
        if(ang < Math.PI)
            sitio.triangulo = tcc;
        else
            sitio.triangulo = tcb;
    });
};

Delaunay.prototype.insertaVertice = function(v){
    var ha = v.triangulo.ha,
        hb = v.triangulo.hb,
        hc = v.triangulo.hc;
    
    var a = ha.vertice,
        b = hb.vertice,
        c = hc.vertice;
    
    var angulo = function(a,b,c) {
        var r = Math.asin(((b.x - a.x)*(c.y - b.y) - (b.y - a.y)*(c.x - b.x))/
                         (Math.sqrt(Math.pow(b.x - a.x,2) + Math.pow(b.y - a.y,2))*
                         Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
        
        var s = Math.acos(((a.x - b.x)*(c.x - b.x) + (a.y - b.y)*(c.y - b.y))/
                         (Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2))*
                         Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
        if(r < 0)
            s = 2*Math.PI - s;
        return s;
    };
    
    var cOriginal = ha.celda;
    ha.celda.halfEdge = null;
        
    var vert = new this.triangulacion.Vertice({x:v.x,y:v.y});
    this.triangulacion.vertices.push(vert);
    
    var pa1 = new this.triangulacion.HalfEdge(vert);
    var pa2 = new this.triangulacion.HalfEdge(a);
    this.triangulacion.aristas.push(pa1);
    this.triangulacion.aristas.push(pa2);
    pa1.par = pa2;
    pa2.par = pa1;
    
    var pb1 = new this.triangulacion.HalfEdge(vert);
    var pb2 = new this.triangulacion.HalfEdge(b);
    this.triangulacion.aristas.push(pb1);
    this.triangulacion.aristas.push(pb2);
    pb1.par = pb2;
    pb2.par = pb1;
    
    var pc1 = new this.triangulacion.HalfEdge(vert);
    var pc2 = new this.triangulacion.HalfEdge(c);
    this.triangulacion.aristas.push(pc1);
    this.triangulacion.aristas.push(pc2);
    pc1.par = pc2;
    pc2.par = pc1;
    
    var ca = new this.triangulacion.Celda(pa1);
    var cb = new this.triangulacion.Celda(pb1);
    var cc = new this.triangulacion.Celda(pc1);
    this.triangulacion.celdas.push(ca);
    this.triangulacion.celdas.push(cb);
    this.triangulacion.celdas.push(cc);
    
    pa1.sig = ha;
    hc.sig = pa2;
    pa2.sig = pc1;
    
    pb1.sig = hb;
    ha.sig = pb2;
    pb2.sig = pa1;
    
    pc1.sig = hc;
    hb.sig = pc2;
    pc2.sig = pb1;
    
    pa1.celda = pb2.celda = ha.celda = ca;
    pb1.celda = pc2.celda = hb.celda = cb;
    pc1.celda = pa2.celda = hc.celda = cc;
    
    ca.sitios = [];
    cb.sitios = [];
    cc.sitios = [];
    
    vert.halfEdge = pa1;
    
    var tca = {ha: pa1, hb: ha, hc: pb2};
    var tcb = {ha: pb1, hb: hb, hc: pc2};
    var tcc = {ha: pc1, hb: hc, hc: pa2};
    
    cOriginal.sitios.forEach(function(sitio){
        if(sitio.triangulo == v.triangulo){
            var anguloA = angulo(b,vert.coords,sitio);
            var anguloB = angulo(c,vert.coords,sitio);
            var anguloC = angulo(a,vert.coords,sitio);
            var target = Math.min(anguloA,anguloB,anguloC)
            if(anguloA == target) {
                sitio.triangulo = tca;
                ca.sitios.push(sitio);
            } else if(anguloB == target) {
                sitio.triangulo = tcb;
                cb.sitios.push(sitio);
            } else if(anguloC == target) {
                sitio.triangulo = tcc;
                cc.sitios.push(sitio);
            }
        }
    });
    
    this.pruebaDeIntercambio(ha.par);
    this.pruebaDeIntercambio(hb.par);
    this.pruebaDeIntercambio(hc.par);
    
};

Delaunay.prototype.pruebaDeIntercambio = function(halfEdge){
    if(halfEdge.celda){
        var vertExterno = halfEdge.sig.par.vertice;
        var vertTriangulo = halfEdge.par.sig.par.vertice;
        var triangulo = {a:vertTriangulo, b:halfEdge.vertice, c:halfEdge.par.vertice};
        if(this.enCirculo(triangulo, vertExterno)){
            this.intercambiarArista(halfEdge.vertice, vertTriangulo, halfEdge.par.vertice, vertExterno);
            this.pruebaDeIntercambio(halfEdge.sig);
            this.pruebaDeIntercambio(halfEdge.par.sig.sig);
        }
    }
};

Delaunay.prototype.calcular = function(){
    this.construirTrianguloInicial();
    var sitio = this.sitiosFaltantes.pop();
    while(sitio){
        this.insertaVertice(sitio);
        sitio = this.sitiosFaltantes.pop();
    }
};

var d = new Delaunay(sitios);
d.calcular();