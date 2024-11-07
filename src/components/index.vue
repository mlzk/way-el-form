

<!-- 封装的json to form 组件 支持Select/Input/DatePicker/TimePicker/InputNumber/Radio/RadioGroup/Checkbox/CheckboxGroup/Slider/Rate/Cascader/el-s/AutoComplete/ColorPicker/支持Row/Col布局/支持Title分栏/支持自定生成必填rules和placeholder/支持通过配置source请求数据状态选项 -->

<script>
// 设置默认校验类型
const requireTypes = {
  "el-input": "string",
  "el-input-number": "number",
  "el-radio": "boolean",
  "el-radio-group": "string",
  "el-checkbox": "boolean",
  "el-checkbox-group": "array",
  "el-switch": "boolean",
  "el-select": "string", // 默认
  "el-time-select": "string",
  "el-date-picker": "string", // 默认
  "el-cascader": "array",
  "el-rate": "number",
  "el-slider": "number",
  "el-color-picker": "string",
};
const hasOwnPropertySafely = (obj, key) => {
  if (!obj || !key) return false;
  return Object.prototype.hasOwnProperty.call(obj, key);
};
export default {
  name: "way-el-form",
  props: {
    // 模式 默认form表单模式 search为搜索条模式
    model: {
      type: String,
      default: "form",
    },
    // 是否启用单步错误提示 如果有多个未通过的表单项，只会依次提示第一个未通过的表单项
    singleStepErrorTip: {
      type: Boolean,
      default: false,
    },
    // 是否启用加载状态ui
    enableSpin: {
      type: Boolean,
      default: true,
    },
    // 行内换行模式
    inlineBlock: {
      type: Boolean,
      default: false,
    },
    /**
     * 表单数据
     */
    form: {
      type: Array,
      require: true,
    },
    /**
     * 表单状态
     */
    status: {
      type: String,
      default: "add",
    },
    /**
     * 表单配置
     */
    formProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
    /**
     * 表单事件
     */
    formEvents: {
      type: Object,
      default: () => {
        return {};
      },
    },
    /**表单项配置 */
    formItemProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 是否展示表单底部
    showFooter: {
      type: Boolean,
      default: true,
    },
    footerRowProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 表单操作按钮
    action: {
      type: Array,
      default: () => {
        return ["submit"];
      },
    },
    // 表单操作按钮配置
    actionProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 严格模式只接受内置的表单项
    strict: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFirstInit: true, // 是否第一次初始化
      formContent: {}, // 表单结构数据
      requests: {}, // 请求队列
      rules: {}, //表单验证规则
      sourceData: {}, //资源数据
      formValues: {}, // 表单值
      formInitValues: "", // 表单初始值
      needOverWriteForm: null,
    };
  },
  render(h) {
    const self = this;
    if (Object.keys(this.formValues).length == 0 && this.enableSpin)
      return h("div", {
        directives: [
          {
            name: "loading",
            value: true,
          },
        ],
      });
    let itemNodes = self.generatorForm(h, this.formContent);

    return h(
      "div",
      {
        attrs: {
          class: `my-custom-form ${
            this.formProps.hideLabel ? "my-custom-form-hide-label" : ""
          } ${this.formProps.class || ""} ${
            this.model == "search" ? "my-custom-search" : ""
          }`,
        },
      },
      [
        h(
          "el-form",
          {
            ref: "formValues",

            props: {
              model: this.formValues,
              rules: this.rules,
              ...this.formProps,
              // 隐藏标签时默认标签位置为顶部
              labelPosition: this.formProps.hideLabel
                ? "top"
                : this.formProps.labelPosition,
            },
            on: {
              ...this.formEvents,
            },
          },
          [
            itemNodes,
            this.model == "form"
              ? self.generatorFooter(h)
              : self.generatorFormButton(h),
          ]
        ),
      ]
    );
  },

  mounted() {
    console.log("form component mounted");
  },

  methods: {
    formRef() {
      return this.$refs.formValues;
    },
    async generatorRluesAndRequests() {
      // 如果没有数据直接返回
      // 递归处理form数据
      let res = this.collectFormContent(this.form);
      // 优先 rules生成
      this.formContent = res.formContent;
      this.rules = res.rules;
      this.requests = res.requests;
      // 第一次渲染dom时 form表单初始值
      if (this.isFirstInit) {
        // 请求生成
        let requests = Object.keys(res.requests).map((key) => {
          return res.requests[key]();
        });
        // form表单生成
        this.formValues = Object.assign({}, res.formData);

        // 执行请求 完成数据源拉取
        if (requests && requests.length > 0) {
          await Promise.allSettled(requests).catch((err) => {
            console.warn(err);
          });
        }
        if (this.needOverWriteForm) {
          this.overWrite(this.needOverWriteForm);
          this.needOverWriteForm = null;
        }
        this.isFirstInit = false;
      }
      // form表单初始值 用于重置表单 每次生成新的初始值避免修改form之后重置表单会将用户主动设置的值清空
      this.formInitValues = Object.assign({}, res.formData);
    },
    /**
     * 递归处理form数据
     * @param {*} item
     */

    collectFormContent(data = []) {
      let res = {
        formContent: [],
        formData: {},
        rules: {},
        requests: {},
      };
      let inputTips = ["el-input", "el-input-number"];
      data.forEach((item) => {
        // 如果设置了key自动设置不同类型默认值
        if (hasOwnPropertySafely(item, "key")) {
          // q: 为什么要这样处理
          // a: 因为el-form-item的value默认值是undefined，如果设置了默认值，会导致el-form-item的value和el-form的value不一致，导致校验不通过
          if (item.type === "el-input-number") {
            res.formData[item.key] = hasOwnPropertySafely(item, "value")
              ? item.value
              : null;
          } else if (item.type === "el-checkbox-group") {
            res.formData[item.key] = hasOwnPropertySafely(item, "value")
              ? item.value
              : [];
          } else {
            res.formData[item.key] = hasOwnPropertySafely(item, "value")
              ? item.value
              : undefined;
          }
        }
        // 如果设置了rules自动设置rules
        if (hasOwnPropertySafely(item, "rules") && item.rules.length > 0) {
          res.rules[item.key] = item.rules;
        }

        // 如果设置了required自动生成校验提示
        // rlues对number类型的校验有问题，需要手动设置type
        if (item.required) {
          let requiredType = hasOwnPropertySafely(item, "requiredType")
            ? item.requiredType
            : requireTypes[item.type] || "string"; // 默认值
          let tips = {
            required: true,
            message: `${inputTips.includes(item.type) ? "请填写" : "请选择"}${
              item.name
            }`,
            trigger: "change",
            type: requiredType,
          };
          if (
            hasOwnPropertySafely(res.rules, item.key) &&
            res.rules[item.key].length > 0
          ) {
            res.rules[item.key] = [tips, ...res.rules[item.key]];
          } else {
            res.rules[item.key] = [tips];
          }
        }

        // 如果设置了source自动生成请求
        if (
          hasOwnPropertySafely(item, "source") &&
          hasOwnPropertySafely(item.source, "requestFunction")
        ) {
          res.requests[item.key] = this.generatorRequestFunction(item);
        }
        // 如果设置了source自动设置传入静态数据源
        else if (
          hasOwnPropertySafely(item, "source") &&
          hasOwnPropertySafely(item.source, "data")
        ) {
          this.sourceData[item.key] = item.source.data;
        } else {
          !hasOwnPropertySafely(this.sourceData, item.key) &&
            (this.sourceData[item.key] = []);
        }
        // 如果没有placeholder自动生成
        if (!item.placeholder) {
          item.placeholder =
            (inputTips.includes(item.type) ? "请填写" : "请选择") + item.name;
        }
        // 剪除source属性，初始化之后不再允许通过修改source属性来修改数据源，因为source属性是用来生成请求的且只能生成一次，如需调整指定数据源，可以通过修改source.data属性来实现或者通过内部方法changeSource手动实现
        let mItem = Object.assign({}, item);
        if (hasOwnPropertySafely(mItem, "source")) {
          delete mItem.source;
        }
        if (
          item.type == "el-row" &&
          hasOwnPropertySafely(item, "children") &&
          item.children.length > 0
        ) {
          let cRes = this.collectFormContent(item.children);
          res.rules = Object.assign(res.rules, cRes.rules);
          res.formData = Object.assign(res.formData, cRes.formData);
          res.requests = Object.assign(res.requests, cRes.requests);
          mItem.children = cRes.formContent;
        }
        res.formContent.push(mItem);
      });
      return res;
    },
    generatorFormButton(h, item) {
      return h(
        "el-form-item",
        {
          class: "my-custom-form-buttons",
        },
        [this.generatorFooterButton(h, item)]
      );
    },
    generatorFooterButton(h) {
      const btns = {
        reset: h(
          "el-button",
          {
            props: {
              type: "default",
            },
            on: {
              click: () => {
                this.reset();
              },
            },
          },
          "重置"
        ),
        submit: h(
          "el-button",
          {
            props: {
              type: "primary",
            },
            on: {
              click: () => {
                this.submit();
              },
            },
          },
          this.model === "search"
            ? "搜索"
            : this.status == "add"
            ? "保存"
            : "修改"
        ),
      };

      return this.action.map((btn) => {
        // 如果设置actionProps
        if (hasOwnPropertySafely(this.actionProps, btn)) {
          return h(
            "el-button",
            {
              props: {
                type: "default",
                ...this.actionProps[btn].componentsProps,
              },
              on: {
                click: () => {
                  if (["submit", "reset"].includes(btn)) {
                    this[btn]();
                  }
                },
                ...this.actionProps[btn].componentsEvents,
              },
            },
            this.actionProps[btn].text
          ); // 不应用form中的保存修改逻辑
        } else {
          return btns[btn];
        }
      });
    },
    generatorFooter(h) {
      // 如果设置了showFooter为false，不显示footer
      if (!this.showFooter) return;
      return h(
        "el-row",
        {
          class: "my-custom-form-footer",
          props: {
            justify: "end",
            ...this.footerRowProps,
          },
        },
        [this.generatorFooterButton(h)]
      );
    },
    generatorRow(h, item) {
      let itemNodes = [];
      if (item.children && item.children.length > 0) {
        item.children.forEach((it) => {
          if (
            (hasOwnPropertySafely(it, "visible") &&
              it.visible(this.status, this.formValues)) ||
            (!hasOwnPropertySafely(it, "visible") &&
              hasOwnPropertySafely(it, "type"))
          ) {
            let formit = this.generatorCol(h, it);
            itemNodes.push(formit);
          }
        });
        itemNodes;
      }
      return h(
        "el-row",
        {
          props: {
            ...item.props,
          },
          class: `my-custom-form-row ${item.class ? item.class : ""}`,
          style: {
            ...item.style,
          },
        },
        itemNodes
      );
    },
    generatorCol(h, item) {
      const colProps = item.colProps ? item.colProps : {};
      let layout = h(
        "el-col",
        {
          key: item.key,
          props: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 6,
            ...colProps,
          },
        },
        [this.generatorFormItem(h, item)]
      );
      return layout;
    },
    generatorTitle(h, item) {
      const props = item.props ? item.props : {};

      return h(
        "el-row",
        {
          props: {
            ...props,
          },
        },
        [
          h(
            "h3",
            {
              class: `my-custom-form-title ${item.class ? item.class : ""}`,
              style: {
                ...item.style,
              },
            },
            item.slot ? [item.slot(h)] : item.name
          ),
        ]
      );
    },
    reBuildFormItemProps(data) {
      const res = data.reduce((acc, curr) => {
        if (!acc[curr.rowKey]) {
          acc[curr.rowKey] = [];
        }
        acc[curr.rowKey].push(curr);
        return acc;
      }, {});
      return res;
    },
    generatorForm(h, data) {
      if (!data) return;
      let res = [];
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        if (["el-row", "Title"].includes(item.type)) {
          switch (item.type) {
            case "el-row":
              // 目前没有支持深度嵌套的情况，如果要支持，需要在这里处理
              // let formItem = this.generatorRow(h, item)
              res.push(this.generatorRow(h, item));
              break;
            case "Title":
              res.push(this.generatorTitle(h, item));
              break;
            default:
              break;
          }
        } else {
          //默认传入的表单配置根节点类型必须为Row，如果要兼容不穿Row节点的情况，需要在这里处理，包装一个Row节点
          if (
            (hasOwnPropertySafely(item, "visible") &&
              item.visible(this.status, this.formValues)) ||
            !hasOwnPropertySafely(item, "visible")
          ) {
            let formItem = this.inlineBlock
              ? this.generatorInlineBlock(h, item)
              : this.generatorBlock(h, item);
            res.push(formItem);
          }
        }
      }
      return res;
    },
    generatorInlineBlock(h, item) {
      if (!hasOwnPropertySafely(item, "hidden")) {
        return this.generatorFormItem(h, item);
      }
    },
    generatorBlock(h, item) {
      if (!hasOwnPropertySafely(item, "hidden")) {
        return h(
          "el-row",
          {
            props: {
              ...item.props,
            },
          },
          [this.generatorFormItem(h, item)]
        );
      }
    },
    generatorFormItem(h, item) {
      return h(
        "el-form-item",
        {
          key: item.key,
          props: {
            prop: item.key,
            // 不再需要使用 scopedSlots
          },
          class: `my-custom-form-item ${item.class ? item.class : ""}`,
          style: {
            ...item.style,
          },
        },
        [
          h("template", { slot: "label" }, [
            h("span", item.name), // 显示标签内容
            item.tips
              ? h(
                  "el-tooltip",
                  {
                    props: {
                      content: item.tips,
                      placement: "top",
                    },
                  },
                  [h("i", { class: "el-icon-info" })] // 提示图标
                )
              : null, // 如果没有 tips，则不显示 tooltip
          ]),
          this.generatorItem(h, item), // 生成表单项的内容
        ]
      );
    },

    // generatorFormItem(h, item) {
    //   return h(
    //     "el-form-item",
    //     {
    //       key: item.key,
    //       props: {
    //         prop: item.key,
    //         label: item.name,
    //       },
    //       class: `my-custom-form-item ${item.class ? item.class : ""}`,
    //       style: {
    //         ...item.style,
    //       },
    //     },
    //     [this.generatorItem(h, item)]
    //   );
    // },
    generatorItem(h, item) {
      switch (item.type) {
        // 特殊组件需要在这里处理 例如select的结构需要包含option，类似的还有Radio/CheckBox
        case "el-select":
          return this.generatorSelect(h, item);
        case "el-radio-group":
          return this.generatorRadioGroup(h, item);
        case "el-checkbox-group":
          return this.generatorCheckboxGroup(h, item);
        default:
          return this.generatorComponents(h, item);
      }
    },
    generatorComponents(h, item) {
      if (
        (this.strict && hasOwnPropertySafely(requireTypes, item.type)) ||
        !this.strict
      ) {
        return h(
          item.type,
          {
            ref: item.key,
            props: {
              ...this.generatorDefaultProps(item),
              ...this.generatorSourceData(item),
              ...item.componentsProps,
            },
            attrs: { placeholder: item.placeholder },
            on: {
              ...this.generatorDefaultEvents(item),
              ...item.componentsEvents,
            },
          },
          item.slot ? [this.$slots.default, item.slot(h)] : this.$slots.default
        );
      } else {
        return h(
          "span",
          {
            style: {
              color: "red",
            },
          },

          `Unaccepted component types '${item.type}'`
        );
      }
    },
    /**
     * 生成默认的数据源 例如Casader\el-transfer
     */
    generatorSourceData(item) {
      let res = {};
      const types = ["el-cascader", "AutoComplete", "el-transfer"];
      if (
        types.includes(item.type) &&
        hasOwnPropertySafely(this.sourceData, item.key)
      ) {
        res["data"] = this.sourceData[item.key];
      } else {
        res["data"] = [];
      }
      return res;
    },
    generatorRadioGroup(h, item) {
      const self = this;
      return h(
        "el-radio-group",
        {
          ref: item.key,
          props: {
            value: self.formValues[item.key],
            ...item.componentsProps,
          },
          on: {
            input: (val) => {
              self.formValues[item.key] = val;
            },
            ...item.componentsEvents,
          },
        },
        self.generatorRadio(h, item, self.sourceData[item.key])
      );
    },
    generatorRadio(h, propItem, data) {
      let radios = data && data.length > 0 ? data : propItem.options || [];
      let res = [];
      const { optionProps } = propItem;
      for (let i = 0; i < radios.length; i++) {
        let item = radios[i];
        let option = h(
          "el-radio",
          {
            props: {
              label: item[propItem.showValue] || item.value,
              ...optionProps,
            },
          },
          item[propItem.showName || "label"]
        );
        res.push(option);
      }
      return res;
    },
    generatorCheckboxGroup(h, item) {
      const self = this;
      return h(
        "el-checkbox-group",
        {
          ref: item.key,
          props: {
            value: self.formValues[item.key],
            ...item.componentsProps,
          },
          on: {
            input: (val) => {
              self.formValues[item.key] = val;
            },
            ...item.componentsEvents,
          },
        },
        self.generatorCheckbox(h, item, self.sourceData[item.key])
      );
    },
    generatorCheckbox(h, propItem, data) {
      let checkboxs = data && data.length > 0 ? data : propItem.options || [];
      let res = [];
      const { optionProps } = propItem;
      for (let i = 0; i < checkboxs.length; i++) {
        let item = checkboxs[i];
        let option = h(
          "el-checkbox",
          {
            props: {
              label: item[propItem.showValue] || item.value,
              ...optionProps,
            },
            key: item[propItem.showValue] || item.value,
          },
          item[propItem.showName || "label"]
        );
        res.push(option);
      }
      return res;
    },

    generatorSelect(h, item) {
      const self = this;
      return h(
        "el-select",
        {
          ref: item.key,
          props: {
            //绑定v-model self.formValues[item.key]
            value: self.formValues[item.key],
            valueKey: item.showValue || "value",
            placeholder: item.placeholder,
            ...item.componentsProps,
          },
          on: {
            input: (val) => {
              self.formValues[item.key] = val;
            },
            ...item.componentsEvents,
          },
        },
        item.custom && item.custom.group
          ? self.generatorOptionsGroup(h, item, self.sourceData[item.key])
          : self.generatorOptions(h, item, self.sourceData[item.key])
      );
    },
    generatorOptionsGroup(h, propItem, data = []) {
      let res = [];
      for (let key in data) {
        let optionGroup = h(
          "el-option-group",
          {
            props: {
              label: key,
            },
          },

          this.generatorOptions(h, propItem, data[key])
        );
        res.push(optionGroup);
      }
      return res;
    },
    generatorOptions(h, propItem, data = []) {
      let res = [];
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let option = h(
          "el-option",
          {
            props: {
              key: item[propItem.showValue || "value"],
              label: item[propItem.showName || "label"],
              value: item[propItem.showValue || "value"],
            },
          },
          item[propItem.showName || "label"]
        );
        res.push(option);
      }
      return res;
    },
    generatorDefaultProps(item) {
      return {
        value: this.formValues[item.key],
        placeholder: item.placeholder,
      };
    },
    generatorDefaultEvents(item) {
      // 日期组件与其他组件的事件不同
      if (["el-date-picker"].includes(item.type)) {
        let  returnData  =  {
          "on-change": (val) => {
            this.formValues[item.key] = val;
          },
          input: (val) => {
            this.formValues[item.key] = val;
          },
        };
        if (item.effectKeys && item.effectKeys.length > 0) {
          returnData["on-change"] = (val) => {
            this.formValues[item.key] = val;
            this.updateSources(item.effectKeys);
          }
        }
        return returnData;

      } else {
        if (item.effectKeys && item.effectKeys.length > 0) {
          return {
            input: (val) => {
              this.formValues[item.key] = val;
            },
            "on-change": (val) => {
              this.updateSources(item.effectKeys);
            },
          };
        }
        return {
          input: (val) => {
            this.formValues[item.key] = val;
          },
        };
      }
    },
    /**
     * 包装请求函数
     * @param item
     */
    generatorRequestFunction(item) {
      let source = item.source;
      const $this = this;
      return async function () {
        try {
          const {
            requestFunction,
            params,
            handle,
            effectKeys,
            effectKeysHandle,
          } = source;

          let requestParams = params || null;
          if (effectKeys && effectKeys.length > 0) {
            // 从this.formValues中取值
            let effectKeysFormValues = {};
            for (let i = 0; i < effectKeys.length; i++) {
              effectKeysFormValues[effectKeys[i]] =
                $this.formValues[effectKeys[i]];
            }
            requestParams = requestParams
              ? { requestParams, ...effectKeysFormValues }
              : effectKeysFormValues;
            if (effectKeysHandle && typeof effectKeysHandle === "function") {
              requestParams = effectKeysHandle({
                requestParams,
                ...effectKeysFormValues,
              });
            }
          }
          const res = requestParams
            ? await requestFunction(requestParams)
            : await requestFunction();

          // 将请求到的数据赋值给sourceData
          $this.sourceData[item.key] = handle
            ? handle(res, requestParams, this.formValues)
            : res;
          return res;
        } catch (err) {
          // 返回一个错误对象
          console.error(err);
          return { error: err };
        }
      };
    },
    // 手动更新某些数据源
    async updateSources(keys = []) {
      if (!keys) return;
      let requests = [];
      if (Object.prototype.toString.call(keys) === "[object Array]") {
        for (let i = 0; i < keys.length; i++) {
          requests.push(this.requests[keys[i]]());
        }
      } else {
        requests = [this.requests[keys]()];
      }
      if (requests.length === 0) {
        return;
      }
      await Promise.allSettled(requests).catch((err) => {
        console.warn(err);
      });
      this.$forceUpdate();
    },
    getFormValues() {
      return this.formValues;
    },
    /**
     * 获取组件实例
     * @param key 生成component的key 同时会填入ref 通过this.$refs[key]调用
     */
    getThis(key) {
      if (key) {
        try {
          return this.$refs[key];
        } catch (error) {
          console.error(error);
        }
      }
      return this;
    },
    submit() {
      this.$refs["formValues"].validate((valid) => {
        this.$emit("submit", {
          valid,
          formValues: this.formValues,
        });
        if (!valid && this.model === "search") {
          let errorMsg = [];
          let errorKeys = [];
          Object.keys(this.$refs["formValues"].$children).forEach((key) => {
            let item = this.$refs["formValues"].$children[key];
            // 表单校验未通过
            if (item.validateState === "error") {
              errorMsg.push(item.validateMessage);
              errorKeys.push(item.label);
            }
          });
          // 只依次提示第一个错误
          if (this.singleStepErrorTip) {
            this.$message.error(errorMsg[0]);
          } else {
            this.$message.error(
              `请完善${
                errorKeys.length > 0 ? errorKeys.join("、") : "查询条件"
              }`
            );
          }
        }
      });
    },
    /**
     * 设置表单值
     */
    setFormValue(key, value) {
      if (hasOwnPropertySafely(this.formValues, key)) {
        this.formValues[key] = value;
      } else {
        console.error("表单中不存在" + key + "属性");
      }
    },
    /**
     * 重置表单
     */
    reset() {
      this.$refs["formValues"].resetFields();
      this.$emit("reset");
      this.$nextTick(() => {
        this.formValues = Object.assign({}, this.formInitValues);
      });
    },
    overWrite(data) {
      console.log("覆盖表单数据", data);
      const $this = this;
      Object.keys(data).forEach((key) => {
        if (hasOwnPropertySafely($this.formValues, key)) {
          $this.formValues[key] = data[key];
        }
      });
    },
    /**
     *
     * @param {*} data
     */
    setFormData(data) {
      console.log("设置表单数据", data);
      console.log(this.formValues);
      if (data) {
        if (this.$refs["formValues"]) {
          this.$refs["formValues"].resetFields();
          this.$nextTick(() => {
            this.overWrite(data);
          });
        } else {
          this.needOverWriteForm = data;
        }
      }
    },
  },
  watch: {
    form: {
      handler() {
        this.generatorRluesAndRequests();
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>

<style lang='scss'>
.my-custom-form {
  position: relative;

  .el-form {
    padding: 0;
  }

  .el-form--inline {
    .el-date-editor.el-input,
    .el-date-editor.el-input__inner {
      width: 200px;
    }

    .el-form-item {
      width: 200px !important;
    }
  }

  .ivu-cascader {
    line-height: inherit;
  }

  .ivu-input-number {
    width: 100% !important;
  }

  // 项目下的fix样式
  // .ivu-input-number-input-wrap {
  //     height: 25px !important;
  // }

  // .ivu-input-number-handler-wrap {
  //     height: 22px !important;
  //     top: 2px;
  // }

  // .ivu-input-number {
  //     // background-color: #03102c;
  //     width: 100% !important;
  //     background: none;
  //     border: 0px !important;
  //     border-radius: 0px !important;
  //     height: 26px !important;
  //     line-height: 24px !important;
  // }

  // .ivu-input-number-handler {
  //     height: 11px;
  // }

  .ivu-select-input {
    background-color: #041538 !important;
    height: 30px !important;
    color: #fff !important;
  }

  .ivu-input-word-count {
    background: none;
  }

  .ivu-input-type-textarea {
    .ivu-input {
      height: auto !important;
    }
  }
}

.my-custom-form-footer {
  .el-button {
    margin: 0 5px;
  }
}

.my-form-spin-icon-load {
  animation: ani-form-spin 1s linear infinite;
}

@keyframes ani-form-spin {
  from {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.my-custom-form-hide-label {
  .el-form-item__label {
    display: none !important;
  }
}

.ivu-form-label-top {
  .el-form-item__label {
    text-align: left !important;
  }

  .ivu-form-item-content {
    margin-left: 0 !important;
  }
}

.ivu-form-label-right {
  .el-form-item__label {
    text-align: right !important;
  }
}

.my-custom-search {
  .el-form-item {
    margin-bottom: 0px;
  }

  .ivu-form-item-error .ivu-select-arrow {
    color: #808695;
  }

  .ivu-form-item-error-tip {
    display: none;
  }
}

.my-custom-form-title {
  margin: 5px 0;
}

.my-custom-form-buttons {
  .el-button {
    margin-right: 10px;
  }
}
</style>
