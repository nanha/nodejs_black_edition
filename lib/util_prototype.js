/**
 * String prototype
 */
String.prototype.numberFormat = function() {
    return this.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,');
};
String.prototype.stripTag = new Function("return this.replace(/<[^>]+>/g, '')");
String.prototype.toArray = new Function("return this.split('')");
/**
 * Array prototype
 */
Array.prototype.search = function(val) {
    var len = this.length;
    for (var i = 0; i < len; i++) {
        if(this[i].trim() == val.trim()) return i;
    }
    return -1;
};
Array.prototype.walk = function(Func) {
    var len = this.length;
    for (var i = 0; i<len; i++) {
        this[i] = Func(this[i], i);
    }
};
Array.prototype.sum = function() {
    var ret = 0;
    for (var i = 0; i<this.length; i++) {
        if((typeof this[i]).toLowerCase() == 'number') ret += this[i];
    }
    return ret;
};
