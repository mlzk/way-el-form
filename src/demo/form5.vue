<template>
        <div>
                <way-el-form model="form" :inlineBlock="inlineBlock" :formProps="formProps" ref="queryForm" :form="originData"
                @submit="handleSubmit" :enableSpin="spin" :action="['submit', 'reset']" @reset="handleReset"
                    :actionProps="actionProps" :showFooter="showFooter" strict />
    </div>
</template>

<script>
// import LabelItem from './label-item.vue'
export default {
    name: 'col-Form',
    components: {
        // LabelItem
    },
    data() {
        return {
            spin: false,
            showFooter: true,
            inlineBlock: true,
            formProps: {
                hideLabel: false,
                inline: false,
                disabled: false,
                hideRequiredMark: false,
                labelColon: true,
                labelPosition: 'top',
                labelWidth: '100px',

            },
            originData: [

                {
                    type: 'el-row',

                    props: {
                        gutter: 20,
                    },
                    children: [

                        {
                            name: '姓名',
                            required: true,
                            type: 'el-input',
                            key: 'name',
                            value: '',
                        },
                        {
                            name: '隐藏字段',
                            hidden: true,
                            key: 'id',
                            value: '',
                        },
                        {
                            name: '年龄',
                            required: true,
                            type: 'el-input-number',
                            key: 'age',
                            value: 1,// 初始
                        },

                        {
                            name: '工种',
                            type: 'el-select',
                            key: 'type',
                            required: true,
                            requiredType: 'number',//设置校验类型
                            componentsProps: {
                                clearable: true
                            },
                            source: {
                                api: '/api/waybill/waybillTypeList', // 模拟
                                params: {
                                    type: '1',
                                    limit: 100,
                                },
                                handle: (res) => {
                                    return res
                                }
                            },
                            showName: 'name',
                            showValue: 'id',
                        },
                        {
                            name: '条件显隐字段',
                            type: 'el-switch',
                            key: 'visable',
                            value: false,// 初始
                        },
                        {
                            name: '自定义校验',
                            required: true,
                            placeholder: '请输入正整数',
                            type: 'el-input-number',
                            key: 'batchCount',
                            componentsProps: {
                                min: 1,
                            },
                            colProps: {

                                xs: 24,
                                sm: 24,
                                md: 24,
                                lg: 24,

                            },

                            value: 1,// 初始
                            visitable: (status, form) => {
                                // form 为表单数据
                                return form.visable
                            },
                            rules: [{
                                required: true,
                                message: '请输入正整数',
                                trigger: ['change'],
                                pattern: /^[1-9]\d*$/
                            }]
                        },]
                },

            ],
            actionProps: {
                submit: {
                    componentsProps: {
                        type: 'primary',
                        icon: 'el-icon-search',
                    },
                    text: '查询'
                },
                reset: {
                    componentsProps: {
                        type: 'default',
                        icon: 'el-icon-refresh',
                    },
                    text: '重置'
                },
            },
        };
    },

    methods: {
        handleSubmit(formData) {
            if (!formData.formValues.name && !formData.formValues.type) return this.$message.error('请完善表单')
            this.$emit('handleSearch', formData.formValues)
        },
        handleReset() {
            this.$emit('handleSearch', {})
        },
        changeSource() {
            this.originData[3].source.data = [
                {
                    name: '4',
                    id: '4'
                },
                {
                    name: '5',
                    id: '5'
                },
                {
                    name: '6',
                    id: '6'
                },
            ]
        },
        simulateAPIRequest() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const response = [{
                        name: '4',
                        id: '4'
                    },
                    {
                        name: '5',
                        id: '5'
                    },
                    {
                        name: '6',
                        id: '6'
                    },];
                    resolve(response);
                }, 2000); // 模拟异步请求延迟，2秒后返回数据
            });
        }
    },
    watch: {

    }
}
</script>

