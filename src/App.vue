<template>
  <div class="SearchForm">
          <div class="demo-title demo-big">
                  way-el-form
                </div>
                <div class="demo-desc demo-big-desc">
                  基于 elementUI 封装的 JSON To Form 表单组件，支持 Search 和 Form 两种模式
              </div>
              <div class="demo-title">
                查询模式
              </div>
              <div class="demo-desc">
                查询模式用户table的表头查询，或者页面的查询
              </div>
              <div class="demo-box">
       
            <SearchForm />
          </div>

          <div class="demo-title">
            查询模式-单项反馈
          </div>
          <div class="demo-desc">
            如果不希望错误的选项框标红可以通过css修改覆盖，这里提供了一个简单的示例
          </div>
          <div class="demo-box">
            <StepForm />
          </div>
          <div class="demo-title">
            表单模式
          </div>
          <div class="demo-desc">
            通用表单模式，常用于业务表单
          </div>
          <div class="demo-box">
            <BaseForm />
          </div>
          <div class="demo-title">
            表单模式-分栏
          </div>
          <div class="demo-desc">
            分栏模式下，label最好隐藏或者设置为顶部，否则会出现错位；分栏模式可以自定义表单项的分栏宽度
          </div>
          <div class="demo-box">
            <ColForm />
          </div>
          <div class="demo-title">
            配置异步请求数据
          </div>
          <div class="demo-desc">
            在main.js注册组件时同步配置全局请求方法，配合formItem的source（api/params/handle）属性可以实现异步数据的获取
          </div>
          <div class="demo-box">
            <AsyncForm />
          </div>
  </div>
</template>

<script>
import SearchForm from './demo/form.vue';
import BaseForm from './demo/form2.vue';
import ColForm from './demo/form3.vue';
import StepForm from './demo/form1.vue';
import AsyncForm from './demo/form5.vue';
export default {
  data() {
    return {
      formProps: {
        hideLabel: true,
        inline: true,
      },
      originData: [
        {
          name: '姓名',
          required: false,
          type: 'Input',
          key: 'name',
          value: '',
        },
        {
          name: '工种',
          type: 'Select',
          key: 'type',
          required: false,
          componentsProps: {
            clearable: true
          },
          source: {
            data: [
              {
                name: '1',
                id: '1'
              },
              {
                name: '2',
                id: '2'
              },
              {
                name: '3',
                id: '3'
              },
            ],
          },
          showName: 'name',
          showValue: 'id',
        },
      ],
      actionProps: {
        submit: {
          componentsProps: {
            type: 'primary',
            icon: 'md-search',
          },
          text: '查询'
        },
        reset: {
          componentsProps: {
            type: 'default',
            icon: 'md-refresh',
          },
          text: '重置'
        },
      },
    };
  },
  components: {
    SearchForm,
    BaseForm,
    ColForm,
    StepForm,
    AsyncForm
  },
  methods: {

  },
  watch: {

  }
}
</script>

<style lang='less' scoped>
.SearchForm {
  padding: 24px;
  margin: 0 auto;
  max-width: 1000px;
}

.demo-big-desc {
  font-size: 18px;
}

.demo-big-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  margin-top: 25px;
}


.demo-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  margin-top: 25px;
}

.demo-big {
  font-size: 30px;
}

.demo-desc {
  margin-bottom: 20px;
  color: #999;
}

.demo-box {
  margin-bottom: 20px;
  padding: 20px;
  transition: all 0.3s;
  border-radius: 5px;

  &:hover {
    box-shadow: 0 0 10px #ccc;
  }
}
</style>
<style lang="less">
.opation {
  display: flex;
  flex-wrap: wrap;
  /* 元素换行 */
  margin-bottom: 20px;
}
</style>