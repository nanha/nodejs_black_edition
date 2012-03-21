/******************************************************
 * Node.js Black Edition
 * Basic Functions
 *
 * @author nanhapark
 ******************************************************/
var BlackEdition = {
    /**
     * Black Edition Information
     * only unicode
     */
    info: function() {
        var str = '\n' +
        '# Node Black Edition \uC18C\uAC1C\n'.yellow +
        '--------------------------\n' +
        'Node.js \uB97C \uC54C\uB9AC\uB294 \uC77C\uC885\uC758 \22\uB178\uC774\uC988 \uB9C8\uCF00\uD305\22 \uC785\uB2C8\uB2E4.\nNode.js\uAC00 \uAC1C\uBC1C\uC790\uC758 \uAE30\uC5B5\uC18D\uC5D0\uC11C \uC0AC\uB77C\uC9C0\uC9C0 \uC54A\uAC8C \uD558\uAE30 \uC704\uD574 \uAD11\uACE0\uD558\uB294 \uBAA9\uC801\uC744 \uAC00\uC9C0\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \u314B\u314B\u314B \uC7AC\uBBF8\uC788\uAC8C \uBD10\uC8FC\uC138\uC694.\nNode Black Edition\uC744 \uC0AC\uC6A9\uD574 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4.\n'
        ;
        console.log(str);
        return '';
    },
    /**
     * help for module
     *
     * @param {String} id - module name
     * @return void
     */
    help: function(id) {
        try {
            var foo = require('ext_' + id + '_doc');
        } catch (e) {
            console.log(e + "\nmake file!");
            return null;
        }
        
        console.log(foo.__doc__);

        return '';
    }
};

module.exports = {
    info: BlackEdition.info,
    help: BlackEdition.help
};
