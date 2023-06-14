import Vue from "vue";
import App from "./App.vue";
import WayElForm from "./index";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(ElementUI);
// eslint-disable-next-line no-unused-vars
function request(url, params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          name: "张三",
          age: 18,
          id: 1,
        },
        {
          name: "李四",
          age: 19,
          id: 2,
        },
        {
          name: "王五",
          age: 20,
          id: 3,
        },
      ]);
    }, 1000);
  });
}
// 注入请求方法

// request方法必须返回一个Promise对象  request(url, params)  url为请求地址，params为请求参数
// key值'request'作为默认请求方法，如果需要额外的请求方法，可以在这里新增key例如 get:func 在formItem source配置requestType:'get'
Vue.use(WayElForm, { request: request });

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
