/*********************************************************
 * Node.js Black Edition
 * cpp native module: extend
 *
 * @source 
 * @author nanhapark <http://about.me/nanha>
 *********************************************************/

var binding = process.binding('extend');

exports.hello = binding.hello;
