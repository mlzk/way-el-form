<template>
    <div class="label-item">
        <div class="title">
            {{ title }}
        </div>

            <el-popover v-if="tips" word-wrap width="300" trigger="hover" :content="tips">


                   <i class="el-icon-question" style="color:#25baff" slot="reference"></i>

            </el-popover>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'label-item',
    props: {
        title: {
            type: String,
            default: ''
        },
        tips: {
            type: String,
            default: ''
        }
    },
    data() {
        return {

        };
    },
    methods: {}
}
</script>

<style lang='less' scoped>
.label-item {
    display: inline-flex;
    padding: 12px;
    align-items: center;

    .content {
        padding-left: 12px;
    }
}
</style>