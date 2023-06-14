<template>
    <div>
        <!-- <div class="opation">
            <label-item title="行内换行模式">
                <i-switch v-model="formProps.inline" />
            </label-item>
            <label-item title="隐藏标签" tips="隐藏标签时默认标签位置为顶部">
                <i-switch v-model="formProps.hideLabel" />
            </label-item>
            <label-item title="禁用">
                <i-switch v-model="formProps.disabled" />
            </label-item>
            <label-item title="隐藏必填标记">
                <i-switch v-model="formProps.hideRequiredMark" />
            </label-item>
            <label-item title="标签后冒号">
                <i-switch v-model="formProps.labelColon" />
            </label-item>
            <label-item title="标签位置">
                <i-select v-model="formProps.labelPosition" style="width: 120px">
                    <i-option value="left">左</i-option>
                    <i-option value="right">右</i-option>
                    <i-option value="top">上</i-option>
                </i-select>
            </label-item>
            <label-item title="spin">
                <i-switch v-model="spin" />
            </label-item>
            <label-item title="展示底部" tips="隐藏之后可以通过自定义操作按钮通过ref手动调用方法">
                <i-switch v-model="showFooter" />
            </label-item>
            <label-item title="inlineBlock"
                tips="该属性用于定义行内换行模式。如果设置为 true，则表单控件会在同一行中显示，并根据内容自动换行。如果设置为 false，则表单控件会分行显示。     ">
                <i-switch v-model="inlineBlock" />
            </label-item>
            <label-item title="动态修改工种数据源"
                tips="静态数据可以通过更改form数据来完成，如果是使用source配置的请求方法，可以通过 this.$refs.queryForm.updateSources('key')来重新获取">
                <Button @click="changeSource">修改数据源</Button>
            </label-item>
        </div> -->
            <way-el-form model="form" :inlineBlock="inlineBlock" :formProps="formProps" ref="queryForm" :form="originData"
            @submit="handleSubmit" :enableSpin="spin" :action="['submit', 'reset']" @reset="handleReset"
            :actionProps="actionProps" :showFooter="showFooter" />
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
                    type: 'Title',
                    name: '查询条件',
                    class: 'user-title',
                    slot: (h) => {
                        return [h('i', {
                            class: 'el-icon-search',
                        }), h('span', '这是自定义分割标题')]
                    }
                },
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
            console.log(formData)
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
        }
    },
    watch: {

    }
}
</script>

<style>
.user-title {
    color: #fb5050;
}
</style>
