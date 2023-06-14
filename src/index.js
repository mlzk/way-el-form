import WayElForm from "./components/index.vue";
// 导出组件
WayElForm.install = (Vue, func) => {
  if (typeof window !== "undefined" && window.Vue) {
    Vue = window.Vue;
  }
  if (func && typeof func === "function") {
    Vue.prototype.$wayElForm = {
      request: func,
    };
  } else if (func && typeof func === "object") {
    Vue.prototype.$wayElForm = func;
  }
  Vue.component(WayElForm.name, WayElForm);
};
export default WayElForm;
