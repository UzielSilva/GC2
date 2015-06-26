function IntervalTree(intervalos) {
    var puntos = [];
    intervalos.forEach(function(iv) {
        var ref = {iv:iv};
        puntos.push({x:iv[0], ref:ref});
        puntos.push({x:iv[1], ref:ref});
    });
    puntos.sort(function(a,b){return a.x - b.x});
    this.root = this.creaIntervalTree(puntos);
}

IntervalTree.prototype.creaIntervalTree = function(puntos) {
    if(puntos.length === 0) {
        return null;
    }
    
    var ILeft = [];
    var IRight = [];
    var IMidLeft = [];
    var IMidRight = [];
    
    var mid = puntos[puntos.length>>1].x;
    for(var i=0; i<puntos.length; ++i) {
        var s = puntos[i];
        if(s.ref.iv){
            
            if(s.ref.iv[1] < mid) {
                var ref = {iv:s.ref.iv};
                ILeft.push({x:s.x, ref:ref});
                s.ref.iv = null;
                s.ref = null;
            } else if(mid < s.ref.iv[0]) {
                var ref = {iv:s.ref.iv};
                IRight.push({x:s.x, ref:ref});
                s.ref.iv = null;
                s.ref = null;
            } else {
                if(s.ref.iv[0] == s.x)
                    IMidLeft.push(s.ref.iv);
                if(s.ref.iv[1] == s.x){
                    IMidRight.push(s.ref.iv);
                    s.ref.iv = null;
                    s.ref = null;
                }
            }
        }
    }
    return {mid: mid, 
            left: this.creaIntervalTree(ILeft),
            right: this.creaIntervalTree(IRight),
            midLeft: IMidLeft,
            midRight: IMidRight};
};

IntervalTree.prototype.peticionDeRango = function(nodo, qx) {
    var segmentosAReportar = [];
    if(qx < nodo.mid){
        for(var i = 0 ; i < nodo.midLeft.length; i++){
            if(nodo.midLeft[i][0] > qx) break;
            segmentosAReportar.push(nodo.midLeft[i]);
        }
        if(nodo.left)
            segmentosAReportar.concat(this.peticionDeRango(nodo.left));
    } else {
        for(var i = 0 ; i < nodo.midRight.length; i++){
            if(nodo.midRight[i][1] < qx) break;
            segmentosAReportar.push(nodo.midRight[i]);
        }
        if(nodo.right)
            segmentosAReportar.concat(this.peticionDeRango(nodo.right));
    }
    return segmentosAReportar;
};

IntervalTree.prototype.busca = function(qx) {
    return this.peticionDeRango(this.root, qx);
};