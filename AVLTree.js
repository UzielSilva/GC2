function AVLTree(n, compare, drawFunc, removeFunc) {
    this.init(n, compare, drawFunc, removeFunc);
}
 
AVLTree.prototype.init = function(n, compare, drawFunc, removeFunc) {
    this.compare = compare;
    this.drawFunc = drawFunc;
    this.removeFunc = removeFunc;
    this.left = null;
    this.right = null;
    this.node = n;
    this.depth = 0;
};
 
AVLTree.prototype.balance = function() {
    var ldepth = this.left  == null ? -1 : this.left.depth;
    var rdepth = this.right == null ? -1 : this.right.depth;
 
    if (ldepth > rdepth + 1) {
        var lldepth = this.left.left  == null ? -1 : this.left.left.depth;
        var lrdepth = this.left.right == null ? -1 : this.left.right.depth;
 
        if (lldepth < lrdepth) {
            this.left.rotateRR();
        }
        this.rotateLL();
    } else if (ldepth + 1 < rdepth) {
        var rrdepth = this.right.right == null ? -1 : this.right.right.depth;
        var rldepth = this.right.left  == null ? -1 : this.right.left.depth;
 
        if (rldepth > rrdepth) {
            this.right.rotateLL();
        }
        this.rotateRR();
    }
};
 
AVLTree.prototype.rotateLL = function() {
    
    var nodeBefore = this.node;
    var rightBefore = this.right;
    this.node = this.left.node;
    this.right = this.left;
    this.left = this.left.left;
    this.right.left = this.right.right;
    this.right.right = rightBefore;
    this.right.node = nodeBefore;
    this.right.updateInNewLocation();
    this.updateInNewLocation();
};
 
AVLTree.prototype.rotateRR = function() {
    
    var nodeBefore = this.node;
    var leftBefore = this.left;
    this.node = this.right.node;
    this.left = this.right;
    this.right = this.right.right;
    this.left.right = this.left.left;
    this.left.left = leftBefore;
    this.left.node = nodeBefore;
    this.left.updateInNewLocation();
    this.updateInNewLocation();
};
 
AVLTree.prototype.updateInNewLocation = function() {
    this.getDepthFromChildren();
};
 
AVLTree.prototype.getDepthFromChildren = function() {
    this.depth = 0;
    if (this.left != null) {
        this.depth = this.left.depth + 1;
    }
    if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
    }
};

AVLTree.prototype.removeMaxMin = function(arg) {
    var attr, attr2;
    if(arg == 'max'){
        attr = 'right';
        attr2 = 'left';
    }
    else if(arg == 'min'){
        attr = 'left';
        attr2 = 'right';
    }
    else return false;
    if(this.node == null)
        return false;
    if(this[attr]){
        if(!this[attr].left && !this[attr].right){
            var n = this[attr].node;
            this[attr] = null;
            return n;
        }
        var n = this[attr].removeMaxMin(arg);
        this.balance();
        this.getDepthFromChildren();
        return n;
    } else {
        if(!this.left && !this.right){
            var n = this.node;
            this.node = null;
            return n;
        }
        var n = this.node;
        this.node = this[attr2].node;
        this[attr] = this[attr2][attr];
        this[attr2] = this[attr2][attr2];
        this.updateInNewLocation();
        return n;
    }
};

AVLTree.getMaxMin = function(arg) {
    var attr;
    if(arg == 'max')
        attr = 'right'
    else if(arg == 'min')
        attr = 'left'
    else return false;
    if(this[attr]){
        var n = this[attr].getMaxMin(arg);
        return n;
    } else {
        return this;
    }
}

AVLTree.prototype.addMaxMin = function(n,arg) {
    var attr;
    if(arg == 'max')
        attr = 'right'
    else if(arg == 'min')
        attr = 'left'
    else return false;
    if(this[attr]){
        this[attr].addMaxMin(n,arg);
        this.balance();
        this.getDepthFromChildren();
    } else {
        this[attr] = new AVLTree(n, this.compare, this.drawFunc, this.removeFunc);
        this.getDepthFromChildren();
    }
};
 
AVLTree.prototype.add = function(n)  {
    if (!this.node){
        this.node = n;
        return false;
    }
    var o = this.compare(n, this.node);

    var ret = false;
    if (o == 0){
        if(this.drawFunc){
            ret = this.drawFunc(this, n);
        }
    } else if (o < 0) {
        if (this.left == null) {
            this.left = new AVLTree(n, this.compare, this.drawFunc, this.removeFunc);
            ret = true;
        } else {
            ret = this.left.add(n);
            if (ret) {
                this.balance();
            }
        }
    } else if (o > 0) {
        if (this.right == null) {
            this.right = new AVLTree(n, this.compare, this.drawFunc, this.removeFunc);
            ret = true;
        } else {
            ret = this.right.add(n);
            if (ret) {
                this.balance();
            }
        }
    }
 
    if (ret) {
        this.getDepthFromChildren();
    }
    return ret;
};

AVLTree.prototype.remove = function(n)  {
    if (!this.node || !n){
        return false;
    }
    var o = this.compare(n, this.node);

    var ret = false;
    if (o == 0){
        if(this.removeFunc){
            this.removeFunc(this);
        }
        var r = this.node;
        if(this.left){
            var m = this.left.removeMaxMin('max');
            this.node = m;
            if(this.left.node == null)
                this.left = null;
        } else if (this.right){
            var m = this.right.removeMaxMin('min');
            this.node = m;
            if(this.right.node == null)
                this.right = null;
        } else {
            this.node = null;
        }
        this.balance();
        this.getDepthFromChildren();
        return r;
    } else if (o < 0) {
        if (this.left != null) {
            ret = this.left.remove(n);
            if (this.left.node == null)
                this.left = null;
            if (ret) {
                this.balance();
            }
        }
    } else if (o > 0) {
        if (this.right != null) {
            ret = this.right.remove(n);
            if (this.right.node == null)
                this.right = null;
            if (ret) {
                this.balance();
            }
        }
    }
 
    if (ret) {
        this.getDepthFromChildren();
    }
    return ret;
};