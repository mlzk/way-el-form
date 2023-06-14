<template>
                    <way-el-form model="search" inlineBlock :formProps="formProps" ref="queryForm" :form="originData"
                                @submit="handleSubmit" :action="['submit', 'reset']" @reset="handleReset" :actionProps="actionProps"
                                :showFooter="false" enableSpin />
</template>
  
<script>

export default {
    name: 'SearchForm',
    data() {
        return {
            formProps: {
                hideLabel: true,
                inline: true,
            },
            originData1: [],
            originData: [
                {
                    name: '姓名',
                    required: false,
                    type: 'el-input',
                    key: 'name',
                    // value: '',
                },
                {
                    name: '工种',
                    type: 'el-select',
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

    methods: {
        handleSubmit(formData) {
            if (!formData.formValues.name && !formData.formValues.type) return this.$message.error('请输入搜索项，再搜索！');
            this.$emit('handleSearch', formData.formValues)
        },
        handleReset() {
            this.$emit('handleSearch', {})
        },
    },
    watch: {

    }
}
</script>
  
<style lang='less' scoped>
.SearchForm {
    padding: 24px;
}

.demo-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
}
</style>
  