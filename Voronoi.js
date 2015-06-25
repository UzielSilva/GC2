function Voronoi(sitios, bbox) {
    
    this.ids = 1;
    
    var comparaEventos = function(a,b){
        var r = a.p.y - b.p.y;
        if (r) {return r;}
        return a.p.x - b.p.x;
    };
    
    var calculaCoordenadaXCentro = function(b,attr,yL) {
        var xL = 
            (yL - b[attr].y)*(b.x - b[attr].x)/(b.y - b[attr].y) + b[attr].x;
        var r = Math.pow(
            (Math.pow(b[attr].x - xL,2) + Math.pow(b[attr].y - yL,2))*
            (Math.pow(b.x - xL,2) + Math.pow(b.y - yL,2))
        ,1/4);
        var factor = (b.y > b[attr].y ?
            1:-1);
        if(attr == 'pl')
            return xL - r*factor;
        if(attr == 'pr')
            return xL + r*factor; 
    };
    
    // a es un nuevo sitio(o una curva que queremos eliminar), b puede contener curvas adyacentes por los sitios pl, pr
    
    var comparaLineaDePlaya = function(a,b){
        if(b.pl && b.pl.idx && b.pl.idx == a.idx){
            return -1;
        } else if(b.pr && b.pr.idx && b.pr.idx == a.idx){
            return 1;
        } else if(b.idx && b.idx == a.idx){
            return 0;
        }
        var xL = -Infinity, 
            xR = Infinity;
        if(b.pl){
            xL = calculaCoordenadaXCentro(b,'pl',a.y);
        }
        if(b.pr){
            xR = calculaCoordenadaXCentro(b,'pr',a.y);
        }
    // No puede suceder que xR < a.p.x < xL porque xL < xR
        var r = (xL > a.x ? -1 : 0);
        r += (a.x > xR ? 1 : 0 );
        return r;
    };
    
    var agregaLineaDePlaya = function(AVL, nvo){
        var leftNode = {},
            rightNode = {},
            prop;
        for ( prop in AVL.node ) {
            leftNode[prop] = rightNode[prop] = AVL.node[prop];
        }
        leftNode.pr = nvo;
        nvo.pl = leftNode;
        rightNode.pl = nvo;
        nvo.pr = rightNode;
        if(rightNode.pr)
            rightNode.pr.pl = rightNode;
        if(leftNode.pl)
            leftNode.pl.pr = leftNode;
        
        if(AVL.left){
            AVL.left.addMaxMin(leftNode, 'max');
        } else {
            AVL.left = new AVLTree(leftNode, this.compare, this.drawFunc, this.removeFunc);
        }
        if(AVL.right){
            AVL.right.addMaxMin(rightNode, 'min');
        } else {
            AVL.right = new AVLTree(rightNode, this.compare, this.drawFunc, this.removeFunc);
        }        
        AVL.node = nvo;
        AVL.updateInNewLocation();
        return [leftNode,rightNode];
    };
    
    var remueveLineaDePlaya = function(AVL, voronoi){
        AVL.node.pl.pr = AVL.node.pr;
        AVL.node.pr.pl = AVL.node.pl;
    };
    
    this.diagrama = new DCEL();
    this.sitios = [];
    var v = this;
    sitios.forEach(function(p){
        v.sitios.push(p);
    });
    this.bbox = bbox;
    this.lineaDePlaya = new AVLTree(
        null,
        comparaLineaDePlaya,
        agregaLineaDePlaya,
        remueveLineaDePlaya
    );
    this.colaDeEventos = new AVLTree(null,comparaEventos);
    this.yL = 0;
    this.xL = 0;

}

Voronoi.prototype.agregaNuevoEvento = function(nodo){
    if(nodo.pl && nodo.pr){
        var nvoEvento = {nodo:nodo, tipo:'circulo'}
        var p1 = nodo.pl,
            p2 = nodo,
            p3 = nodo.pr;
        var x = 1/2*((Math.pow(p1.x,2) - Math.pow(p2.x,2))*(p3.y - p2.y)
                    -(Math.pow(p2.x,2) - Math.pow(p3.x,2))*(p2.y - p1.y)
                    +(p3.y - p1.y)*(p3.y - p2.y)*(p2.y - p1.y))/
            ((p1.x - p2.x)*(p3.y - p2.y) - (p2.x - p3.x)*(p2.y - p1.y));
        var y1 = (p2.x - p3.x)*(x - (p2.x + p3.x)/2)/(p3.y - p2.y) + (p2.y + p3.y)/2;
        var y2 = y1 + Math.sqrt(Math.pow(p1.x-x,2) + Math.pow(p1.y - y1,2));
        nvoEvento.p = {x:x,y:y2};
        nvoEvento.p1 = p1;
        nvoEvento.p2 = p2;
        nvoEvento.p3 = p3;
        nvoEvento.centro = {x:x, y:y1};
        var angulo = function(p){
            var ret = Math.acos(1 - (Math.pow(p.x - x, 2) + Math.pow(p.y - y2, 2))/(2*Math.pow(y2-y1,2)));
            if(p.x > x)
                ret = 2*Math.PI - ret;
            return ret;
        }
        var ordenCorrecto = [p1,p2,p3].sort(function(a,b){return angulo(a)- angulo(b)});
        
        if(ordenCorrecto[0] == p1 && ordenCorrecto[1] == p2 && ordenCorrecto[2] == p3 &&
            y2 - this.yL > 1e-9 || (y2 - this.yL < 1e-9 && y2 - this.yL > -1e-9 && x - this.xL > 1e-9)){
            nodo.eventoDeCirculo = nvoEvento.p;
            nodo.idx = this.ids++;
            nvoEvento.p.idx = nodo.idx;
            this.colaDeEventos.add(nvoEvento);
        }
    }
}

Voronoi.prototype.procesarEvento = function(evento) {
    if(evento.tipo == 'sitio'){
        this.yL = evento.p.y;
        this.xL = evento.p.x;
        var p = this.lineaDePlaya.add(evento.p);
        if(p){
            if(p[0].eventoDeCirculo){
                this.colaDeEventos.remove({p:p[0].eventoDeCirculo});
                p[0].eventoDeCirculo =  null;
                p[1].eventoDeCirculo =  null;
            }
            this.agregaNuevoEvento(p[0]);
            this.agregaNuevoEvento(p[1]);
        }
        var nuevaCelda = new this.diagrama.Celda();
        nuevaCelda.sitio = evento.p;
        if(p[0]){
            var otraCelda = this.diagrama.celdas[[p[0].x,p[0].y]];
            var halfEdge1 = new this.diagrama.HalfEdge(null,nuevaCelda);
            var halfEdge2 = new this.diagrama.HalfEdge(null,otraCelda);
            halfEdge1.par = halfEdge2;
            halfEdge2.par = halfEdge1;
            nuevaCelda.halfEdge = halfEdge1;
            if(!otraCelda.halfEdge){
                otraCelda.halfEdge = halfEdge2;
            }
            this.diagrama.aristas[[evento.p.x,evento.p.y,p[0].x,p[0].y]] = halfEdge1;
            this.diagrama.aristas[[p[0].x,p[0].y,evento.p.x,evento.p.y]] = halfEdge2;
            this.diagrama.aristas.push(halfEdge1);
            this.diagrama.aristas.push(halfEdge2);

        }
        this.diagrama.celdas[[evento.p.x,evento.p.y]] = nuevaCelda;
        this.diagrama.celdas.push(nuevaCelda);
    } else if(evento.tipo == 'circulo'){
        this.yL = evento.p.y;
        this.xL = evento.p.x;
        var p = this.lineaDePlaya.remove(evento.p);
        if(p.pl.eventoDeCirculo){
                this.colaDeEventos.remove({p:p.pl.eventoDeCirculo});
                p.pl.eventoDeCirculo =  null;
            }
        if(p.pr.eventoDeCirculo){
                this.colaDeEventos.remove({p:p.pr.eventoDeCirculo});
                p.pr.eventoDeCirculo =  null;
            }
        this.agregaNuevoEvento(p.pl);
        this.agregaNuevoEvento(p.pr);
        var nuevoVertice = new this.diagrama.Vertice(evento.centro);
        var a1 = this.diagrama.aristas[[evento.p2.x,evento.p2.y,evento.p1.x,evento.p1.y]];
        var a2 = this.diagrama.aristas[[evento.p3.x,evento.p3.y,evento.p2.x,evento.p2.y]];
        
        var celdaL = this.diagrama.celdas[[evento.p1.x,evento.p1.y]];
        var celdaR = this.diagrama.celdas[[evento.p3.x,evento.p3.y]];

        var halfEdgeL = new this.diagrama.HalfEdge(null,celdaL);
        var halfEdgeR = new this.diagrama.HalfEdge(null,celdaR);
        
        halfEdgeL.par = halfEdgeR;
        halfEdgeR.par = halfEdgeL;
        
        this.diagrama.aristas[[evento.p1.x,evento.p1.y,evento.p3.x,evento.p3.y]] = halfEdgeL;
        this.diagrama.aristas[[evento.p3.x,evento.p3.y,evento.p1.x,evento.p1.y]] = halfEdgeR;
        this.diagrama.aristas.push(halfEdgeL);
        this.diagrama.aristas.push(halfEdgeR);
        
        this.diagrama.vertices.push(nuevoVertice);
        a1.vertice = a2.vertice = halfEdgeL.vertice = nuevoVertice;
        if(a2.par.sig != a1){
            var temp1 = a2.par.sig;
            a2.par.sig = a1;
            var x = a1;
            while(x.sig != a1)
                x = x.sig
            x.sig = temp1;
        }
        if(a1.par.sig != halfEdgeL){
            var temp2 = a1.par.sig;
            a1.par.sig = halfEdgeL;
            var x = halfEdgeL;
            while(x.sig != halfEdgeL)
                x = x.sig
            x.sig = temp2;
        }
        halfEdgeL.par.sig = a2;
        var x = a2;
        while(!(x.sig.vertice== a2.vertice))
            x = x.sig;
        x.sig = halfEdgeL.par;
        
        nuevoVertice.halfEdge = a1;
    }
};

Voronoi.prototype.calcular = function() {
    var colaDeEventos = this.colaDeEventos;
    this.sitios.forEach(function(s) { 
        colaDeEventos.add({p:{x:s.x,y:s.y}, tipo:'sitio'}) 
    });
    var evento= this.colaDeEventos.removeMaxMin('min');
    while(evento){
        this.procesarEvento(evento);
        evento = this.colaDeEventos.removeMaxMin('min');
    }
};

Voronoi.prototype.dibujar = function(id) {
    var clipBoundingBox = function(halfEdge,lib){
        var s1 = halfEdge.celda.sitio;
        var s2 = halfEdge.par.celda.sitio;
        var m = (s1.x - s2.x)/(s2.y - s1.y);
        var p = halfEdge.par.vertice.coords;
        var d1, d2;
        var xEv, yEv;
        if (m > 0){
            if(s1.x > s2.x){
                xEv = lib.bBox.xMax;
                yEv = lib.bBox.yMax;
            }else{
                xEv = lib.bBox.xMin;
                yEv = lib.bBox.yMin;
            }
        } else {
            if(s1.x > s2.x){
                xEv = lib.bBox.xMin;
                yEv = lib.bBox.yMax;
            }else{
                xEv = lib.bBox.xMax;
                yEv = lib.bBox.yMin;
            }
        }
        var yP = m*(xEv - p.x) + p.y;
        d1 = {p:{x:xEv,y:yP},d:Math.sqrt(Math.pow(p.x - xEv,2) + Math.pow(p.y - yP,2))};
        var xP = (yEv - p.y)/m + p.x;
        d2 = {p:{x:xP,y:yEv},d:Math.sqrt(Math.pow(p.x - xP,2) + Math.pow(p.y - yEv,2))};
        var v;
        if(d1.d < d2.d)
            v = d1.p
        else
            v = d2.p
        return v;
    }
    var v = this;
    var dibujaSitios = function(lib){
        v.sitios.forEach(function(x){lib.drawPoint(x)});
    }
    var bBox = {xMin: 0, xMax: 300, yMin: 0, yMax: 300}
    this.diagrama.dibujar(id,bBox,true,clipBoundingBox,dibujaSitios);
}

var v = new Voronoi(sitios);
v.calcular();