function QuadTree(puntos, minimoEnConjunto, cuadrado) {
    if(puntos){
        var c = cuadrado;
        this.minimoEnConjunto = (!minimoEnConjunto ? 1 
                                : minimoEnConjunto);
        if(!c){
            var limites = Util.encuentraMaxMin(puntos);
            var xOy;
            var yOx;
            if(limites.xMax.x - limites.xMin.x >
                limites.yMax.y - limites.yMin.y)
            {
                xOy = 'x';
                yOx = 'y';
            } else {
                xOy = 'y';
                yOx = 'x';
            }
            var l = limites[xOy +'Max'][xOy] - limites[xOy + 'Min'][xOy];
            var p1 = {}, 
                p2 = {}, 
                p3 = {}, 
                p4 = {};
            p1[xOy] = limites[xOy + 'Min'][xOy];
            p1[yOx] = limites[yOx + 'Min'][yOx];
            p2[xOy] = limites[xOy + 'Max'][xOy];
            p2[yOx] = limites[yOx + 'Min'][yOx] + l;
            c = [p1 ,p2];
        }

        this.construye(puntos, c, this);
    }
}

QuadTree.prototype.construye = function(puntos, cuadrado, objeto){
    if(puntos.length <= this.minimoEnConjunto){
        objeto.puntos = puntos;
        objeto.cuadrado = cuadrado;
        return objeto;
    }
    var conjuntos = {NO:[], NE:[], SO:[], SE:[]};
    var mitadX = (cuadrado[1].x + cuadrado[0].x) / 2;
    var mitadY = (cuadrado[1].y + cuadrado[0].y) / 2; 
    puntos.forEach(function(punto){
        var nOs;
        var eUo;
        if(punto.x > mitadX){
            eUo = 'E';
        } else {
            eUo = 'O';
        }
        if(punto.y > mitadY){
            nOs = 'N';
        } else {
            nOs = 'S';
        }
        conjuntos[nOs + eUo].push(punto);
    });
    var p1 = {x: mitadX, y: mitadY};
    var p2 = {x: mitadX, y: cuadrado[0].y};
    var p3 = {x: cuadrado[0].x, y: mitadY};
    var p4 = {x: mitadX, y: cuadrado[1].y};
    var p5 = {x: cuadrado[1].x, y: mitadY};
    objeto.NO = new QuadTree(conjuntos.NO, this.minimoEnConjunto, [p3, p4]);
    objeto.NE = new QuadTree(conjuntos.NE, this.minimoEnConjunto, [p1, cuadrado[1]]);
    objeto.SO = new QuadTree(conjuntos.SO, this.minimoEnConjunto, [cuadrado[0], p1]);
    objeto.SE = new QuadTree(conjuntos.SE, this.minimoEnConjunto, [p2, p5]);
    objeto.NO.padre = objeto;    objeto.NO.padre = objeto;
    objeto.NE.padre = objeto;
    objeto.SO.padre = objeto;
    objeto.SE.padre = objeto;
    objeto.cuadrado = cuadrado;
    return objeto;
};

QuadTree.prototype.vecino = function(nodo, direccion){
    if(!nodo.padre)
        return null;
    switch(direccion){
        case 'N':
            if(nodo == nodo.padre.SO) return nodo.padre.NO;
            if(nodo == nodo.padre.SE) return nodo.padre.NE;
            break;
        case 'S':
            if(nodo == nodo.padre.NO) return nodo.padre.SO;
            if(nodo == nodo.padre.NE) return nodo.padre.SE;
            break;
        case 'O':
            if(nodo == nodo.padre.SE) return nodo.padre.SO;
            if(nodo == nodo.padre.NE) return nodo.padre.NO;
            break;
        case 'E':
            if(nodo == nodo.padre.SO) return nodo.padre.SE;
            if(nodo == nodo.padre.NO) return nodo.padre.NE;
    }
    var v = this.vecino(nodo.padre, direccion);
    if(!v || !v.NO)
        return v;
    else{ 
        switch(direccion){
            case 'N':    
                if(nodo == nodo.padre.NO)
                    return v.padre.SO;
                else return v.padre.SE;
                break;
            case 'S':    
                if(nodo == nodo.padre.SE)
                    return v.padre.NE;
                else return v.padre.NO;
                break;
            case 'O':    
                if(nodo == nodo.padre.SO)
                    return v.padre.SE;
                else return v.padre.NE;
                break;
            case 'E':    
                if(nodo == nodo.padre.NE)
                    return v.padre.NO;
                else return v.padre.SO;
                break;
        }
    }
};

QuadTree.prototype.dibujar = function(id, canvas){
    var c = canvas;
    if(!c){
        var bBox = {xMin: this.cuadrado[0].x,
                   yMin: this.cuadrado[0].y,
                   xMax: this.cuadrado[1].x,
                   yMax: this.cuadrado[1].y}
        c = Util.creaCanvas(id,bBox);
    }
    var p1 = {x: this.cuadrado[0].x, y: this.cuadrado[1].y};
    var p2 = {x: this.cuadrado[1].x, y: this.cuadrado[0].y};
    c.dibujaLinea(this.cuadrado[0], p1);
    c.dibujaLinea(this.cuadrado[0], p2);
    c.dibujaLinea(this.cuadrado[1], p1);
    c.dibujaLinea(this.cuadrado[1], p2);
    if(this.NO){
        this.NO.dibujar(id,c);
        this.NE.dibujar(id,c);
        this.SO.dibujar(id,c);
        this.SE.dibujar(id,c);
    }else{
        this.puntos.forEach(function(x){c.dibujaPunto(x)});
    }
};