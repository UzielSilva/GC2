function PrioritySearchTree(puntos){
    puntos.sort(function(a,b){return a.y - b.y});
    this.construye(puntos, this);
}

PrioritySearchTree.prototype.construye = function(arreglo, objeto) {
    if(arreglo.length > 0){
        var mediana = ((arreglo.length + 1) >> 1) - 1;
        objeto.izq = this.construye(arreglo.slice(0,mediana),{});
        objeto.der = this.construye(arreglo.slice(mediana + 1),{});
        objeto.raiz = arreglo[mediana];
        this.acomoda(objeto);
        return objeto;
    }else return null;
};

PrioritySearchTree.prototype.acomoda = function(objeto) {
    if(!objeto.izq && !objeto.der)
        return;
    var lado;
    var xIzq = Infinity;
    var xDer = Infinity;
    if(objeto.izq)
        xIzq = objeto.izq.raiz.x;
    if(objeto.der)
        xDer = objeto.der.raiz.x;
    if(xIzq > xDer)
        lado = 'der';
    else
        lado = 'izq';
    if(objeto.raiz.x > objeto[lado].raiz.x){
        var temp = objeto.raiz;
        objeto.raiz = objeto[lado].raiz;
        objeto[lado].raiz =  temp;
        this.acomoda(objeto[lado])
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
}

PrioritySearchTree.prototype.reportaSubArbol = function(nodo, reportados, qx){
    if(nodo && nodo.raiz.x <= qx){
        reportados.push(nodo.raiz);
        this.reportaSubArbol(nodo.izq);
        this.reportaSubArbol(nodo.der);
    }
}