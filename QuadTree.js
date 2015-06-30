function QuadTree(puntos, minimoEnConjunto, cuadrado) {
    if(puntos){
        var c = cuadrado;
        this.minimoEnConjunto = (!minimoEnConjunto ? 1 
                                : minimoEnConjunto);
        if(!c){
            var limites = Util.encuentraMaxMin(puntos);
            var xOy;
            var yOx;
            if(limites.maxX.x - limites.minX.x >
                limites.maxY.y - limites.minY.y)
            {
                xOy = 'x';
                yOx = 'y';
            } else {
                xOy = 'y';
                yOx = 'x';
            }
            var l = limites['max' + xOy.toUpperCase()][xOy] - limites['min' + xOy.toUpperCase()][xOy];
            var m = (limites['max' + xOy.toUpperCase()][yOx] + limites['min' + xOy.toUpperCase()][yOx])/2;
            var p1 = {}, 
                p2 = {}, 
                p3 = {}, 
                p4 = {};
            p1[xOy] = limites['min' + xOy.toUpperCase()][xOy];
            p1[yOx] = m - l/2;
            p2[xOy] = limites['max' + xOy.toUpperCase()][xOy];
            p2[yOx] = m + l/2;
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