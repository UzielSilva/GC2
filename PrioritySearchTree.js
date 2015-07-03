function PrioritySearchTree(puntos, noOrdena){
    this.maxMin = Util.encuentraMaxMin(puntos);
    if(!noOrdena)
        puntos.sort(function(a,b){return a.y - b.y});
    this.construye(puntos, this);
}

PrioritySearchTree.prototype.construye = function(arreglo, objeto) {
    if(arreglo.length > 0){
        var mediana = ((arreglo.length + 1) >> 1) - 1;
        objeto.izq = new PrioritySearchTree(arreglo.slice(0,mediana),true);
        objeto.der = new PrioritySearchTree(arreglo.slice(mediana + 1),true);
        objeto.raiz = arreglo[mediana];
        this.acomoda(objeto);
        return objeto;
    }else return null;
};

PrioritySearchTree.prototype.acomoda = function(objeto, l) {
    if(!objeto.izq.raiz && !objeto.der.raiz)
        return;
    var lado1, lado2;
    var xIzq = Infinity;
    var xDer = Infinity;
    if(l && objeto[l].raiz && objeto.raiz.x > objeto[l].raiz.x){
        d3.select("#Voronoi").select("g").remove();
        objeto.dibujar("#Voronoi");
        var temp = objeto.raiz;
        objeto.raiz = objeto[l].raiz;
        objeto[l].raiz =  temp;
        this.acomoda(objeto[l],l);
        d3.select("#Voronoi").select("g").remove();
        objeto.dibujar("#Voronoi");
    }
    
    if(objeto.izq.raiz)
        xIzq = objeto.izq.raiz.x;
    if(objeto.der.raiz)
        xDer = objeto.der.raiz.x;
    if(xIzq > xDer){
        lado1 = 'der';
        lado2 = 'izq';
    } else {
        lado1 = 'izq';
        lado2 = 'der';
    }
    if(objeto.raiz.x > objeto[lado1].raiz.x){
        d3.select("#Voronoi").select("g").remove();
        objeto.dibujar("#Voronoi");
        var temp = objeto.raiz;
        var temp2 = objeto.izq;
        objeto.raiz = objeto[lado1].raiz;
        objeto[lado1].raiz =  temp;
        this.acomoda(objeto[lado1], lado2);
        if(lado == 'der'){
            objeto.izq = objeto.der;
            objeto.der = temp2;
        }
        d3.select("#Voronoi").select("g").remove();
        objeto.dibujar("#Voronoi");
    }
};

PrioritySearchTree.prototype.busca = function(qx, qy) {
    if(!this.raiz) return [];
    var reportados = [];
    var nodo = this;
    var estaDentro =  function (nodo){
        if(!nodo) return false;
        return (qy[0] >= nodo.raiz.y &&
            qy[1] <= nodo.raiz.y &&
            qx <= nodo.raiz.x);
    };
    if(estaDentro(nodo)) reportados.push(nodo.raiz);
    while(nodo && ((nodo.der && qy[0] > nodo.der.raiz.y) ||
                  (nodo.izq && qy[1] < nodo.izq.raiz.y)))
    {
        if(nodo.der && qy[0] > nodo.der.raiz.y) nodo = nodo.der;
        else nodo = nodo.izq;
        
        if(estaDentro(nodo)) reportados.push(nodo.raiz);
    }
    
    var nodoIzq = nodo.izq;
    var nodoDer = nodo.der;
    
    while(nodoIzq && nodoIzq.raiz.x <= qx){
        if(estaDentro(nodoIzq)) reportados.push(nodoIzq.raiz);
        if(nodoIzq.der && qy[0] > nodoIzq.der.raiz.y)
            nodoIzq = nodoIzq.der;
        else{
            this.reportaSubArbol(nodoIzq, reportados, qx);
            nodoIzq = nodoIzq.izq;
        }
    }
    
    while(nodoDer && nodoDer.raiz.x <= qx){
        if(estaDentro(nodoDer)) reportados.push(nodoDer.raiz);
        if(nodoDer.izq && qy[1] < nodoDer.izq.raiz.y)
            nodoDer = nodoDer.izq;
        else{
            this.reportaSubArbol(nodoDer, reportados, qx);
            nodoDer = nodoDer.der;
        }
    }
    return reportados;
};

PrioritySearchTree.prototype.reportaSubArbol = function(nodo, reportados, qx){
    if(nodo && nodo.raiz.x <= qx){
        reportados.push(nodo.raiz);
        this.reportaSubArbol(nodo.izq);
        this.reportaSubArbol(nodo.der);
    }
};

PrioritySearchTree.prototype.dibujar = function(id, canvas) {
    if(!this.raiz) return;
    var c = canvas;
    if(!c){
        var bBox = {xMin: this.maxMin.xMin.x,
                    xMax: this.maxMin.xMax.x,
                    yMin: this.maxMin.yMin.y,
                    yMax: this.maxMin.yMax.y};
        c = new Util.creaCanvas(id, bBox);
    }
    c.dibujaPunto(this.raiz);

    if(this.izq.raiz){
        c.dibujaLinea(this.raiz, this.izq.raiz, "green");
        this.izq.dibujar(id, c);
    }
    
    if(this.der.raiz){
        c.dibujaLinea(this.raiz, this.der.raiz, "red");
        this.der.dibujar(id, c);
    }
};