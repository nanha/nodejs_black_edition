/*********************************************************
 * Node.js Black Edition
 * cpp native module: base64
 *
 * @source http://startic.kr/njs/package/node-base64
 * @author nanhapark <http://about.me/nanha>
 *********************************************************/

var binding = process.binding('base64');

exports.encode = binding.encode;
exports.decode = binding.decode;
