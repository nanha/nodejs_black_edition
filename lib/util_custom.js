/**
 * String prototype
 */
String.prototype.numberFormat = function() {
    return this.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,'$1,');
};
String.prototype.stripTag = new Function("return this.replace(/<[^>]+>/g, '')");
String.prototype.toArray = new Function("return this.split('')");

/**
 * print, console.log alternative
 */
global.print = console.log;
