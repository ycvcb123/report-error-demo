import Vue from 'vue';
import App from './App.vue';
import Raven from "raven-js";
import axios from 'axios';

const _ravenConfig = {
  release: "staging@2.0.0"
};

const  raven = Raven.config("http://127.0.0.1:3000/raven/api/reportError", _ravenConfig);

raven.install();

raven.setTransport(function(option){
  let data = {
    stack:option.data,
    msg:(()=>{
      let res = []
      let data = option.data
      data.exception && data.exception.values && data.exception.values.length && res.push(`${data.exception.values[0].type}:${data.exception.values[0].value}`)
      return res.join(';')
    })(),
  }
  console.log('ravenjs capture error:', data);
  axios.post('http://127.0.0.1:3000/raven/api/reportError',data);
  option.onSuccess();
});
function formatComponentName(vm) {
if (vm.$root === vm) {
  return 'root instance';
}
var name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
return (
  (name ? 'component <' + name + '>' : 'anonymous component') +
  (vm._isVue && vm.$options.__file ? ' at ' + vm.$options.__file : '')
);
}

Vue.config.productionTip = false;
const  _oldOnError = Vue.config.errorHandler;

// 重写了 errorHandler
Vue.config.errorHandler = function(error, vm, info) {
  const metaData = {};
  if (Object.prototype.toString.call(vm) === '[object Object]') {
    metaData.componentName = formatComponentName(vm);
    metaData.propsData = vm.$options.propsData;
  }

  if (typeof info !== 'undefined') {
    metaData.lifecycleHook = info;
  }
  debugger
  Raven.captureException(error, {
    extra: metaData
  });

  if (typeof _oldOnError === 'function') {
    _oldOnError.call(this, error, vm, info);
  }
}

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
