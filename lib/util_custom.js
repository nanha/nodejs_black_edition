/**
 * String prototype
 */
String.prototype.numberFormat = function() {
    return this.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,');
};
String.prototype.stripTag = new Function("return this.replace(/<[^>]+>/g, '')");
String.prototype.toArray = new Function("return this.split('')");
Array.prototype.sum = function() {
    var ret = 0;
    for (var i = 0; i<this.length; i++) {
        if((typeof this[i]).toLowerCase() == 'number') ret += this[i];
    }
    return ret;
};

/**
 * print, console.log alternative
 */
global.print = console.log;
