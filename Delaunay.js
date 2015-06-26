function Delaunay(sitios) {
    this.sitiosFaltantes = [];
    var v = this;
    sitios.forEach(function(p){
        v.sitiosFaltantes.push({x:p.x, y:p.y});
    });
    this.triangulacion = new DCEL();
}

// triangulo := {a,b,c}
// punto := {x,y}

Delaunay.prototype.enCirculo = function(triangulo, punto){
    if(punto.externo)
        if(triangulo.b.externo ||
           (!triangulo.a.externo &&
           !triangulo.b.externo &&
           !triangulo.c.externo)
          )
            return false;
    var orientacion = function(a,b,c){
        return Math.asin(((b.x - a.x)*(c.y - b.y) - (b.y - a.y)*(c.x - b.x))/
                     (Math.sqrt(Math.pow(b.x - a.x,2) + Math.pow(b.y - a.y,2))*
                     Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
    };
    if(triangulo.a.externo ||
       triangulo.b.externo ||
       triangulo.c.externo) {
        
        var oa = orientacion(triangulo.a,triangulo.b,triangulo.c);
        var ob = orientacion(triangulo.b,triangulo.c,punto);
        var oc = orientacion(triangulo.c,punto,triangulo.a);
        var od = orientacion(punto,triangulo.a,triangulo.b);
        if(Math.max(oa,ob,oc,od) < 0 || Math.min(oa,ob,oc,od) > 0)
            return true;
        return false;
    }
    var angulo = function(a,b,c) {
        return Math.acos(((a.x - b.x)*(c.x - b.x) + (a.y - b.y)*(c.y - b.y))/
                     (Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2))*
                     Math.sqrt(Math.pow(c.x - b.x,2) + Math.pow(c.y - b.y,2))));
    };
    var oa = orientacion(triangulo.a,triangulo.c,triangulo.b);
    var ob = orientacion(triangulo.a,triangulo.c,punto);
    var a1 = angulo(triangulo.a, triangulo.b, triangulo.c);
    var a2 = angulo(triangulo.a, punto, triangulo.c);
    
    if(Math.max(oa,ob) > 0 && Math.min(oa,ob) < 0)
        a1 = Math.PI - a1;
    return a1 < a2;
};

Delaunay.prototype.construirTrianguloInicial = function() {
    var sitios = [];
    this.sitiosFaltantes.forEach(function(x){sitios.push(x)});
    sitios.sort(function(a,b){ return a.x - b.x });
    var xMin = sitios[0].x;
    var xMax = sitios[sitios.length - 1].x;
    sitios.sort(function(a,b){ return a.y - b.y });
    var yMin = sitios[0].y;
    var yMax = sitios[sitios.length - 1].y;
    xMin -= 10;
    yMin -= 10;
    xMax += 10;
    yMax += 10;
    
    var va = new this.triangulacion.Vertice({x:xMin, y:yMin, externo:true});
    var vb = new this.triangulacion.Vertice({x:xMin, y:2*yMax - yMin, externo:true});
    var vc = new this.triangulacion.Vertice({x:2*xMax - xMin, y:yMin, externo:true});
    this.triangulacion.vertices["a"] = va;
    this.triangulacion.vertices["b"] = vb;
    this.triangulacion.vertices["c"] = vc;
//    this.triangulacion.vertices.push(va);
//    this.triangulacion.vertices.push(vb);
//    this.triangulacion.vertices.push(vc);

    var celda = new this.triangulacion.Celda();
    
    var ha1 = new this.triangulacion.HalfEdge(va);
    var ha2 = new this.triangulacion.HalfEdge(vb);
    va.halfEdge = ha1;
    ha1.par = ha2;
    ha2.par = ha1;
    ha1.celda = celda;
    
    var hb1 = new this.triangulacion.HalfEdge(vb);
    var hb2 = new this.triangulacion.HalfEdge(vc);
    vb.halfEdge = hb1;
    hb1.par = hb2;
    hb2.par = hb1;
    hb1.celda = celda;
    
    var hc1 = new this.triangulacion.HalfEdge(vc);
    var hc2 = new this.triangulacion.HalfEdge(va);
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

Delaunay.prototype.intercambiarArista = function(ha,hb,hc,hd){
    
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
    
    
    
    var x = ha;
    var y = hc;
    var da = x.par.sig;
    var dc = y.par.sig;
    
    ha.vertice.halfEdge = ha;
    hb.vertice.halfEdge = hb;
    hc.vertice.halfEdge = hc;
    hd.vertice.halfEdge = hd;
    ha.par.celda.halfEdge = ha.par;
    hc.par.celda.halfEdge = hc.par;
    
    hc.par.sig = hb.par;
    ha.par.sig = hd.par
    
    da.vertice = hb.vertice;
    da.sig = hc.par;
    hb.par.sig = da;
    da.celda = hc.par.celda;
    hb.par.celda = hc.par.celda;

    dc.vertice = hd.vertice;
    dc.sig = ha.par;
    hd.par.sig = dc;
    dc.celda = ha.par.celda;
    hd.par.celda = ha.par.celda;
    
    var tha = {ha: ha.par, hb: hd.par, hc: dc};
    var thc = {ha: hc.par, hb: hb.par, hc: da};
    
    var sitios1 = ha.par.celda.sitios;
    var sitios2 = hc.par.celda.sitios;
    
    ha.par.celda.sitios = [];
    hc.par.celda.sitios = [];
    
    sitios1.forEach(function(sitio){
        var ang = angulo(hd.vertice.coords,hb.vertice.coords,sitio);
        if(ang > Math.PI){
            sitio.triangulo = tha;
            ha.par.celda.sitios.push(sitio);
        } else {
            sitio.triangulo = thc;
            hc.par.celda.sitios.push(sitio);
        }
    });

    sitios2.forEach(function(sitio){
        var ang = angulo(hd.vertice.coords,hb.vertice.coords,sitio);
        if(ang > Math.PI){
            sitio.triangulo = tha;
            ha.par.celda.sitios.push(sitio);
        } else {
            sitio.triangulo = thc;
            hc.par.celda.sitios.push(sitio);
        }
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
        if(sitio.triangulo.ha == v.triangulo.ha &&
          sitio.triangulo.hb == v.triangulo.hb &&
          sitio.triangulo.hc == v.triangulo.hc){
            var anguloA = angulo(a.coords,vert.coords,sitio);
            var anguloB = angulo(b.coords,vert.coords,sitio);
            var anguloC = angulo(c.coords,vert.coords,sitio);
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
    
    cOriginal.sitios = null;
    
//    d3.select("#Delaunay").select("g").remove();
//    this.triangulacion.dibujar("#Delaunay");
    
    this.pruebaDeIntercambio(ha.par);
    this.pruebaDeIntercambio(hb.par);
    this.pruebaDeIntercambio(hc.par);
    
};

Delaunay.prototype.pruebaDeIntercambio = function(halfEdge){
    if(halfEdge.celda){
        var heA = halfEdge.par.sig.sig.par;
        var heB = halfEdge.par.sig.par;
        var heC = halfEdge.sig.sig.par;
        var heD = halfEdge.sig.par;
        var triangulo = {a:heA.vertice.coords, b:heB.vertice.coords, c:heC.vertice.coords};
        if(this.enCirculo(triangulo, heD.vertice.coords)){
            this.intercambiarArista(heA, heB, heC, heD);
//            d3.select("#Delaunay").select("g").remove();
//            this.triangulacion.dibujar("#Delaunay");
            this.pruebaDeIntercambio(heC);
            this.pruebaDeIntercambio(heD);
        }
    }
};

Delaunay.prototype.quitarVerticesAuxiliares = function(){
    var va = this.triangulacion.vertices["a"],
        vb = this.triangulacion.vertices["b"],
        vc = this.triangulacion.vertices["c"];
    var x = va.halfEdge.sig;
    if(x.vertice.coords.externo && x.par.vertice.coords.externo){
        x = x.par.sig.sig;
    }
    while(x.par.vertice.coords.externo){
        x = x.par.sig;
        if(x.par == va.halfEdge)
            va.halfEdge.par.vertice.halfEdge = null;
    }
    var v = x.vertice;
    do {
//        d3.select("#Delaunay").select("g").remove();
//        this.triangulacion.dibujar("#Delaunay");
        
        x.sig.vertice.halfEdge = x.par;
        
        var temp1 = x.sig;
        var temp2 = x.sig.par;

        x.vertice.halfEdge = x;
        if(x.sig.par.sig.par.vertice.coords.externo){
            
            var temp3 = x.sig.par.sig;
            var temp4 = x.sig.par.sig.par;
            var temp5 = x.sig.par.sig.sig;
            var temp6 = x.sig.par.sig.sig.par;

            x.sig = x.sig.par.sig.par.sig;
            
            temp3.sig = null;
            temp3.par = null;
            temp3.vertice = null;
            temp3.celda = null;

            temp4.sig = null;
            temp4.par = null;
            temp4.vertice = null;
            temp4.celda = null;
            
            temp5.sig = null;
            temp5.par = null;
            temp5.vertice = null;
            temp5.celda = null;

            temp6.sig = null;
            temp6.par = null;
            temp6.vertice = null;
            temp6.celda = null;
            
        }else{
            x.sig = x.sig.par.sig;
        }
        x.celda = null;

        temp1.sig = null;
        temp1.par = null;
        temp1.vertice = null;
        temp1.celda = null;

        temp2.sig = null;
        temp2.par = null;
        temp2.vertice = null;
        temp2.celda = null;

        x = x.sig;
    }while(x.vertice != v)
    va.coords = null;
    va.halfEdge = null;
    vb.coords = null;
    vb.halfEdge = null;
    vc.coords = null;
    vc.halfEdge = null;
    
    this.triangulacion.vertices["a"] = null;
    this.triangulacion.vertices["b"] = null;
    this.triangulacion.vertices["c"] = null;
};

Delaunay.prototype.calcular = function(){
    this.construirTrianguloInicial();
    var sitio = this.sitiosFaltantes.pop();
    while(sitio){
        this.insertaVertice(sitio);
        sitio = this.sitiosFaltantes.pop();
    }
    this.quitarVerticesAuxiliares();
};

var d = new Delaunay(sitios);
d.calcular();