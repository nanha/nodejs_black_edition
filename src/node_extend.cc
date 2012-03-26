/*********************************************************
 * Node.js Black Edition
 * cpp native module: extend
 *
 * @source 
 * @author nanhapark <http://about.me/nanha>
 *********************************************************/

#include <node.h>
#include <node_extend.h>

#include <v8.h>

#include <errno.h>
#include <string.h>

namespace node {

using namespace v8;

static Handle<Value> hello(const Arguments& args) {
  HandleScope scope;
  return scope.Close(String::New("wow cpp binding"));
}


void EXTEND::Initialize(v8::Handle<v8::Object> target) {
  HandleScope scope;

  NODE_SET_METHOD(target, "hello", hello);
}


}  // namespace node

NODE_MODULE(node_extend, node::EXTEND::Initialize)
